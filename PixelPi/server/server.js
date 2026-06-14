const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const mysql = require('mysql2/promise');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ====================
// RATE LIMITING
// ====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.', success: false }
});

app.use('/api/', limiter);

// ====================
// SECURITY MIDDLEWARE
// ====================
app.use(compression({ level: 6 }));

// CORS Configuration
const allowedOrigins = [
  'https://pixelpitechnologies.in',
  'http://pixelpitechnologies.in',
  'https://www.pixelpitechnologies.in',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parsers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ====================
// DATABASE CONNECTION
// ====================
// Force 127.0.0.1 to avoid IPv6 ::1 resolution issues on Windows
const dbHost = (process.env.DB_HOST === 'localhost') ? '127.0.0.1' : (process.env.DB_HOST || '127.0.0.1');

let pool;
let dbAvailable = false;

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function readJsonFile(filename, defaultData = []) {
  const filePath = path.join(dataDir, filename);
  try {
    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error(`Error reading JSON file ${filename}:`, error);
    return defaultData;
  }
}

async function writeJsonFile(filename, data) {
  const filePath = path.join(dataDir, filename);
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing JSON file ${filename}:`, error);
    return false;
  }
}

function createPool() {
  return mysql.createPool({
    host: dbHost,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pixelpi_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
}

try {
  pool = createPool();
} catch (e) {
  console.error('✗ Failed to create DB pool:', e.message);
}

// ====================
// SESSION CONFIGURATION
// ====================
const memoryStore = new session.MemoryStore();
let sessionStoreInstance;
try {
  if (pool) {
    sessionStoreInstance = new MySQLStore({
      expiration: 86400000,
      createDatabaseTable: true,
      schema: {
        tableName: 'user_sessions',
        columnNames: { session_id: 'session_id', expires: 'expires', data: 'data' }
      }
    }, pool);
  }
} catch (e) {
  console.warn('⚠ MySQL session store unavailable, using memory store');
}

const CustomStore = function() {};
CustomStore.prototype = Object.create(session.Store.prototype);
CustomStore.prototype.get = function(sid, cb) {
  if (dbAvailable && sessionStoreInstance) {
    sessionStoreInstance.get(sid, cb);
  } else {
    memoryStore.get(sid, cb);
  }
};
CustomStore.prototype.set = function(sid, sess, cb) {
  if (dbAvailable && sessionStoreInstance) {
    sessionStoreInstance.set(sid, sess, cb);
  } else {
    memoryStore.set(sid, sess, cb);
  }
};
CustomStore.prototype.destroy = function(sid, cb) {
  if (dbAvailable && sessionStoreInstance) {
    sessionStoreInstance.destroy(sid, cb);
  } else {
    memoryStore.destroy(sid, cb);
  }
};
CustomStore.prototype.touch = function(sid, sess, cb) {
  if (dbAvailable && sessionStoreInstance && typeof sessionStoreInstance.touch === 'function') {
    sessionStoreInstance.touch(sid, sess, cb);
  } else if (typeof memoryStore.touch === 'function') {
    memoryStore.touch(sid, sess, cb);
  } else {
    if (cb) cb();
  }
};

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict'
  },
  store: new CustomStore()
};

app.use(session(sessionConfig));

// ====================
// AUTHENTICATION MIDDLEWARE
// ====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      success: false 
    });
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      success: false 
    });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin rights required.',
      success: false 
    });
  }
  next();
};

// Generate JWT token
const generateToken = (userData) => {
  return jwt.sign(
    { 
      id: userData.id || 'admin',
      username: userData.username,
      role: userData.role || 'admin',
      timestamp: new Date().toISOString()
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// ====================
// DATABASE INITIALIZATION
// ====================
async function initializeDatabase() {
  if (!pool) {
    console.error('✗ Database pool not created — MySQL is not available');
    console.warn('⚠ Server will run in limited mode (no database features)');
    return;
  }
  try {
    const connection = await pool.getConnection();
    
    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        source VARCHAR(100) DEFAULT 'website_contact',
        status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        status ENUM('active', 'unsubscribed', 'bounced') DEFAULT 'active',
        source VARCHAR(100) DEFAULT 'website_newsletter',
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP NULL,
        confirmed_at TIMESTAMP NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata JSON,
        INDEX idx_email (email),
        INDEX idx_status (status)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS collaboration_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        source VARCHAR(100) DEFAULT 'website_collaboration',
        status ENUM('new', 'reviewing', 'contacted', 'accepted', 'rejected') DEFAULT 'new',
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_company (company),
        INDEX idx_status (status),
        INDEX idx_type (type)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS career_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        position VARCHAR(255) NOT NULL,
        education VARCHAR(500) NOT NULL,
        university VARCHAR(500) NOT NULL,
        skills TEXT,
        experience TEXT,
        portfolio VARCHAR(500),
        message TEXT,
        resume_filename VARCHAR(500),
        resume_path VARCHAR(500),
        source VARCHAR(100) DEFAULT 'website_careers',
        status ENUM('new', 'reviewing', 'shortlisted', 'interviewed', 'hired', 'rejected') DEFAULT 'new',
        application_id VARCHAR(100) UNIQUE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_position (position),
        INDEX idx_status (status),
        INDEX idx_application_id (application_id),
        FULLTEXT idx_search (name, email, skills, experience)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        to_email VARCHAR(255) NOT NULL,
        from_email VARCHAR(255),
        subject VARCHAR(500) NOT NULL,
        type VARCHAR(100) NOT NULL,
        status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
        error_message TEXT,
        reference_id VARCHAR(100),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_to_email (to_email),
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_sent_at (sent_at)
      )
    `);
    
    // Create admin users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role ENUM('admin', 'editor', 'viewer') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_role (role),
        INDEX idx_is_active (is_active)
      )
    `);

    // Create blog posts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        cover_image VARCHAR(500),
        category VARCHAR(100) DEFAULT 'Technology',
        tags JSON,
        author VARCHAR(255) DEFAULT 'Pixel Pi Team',
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        views INT DEFAULT 0,
        reading_time INT DEFAULT 5,
        meta_title VARCHAR(500),
        meta_description TEXT,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_published_at (published_at),
        FULLTEXT idx_search (title, excerpt, content)
      )
    `);

    // Create audit logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(100),
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100),
        resource_id VARCHAR(100),
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (username),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create website settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS website_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value LONGTEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (setting_key)
      )
    `);

    // Create career openings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS career_openings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        location VARCHAR(200) DEFAULT 'Bangalore, India',
        type ENUM('full-time','part-time','internship','contract') DEFAULT 'full-time',
        experience VARCHAR(100),
        description TEXT,
        requirements TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed default openings if table is empty
    const [openingsExist] = await connection.execute('SELECT id FROM career_openings LIMIT 1');
    if (openingsExist.length === 0) {
      await connection.execute(`
        INSERT INTO career_openings (title, department, location, type, experience, description, requirements, is_active)
        VALUES 
        (
          'Embedded Systems Intern', 
          'Engineering', 
          'Bangalore / Remote', 
          'internship', 
          '0-1 years', 
          'Work on cutting-edge IoT and electronics projects, developing firmware for ESP32, Arduino, STM32, and Raspberry Pi platforms. Contribute to real-world projects in smart devices, automation, and embedded solutions.',
          'Currently pursuing Bachelor''s/Master''s in ECE, EEE, CS or related field; Basic knowledge of C/C++ programming; Understanding of microcontrollers and electronics; Familiarity with Arduino/Raspberry Pi is a plus; Passion for embedded systems and IoT',
          true
        ),
        (
          'Application Developer Intern', 
          'Software Development', 
          'Bangalore / Remote', 
          'internship', 
          '0-1 years', 
          'Develop web and cloud applications for IoT dashboards, automation systems, and internal tools. Work with modern technologies to create user-friendly interfaces and robust backend systems.',
          'Currently pursuing Bachelor''s/Master''s in CS, IT or related field; Knowledge of HTML, CSS, JavaScript; Basic understanding of databases; Familiarity with React/Node.js is a plus; Problem-solving skills and creativity',
          true
        )
      `);
      console.log('✓ Default career openings seeded into database');
    }

    // Insert default admin if not exists
    const [adminExists] = await connection.execute(
      'SELECT id FROM admin_users WHERE username = ?',
      [process.env.ADMIN_USERNAME || 'admin']
    );
    
    if (adminExists.length === 0) {
      // Simple hashed password for demo (in production, use bcrypt)
      const defaultPassword = Buffer.from(process.env.ADMIN_PASSWORD || 'admin123').toString('base64');
      await connection.execute(
        'INSERT INTO admin_users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
        [
          process.env.ADMIN_USERNAME || 'admin',
          defaultPassword,
          process.env.ADMIN_EMAIL || 'admin@pixelpitechnologies.in',
          'admin'
        ]
      );
      console.log('✓ Default admin user created');
    }
    
    connection.release();
    dbAvailable = true;
    console.log('✓ Database tables initialized successfully');
    console.log(`  Connected to MySQL at ${dbHost}:${process.env.DB_PORT || 3306}`);
  } catch (error) {
    console.error('✗ Database initialization error:', error.message);
    console.warn('⚠ Server will run in limited mode (no database features)');
    console.warn('  Make sure MySQL is running and accessible at ' + dbHost + ':' + (process.env.DB_PORT || 3306));
  }
}

// ====================
// FILE UPLOAD CONFIGURATION
// ====================
const uploadsDir = path.join(__dirname, '../uploads/resumes');
const publicDir = path.join(__dirname, '../public');

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✓ Created uploads directory: ${uploadsDir}`);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`✓ Created public directory: ${publicDir}`);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '_' + safeName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, PNG, JPG, and JPEG files are allowed'));
    }
  }
});

// ====================
// EMAIL CONFIGURATION
// ====================
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  });
  
  transporter.verify((error, success) => {
    if (error) {
      console.error('✗ Email configuration error:', error.message);
    } else {
      console.log('✓ Email server is ready to send messages');
    }
  });
} catch (emailError) {
  console.error('✗ Failed to create email transporter:', emailError.message);
  transporter = null;
}

// ====================
// HELPER FUNCTIONS
// ====================
async function logEmail(toEmail, fromEmail, subject, type, status, errorMessage = null, referenceId = null) {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO email_logs (to_email, from_email, subject, type, status, error_message, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [toEmail, fromEmail, subject, type, status, errorMessage, referenceId]
    );
    connection.release();
  } catch (error) {
    console.error('Failed to log email:', error.message);
  }
}

// ====================
// API ROUTES
// ====================

// HEALTH CHECK
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      server: 'PixelPi Technologies API',
      database: 'connected',
      email: transporter ? 'configured' : 'not_configured',
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ADMIN LOGIN
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    // Try database auth first, fallback to env-based auth
    let user = null;
    
    if (dbAvailable && pool) {
      try {
        const connection = await pool.getConnection();
        const [users] = await connection.execute(
          'SELECT * FROM admin_users WHERE username = ? AND is_active = true',
          [username]
        );
        connection.release();
        
        if (users.length > 0) {
          const dbUser = users[0];
          const inputPasswordHash = Buffer.from(password).toString('base64');
          if (inputPasswordHash === dbUser.password_hash) {
            user = { id: dbUser.id, username: dbUser.username, role: dbUser.role, email: dbUser.email };
            // Update last login
            try {
              const updateConn = await pool.getConnection();
              await updateConn.execute('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [dbUser.id]);
              updateConn.release();
            } catch (e) { /* ignore */ }
          }
        }
      } catch (dbErr) {
        console.warn('DB auth failed, trying env fallback:', dbErr.message);
      }
    }
    
    // Fallback: authenticate with env credentials
    if (!user) {
      const envUsername = process.env.ADMIN_USERNAME || 'admin';
      const envPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (username === envUsername && password === envPassword) {
        user = { id: 'env-admin', username: envUsername, role: 'admin', email: process.env.ADMIN_EMAIL || 'admin@pixelpitechnologies.in' };
      }
    }
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set session
    req.session.user = user;
    req.session.isLoggedIn = true;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: user
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

// ADMIN LOGOUT
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
    
    res.clearCookie('connect.sid');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// CHECK AUTH STATUS
app.get('/api/admin/status', authenticateToken, (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    user: req.user
  });
});

// CAREER APPLICATIONS - PUBLIC ENDPOINT
app.post('/api/careers/apply', upload.single('resume'), async (req, res) => {
  console.log('📨 Career application received');
  
  try {
    const file = req.file;
    const {
      name,
      email,
      phone,
      position,
      education,
      university,
      skills,
      experience,
      portfolio,
      message
    } = req.body;
    
    console.log('📝 Application data:', { name, email, position });
    
    // Validate required fields
    if (!name || !email || !phone || !position || !education || !university || !skills) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Please fill in all required fields', 
        success: false 
      });
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ 
        error: 'Please enter a valid email address', 
        success: false 
      });
    }
    
    // Validate phone
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      console.log('❌ Invalid phone number:', phone);
      return res.status(400).json({ 
        error: 'Please enter a valid phone number with at least 10 digits', 
        success: false 
      });
    }
    
    // Validate file
    if (!file) {
      console.log('❌ No resume file uploaded');
      return res.status(400).json({ 
        error: 'Please upload your resume', 
        success: false 
      });
    }
    
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return res.status(400).json({ 
        error: 'Resume file size must be less than 5MB', 
        success: false 
      });
    }
    
    // Generate application ID
    const applicationId = 'APP' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Get client info
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Save to database
    let savedSuccessfully = false;
    if (dbAvailable && pool) {
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          `INSERT INTO career_applications (
            name, email, phone, position, education, university, skills, 
            experience, portfolio, message, resume_filename, resume_path,
            application_id, ip_address, user_agent, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name, email, cleanPhone, position, education, university, 
            typeof skills === 'string' ? skills : JSON.stringify(skills),
            experience || '', portfolio || '', message || '',
            file.filename, file.path, applicationId,
            ipAddress, userAgent, 'new'
          ]
        );
        
        connection.release();
        console.log('✅ Application saved to database:', applicationId);
        savedSuccessfully = true;
      } catch (dbError) {
        connection.release();
        console.error('❌ Database error:', dbError.message);
        
        if (dbError.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ 
            error: 'You have already applied for this position',
            success: false 
          });
        }
        throw dbError;
      }
    } else {
      const applications = await readJsonFile('applications.json');
      if (applications.some(a => a.email === email && a.position === position)) {
        return res.status(409).json({
          error: 'You have already applied for this position',
          success: false
        });
      }
      applications.push({
        id: Date.now(),
        name,
        email,
        phone: cleanPhone,
        position,
        education,
        university,
        skills: typeof skills === 'string' ? skills : JSON.stringify(skills),
        experience: experience || '',
        portfolio: portfolio || '',
        message: message || '',
        resume_filename: file.filename,
        resume_path: file.path,
        application_id: applicationId,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'new',
        created_at: new Date().toISOString()
      });
      await writeJsonFile('applications.json', applications);
      console.log('✅ Application saved to JSON file:', applicationId);
      savedSuccessfully = true;
    }
    
  } catch (error) {
    console.error('❌ Career application error:', error.message);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'Resume file size must be less than 5MB',
          success: false 
        });
      }
      return res.status(400).json({ 
        error: error.message,
        success: false 
      });
    }
    
    // Handle file filter errors
    if (error.message && error.message.includes('allowed')) {
      return res.status(400).json({ 
        error: error.message,
        success: false 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit application. Please try again later.',
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================
// ADMIN PROTECTED ROUTES
// ====================

// GET CAREER APPLICATIONS (ADMIN)
app.get('/api/admin/applications', authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    
    let applications = [];
    let total = 0;
    let statusCountsMap = {};

    if (dbAvailable && pool) {
      let query = 'SELECT id, application_id, name, email, phone, position, education, university, status, resume_filename, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as created_at FROM career_applications';
      let countQuery = 'SELECT COUNT(*) as total FROM career_applications';
      let conditions = [];
      let params = [];
      
      if (status && status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
      }
      
      if (search) {
        conditions.push('(name LIKE ? OR email LIKE ? OR position LIKE ? OR application_id LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const connection = await pool.getConnection();
      
      // Get total count
      const [countResult] = await connection.execute(countQuery, params.slice(0, -2));
      total = countResult[0].total;
      
      // Get paginated applications
      const [appRows] = await connection.execute(query, params);
      applications = appRows;
      
      // Get status counts
      const [statusCounts] = await connection.execute(
        'SELECT status, COUNT(*) as count FROM career_applications GROUP BY status'
      );
      
      connection.release();
      
      statusCountsMap = statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {});
    } else {
      const allApps = await readJsonFile('applications.json');
      
      // Calculate status counts
      allApps.forEach(app => {
        statusCountsMap[app.status] = (statusCountsMap[app.status] || 0) + 1;
      });
      
      // Filter by status
      let filtered = allApps;
      if (status && status !== 'all') {
        filtered = filtered.filter(app => app.status === status);
      }
      
      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(app => 
          (app.name && app.name.toLowerCase().includes(searchLower)) ||
          (app.email && app.email.toLowerCase().includes(searchLower)) ||
          (app.position && app.position.toLowerCase().includes(searchLower)) ||
          (app.application_id && app.application_id.toLowerCase().includes(searchLower))
        );
      }
      
      total = filtered.length;
      
      // Sort desc by id
      filtered.sort((a, b) => b.id - a.id);
      
      // Slice for pagination
      applications = filtered.slice(offset, offset + limit).map(app => ({
        id: app.id,
        application_id: app.application_id,
        name: app.name,
        email: app.email,
        phone: app.phone,
        position: app.position,
        education: app.education,
        university: app.university,
        status: app.status,
        resume_filename: app.resume_filename,
        created_at: app.created_at
      }));
    }
    
    res.status(200).json({
      success: true,
      data: {
        applications: applications,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit)
        },
        statusCounts: statusCountsMap
      }
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

// GET SINGLE APPLICATION (ADMIN)
app.get('/api/admin/applications/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (dbAvailable && pool) {
      const connection = await pool.getConnection();
      const [applications] = await connection.execute(
        `SELECT * FROM career_applications WHERE id = ? OR application_id = ?`,
        [id, id]
      );
      
      connection.release();
      
      if (applications.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: applications[0]
      });
    } else {
      const applications = await readJsonFile('applications.json');
      const application = applications.find(a => String(a.id) === String(id) || a.application_id === id);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }
      res.status(200).json({
        success: true,
        data: application
      });
    }
    
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application'
    });
  }
});

// UPDATE APPLICATION STATUS (ADMIN)
app.put('/api/admin/applications/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['new', 'reviewing', 'shortlisted', 'interviewed', 'hired', 'rejected'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    if (dbAvailable && pool) {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'UPDATE career_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR application_id = ?',
        [status, id, id]
      );
      
      connection.release();
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }
    } else {
      const applications = await readJsonFile('applications.json');
      const idx = applications.findIndex(a => String(a.id) === String(id) || a.application_id === id);
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }
      applications[idx].status = status;
      applications[idx].updated_at = new Date().toISOString();
      await writeJsonFile('applications.json', applications);
    }
    
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application'
    });
  }
});

// GET DASHBOARD STATS (ADMIN)
app.get('/api/admin/dashboard/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    let dailyApps = [];
    let totals = {};
    let positionStats = [];

    if (dbAvailable && pool) {
      const connection = await pool.getConnection();
      
      // Get applications count by day (last 30 days)
      const [dbDaily] = await connection.execute(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM career_applications 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
      `);
      dailyApps = dbDaily;
      
      // Get total counts
      const [totalCounts] = await connection.execute(`
        SELECT 
          (SELECT COUNT(*) FROM career_applications) as total_applications,
          (SELECT COUNT(*) FROM career_applications WHERE status = 'new') as new_applications,
          (SELECT COUNT(*) FROM career_applications WHERE status = 'hired') as hired_applications,
          (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'active') as newsletter_subscribers,
          (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new') as new_contacts
      `);
      totals = totalCounts[0];
      
      // Get applications by position
      const [dbPosition] = await connection.execute(`
        SELECT position, COUNT(*) as count 
        FROM career_applications 
        GROUP BY position 
        ORDER BY count DESC 
        LIMIT 10
      `);
      positionStats = dbPosition;
      
      connection.release();
    } else {
      const allApps = await readJsonFile('applications.json');
      const allSubscribers = await readJsonFile('newsletters.json');
      const allContacts = await readJsonFile('contacts.json');
      
      // Totals
      totals = {
        total_applications: allApps.length,
        new_applications: allApps.filter(a => a.status === 'new').length,
        hired_applications: allApps.filter(a => a.status === 'hired').length,
        newsletter_subscribers: allSubscribers.filter(n => n.status === 'active').length,
        new_contacts: allContacts.filter(c => c.status === 'new').length
      };
      
      // Daily applications count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const appDates = allApps
        .filter(a => new Date(a.created_at) >= thirtyDaysAgo)
        .reduce((acc, a) => {
          const dateStr = new Date(a.created_at).toISOString().split('T')[0];
          acc[dateStr] = (acc[dateStr] || 0) + 1;
          return acc;
        }, {});
      dailyApps = Object.entries(appDates)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => b.date.localeCompare(a.date));
        
      // Applications by position (limit 10)
      const posCounts = allApps.reduce((acc, a) => {
        acc[a.position] = (acc[a.position] || 0) + 1;
        return acc;
      }, {});
      positionStats = Object.entries(posCounts)
        .map(([position, count]) => ({ position, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
    
    res.status(200).json({
      success: true,
      data: {
        dailyApplications: dailyApps,
        totals: totals,
        positionStats: positionStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// ====================
// CONTACT, NEWSLETTER, COLLABORATION
// ====================

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required', success: false });
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      await conn.execute(
        'INSERT INTO contact_submissions (name, email, subject, message, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, subject, message, ip, ua]
      );
      conn.release();
    } else {
      const contacts = await readJsonFile('contacts.json');
      contacts.push({
        id: Date.now(),
        name,
        email,
        subject,
        message,
        status: 'new',
        ip_address: ip,
        user_agent: ua,
        created_at: new Date().toISOString()
      });
      await writeJsonFile('contacts.json', contacts);
    }
    await logAudit(null, 'system', 'contact_submit', 'contact', null, `Contact from ${email}`, ip);
    res.json({ success: true, message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send message', success: false });
  }
});

app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required', success: false });
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      try {
        await conn.execute(
          'INSERT INTO newsletter_subscriptions (email, ip_address, user_agent) VALUES (?, ?, ?)',
          [email, ip, ua]
        );
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
          conn.release();
          return res.json({ success: true, message: 'You are already subscribed!' });
        }
        throw e;
      }
      conn.release();
    } else {
      const newsletters = await readJsonFile('newsletters.json');
      if (newsletters.some(n => n.email === email)) {
        return res.json({ success: true, message: 'You are already subscribed!' });
      }
      newsletters.push({
        id: Date.now(),
        email,
        status: 'active',
        ip_address: ip,
        user_agent: ua,
        subscribed_at: new Date().toISOString()
      });
      await writeJsonFile('newsletters.json', newsletters);
    }
    res.json({ success: true, message: 'Successfully subscribed to our newsletter!' });
  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({ error: 'Failed to subscribe', success: false });
  }
});

app.post('/api/collaboration', async (req, res) => {
  try {
    const { name, email, company, type, message } = req.body;
    if (!name || !email || !company || !type || !message) {
      return res.status(400).json({ error: 'All fields are required', success: false });
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      await conn.execute(
        'INSERT INTO collaboration_inquiries (name, email, company, type, message, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, company, type, message, ip, ua]
      );
      conn.release();
    } else {
      const collabs = await readJsonFile('collaborations.json');
      collabs.push({
        id: Date.now(),
        name,
        email,
        company,
        type,
        message,
        status: 'new',
        ip_address: ip,
        user_agent: ua,
        created_at: new Date().toISOString()
      });
      await writeJsonFile('collaborations.json', collabs);
    }
    res.json({ success: true, message: 'Collaboration inquiry submitted! Our team will review and contact you.' });
  } catch (error) {
    console.error('Collaboration error:', error);
    res.status(500).json({ error: 'Failed to submit inquiry', success: false });
  }
});

// ====================
// AUDIT LOGGING
// ====================
async function logAudit(userId, username, action, resource, resourceId, details, ip) {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      await conn.execute(
        'INSERT INTO audit_logs (user_id, username, action, resource, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, username, action, resource, resourceId, details, ip]
      );
      conn.release();
    } else {
      const logs = await readJsonFile('audit_logs.json');
      logs.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        user_id: userId,
        username: username,
        action: action,
        resource: resource,
        resource_id: resourceId,
        details: details,
        ip_address: ip,
        created_at: new Date().toISOString()
      });
      await writeJsonFile('audit_logs.json', logs.slice(-100)); // limit to last 100 logs
    }
  } catch (e) { console.error('Audit log error:', e.message); }
}

// ====================
// BLOG API - PUBLIC
// ====================

// Get published blog posts
app.get('/api/blog', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let posts = [];
    let categories = [];
    let total = 0;

    if (dbAvailable && pool) {
      let query = 'SELECT id, title, slug, excerpt, cover_image, category, tags, author, views, reading_time, DATE_FORMAT(published_at, "%Y-%m-%d") as published_at FROM blog_posts WHERE status = "published"';
      let countQuery = 'SELECT COUNT(*) as total FROM blog_posts WHERE status = "published"';
      let params = [];

      if (category && category !== 'all') {
        query += ' AND category = ?';
        countQuery += ' AND category = ?';
        params.push(category);
      }
      if (search) {
        query += ' AND (title LIKE ? OR excerpt LIKE ?)';
        countQuery += ' AND (title LIKE ? OR excerpt LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';

      const conn = await pool.getConnection();
      const [countResult] = await conn.execute(countQuery, params);
      total = countResult[0].total;
      const [postsRows] = await conn.execute(query, [...params, limit, offset]);
      posts = postsRows;
      const [categoriesRows] = await conn.execute('SELECT DISTINCT category FROM blog_posts WHERE status = "published" ORDER BY category');
      categories = categoriesRows.map(c => c.category);
      conn.release();
    } else {
      const allPosts = await readJsonFile('blog_posts.json');
      const published = allPosts.filter(p => p.status === 'published');
      
      categories = [...new Set(published.map(p => p.category))].sort();
      
      let filtered = published;
      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p => 
          (p.title && p.title.toLowerCase().includes(searchLower)) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(searchLower))
        );
      }
      
      total = filtered.length;
      filtered.sort((a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0));
      
      posts = filtered.slice(offset, offset + limit).map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        cover_image: p.cover_image,
        category: p.category,
        tags: p.tags,
        author: p.author,
        views: p.views || 0,
        reading_time: p.reading_time || 5,
        published_at: p.published_at ? new Date(p.published_at).toISOString().split('T')[0] : null
      }));
    }

    res.json({
      success: true,
      data: {
        posts,
        categories,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Blog list error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts', success: false });
  }
});

// Get single blog post by slug
app.get('/api/blog/:slug', async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [posts] = await conn.execute('SELECT * FROM blog_posts WHERE slug = ? AND status = "published"', [req.params.slug]);
      if (posts.length === 0) { conn.release(); return res.status(404).json({ error: 'Post not found', success: false }); }
      // Increment views
      await conn.execute('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [posts[0].id]);
      // Get related posts
      const [related] = await conn.execute(
        'SELECT id, title, slug, excerpt, cover_image, category, DATE_FORMAT(published_at, "%Y-%m-%d") as published_at FROM blog_posts WHERE status = "published" AND category = ? AND id != ? ORDER BY published_at DESC LIMIT 3',
        [posts[0].category, posts[0].id]
      );
      conn.release();
      res.json({ success: true, data: { post: posts[0], related } });
    } else {
      const allPosts = await readJsonFile('blog_posts.json');
      const postIdx = allPosts.findIndex(p => p.slug === req.params.slug && p.status === 'published');
      if (postIdx === -1) {
        return res.status(404).json({ error: 'Post not found', success: false });
      }
      
      const post = allPosts[postIdx];
      post.views = (post.views || 0) + 1;
      await writeJsonFile('blog_posts.json', allPosts);
      
      const related = allPosts
        .filter(p => p.status === 'published' && p.category === post.category && String(p.id) !== String(post.id))
        .sort((a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0))
        .slice(0, 3)
        .map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          cover_image: p.cover_image,
          category: p.category,
          published_at: p.published_at ? new Date(p.published_at).toISOString().split('T')[0] : null
        }));
        
      res.json({ success: true, data: { post, related } });
    }
  } catch (error) {
    console.error('Blog detail error:', error);
    res.status(500).json({ error: 'Failed to fetch post', success: false });
  }
});

// ====================
// BLOG API - ADMIN
// ====================

// Get all blog posts (admin)
app.get('/api/admin/blog', authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let posts = [];
    let total = 0;

    if (dbAvailable && pool) {
      let query = 'SELECT id, title, slug, category, author, status, views, DATE_FORMAT(published_at, "%Y-%m-%d %H:%i") as published_at, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i") as created_at FROM blog_posts';
      let params = [];
      if (status && status !== 'all') { query += ' WHERE status = ?'; params.push(status); }
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const conn = await pool.getConnection();
      const [rows] = await conn.execute(query, params);
      posts = rows;
      
      let countQuery = 'SELECT COUNT(*) as total FROM blog_posts';
      let countParams = [];
      if (status && status !== 'all') { countQuery += ' WHERE status = ?'; countParams.push(status); }
      const [countResult] = await conn.execute(countQuery, countParams);
      total = countResult[0].total;
      conn.release();
    } else {
      const allPosts = await readJsonFile('blog_posts.json');
      let filtered = allPosts;
      if (status && status !== 'all') {
        filtered = filtered.filter(p => p.status === status);
      }
      total = filtered.length;
      
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      
      posts = filtered.slice(offset, offset + limit).map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        author: p.author,
        status: p.status,
        views: p.views || 0,
        published_at: p.published_at ? new Date(p.published_at).toISOString().replace('T', ' ').substring(0, 16) : null,
        created_at: p.created_at ? new Date(p.created_at).toISOString().replace('T', ' ').substring(0, 16) : null
      }));
    }

    res.json({ success: true, data: { posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error('Admin blog list error:', error);
    res.status(500).json({ error: 'Failed to fetch posts', success: false });
  }
});

// Get single blog post by ID (admin)
app.get('/api/admin/blog/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [posts] = await conn.execute('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
      conn.release();
      if (posts.length === 0) return res.status(404).json({ error: 'Post not found', success: false });
      res.json({ success: true, data: posts[0] });
    } else {
      const posts = await readJsonFile('blog_posts.json');
      const post = posts.find(p => String(p.id) === String(req.params.id));
      if (!post) return res.status(404).json({ error: 'Post not found', success: false });
      res.json({ success: true, data: post });
    }
  } catch (error) {
    console.error('Fetch post detail error:', error);
    res.status(500).json({ error: 'Failed to fetch post details', success: false });
  }
});

// Create blog post
app.post('/api/admin/blog', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, cover_image, category, tags, author, status, meta_title, meta_description } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required', success: false });

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    const readingTime = Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200);
    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    let insertId;

    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [result] = await conn.execute(
        'INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, category, tags, author, status, reading_time, meta_title, meta_description, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, slug, excerpt || '', content, cover_image || '', category || 'Technology', JSON.stringify(tags || []), author || 'Pixel Pi Team', status || 'draft', readingTime, meta_title || title, meta_description || excerpt || '', publishedAt ? new Date(publishedAt) : null]
      );
      conn.release();
      insertId = result.insertId;
    } else {
      const posts = await readJsonFile('blog_posts.json');
      insertId = Date.now();
      posts.push({
        id: insertId,
        title,
        slug,
        excerpt: excerpt || '',
        content,
        cover_image: cover_image || '',
        category: category || 'Technology',
        tags: tags || [],
        author: author || 'Pixel Pi Team',
        status: status || 'draft',
        reading_time: readingTime,
        meta_title: meta_title || title,
        meta_description: meta_description || excerpt || '',
        published_at: publishedAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0
      });
      await writeJsonFile('blog_posts.json', posts);
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAudit(req.user.id, req.user.username, 'create_post', 'blog', insertId.toString(), `Created post: ${title}`, ip);

    res.json({ success: true, message: 'Blog post created successfully', data: { id: insertId, slug } });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post', success: false });
  }
});

// Update blog post
app.put('/api/admin/blog/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, cover_image, category, tags, author, status, meta_title, meta_description } = req.body;
    
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [existing] = await conn.execute('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
      if (existing.length === 0) { conn.release(); return res.status(404).json({ error: 'Post not found', success: false }); }

      const publishedAt = status === 'published' && existing[0].status !== 'published' ? new Date() : existing[0].published_at;
      const readingTime = content ? Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200) : existing[0].reading_time;

      await conn.execute(
        'UPDATE blog_posts SET title=?, excerpt=?, content=?, cover_image=?, category=?, tags=?, author=?, status=?, reading_time=?, meta_title=?, meta_description=?, published_at=? WHERE id=?',
        [title || existing[0].title, excerpt || existing[0].excerpt, content || existing[0].content, cover_image || existing[0].cover_image, category || existing[0].category, JSON.stringify(tags || JSON.parse(existing[0].tags || '[]')), author || existing[0].author, status || existing[0].status, readingTime, meta_title || existing[0].meta_title, meta_description || existing[0].meta_description, publishedAt, req.params.id]
      );
      conn.release();
    } else {
      const posts = await readJsonFile('blog_posts.json');
      const idx = posts.findIndex(p => String(p.id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ error: 'Post not found', success: false });
      
      const existing = posts[idx];
      const publishedAt = status === 'published' && existing.status !== 'published' ? new Date().toISOString() : existing.published_at;
      const readingTime = content ? Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200) : existing.reading_time;
      
      posts[idx] = {
        ...existing,
        title: title !== undefined ? title : existing.title,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        cover_image: cover_image !== undefined ? cover_image : existing.cover_image,
        category: category !== undefined ? category : existing.category,
        tags: tags !== undefined ? tags : existing.tags,
        author: author !== undefined ? author : existing.author,
        status: status !== undefined ? status : existing.status,
        reading_time: readingTime,
        meta_title: meta_title !== undefined ? meta_title : existing.meta_title,
        meta_description: meta_description !== undefined ? meta_description : existing.meta_description,
        published_at: publishedAt,
        updated_at: new Date().toISOString()
      };
      await writeJsonFile('blog_posts.json', posts);
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAudit(req.user.id, req.user.username, 'update_post', 'blog', req.params.id, `Updated post: ${title || 'unknown'}`, ip);

    res.json({ success: true, message: 'Blog post updated successfully' });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post', success: false });
  }
});

// Delete blog post
app.delete('/api/admin/blog/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    let title = 'Unknown';
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [existing] = await conn.execute('SELECT title FROM blog_posts WHERE id = ?', [req.params.id]);
      if (existing.length > 0) title = existing[0].title;
      await conn.execute('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
      conn.release();
    } else {
      const posts = await readJsonFile('blog_posts.json');
      const idx = posts.findIndex(p => String(p.id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ error: 'Post not found', success: false });
      title = posts[idx].title;
      posts.splice(idx, 1);
      await writeJsonFile('blog_posts.json', posts);
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAudit(req.user.id, req.user.username, 'delete_post', 'blog', req.params.id, `Deleted post: ${title}`, ip);
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post', success: false });
  }
});

// ====================
// ADMIN - CONTACTS, NEWSLETTERS, COLLABORATIONS
// ====================

app.get('/api/admin/contacts', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 50');
      conn.release();
      res.json({ success: true, data: rows });
    } else {
      const contacts = await readJsonFile('contacts.json');
      contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json({ success: true, data: contacts.slice(0, 50) });
    }
  } catch (error) { res.status(500).json({ error: 'Failed', success: false }); }
});

app.put('/api/admin/contacts/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      await conn.execute('UPDATE contact_submissions SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
      conn.release();
    } else {
      const contacts = await readJsonFile('contacts.json');
      const idx = contacts.findIndex(c => String(c.id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ error: 'Contact not found', success: false });
      contacts[idx].status = req.body.status;
      await writeJsonFile('contacts.json', contacts);
    }
    res.json({ success: true, message: 'Updated' });
  } catch (error) { res.status(500).json({ error: 'Failed', success: false }); }
});

app.get('/api/admin/newsletters', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute('SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC LIMIT 100');
      conn.release();
      res.json({ success: true, data: rows });
    } else {
      const newsletters = await readJsonFile('newsletters.json');
      newsletters.sort((a, b) => new Date(b.subscribed_at) - new Date(a.subscribed_at));
      res.json({ success: true, data: newsletters.slice(0, 100) });
    }
  } catch (error) { res.status(500).json({ error: 'Failed', success: false }); }
});

app.get('/api/admin/collaborations', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute('SELECT * FROM collaboration_inquiries ORDER BY created_at DESC LIMIT 50');
      conn.release();
      res.json({ success: true, data: rows });
    } else {
      const collabs = await readJsonFile('collaborations.json');
      collabs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json({ success: true, data: collabs.slice(0, 50) });
    }
  } catch (error) { res.status(500).json({ error: 'Failed', success: false }); }
});

app.put('/api/admin/collaborations/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      await conn.execute('UPDATE collaboration_inquiries SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
      conn.release();
    } else {
      const collabs = await readJsonFile('collaborations.json');
      const idx = collabs.findIndex(c => String(c.id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ error: 'Collaboration inquiry not found', success: false });
      collabs[idx].status = req.body.status;
      await writeJsonFile('collaborations.json', collabs);
    }
    res.json({ success: true, message: 'Updated' });
  } catch (error) { res.status(500).json({ error: 'Failed', success: false }); }
});

// ====================
// ADMIN - AUDIT LOGS & MONITORING
// ====================

app.get('/api/admin/audit-logs', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [logs] = await conn.execute('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
      conn.release();
      res.json({ success: true, data: logs });
    } else {
      const logs = await readJsonFile('audit_logs.json');
      logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json({ success: true, data: logs.slice(0, 100) });
    }
  } catch (error) { res.status(500).json({ error: 'Failed', success: false }); }
});

// Enhanced dashboard stats
app.get('/api/admin/dashboard/overview', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      const [stats] = await conn.execute(`
        SELECT
          (SELECT COUNT(*) FROM career_applications) as total_applications,
          (SELECT COUNT(*) FROM career_applications WHERE status = 'new') as new_applications,
          (SELECT COUNT(*) FROM contact_submissions) as total_contacts,
          (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new') as new_contacts,
          (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'active') as subscribers,
          (SELECT COUNT(*) FROM collaboration_inquiries) as total_collaborations,
          (SELECT COUNT(*) FROM collaboration_inquiries WHERE status = 'new') as new_collaborations,
          (SELECT COUNT(*) FROM blog_posts) as total_posts,
          (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') as published_posts,
          (SELECT COALESCE(SUM(views), 0) FROM blog_posts) as total_views
      `);
      const [recentActivity] = await conn.execute('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10');
      conn.release();
      res.json({ success: true, data: { stats: stats[0], recentActivity } });
    } else {
      const applications = await readJsonFile('applications.json');
      const contacts = await readJsonFile('contacts.json');
      const newsletters = await readJsonFile('newsletters.json');
      const collaborations = await readJsonFile('collaborations.json');
      const blogPosts = await readJsonFile('blog_posts.json');
      const auditLogs = await readJsonFile('audit_logs.json');
      
      const stats = {
        total_applications: applications.length,
        new_applications: applications.filter(a => a.status === 'new').length,
        total_contacts: contacts.length,
        new_contacts: contacts.filter(c => c.status === 'new').length,
        subscribers: newsletters.filter(n => n.status === 'active').length,
        total_collaborations: collaborations.length,
        new_collaborations: collaborations.filter(c => c.status === 'new').length,
        total_posts: blogPosts.length,
        published_posts: blogPosts.filter(b => b.status === 'published').length,
        total_views: blogPosts.reduce((acc, b) => acc + (b.views || 0), 0)
      };
      
      auditLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const recentActivity = auditLogs.slice(0, 10);
      
      res.json({ success: true, data: { stats, recentActivity } });
    }
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed', success: false });
  }
});

// Upload blog image
const blogUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../uploads/blog');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});

app.post('/api/admin/upload', authenticateToken, isAdmin, blogUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded', success: false });
  res.json({ success: true, url: `/uploads/blog/${req.file.filename}` });
});

// ====================
// VISITOR TRACKING & SECURITY
// ====================
const visitorLog = [];
const securityLog = [];
const blockedIPs = new Set();
let requestCounts = {};

// Visitor tracking middleware
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (req.path.startsWith('/api/') || req.path.match(/\.(js|css|png|jpg|ico|woff|svg)$/)) return next();
  const entry = { path: req.path, ip, ua: req.headers['user-agent'], method: req.method, ts: new Date().toISOString() };
  visitorLog.push(entry);
  if (visitorLog.length > 5000) visitorLog.shift();
  // Rate tracking for security
  const key = ip + '-' + Math.floor(Date.now() / 60000);
  requestCounts[key] = (requestCounts[key] || 0) + 1;
  if (requestCounts[key] > 200) {
    securityLog.push({ type: 'rate_limit', ip, path: req.path, ts: new Date().toISOString(), detail: `${requestCounts[key]} req/min` });
    if (securityLog.length > 2000) securityLog.shift();
  }
  // Clean old rate counts every 5 minutes
  if (Math.random() < 0.01) {
    const cutoff = Math.floor(Date.now() / 60000) - 5;
    Object.keys(requestCounts).forEach(k => { if (parseInt(k.split('-').pop()) < cutoff) delete requestCounts[k]; });
  }
  next();
});

// Track failed logins for security
const originalLoginHandler = app._router.stack;

// Analytics API
app.get('/api/admin/analytics', authenticateToken, isAdmin, (req, res) => {
  const now = Date.now();
  const day = 86400000;
  const todayVisitors = visitorLog.filter(v => now - new Date(v.ts).getTime() < day);
  const weekVisitors = visitorLog.filter(v => now - new Date(v.ts).getTime() < 7 * day);
  // Page views by path
  const pageViews = {};
  todayVisitors.forEach(v => { pageViews[v.path] = (pageViews[v.path] || 0) + 1; });
  // Unique IPs today
  const uniqueIPs = new Set(todayVisitors.map(v => v.ip)).size;
  // Hourly traffic (last 24h)
  const hourly = Array(24).fill(0);
  todayVisitors.forEach(v => { const h = new Date(v.ts).getHours(); hourly[h]++; });
  // Daily traffic (last 7 days)
  const daily = Array(7).fill(0);
  weekVisitors.forEach(v => { const d = Math.floor((now - new Date(v.ts).getTime()) / day); if (d < 7) daily[6 - d]++; });
  // Browser stats
  const browsers = {};
  todayVisitors.forEach(v => {
    const ua = v.ua || '';
    const b = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Other';
    browsers[b] = (browsers[b] || 0) + 1;
  });
  // Device stats
  const devices = { desktop: 0, mobile: 0, tablet: 0 };
  todayVisitors.forEach(v => {
    const ua = v.ua || '';
    if (ua.includes('Mobile')) devices.mobile++;
    else if (ua.includes('Tablet') || ua.includes('iPad')) devices.tablet++;
    else devices.desktop++;
  });
  res.json({ success: true, data: {
    today: { views: todayVisitors.length, unique: uniqueIPs },
    week: { views: weekVisitors.length, unique: new Set(weekVisitors.map(v => v.ip)).size },
    total: { views: visitorLog.length },
    pageViews: Object.entries(pageViews).sort((a, b) => b[1] - a[1]).slice(0, 10),
    hourly, daily, browsers, devices,
    dayLabels: Array(7).fill(0).map((_, i) => { const d = new Date(now - (6 - i) * day); return d.toLocaleDateString('en', { weekday: 'short' }); })
  }});
});

// Security API
app.get('/api/admin/security', authenticateToken, isAdmin, (req, res) => {
  const now = Date.now();
  const day = 86400000;
  const recentThreats = securityLog.filter(s => now - new Date(s.ts).getTime() < day);
  const threatsByType = {};
  recentThreats.forEach(t => { threatsByType[t.type] = (threatsByType[t.type] || 0) + 1; });
  // Security score (100 = perfect, minus points for threats)
  const score = Math.max(0, 100 - recentThreats.length * 2);
  res.json({ success: true, data: {
    score, threats: recentThreats.slice(-50).reverse(),
    threatsByType, blockedIPs: [...blockedIPs].slice(0, 50),
    totalBlocked: blockedIPs.size,
    ssl: process.env.NODE_ENV === 'production',
    rateLimit: { windowMs: 15, maxRequests: 100 },
    summary: { today: recentThreats.length, blocked: blockedIPs.size, failedLogins: recentThreats.filter(t => t.type === 'failed_login').length }
  }});
});

app.post('/api/admin/security/block-ip', authenticateToken, isAdmin, (req, res) => {
  const { ip } = req.body;
  if (ip) { blockedIPs.add(ip); securityLog.push({ type: 'ip_blocked', ip, ts: new Date().toISOString(), detail: 'Manual block' }); }
  res.json({ success: true, message: 'IP blocked' });
});

app.post('/api/admin/security/unblock-ip', authenticateToken, isAdmin, (req, res) => {
  const { ip } = req.body;
  blockedIPs.delete(ip);
  res.json({ success: true, message: 'IP unblocked' });
});


async function readGalleryMetadata() {
  try {
    const metaPath = path.join(dataDir, 'gallery_metadata.json');
    if (!fs.existsSync(metaPath)) return {};
    const content = await fs.promises.readFile(metaPath, 'utf8');
    return JSON.parse(content || '{}');
  } catch (e) {
    console.error('Error reading gallery metadata:', e);
    return {};
  }
}

async function writeGalleryMetadata(meta) {
  try {
    const metaPath = path.join(dataDir, 'gallery_metadata.json');
    await fs.promises.writeFile(metaPath, JSON.stringify(meta, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing gallery metadata:', e);
    return false;
  }
}

// Public Gallery API (no auth required — for index.html)
app.get('/api/gallery', async (req, res) => {
  const galleryDir = path.join(__dirname, '../uploads/gallery');
  if (!fs.existsSync(galleryDir)) return res.json({ success: true, data: [] });
  try {
    const files = fs.readdirSync(galleryDir).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    const metadata = await readGalleryMetadata();
    const images = files.map(f => ({
      filename: f, url: `/uploads/gallery/${f}`,
      uploaded: fs.statSync(path.join(galleryDir, f)).mtime.toISOString(),
      title: metadata[f]?.title || '',
      desc: metadata[f]?.desc || ''
    })).sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
    res.json({ success: true, data: images });
  } catch (e) { res.json({ success: true, data: [] }); }
});

// Gallery API (admin - requires auth)
app.get('/api/admin/gallery', authenticateToken, isAdmin, async (req, res) => {
  const galleryDir = path.join(__dirname, '../uploads/gallery');
  if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });
  try {
    const files = fs.readdirSync(galleryDir).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    const metadata = await readGalleryMetadata();
    const images = files.map(f => ({
      filename: f, url: `/uploads/gallery/${f}`,
      size: fs.statSync(path.join(galleryDir, f)).size,
      uploaded: fs.statSync(path.join(galleryDir, f)).mtime.toISOString(),
      title: metadata[f]?.title || '',
      desc: metadata[f]?.desc || ''
    })).sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
    res.json({ success: true, data: images });
  } catch (e) { res.json({ success: true, data: [] }); }
});

const galleryUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => { const d = path.join(__dirname, '../uploads/gallery'); if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); cb(null, d); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')); }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => { cb(null, /\.(jpg|jpeg|png|webp|gif)$/i.test(path.extname(file.originalname))); }
});

app.post('/api/admin/gallery/upload', authenticateToken, isAdmin, galleryUpload.array('images', 20), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files', success: false });
  const urls = req.files.map(f => ({ filename: f.filename, url: `/uploads/gallery/${f.filename}` }));
  res.json({ success: true, data: urls, message: `${urls.length} image(s) uploaded` });
});

app.put('/api/admin/gallery/:filename', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, desc } = req.body;
    const metadata = await readGalleryMetadata();
    metadata[req.params.filename] = {
      title: title || '',
      desc: desc || ''
    };
    await writeGalleryMetadata(metadata);
    res.json({ success: true, message: 'Image details updated successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message, success: false });
  }
});

app.delete('/api/admin/gallery/:filename', authenticateToken, isAdmin, async (req, res) => {
  const fp = path.join(__dirname, '../uploads/gallery', req.params.filename);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    try {
      const metadata = await readGalleryMetadata();
      if (metadata[req.params.filename]) {
        delete metadata[req.params.filename];
        await writeGalleryMetadata(metadata);
      }
    } catch (err) { /* ignore */ }
    res.json({ success: true });
  }
  else res.status(404).json({ error: 'Not found', success: false });
});

// Career Openings API (job positions, separate from applications)
app.get('/api/career-openings', async (req, res) => {
  if (dbAvailable && pool) {
    try {
      const conn = await pool.getConnection();
      await conn.execute(`CREATE TABLE IF NOT EXISTS career_openings (
        id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, department VARCHAR(100),
        location VARCHAR(200) DEFAULT 'Bangalore, India', type ENUM('full-time','part-time','internship','contract') DEFAULT 'full-time',
        experience VARCHAR(100), description TEXT, requirements TEXT, is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      const [rows] = await conn.execute('SELECT * FROM career_openings WHERE is_active = true ORDER BY created_at DESC');
      conn.release();
      res.json({ success: true, data: rows });
    } catch (e) { res.json({ success: true, data: [] }); }
  } else {
    const openings = await readJsonFile('career_openings.json');
    const activeOpenings = openings.filter(o => o.is_active !== false);
    res.json({ success: true, data: activeOpenings });
  }
});

app.get('/api/admin/career-openings', authenticateToken, isAdmin, async (req, res) => {
  if (dbAvailable && pool) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute('SELECT * FROM career_openings ORDER BY created_at DESC');
      conn.release();
      res.json({ success: true, data: rows });
    } catch (e) { res.json({ success: true, data: [] }); }
  } else {
    const openings = await readJsonFile('career_openings.json');
    openings.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    res.json({ success: true, data: openings });
  }
});

app.post('/api/admin/career-openings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, department, location, type, experience, description, requirements } = req.body;
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      await conn.execute('INSERT INTO career_openings (title,department,location,type,experience,description,requirements) VALUES (?,?,?,?,?,?,?)',
        [title, department || '', location || 'Bangalore, India', type || 'full-time', experience || '', description || '', requirements || '']);
      conn.release();
    } else {
      const openings = await readJsonFile('career_openings.json');
      openings.push({
        id: Date.now(),
        title,
        department: department || '',
        location: location || 'Bangalore, India',
        type: type || 'full-time',
        experience: experience || '',
        description: description || '',
        requirements: requirements || '',
        is_active: true,
        created_at: new Date().toISOString()
      });
      await writeJsonFile('career_openings.json', openings);
    }
    res.json({ success: true, message: 'Opening created' });
  } catch (e) { res.status(500).json({ error: e.message, success: false }); }
});

app.put('/api/admin/career-openings/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, department, location, type, experience, description, requirements, is_active } = req.body;
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      await conn.execute('UPDATE career_openings SET title=?,department=?,location=?,type=?,experience=?,description=?,requirements=?,is_active=? WHERE id=?',
        [title, department, location, type, experience, description, requirements, is_active !== undefined ? is_active : true, req.params.id]);
      conn.release();
    } else {
      const openings = await readJsonFile('career_openings.json');
      const idx = openings.findIndex(o => String(o.id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ error: 'Opening not found', success: false });
      
      openings[idx] = {
        ...openings[idx],
        title: title !== undefined ? title : openings[idx].title,
        department: department !== undefined ? department : openings[idx].department,
        location: location !== undefined ? location : openings[idx].location,
        type: type !== undefined ? type : openings[idx].type,
        experience: experience !== undefined ? experience : openings[idx].experience,
        description: description !== undefined ? description : openings[idx].description,
        requirements: requirements !== undefined ? requirements : openings[idx].requirements,
        is_active: is_active !== undefined ? is_active : openings[idx].is_active,
        updated_at: new Date().toISOString()
      };
      await writeJsonFile('career_openings.json', openings);
    }
    res.json({ success: true, message: 'Opening updated' });
  } catch (e) { res.status(500).json({ error: e.message, success: false }); }
});

app.delete('/api/admin/career-openings/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      await conn.execute('DELETE FROM career_openings WHERE id = ?', [req.params.id]);
      conn.release();
    } else {
      const openings = await readJsonFile('career_openings.json');
      const idx = openings.findIndex(o => String(o.id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ error: 'Opening not found', success: false });
      openings.splice(idx, 1);
      await writeJsonFile('career_openings.json', openings);
    }
    res.json({ success: true, message: 'Opening deleted' });
  } catch (e) { res.status(500).json({ error: e.message, success: false }); }
});

// Settings API
app.get('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  if (dbAvailable && pool) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute('SELECT * FROM website_settings');
      conn.release();
      const settings = {};
      rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
      settings.dbStatus = 'connected';
      res.json({ success: true, data: settings });
    } catch (e) { res.json({ success: true, data: { dbStatus: 'error' } }); }
  } else {
    const settings = await readJsonFile('settings.json', {
      siteName: 'PixelPi Technologies',
      siteEmail: process.env.EMAIL_USER || 'info@pixelpitechnologies.in',
    });
    settings.dbStatus = 'disconnected';
    res.json({ success: true, data: settings });
  }
});

app.put('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    if (dbAvailable && pool) {
      const conn = await pool.getConnection();
      for (const [key, value] of Object.entries(req.body)) {
        await conn.execute('INSERT INTO website_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value]);
      }
      conn.release();
    } else {
      const settings = await readJsonFile('settings.json', {});
      for (const [key, value] of Object.entries(req.body)) {
        settings[key] = value;
      }
      await writeJsonFile('settings.json', settings);
    }
    res.json({ success: true, message: 'Settings saved' });
  } catch (e) { res.status(500).json({ error: e.message, success: false }); }
});

// ====================
// STATIC FILES & ROUTES
// ====================

// Serve static files from public directory
app.use(express.static(publicDir, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve admin.html at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

// Serve career.html
app.get('/career', (req, res) => {
  res.sendFile(path.join(publicDir, 'career.html'));
});

app.get('/careers', (req, res) => {
  res.redirect(301, '/career');
});



// Serve blog.html
app.get('/blog', (req, res) => {
  res.sendFile(path.join(publicDir, 'blog.html'));
});

app.get('/blog/:slug', (req, res) => {
  res.sendFile(path.join(publicDir, 'blog.html'));
});

// Redirects for SEO
app.get('/services', (req, res) => { res.redirect(301, '/#services'); });
app.get('/contact', (req, res) => { res.redirect(301, '/#contact'); });
app.get('/about', (req, res) => { res.redirect(301, '/#vision'); });
app.get('/gallery', (req, res) => { res.redirect(301, '/#gallery'); });
app.get('/collaborate', (req, res) => { res.redirect(301, '/#collaboration'); });

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ====================
// ERROR HANDLING
// ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Page not found',
    message: 'The requested resource could not be found',
    success: false,
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our server',
    success: false,
    timestamp: new Date().toISOString()
  });
});

// ====================
// START SERVER
// ====================

async function startServer() {
  try {
    // Initialize database (will not crash if MySQL unavailable)
    await initializeDatabase();
    
    const dbStatus = dbAvailable ? 'MySQL (Connected)' : 'DISCONNECTED - MySQL not running';
    
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║   🚀 PixelPi Technologies Server Started Successfully!                   ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║   📍 Server: http://localhost:${PORT}                                    ║
║   🌐 Environment: ${process.env.NODE_ENV || 'development'}               ║
║   🗄️  Database: ${dbStatus}
║   📁 Blog Page: http://localhost:${PORT}/blog                            ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║   🌐 Website URLs:                                                       ║
║   • Main Site: http://localhost:${PORT}/                                 ║
║   • Blog: http://localhost:${PORT}/blog                                  ║
║   • Admin Panel: http://localhost:${PORT}/admin                          ║
║   • Careers Page: http://localhost:${PORT}/career                        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();