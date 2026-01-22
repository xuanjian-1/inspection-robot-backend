const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OperationLog = sequelize.define('OperationLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  operator_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  operation: { type: DataTypes.STRING(50), allowNull: false }, // 操作类型（login/register等）
  detail: { type: DataTypes.TEXT }, // 操作详情
  ip: { type: DataTypes.STRING(50) } // 操作IP
}, { timestamps: true, underscored: true, tableName: 'operation_logs' });

module.exports = OperationLog;