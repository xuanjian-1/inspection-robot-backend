const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// 创建管理员（仅超级管理员）
router.post('/create-admin', authenticate, authorize('super_admin'), adminController.createAdmin);
// 禁用/启用用户（管理员/超级管理员）
router.post('/toggle-user-status', authenticate, authorize('super_admin', 'admin'), adminController.toggleUserStatus);
// 重置密码（管理员/超级管理员）
router.post('/reset-password', authenticate, authorize('super_admin', 'admin'), adminController.resetUserPassword);
// 查看机器人绑定记录（管理员/超级管理员）
router.get('/robot-bind-records', authenticate, authorize('super_admin', 'admin'), adminController.getRobotBindRecords);

module.exports = router;