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
    }
});

module.exports = mongoose.model('Server', serverSchema);