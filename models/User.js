const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone: {
  type: DataTypes.STRING(11),
  allowNull: false,
  unique: true,
  validate: { is: /^1[3-9]\d{9}$/ } // 国内手机号
},
  password: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { len: [6, 20] } // 密码长度6-20位
  },
  role: { 
    type: DataTypes.ENUM('super_admin', 'admin', 'user'), 
    defaultValue: 'user' 
  },
  status: { 
    type: DataTypes.ENUM('active', 'disabled'), 
    defaultValue: 'active' 
  },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: true, underscored: true, tableName: 'users' });

// 密码加密钩子（保存前执行）
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);
});

// 密码验证方法（登录时用）
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 初始化超级管理员（仅首次运行创建，账号：17793448947，密码：198620）
User.findOrCreate({
  where: { phone: process.env.SUPER_ADMIN_PHONE=17793448947 },
  defaults: {
    password: process.env.SUPER_ADMIN_PASSWORD=198620,
    role: 'super_admin',
    status: 'active'
  }
}).then(() => console.log('✅ 超级管理员初始化完成'));

module.exports = User;