const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  university: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  competitionCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  participationMode: {
    type: DataTypes.ENUM('individual', 'group'),
    allowNull: false
  },
  groupMemberName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  groupMemberEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  groupMemberPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  selectedLanguage: {
    type: DataTypes.ENUM('cpp', 'javascript', 'java', 'python', ''),
    defaultValue: ''
  },
  quizStartTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  quizEndTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  quizSubmitted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  finalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  marksReviewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'students',
  timestamps: true
});

// Hash password before saving
Student.beforeSave(async (student) => {
  if (student.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(student.password, salt);
  }
});

// Instance method to compare password
Student.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Student;
