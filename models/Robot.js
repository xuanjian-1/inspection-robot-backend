const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Robot = sequelize.define('Robot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  robot_no: { type: DataTypes.STRING(20), allowNull: false, unique: true }, // 机器人编号
  bluetooth_id: { type: DataTypes.STRING(100) }, // 蓝牙设备ID
  status: { type: DataTypes.ENUM('online', 'offline', 'error'), defaultValue: 'offline' },
  bind_user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } }, // 绑定用户
  last_position_x: { type: DataTypes.DOUBLE }, // 最后定位X
  last_position_y: { type: DataTypes.DOUBLE }, // 最后定位Y
  battery: { type: DataTypes.DOUBLE, defaultValue: 100 } // 电池电量
}, { timestamps: true, underscored: true, tableName: 'robots' });

module.exports = Robot;