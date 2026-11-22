const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  language: {
    type: DataTypes.ENUM('cpp', 'javascript', 'java', 'python'),
    allowNull: false
  },
  marksAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  feedback: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'submissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'questionId']
    }
  ]
});

module.exports = Submission;
