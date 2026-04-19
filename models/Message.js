// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: [true, '频道ID不能为空'],
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, '发送者不能为空']
    },
    content: {
        type: String,
        required: [true, '消息内容不能为空'],
        maxlength: [2000, '消息内容最多2000个字符'],
        trim: true
    },
    // 消息类型：普通文字 / 系统消息（如"xxx 加入了频道"）
    type: {
        type: String,
        enum: ['text', 'system'],
        default: 'text'
    },
    // 回复目标：为 null 表示普通消息，有值表示回复某条消息
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// 按 channel + createdAt 建复合索引，加速历史消息查询
messageSchema.index({ channel: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
