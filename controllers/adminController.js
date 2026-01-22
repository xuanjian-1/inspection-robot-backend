const User = require('../models/User');
const Robot = require('../models/Robot');
const OperationLog = require('../models/OperationLog');
const bcrypt = require('bcryptjs');

// 1. 超级管理员创建普通管理员
exports.createAdmin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const superAdmin = req.user;
    
    // 仅超级管理员可操作
    if (superAdmin.role !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '仅超级管理员可创建管理员' });
    }
    
    // 手机号唯一性校验
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ code: 400, message: '该手机号已注册' });
    }
    
    // 创建管理员（role=admin）
    const admin = await User.create({ phone, password, role: 'admin' });
    
    // 记录日志
    await OperationLog.create({
      operator_id: superAdmin.id,
      operation: 'create_admin',
      detail: `创建管理员账号${phone}`,
      ip: req.ip
    });
    
    res.status(201).json({ code: 200, message: '管理员创建成功', data: { admin } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建失败', error: err.message });
  }
};

// 2. 管理员禁用/启用普通用户
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const admin = req.user;
    
    // 不能修改超级管理员
    const user = await User.findByPk(userId);
    if (user.role === 'super_admin') {
      return res.status(403).json({ code: 403, message: '无法修改超级管理员状态' });
    }
    
    // 更新状态
    user.status = status;
    await user.save();
    
    // 记录日志
    await OperationLog.create({
      operator_id: admin.id,
      operation: 'toggle_user_status',
      detail: `将用户${user.phone}状态改为${status}`,
      ip: req.ip
    });
    
    res.status(200).json({ code: 200, message: '用户状态更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新失败', error: err.message });
  }
};

// 3. 管理员重置用户密码
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const admin = req.user;
    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
    
    // 密码加密
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    // 记录日志
    await OperationLog.create({
      operator_id: admin.id,
      operation: 'reset_password',
      detail: `重置用户${user.phone}密码`,
      ip: req.ip
    });
    
    res.status(200).json({ code: 200, message: '密码重置成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '重置失败', error: err.message });
  }
};

// 4. 管理员查看所有机器人绑定记录
exports.getRobotBindRecords = async (req, res) => {
  try {
    const robots = await Robot.findAll({
      include: [{ model: User, attributes: ['id', 'phone', 'role'] }] // 关联用户信息
    });
    
    res.status(200).json({ code: 200, data: { robots } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取记录失败', error: err.message });
  }
};