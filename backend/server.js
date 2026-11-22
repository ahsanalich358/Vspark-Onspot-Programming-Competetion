const path = require('path');
const dotenv = require('dotenv');

// Load environment variables immediately before any other module loads
dotenv.config({ path: path.join(__dirname, '.env') });

const fs = require('fs');
const debugLogPath = path.join(__dirname, 'server_debug.log');
function debugLog(...args) {
  try {
    const line = `[${new Date().toISOString()}] ${args.map(a => (a && a.stack) ? a.stack : (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}\n`;
    fs.appendFileSync(debugLogPath, line);
  } catch (e) {}
}

// Global safety and lifecycle logging handlers
process.on('exit', (code) => {
  debugLog('PROCESS EXIT WITH CODE:', code);
});

process.on('SIGINT', () => {
  debugLog('RECEIVED SIGINT');
});

process.on('SIGTERM', () => {
  debugLog('RECEIVED SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  debugLog('UNHANDLED REJECTION:', reason);
  console.error('Unhandled Rejection (recovered):', reason);
});

process.on('uncaughtException', (err) => {
  debugLog('UNCAUGHT EXCEPTION:', err);
  console.error('Uncaught Exception:', err);
  if (err.code === 'EADDRINUSE') {
    process.exit(1);
  }
});

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');

// Connect to PostgreSQL and sync models
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VSPARK API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
