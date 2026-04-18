// middleware/auth.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { UnauthorizedError, asyncHandler } = require('../utils/errorHandler');
const User = require('../models/User');

const authenticate = asyncHandler(async (req, res, next) => {
    // 从请求头获取 token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        throw new UnauthorizedError('请先登录');
    }

    // 验证 token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // 检查用户是否仍然存在且未被禁用
    const user = await User.findById(decoded.id);
    if (!user) {
        throw new UnauthorizedError('用户不存在');
    }
    if (!user.isActive) {
        throw new UnauthorizedError('账号已被禁用');
    }

    // 将用户信息存储到请求对象
    req.user = decoded;
    next();
});

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