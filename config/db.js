const { Sequelize } = require('sequelize');
require('dotenv').config();

// 初始化 Sequelize（MySQL 连接）
const sequelize = new Sequelize(
  process.env.MYSQL_DB,       // 数据库名
  process.env.MYSQL_USER,     // 用户名
  process.env.MYSQL_PASSWORD, // 密码
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

// 测试连接
sequelize.authenticate()
  .then(() => console.log('✅ MySQL 数据库连接成功'))
  .catch(err => console.error('❌ 数据库连接失败：', err));

module.exports = sequelize;