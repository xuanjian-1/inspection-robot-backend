const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  task_no: { type: DataTypes.STRING(20), allowNull: false, unique: true }, // 任务编号
  name: { type: DataTypes.STRING(50), allowNull: false }, // 任务名称
  user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } }, // 创建用户
  robot_id: { type: DataTypes.INTEGER, references: { model: 'robots', key: 'id' } }, // 执行机器人
  map_id: { type: DataTypes.INTEGER, references: { model: 'maps', key: 'id' } }, // 关联地图
  type: { type: DataTypes.ENUM('routine', 'emergency', 'fixed'), defaultValue: 'routine' }, // 任务类型
  start_point: { type: DataTypes.STRING(50), allowNull: false }, // 起点坐标（lng,lat）
  end_point: { type: DataTypes.STRING(50), allowNull: false }, // 终点坐标
  path_points: { type: DataTypes.TEXT }, // 路径点序列（JSON字符串）
  mode: { type: DataTypes.ENUM('once', 'loop'), defaultValue: 'once' }, // 巡检模式（单次/来回）
  priority: { type: DataTypes.INTEGER, defaultValue: 1 }, // 优先级1-5
  status: { type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'), defaultValue: 'pending' }, // 状态
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: true, underscored: true, tableName: 'tasks' });

module.exports = Task;