// models/Channel.js
const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '频道名称不能为空'],
        unique: true,
        trim: true,
        minlength: [1, '频道名称至少1个字符'],
        maxlength: [30, '频道名称最多30个字符']
    },
    description: {
        type: String,
        default: '',
        maxlength: [100, '频道描述最多100个字符']
    },
    icon: {
        type: String,
        default: '💬'
    },
    // 频道类型：text（文字聊天）、announcement（公告，仅管理员可发言）
    type: {
        type: String,
        enum: ['text', 'announcement'],
        default: 'text'
    },
    // 排序权重，数字越小越靠前
    order: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Channel', channelSchema);
