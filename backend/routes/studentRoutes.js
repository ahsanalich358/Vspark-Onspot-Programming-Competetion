const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protectStudent, generateToken } = require('../middleware/auth');
const { validate, validateStudentRegistration, validateLogin, sanitizeInput } = require('../middleware/validation');
const { loginLimiter, submissionLimiter } = require('../middleware/rateLimiter');
const { Student, Question, Submission, EventLog, QuizSettings } = require('../models');

// @route   POST /api/students/register
// @desc    Register a new student
// @access  Public
router.post('/register', sanitizeInput, validateStudentRegistration, validate, async (req, res) => {
  try {
    const { fullName, email, phone, university, password, participationMode, groupMember } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Create student
    const studentData = {
      fullName,
      email,
      phone: phone || '',
      university: university || 'COMSATS University Islamabad, Vehari Campus',
      password,
      participationMode: participationMode || 'individual'
    };

    // Add group member if participation mode is group
    if (participationMode === 'group' && groupMember) {
      studentData.groupMemberName = groupMember.fullName;
      studentData.groupMemberEmail = groupMember.email;
      studentData.groupMemberPhone = groupMember.phone;
    }

    const student = await Student.create(studentData);

    // Generate token
    const token = generateToken(student.id, 'student');

    res.status(201).json({
      message: 'Registration successful',
      token,
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        participationMode: student.participationMode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/students/login
// @desc    Login student
// @access  Public
router.post('/login', loginLimiter, sanitizeInput, validateLogin, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student
    const student = await Student.findOne({ where: { email } });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(student.id, 'student');

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        competitionCode: student.competitionCode,
        participationMode: student.participationMode,
        selectedLanguage: student.selectedLanguage,
        quizStartTime: student.quizStartTime,
        quizSubmitted: student.quizSubmitted
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/students/profile
// @desc    Get student profile
// @access  Private (Student only)
router.get('/profile', protectStudent, async (req, res) => {
  try {
    const student = await Student.findByPk(req.student.id, {
      attributes: { exclude: ['password'] }
    });
    
    // Format group member data
    const profile = student.toJSON();
    if (profile.participationMode === 'group' && profile.groupMemberName) {
      profile.groupMember = {
        fullName: profile.groupMemberName,
        email: profile.groupMemberEmail,
        phone: profile.groupMemberPhone
      };
      delete profile.groupMemberName;
      delete profile.groupMemberEmail;
      delete profile.groupMemberPhone;
    }
    
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/students/select-language
// @desc    Select programming language before quiz
// @access  Private (Student only)
router.post('/select-language', protectStudent, sanitizeInput, async (req, res) => {
  try {
    const { language } = req.body;

    // Validate language
    const validLanguages = ['cpp', 'javascript', 'java', 'python'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ message: 'Invalid language selection' });
    }

    // Check if student already selected language
    if (req.student.selectedLanguage) {
      return res.status(400).json({ message: 'Language already selected. Cannot change once set.' });
    }

    await req.student.update({ selectedLanguage: language });

    res.json({
      message: 'Language selected successfully',
      selectedLanguage: language
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/students/start-quiz
// @desc    Start the quiz
// @access  Private (Student only)
router.post('/start-quiz', protectStudent, async (req, res) => {
  try {
    // Check if quiz is active
    const quizSettings = await QuizSettings.findOne();
    if (!quizSettings || !quizSettings.isActive) {
      return res.status(400).json({ message: 'Quiz is not active' });
    }

    // Check if student has selected language
    if (!req.student.selectedLanguage) {
      return res.status(400).json({ message: 'Please select a programming language first' });
    }

    // Check if student already started quiz
    if (req.student.quizStartTime) {
      return res.status(400).json({ message: 'Quiz already started' });
    }

    // Set quiz start time and calculate end time
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + quizSettings.duration * 60000);

    await req.student.update({
      quizStartTime: startTime,
      quizEndTime: endTime
    });

    res.json({
      message: 'Quiz started successfully',
      startTime,
      endTime,
      duration: quizSettings.duration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/students/questions
// @desc    Get questions for student's selected language
// @access  Private (Student only)
router.get('/questions', protectStudent, async (req, res) => {
  try {
    // Check if student has started quiz
    if (!req.student.quizStartTime) {
      return res.status(400).json({ message: 'Quiz not started yet' });
    }

    // Check if quiz time has expired (server-side validation)
    if (new Date() > req.student.quizEndTime) {
      return res.status(400).json({ message: 'Quiz time has expired' });
    }

    // Get questions valid for student's selected language
    const questions = await Question.findAll({
      where: {
        validLanguages: { [Op.contains]: [req.student.selectedLanguage] },
        isActive: true
      },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      order: [['difficulty', 'ASC']]
    });

    // Get student's submissions to show which questions are answered
    const submissions = await Submission.findAll({
      where: { studentId: req.student.id },
      attributes: ['questionId']
    });
    const submittedQuestions = submissions.map(sub => sub.questionId);

    const questionsWithStatus = questions.map(q => ({
      ...q.toJSON(),
      isSubmitted: submittedQuestions.includes(q.id)
    }));

    res.json({
      questions: questionsWithStatus,
      timeRemaining: Math.max(0, req.student.quizEndTime - new Date())
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/students/submit-answer
// @desc    Submit answer for a question
// @access  Private (Student only)
router.post('/submit-answer', protectStudent, submissionLimiter, sanitizeInput, async (req, res) => {
  try {
    const { questionId, code } = req.body;

    // Validate input
    if (!questionId || !code) {
      return res.status(400).json({ message: 'Question ID and code are required' });
    }

    // Check if student has started quiz
    if (!req.student.quizStartTime) {
      return res.status(400).json({ message: 'Quiz not started yet' });
    }

    // Check if quiz time has expired (server-side validation)
    if (new Date() > req.student.quizEndTime) {
      return res.status(400).json({ message: 'Quiz time has expired. Cannot submit answer.' });
    }

    // Validate question exists and is valid for student's language
    const question = await Question.findOne({
      where: {
        id: questionId,
        validLanguages: { [Op.contains]: [req.student.selectedLanguage] },
        isActive: true
      }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found or not valid for your selected language' });
    }

    // Check if submission already exists, update it; otherwise create new
    const [submission, created] = await Submission.findOrCreate({
      where: {
        studentId: req.student.id,
        questionId: questionId
      },
      defaults: {
        code,
        language: req.student.selectedLanguage,
        submittedAt: new Date()
      }
    });

    if (!created) {
      await submission.update({
        code,
        submittedAt: new Date()
      });
    }

    res.json({
      message: 'Answer submitted successfully',
      submission: {
        id: submission.id,
        questionId: submission.questionId,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/students/submit-quiz
// @desc    Submit final quiz
// @access  Private (Student only)
router.post('/submit-quiz', protectStudent, async (req, res) => {
  try {
    // Check if already submitted
    if (req.student.quizSubmitted) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    // Mark quiz as submitted
    await req.student.update({ quizSubmitted: true });

    res.json({
      message: 'Quiz submitted successfully',
      submittedAt: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/students/my-submissions
// @desc    Get student's own submissions
// @access  Private (Student only)
router.get('/my-submissions', protectStudent, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { studentId: req.student.id },
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

// @route   POST /api/students/log-event
// @desc    Log anti-cheating events (tab switch, window blur, etc.)
// @access  Private (Student only)
router.post('/log-event', protectStudent, sanitizeInput, async (req, res) => {
  try {
    const { eventType, details } = req.body;

    // Validate event type
    const validEvents = ['tab_switch', 'window_blur', 'copy_attempt', 'paste_attempt', 'shortcut_blocked'];
    if (!validEvents.includes(eventType)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    // Create event log
    await EventLog.create({
      studentId: req.student.id,
      eventType,
      details: details || ''
    });

    // Don't send detailed response to avoid giving information to cheaters
    res.json({ message: 'Event logged' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/quiz-status
// @desc    Get current quiz status and time remaining
// @access  Private (Student only)
router.get('/quiz-status', protectStudent, async (req, res) => {
  try {
    const quizSettings = await QuizSettings.findOne();
    
    if (!req.student.quizStartTime) {
      return res.json({
        hasStarted: false,
        isActive: quizSettings?.isActive || false,
        hasSubmitted: req.student.quizSubmitted
      });
    }

    const now = new Date();
    const timeRemaining = Math.max(0, req.student.quizEndTime - now);
    const hasExpired = now > req.student.quizEndTime;

    res.json({
      hasStarted: true,
      startTime: req.student.quizStartTime,
      endTime: req.student.quizEndTime,
      timeRemaining,
      hasExpired,
      hasSubmitted: req.student.quizSubmitted,
      selectedLanguage: req.student.selectedLanguage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
