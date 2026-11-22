const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  problemStatement: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sampleInput: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  sampleOutput: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Tough'),
    allowNull: false
  },
  marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  validLanguages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'questions',
  timestamps: true
});

// Set marks based on difficulty before validation if not explicitly provided
Question.beforeValidate((question) => {
  if (question.marks !== undefined && question.marks !== null && question.marks !== '') {
    question.marks = parseInt(question.marks, 10);
    return;
  }
  if (question.difficulty) {
    switch(question.difficulty) {
      case 'Easy':
        question.marks = 10;
        break;
      case 'Medium':
        question.marks = 20;
        break;
      case 'Tough':
        // Teacher choice: defaults to 10 marks per question (for 3 Tough questions = 30 marks total)
        question.marks = 10;
        break;
      default:
        question.marks = 10;
    }
  }
});

module.exports = Question;
