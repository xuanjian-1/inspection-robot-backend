/**
 * 巡检机器人后端服务主文件
 * 功能：启动Express服务器，配置中间件，挂载路由，连接数据库
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// 1. 加载环境变量（优先加载根目录.env文件）
dotenv.config({ path: '.env' });

// 2. 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 3. 配置核心中间件（解决跨域、请求解析、安全防护、日志）
app.use(cors()); // 允许跨域请求
app.use(helmet()); // 增强HTTP头部安全
app.use(morgan('dev')); // 开发环境日志
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析表单请求体

// 4. 数据库连接配置（修复之前的robot_inspection未定义错误）
const { Sequelize } = require('sequelize');
// 方式1：使用环境变量（推荐，需确保.env文件配置正确）
const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'robot_inspection', // 数据库名（默认值兜底）
  process.env.MYSQL_USER || 'root', // 用户名（默认值兜底）
  process.env.MYSQL_PASSWORD || 'Liu198620jiajia@', // 密码（默认值兜底）
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false, // 关闭SQL日志（开发时可改为true）
    pool: {
      max: 5, // 连接池最大连接数
      min: 0, // 最小连接数
      acquire: 30000, // 等待连接的超时时间
      idle: 10000 // 连接空闲超时时间
    }
  }
);

// 测试数据库连接
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败：', error.message);
    // 数据库连接失败时仍启动服务器（仅影响数据库相关接口）
  }
})();

// 5. 导入并挂载路由（修复MODULE_NOT_FOUND错误）
// 5.1 认证路由（auth）
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ 认证路由挂载成功');
} catch (error) {
  console.warn('⚠️  认证路由挂载失败：', error.message);
  // 路由挂载失败时不中断服务器启动
}

// 5.2 其他示例路由（可根据实际需求添加）
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '巡检机器人后端服务运行中',
    version: '1.0.0'
  });
});

// 6. 404错误处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `接口 ${req.originalUrl} 不存在`
  });
});

// 7. 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误：', err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '未知错误'
  });
});

// 8. 启动服务器
app.listen(PORT, () => {
  console.log(`=======================================`);
  console.log(`✅ 服务器已启动：http://localhost:${PORT}`);
  console.log(`📌 当前环境：${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================`);
});

// 9. 捕获未处理的异常（防止服务器崩溃）
process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获的异常：', err);
  // 可选：优雅关闭服务器
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝：', reason, promise);
});

// 导出app供测试使用（可选）
module.exports = app;