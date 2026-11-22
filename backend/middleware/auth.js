const jwt = require('jsonwebtoken');
const { Admin, Student } = require('../models');

// Protect admin routes
exports.protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is admin
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }

      // Get admin from token
      req.admin = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Protect student routes
exports.protectStudent = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is student
      if (decoded.role !== 'student') {
        return res.status(403).json({ message: 'Access denied. Student only.' });
      }

      // Get student from token
      req.student = await Student.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.student) {
        return res.status(401).json({ message: 'Student not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Generate JWT token
exports.generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
