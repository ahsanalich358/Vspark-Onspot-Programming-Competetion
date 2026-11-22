const { sequelize } = require('../config/database');
const Admin = require('./Admin');
const Student = require('./Student');
const Question = require('./Question');
const Submission = require('./Submission');
const QuizSettings = require('./QuizSettings');
const EventLog = require('./EventLog');

// Define relationships
Student.hasMany(Submission, { foreignKey: 'studentId', as: 'submissions' });
Submission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Question.hasMany(Submission, { foreignKey: 'questionId', as: 'submissions' });
Submission.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

Student.hasMany(EventLog, { foreignKey: 'studentId', as: 'eventLogs' });
EventLog.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

module.exports = {
  sequelize,
  Admin,
  Student,
  Question,
  Submission,
  QuizSettings,
  EventLog
};
