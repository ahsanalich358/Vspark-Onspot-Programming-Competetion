const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EventLog = sequelize.define('EventLog', {
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
  eventType: {
    type: DataTypes.ENUM('tab_switch', 'window_blur', 'copy_attempt', 'paste_attempt', 'shortcut_blocked'),
    allowNull: false
  },
  details: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'event_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['studentId', 'eventType']
    }
  ]
});

module.exports = EventLog;
