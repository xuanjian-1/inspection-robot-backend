const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

// 登录校验（所有需登录的接口必须通过）
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ code: 401, message: '请先登录' });
    
    // 验证JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.status === 'disabled') {
      return res.status(403).json({ code: 403, message: '账号已禁用' });
    }
    
    req.user = user; // 挂载用户信息到req
    next();
  } catch (err) {
    res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
};

// 角色权限校验（如超级管理员才能创建管理员）
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '无权限执行此操作' });
    }
    next();
  };
};