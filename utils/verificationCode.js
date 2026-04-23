// utils/verificationCode.js — 内存验证码存储与管理
const crypto = require('crypto');

// key: 'email:type' → { code, createdAt, expiresAt }
const codeStore = new Map();

const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 分钟
const RESEND_COOLDOWN_MS = 60 * 1000;  // 60 秒

function getKey(email, type) {
  return `${email.toLowerCase()}:${type}`;
}

// 生成 6 位随机数字验证码
function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}

// 存储验证码
function storeCode(email, code, type) {
  const now = Date.now();
  codeStore.set(getKey(email, type), {
    code,
    createdAt: now,
    expiresAt: now + CODE_EXPIRY_MS
  });
}

// 校验验证码，通过后自动删除
function verifyCode(email, code, type) {
  const key = getKey(email, type);
  const record = codeStore.get(key);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    codeStore.delete(key);
    return false;
  }
  if (record.code !== code) return false;

  codeStore.delete(key);
  return true;
}

// 检查是否在冷却期内（60s 内不可重发）
function canResend(email, type) {
  const record = codeStore.get(getKey(email, type));
  if (!record) return true;
  return Date.now() - record.createdAt >= RESEND_COOLDOWN_MS;
}

module.exports = { generateCode, storeCode, verifyCode, canResend };
