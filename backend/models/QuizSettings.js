const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizSettings = sequelize.define('QuizSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: false,
    defaultValue: 120
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'quiz_settings',
  timestamps: true
});

module.exports = QuizSettings;
