// routes/authRoutes.js
// 1. 导入Express和Router核心模块
const express = require('express');
const router = express.Router(); // 关键：初始化Router对象

// 2. 导入控制器（路径必须正确）
const authController = require('../controllers/authController');

// 3. 定义路由（处理函数为控制器中的有效函数）
router.post('/login', authController.login);    // 登录
router.post('/register', authController.register); // 注册
router.get('/profile', authController.profile); // 获取用户信息

// 4. 导出路由（供server.js导入）
module.exports = router;