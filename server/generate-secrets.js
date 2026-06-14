// generate-secrets.js
const crypto = require('crypto');

console.log('🔐 Generating secure secrets...\n');

// Generate JWT Secret (64 characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret + '\n');

// Generate Session Secret (32 characters)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET=' + sessionSecret + '\n');

console.log('✅ Copy these to your .env file');