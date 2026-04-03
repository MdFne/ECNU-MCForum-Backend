// models/ServerStats.js
const mongoose = require('mongoose');

const serverStatsSchema = new mongoose.Schema({
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        required: true
    },
    onlineStatus: {
        type: Boolean,
        default: false
    },
    currentPlayers: {
        type: Number,
        default: 0
    },
    maxPlayers: {
        type: Number,
        default: 64
    },
    version: {
        type: String,
        default: ''
    },
    latency: {
        type: Number,
        default: 0
    },
    recordedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// 复合索引，用于高效查询
serverStatsSchema.index({ server: 1, recordedAt: -1 });

module.exports = mongoose.model('ServerStats', serverStatsSchema);