const mongoose = require('mongoose');

const activityTrailerSchema = new mongoose.Schema({
    startTime: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityTrailer', activityTrailerSchema);
