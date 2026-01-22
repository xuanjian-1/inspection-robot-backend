const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Map = sequelize.define('Map', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  creator_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  robot_id: { type: DataTypes.INTEGER, references: { model: 'robots', key: 'id' } },
  type: { type: DataTypes.ENUM('2d', '3d', '2d_3d'), defaultValue: '2d_3d' },
  boundary_points: { type: DataTypes.TEXT }, // 2D边界坐标（JSON字符串）
  obstacle_points: { type: DataTypes.TEXT }, // 障碍物坐标（JSON字符串）
  three_d_boundary: { type: DataTypes.TEXT }, // 3D边界坐标（JSON字符串）
  resolution: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'high' },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
}, { timestamps: true, underscored: true, tableName: 'maps' });

module.exports = Map;