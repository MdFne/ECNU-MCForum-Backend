const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtConfig = require('../config/jwt');
const ApiResponse = require('../utils/response');
const { BadRequestError, UnauthorizedError, ConflictError, NotFoundError, asyncHandler } = require('../utils/errorHandler');
const User = require('../models/User');
const { generateCode, storeCode, verifyCode, canResend } = require('../utils/verificationCode');
const { sendRegisterCode, sendResetCode } = require('../services/emailService');

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
    const { username, email, password, confirmPassword, code } = req.body;

    if (!username || !email || !password) {
        throw new BadRequestError('用户名、邮箱和密码不能为空');
    }

    if (!code) {
        throw new BadRequestError('验证码不能为空');
    }

    // 校验邮箱验证码
    if (!verifyCode(email, code, 'register')) {
        throw new BadRequestError('验证码无效或已过期');
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

// 发送注册验证码
const sendRegisterCodeHandler = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new BadRequestError('邮箱不能为空');
    }

    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ConflictError('该邮箱已被注册');
    }

    // 检查冷却期
    if (!canResend(email, 'register')) {
        throw new BadRequestError('请求过于频繁，请60秒后重试');
    }

    const code = generateCode();
    storeCode(email, code, 'register');
    await sendRegisterCode(email, code);

    return ApiResponse.success(res, null, '验证码已发送');
});

// 发送重置密码验证码
const sendResetCodeHandler = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new BadRequestError('邮箱不能为空');
    }

    // 检查邮箱是否存在对应用户
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new NotFoundError('该邮箱未注册');
    }

    // 检查冷却期
    if (!canResend(email, 'reset')) {
        throw new BadRequestError('请求过于频繁，请60秒后重试');
    }

    const code = generateCode();
    storeCode(email, code, 'reset');
    await sendResetCode(email, code);

    return ApiResponse.success(res, null, '验证码已发送');
});

// 重置密码
const resetPassword = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        throw new BadRequestError('邮箱、验证码和新密码不能为空');
    }

    if (newPassword.length < 6) {
        throw new BadRequestError('密码长度至少6位');
    }

    // 校验验证码
    if (!verifyCode(email, code, 'reset')) {
        throw new BadRequestError('验证码无效或已过期');
    }

    // 查找用户并更新密码
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        throw new NotFoundError('用户不存在');
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return ApiResponse.success(res, null, '密码重置成功');
});

module.exports = {
    register,
    login,
    getProfile,
    refreshToken,
    logout,
    generateToken,
    generateRefreshToken,
    sendRegisterCode: sendRegisterCodeHandler,
    sendResetCode: sendResetCodeHandler,
    resetPassword
};
