// middleware/auth.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authenticate = (req, res, next) => {
    // 从请求头获取 token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // 验证 token
        const decoded = jwt.verify(token, jwtConfig.secret);
        // 将用户信息存储到请求对象
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authenticate;