// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '用户名不能为空'],
        unique: true,
        minlength: [3, '用户名至少3个字符'],
        maxlength: [20, '用户名最多20个字符'],
        trim: true
    },
    email: {
        type: String,
        required: [true, '邮箱不能为空'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
    },
    password: {
        type: String,
        required: [true, '密码不能为空'],
        minlength: [6, '密码至少6个字符'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: ''
    },
    school: {
        type: String,
        default: ''
    },
    age: {
        type: Number,
        min: [1, '年龄必须大于0'],
        max: [150, '年龄必须小于150']
    },
    lastLoginAt: {
        type: Date
    },
    lastLoginIp: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
