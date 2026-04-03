// controllers/authController.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const ApiResponse = require('../utils/response');
const { BadRequestError, UnauthorizedError, asyncHandler } = require('../utils/errorHandler');

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        jwtConfig.secret,
        { expiresIn: jwtConfig.refreshExpiresIn }
    );
};

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new BadRequestError('用户名和密码不能为空');
    }

    const user = {
        id: '1',
        username: username,
        role: 'user'
    };

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const data = {
        user: {
            id: user.id,
            username: user.username,
            role: user.role
        },
        token,
        refreshToken
    };

    return ApiResponse.success(res, data, '登录成功');
});

const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new UnauthorizedError('未授权访问');
    }

    const user = {
        id: userId,
        username: 'example_user',
        email: 'user@example.com',
        role: 'user',
        createdAt: new Date()
    };

    return ApiResponse.success(res, user, '获取用户信息成功');
});

const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new BadRequestError('刷新令牌不能为空');
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtConfig.secret);
        const newToken = generateToken(decoded.id);
        const newRefreshToken = generateRefreshToken(decoded.id);

        const data = {
            token: newToken,
            refreshToken: newRefreshToken
        };

        return ApiResponse.success(res, data, '令牌刷新成功');
    } catch (error) {
        throw new UnauthorizedError('无效的刷新令牌');
    }
});

module.exports = {
    login,
    getProfile,
    refreshToken,
    generateToken,
    generateRefreshToken
};
