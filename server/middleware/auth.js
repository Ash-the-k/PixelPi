// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT tokens
const authenticateToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      success: false 
    });
  }
  
  try {
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Add user info to request
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      success: false 
    });
  }
};

// Generate JWT token
const generateToken = (userData) => {
  return jwt.sign(
    { 
      id: userData.id,
      email: userData.email,
      role: userData.role || 'user' 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // Token expires in 24 hours
  );
};

// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin rights required.',
      success: false 
    });
  }
  next();
};

module.exports = { authenticateToken, generateToken, isAdmin }; 