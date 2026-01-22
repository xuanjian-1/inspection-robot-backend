// controllers/authController.js
// 导入密码加密和JWT依赖（确保已安装：npm install bcryptjs jsonwebtoken）
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 模拟用户数据（实际项目中替换为数据库查询）
const mockUser = {
  id: 1,
  username: 'admin',
  password: bcrypt.hashSync('123456', 10), // 加密后的密码
  role: 'admin'
};

// 1. 登录接口
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 模拟数据库查询（实际项目中替换为Sequelize查询）
    if (username !== mockUser.username) {
      return res.status(401).json({
        success: false,
        message: '用户名不存在'
      });
    }

    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, mockUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: mockUser.id, username: mockUser.username },
      'your-secret-key', // 实际项目中替换为环境变量
      { expiresIn: '24h' }
    );

    // 返回成功响应
    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          role: mockUser.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

// 2. 注册接口
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 模拟注册逻辑（实际项目中替换为数据库创建）
    const newUser = {
      id: Date.now(),
      username,
      password: bcrypt.hashSync(password, 10),
      role: 'user'
    };

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

// 3. 获取用户信息接口
exports.profile = async (req, res) => {
  try {
    // 模拟获取用户信息（实际项目中从JWT解析用户ID后查询数据库）
    res.status(200).json({
      success: true,
      data: {
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
};