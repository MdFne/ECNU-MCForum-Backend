// config/email.js — SMTP 邮件服务配置
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.163.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 启动时验证连接（不阻塞启动）
transporter.verify().then(() => {
  console.log('SMTP 邮件服务连接成功');
}).catch((err) => {
  console.error('SMTP 邮件服务连接失败:', err.message);
});

module.exports = transporter;
