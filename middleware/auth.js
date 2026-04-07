// middleware/auth.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authenticate = async (req, res, next) => {
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

/**
 * 角色授权中间件
 * @param  {...string} roles 允许访问的角色
 */
const authorize = (...roles) => {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: '未授权访问' });
        }

        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ message: '您没有权限执行此操作' });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
};