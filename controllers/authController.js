const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtConfig = require('../config/jwt');
const ApiResponse = require('../utils/response');
const { BadRequestError, UnauthorizedError, ConflictError, NotFoundError, asyncHandler } = require('../utils/errorHandler');
const User = require('../models/User');

const SALT_ROUNDS = 10;

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

const register = asyncHandler(async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
        throw new BadRequestError('用户名、邮箱和密码不能为空');
    }

    if (password !== confirmPassword) {
        throw new BadRequestError('两次输入的密码不一致');
    }

    if (password.length < 6) {
        throw new BadRequestError('密码长度至少6位');
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        if (existingUser.username === username) {
            throw new ConflictError('用户名已被注册');
        }
        throw new ConflictError('邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const data = {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        },
        token,
        refreshToken
    };

    return ApiResponse.created(res, data, '注册成功');
});

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    if (!username || !password) {
        throw new BadRequestError('用户名和密码不能为空');
    }

    const user = await User.findOne({
        $or: [{ username }, { email: username }]
    }).select('+password');

    if (!user) {
        throw new UnauthorizedError('用户名或密码错误');
    }

    if (!user.isActive) {
        throw new UnauthorizedError('账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new UnauthorizedError('用户名或密码错误');
    }

    await User.findByIdAndUpdate(user._id, {
        lastLoginAt: new Date(),
        lastLoginIp: clientIp
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const data = {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar
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

    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError('用户不存在');
    }

    const data = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        school: user.school,
        age: user.age,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
    };

    return ApiResponse.success(res, data, '获取用户信息成功');
});

const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new BadRequestError('刷新令牌不能为空');
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtConfig.secret);

        const user = await User.findById(decoded.id);

        if (!user) {
            throw new UnauthorizedError('用户不存在');
        }

        if (!user.isActive) {
            throw new UnauthorizedError('账号已被禁用');
        }

        const newToken = generateToken(decoded.id);
        const newRefreshToken = generateRefreshToken(decoded.id);

        const data = {
            token: newToken,
            refreshToken: newRefreshToken
        };

        return ApiResponse.success(res, data, '令牌刷新成功');
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new UnauthorizedError('刷新令牌已过期，请重新登录');
        }
        throw new UnauthorizedError('无效的刷新令牌');
    }
});

const logout = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, null, '退出登录成功');
});

module.exports = {
    register,
    login,
    getProfile,
    refreshToken,
    logout,
    generateToken,
    generateRefreshToken
};
