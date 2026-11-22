const { body, validationResult } = require('express-validator');

// Validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    return res.status(400).json({ 
      message: errorList[0]?.msg || 'Validation failed',
      errors: errorList 
    });
  }
  next();
};

// Admin registration validation
exports.validateAdminRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Student registration validation
exports.validateStudentRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim(),
  body('university')
    .trim()
    .notEmpty()
    .withMessage('University is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('participationMode')
    .optional()
    .isIn(['individual', 'group'])
    .withMessage('Participation mode must be individual or group')
];

// Question validation
exports.validateQuestion = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('problemStatement')
    .trim()
    .notEmpty()
    .withMessage('Problem statement is required'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Tough'])
    .withMessage('Difficulty must be Easy, Medium, or Tough'),
  body('marks')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 60 })
    .withMessage('Marks must be an integer between 1 and 60'),
  body('validLanguages')
    .isArray({ min: 1 })
    .withMessage('At least one valid language must be selected')
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Sanitize inputs to prevent NoSQL injection
exports.sanitizeInput = (req, res, next) => {
  // Remove any MongoDB operators from request body
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    });
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};
