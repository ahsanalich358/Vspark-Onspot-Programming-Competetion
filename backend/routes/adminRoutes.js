const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { Op } = require('sequelize');
const { protectAdmin, generateToken } = require('../middleware/auth');
const { validate, validateAdminRegistration, validateLogin, validateQuestion, sanitizeInput } = require('../middleware/validation');
const { loginLimiter } = require('../middleware/rateLimiter');
const { Admin, Student, Question, Submission, EventLog, QuizSettings } = require('../models');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// @route   POST /api/admin/register
// @desc    Register admin (first time setup)
// @access  Public (should be protected in production)
router.post('/register', sanitizeInput, validateAdminRegistration, validate, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });
    
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create admin
    const admin = await Admin.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(admin.id, 'admin');

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/login
// @desc    Login admin
// @access  Public
router.post('/login', loginLimiter, sanitizeInput, validateLogin, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({ 
        message: 'Account is locked due to too many failed login attempts. Try again later.' 
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      admin.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (admin.failedLoginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      
      await admin.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    // Generate token
    const token = generateToken(admin.id, 'admin');

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/questions
// @desc    Create a new question
// @access  Private (Admin only)
router.post('/questions', protectAdmin, sanitizeInput, validateQuestion, validate, async (req, res) => {
  try {
    const { title, problemStatement, sampleInput, sampleOutput, difficulty, marks, validLanguages } = req.body;

    const question = await Question.create({
      title,
      problemStatement,
      sampleInput: sampleInput || '',
      sampleOutput: sampleOutput || '',
      difficulty,
      marks: (marks !== undefined && marks !== null && marks !== '') ? parseInt(marks, 10) : undefined,
      validLanguages
    });

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/questions
// @desc    Get all questions
// @access  Private (Admin only)
router.get('/questions', protectAdmin, async (req, res) => {
  try {
    const questions = await Question.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total marks and breakdown
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    const easyMarks = questions.filter(q => q.difficulty === 'Easy').reduce((sum, q) => sum + (q.marks || 0), 0);
    const mediumMarks = questions.filter(q => q.difficulty === 'Medium').reduce((sum, q) => sum + (q.marks || 0), 0);
    const toughMarks = questions.filter(q => q.difficulty === 'Tough').reduce((sum, q) => sum + (q.marks || 0), 0);
    const toughCount = questions.filter(q => q.difficulty === 'Tough').length;
    
    res.json({
      questions,
      totalMarks,
      targetMarks: 60,
      isValid: totalMarks === 60,
      breakdown: {
        easyMarks,
        mediumMarks,
        toughMarks,
        toughCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/questions/:id
// @desc    Update a question
// @access  Private (Admin only)
router.put('/questions/:id', protectAdmin, sanitizeInput, validateQuestion, validate, async (req, res) => {
  try {
    const { title, problemStatement, sampleInput, sampleOutput, difficulty, marks, validLanguages } = req.body;

    const question = await Question.findByPk(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.update({
      title,
      problemStatement,
      sampleInput: sampleInput !== undefined ? sampleInput : question.sampleInput,
      sampleOutput: sampleOutput !== undefined ? sampleOutput : question.sampleOutput,
      difficulty,
      marks: (marks !== undefined && marks !== null && marks !== '') ? parseInt(marks, 10) : question.marks,
      validLanguages
    });

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/questions/:id
// @desc    Delete a question
// @access  Private (Admin only)
router.delete('/questions/:id', protectAdmin, async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.destroy();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/questions/bulk-upload
// @desc    Bulk upload questions from CSV/JSON
// @access  Private (Admin only)
router.post('/questions/bulk-upload', protectAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const results = {
      success: [],
      failed: []
    };

    // Check file type
    if (req.file.mimetype === 'application/json' || req.file.originalname.endsWith('.json')) {
      // Handle JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const questions = JSON.parse(fileContent);

      for (let i = 0; i < questions.length; i++) {
        try {
          const q = questions[i];
          await Question.create({
            title: q.title,
            problemStatement: q.problemStatement,
            sampleInput: q.sampleInput || '',
            sampleOutput: q.sampleOutput || '',
            difficulty: q.difficulty,
            marks: (q.marks !== undefined && q.marks !== null && q.marks !== '') ? parseInt(q.marks, 10) : undefined,
            validLanguages: q.validLanguages
          });
          results.success.push({ row: i + 1, title: q.title });
        } catch (error) {
          results.failed.push({ row: i + 1, error: error.message });
        }
      }

      fs.unlinkSync(filePath);

      res.json({
        message: 'Bulk upload completed',
        results
      });
    } else if (req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv')) {
      // Handle CSV file
      const questions = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => questions.push(data))
        .on('end', async () => {
          for (let i = 0; i < questions.length; i++) {
            try {
              const q = questions[i];
              const validLanguages = q.validLanguages ? q.validLanguages.split(',').map(lang => lang.trim()) : [];
              
              await Question.create({
                title: q.title,
                problemStatement: q.problemStatement,
                sampleInput: q.sampleInput || '',
                sampleOutput: q.sampleOutput || '',
                difficulty: q.difficulty,
                marks: (q.marks !== undefined && q.marks !== null && q.marks !== '') ? parseInt(q.marks, 10) : undefined,
                validLanguages
              });
              results.success.push({ row: i + 2, title: q.title });
            } catch (error) {
              results.failed.push({ row: i + 2, error: error.message });
            }
          }

          fs.unlinkSync(filePath);

          res.json({
            message: 'Bulk upload completed',
            results
          });
        });
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Invalid file format. Please upload CSV or JSON' });
    }
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/quiz-settings
// @desc    Get quiz settings
// @access  Private (Admin only)
router.get('/quiz-settings', protectAdmin, async (req, res) => {
  try {
    let settings = await QuizSettings.findOne();
    
    if (!settings) {
      settings = await QuizSettings.create({ duration: 120 });
    }

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/quiz-settings
// @desc    Update quiz settings
// @access  Private (Admin only)
router.put('/quiz-settings', protectAdmin, sanitizeInput, async (req, res) => {
  try {
    const { duration, isActive } = req.body;

    let settings = await QuizSettings.findOne();
    
    if (!settings) {
      settings = await QuizSettings.create({ duration, isActive });
    } else {
      await settings.update({
        duration: duration !== undefined ? duration : settings.duration,
        isActive: isActive !== undefined ? isActive : settings.isActive
      });
    }

    res.json({
      message: 'Quiz settings updated successfully',
      settings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/students
// @desc    Get all registered students
// @access  Private (Admin only)
router.get('/students', protectAdmin, async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/submissions
// @desc    Get all submissions
// @access  Private (Admin only)
router.get('/submissions', protectAdmin, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'fullName', 'email', 'competitionCode']
        },
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'title', 'difficulty', 'marks']
        }
      ],
      order: [['submittedAt', 'DESC']]
    });
    
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/submissions/student/:studentId
// @desc    Get submissions by student
// @access  Private (Admin only)
router.get('/submissions/student/:studentId', protectAdmin, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { studentId: req.params.studentId },
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'title', 'difficulty', 'marks']
        }
      ],
      order: [['submittedAt', 'DESC']]
    });
    
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/submissions/:id/grade
// @desc    Grade a submission
// @access  Private (Admin only)
router.put('/submissions/:id/grade', protectAdmin, sanitizeInput, async (req, res) => {
  try {
    const { marksAwarded, feedback } = req.body;

    const submission = await Submission.findByPk(req.params.id, {
      include: [{ model: Question, as: 'question' }]
    });
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Validate marks
    if (marksAwarded < 0 || marksAwarded > submission.question.marks) {
      return res.status(400).json({ 
        message: `Marks must be between 0 and ${submission.question.marks}` 
      });
    }

    await submission.update({
      marksAwarded,
      feedback: feedback || ''
    });

    // Update student's total marks
    const allSubmissions = await Submission.findAll({
      where: { studentId: submission.studentId }
    });
    const totalMarks = allSubmissions.reduce((sum, sub) => sum + sub.marksAwarded, 0);
    
    await Student.update(
      { finalMarks: totalMarks },
      { where: { id: submission.studentId } }
    );

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/students/:id/review
// @desc    Mark student as reviewed
// @access  Private (Admin only)
router.put('/students/:id/review', protectAdmin, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.update({ marksReviewed: true });

    res.json({
      message: 'Student marked as reviewed',
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/event-logs/:studentId
// @desc    Get event logs for a student
// @access  Private (Admin only)
router.get('/event-logs/:studentId', protectAdmin, async (req, res) => {
  try {
    const logs = await EventLog.findAll({
      where: { studentId: req.params.studentId },
      order: [['timestamp', 'DESC']]
    });
    
    // Aggregate counts by event type
    const summary = {};
    logs.forEach(log => {
      summary[log.eventType] = (summary[log.eventType] || 0) + 1;
    });

    res.json({
      logs,
      summary,
      totalEvents: logs.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/generate-codes
// @desc    Generate competition codes for students
// @access  Private (Admin only)
router.post('/generate-codes', protectAdmin, async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { competitionCode: null }
    });
    
    const codes = [];
    
    for (const student of students) {
      // Generate unique code (VS + 6 random characters)
      let code;
      let isUnique = false;
      
      while (!isUnique) {
        code = 'VS' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const existing = await Student.findOne({ where: { competitionCode: code } });
        if (!existing) {
          isUnique = true;
        }
      }
      
      await student.update({ competitionCode: code });
      
      codes.push({
        name: student.fullName,
        email: student.email,
        code: code
      });
    }

    res.json({
      message: `Generated ${codes.length} competition codes`,
      codes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/download-codes
// @desc    Download competition codes
// @access  Private (Admin only)
router.get('/download-codes', protectAdmin, async (req, res) => {
  try {
    const { format = 'txt' } = req.query;
    const students = await Student.findAll({
      where: { competitionCode: { [Op.ne]: null } },
      attributes: ['fullName', 'email', 'competitionCode']
    });

    if (format === 'csv') {
      let csv = 'Name,Email,Competition Code\n';
      students.forEach(student => {
        csv += `${student.fullName},${student.email},${student.competitionCode}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=competition-codes.csv');
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=competition-codes.json');
      res.send(JSON.stringify(students, null, 2));
    } else {
      // Default: plain text
      let text = 'VSPARK Competition Codes\n' + '='.repeat(50) + '\n\n';
      students.forEach(student => {
        text += `Name: ${student.fullName}\n`;
        text += `Email: ${student.email}\n`;
        text += `Code: ${student.competitionCode}\n`;
        text += '-'.repeat(50) + '\n';
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=competition-codes.txt');
      res.send(text);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard-stats', protectAdmin, async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalQuestions = await Question.count();
    const totalSubmissions = await Submission.count();
    const studentsSubmitted = await Student.count({ where: { quizSubmitted: true } });
    
    const questions = await Question.findAll();
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    const easyMarks = questions.filter(q => q.difficulty === 'Easy').reduce((sum, q) => sum + (q.marks || 0), 0);
    const mediumMarks = questions.filter(q => q.difficulty === 'Medium').reduce((sum, q) => sum + (q.marks || 0), 0);
    const toughMarks = questions.filter(q => q.difficulty === 'Tough').reduce((sum, q) => sum + (q.marks || 0), 0);
    const toughCount = questions.filter(q => q.difficulty === 'Tough').length;

    res.json({
      totalStudents,
      totalQuestions,
      totalSubmissions,
      studentsSubmitted,
      totalMarks,
      targetMarks: 60,
      isMarksValid: totalMarks === 60,
      breakdown: {
        easyMarks,
        mediumMarks,
        toughMarks,
        toughCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
