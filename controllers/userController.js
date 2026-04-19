// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const ApiResponse = require('../utils/response');
const { BadRequestError, UnauthorizedError, ConflictError, asyncHandler } = require('../utils/errorHandler');

const SALT_ROUNDS = 10;

// 更新用户资料
const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { username, email, school, age } = req.body;

    // 构建更新对象（只更新传入的字段）
    const updateData = {};
    if (username !== undefined) {
        if (username.trim().length < 3 || username.trim().length > 20) {
            throw new BadRequestError('用户名长度应在3-20个字符之间');
        }
        // 检查用户名是否被其他人占用
        const existing = await User.findOne({ username: username.trim(), _id: { $ne: userId } });
        if (existing) {
            throw new ConflictError('该用户名已被使用');
        }
        updateData.username = username.trim();
    }
    if (email !== undefined) {
        updateData.email = email.trim().toLowerCase();
    }
    if (school !== undefined) {
        updateData.school = school;
    }
    if (age !== undefined) {
        if (age < 1 || age > 150) {
            throw new BadRequestError('年龄不合法');
        }
        updateData.age = age;
    }

    if (Object.keys(updateData).length === 0) {
        throw new BadRequestError('没有需要更新的字段');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    });

    if (!updatedUser) {
        throw new UnauthorizedError('用户不存在');
    }

    const data = {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        school: updatedUser.school,
        age: updatedUser.age
    };

    return ApiResponse.success(res, data, '更新用户信息成功');
});

// 修改密码
const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new BadRequestError('旧密码和新密码不能为空');
    }

    if (newPassword.length < 6) {
        throw new BadRequestError('新密码长度至少6位');
    }

    // 获取用户（含密码字段）
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new UnauthorizedError('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('旧密码错误');
    }

    // 更新密码
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return ApiResponse.success(res, null, '密码修改成功');
});

// 上传头像
const uploadAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        throw new BadRequestError('请选择要上传的头像图片');
    }

    // 获取用户旧头像，用于删除旧文件
    const oldUser = await User.findById(userId);
    const oldAvatar = oldUser ? oldUser.avatar : null;

    // 新头像路径
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // 更新数据库
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: avatarPath },
        { new: true }
    );

    if (!updatedUser) {
        throw new UnauthorizedError('用户不存在');
    }

    // 删除旧头像文件（如果是本地上传的文件，且和新文件不同）
    if (oldAvatar && oldAvatar.startsWith('/uploads/avatars/') && oldAvatar !== avatarPath) {
        const oldFilePath = path.join(__dirname, '..', oldAvatar);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }
    }

    return ApiResponse.success(res, { avatar: avatarPath }, '头像上传成功');
});

module.exports = {
    updateProfile,
    changePassword,
    uploadAvatar
};
