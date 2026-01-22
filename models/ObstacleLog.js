// models/ObstacleLog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 定义障碍物日志模型
const ObstacleLog = sequelize.define('ObstacleLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  robotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '机器人ID'
  },
  position: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '障碍物位置（经度、纬度）'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '障碍物类型'
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: '距离（米）'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  }
}, {
  tableName: 'obstacle_logs',
  timestamps: false
});

module.exports = ObstacleLog;