const rateLimit = require('express-rate-limit');

// Helper: skip rate limiting on localhost or in development
const isLocal = (req) => {
  return process.env.NODE_ENV === 'development' || 
         req.ip === '127.0.0.1' || 
         req.ip === '::1' || 
         req.ip === '::ffff:127.0.0.1';
};

// Login rate limiter - prevent brute force attacks in production, relaxed for local dev
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // relaxed threshold
  skip: isLocal,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,
  skip: isLocal,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Submission rate limiter
exports.submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  skip: isLocal,
  message: { message: 'Too many submissions, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});
