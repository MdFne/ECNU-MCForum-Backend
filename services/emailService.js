// services/emailService.js — 邮件发送服务
const transporter = require('../config/email');

const SENDER = `"MCForum" <${process.env.SMTP_USER}>`;

// 发送注册验证码邮件
async function sendRegisterCode(email, code) {
  await transporter.sendMail({
    from: SENDER,
    to: email,
    subject: 'MCForum 注册验证码',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;color:#333;">
        <h2 style="color:#409eff;">MCForum 注册验证</h2>
        <p>你的注册验证码为：</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#409eff;margin:16px 0;">${code}</div>
        <p style="color:#999;font-size:13px;">验证码 5 分钟内有效，请勿泄露给他人。</p>
      </div>
    `
  });
}

// 发送重置密码验证码邮件
async function sendResetCode(email, code) {
  await transporter.sendMail({
    from: SENDER,
    to: email,
    subject: 'MCForum 重置密码验证码',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;color:#333;">
        <h2 style="color:#409eff;">MCForum 重置密码</h2>
        <p>你正在重置密码，验证码为：</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#409eff;margin:16px 0;">${code}</div>
        <p style="color:#999;font-size:13px;">验证码 5 分钟内有效。如非本人操作，请忽略此邮件。</p>
      </div>
    `
  });
}

module.exports = { sendRegisterCode, sendResetCode };
