// models/Server.js
const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['生存', '创造', '小游戏', '测试', '其他'],
        default: '生存'
    },
    address: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        default: 25565
    },
    thumbnail: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    currentPlayers: {
        type: Number,
        default: 0
    },
    maxPlayers: {
        type: Number,
        default: 64
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    monthlyHeat: {
        type: [Number],
        default: []
    },
    last10dayHeat: {
        type: [Number],
        default: Array(10).fill(0)
    },
    requiredMods: {
        type: [String],
        default: []
    },
    version: {
        type: String,
        default: '1.20.1'
    },
    // 新增字段，与API响应格式对齐
    last_updated_str: {
        type: String,
        default: ''
    },
    last_updated: {
        type: Number,
        default: 0
    },
    motd: {
        type: String,
        default: ''
    },
    ping: {
        type: Number,
        default: 0
    },
    today_max: {
        type: Number,
        default: 0
    },
    today_min: {
        type: Number,
        default: 0
    },
    today_avg: {
        type: Number,
        default: 0
    },
    history_max: {
        type: Number,
        default: 0
    },
    total_queries: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Number,
        default: 0
    },
    created_at_str: {
        type: String,
        default: ''
    }

});

module.exports = mongoose.model('Server', serverSchema);