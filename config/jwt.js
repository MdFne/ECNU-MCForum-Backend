// config/jwt.js
module.exports = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
};
