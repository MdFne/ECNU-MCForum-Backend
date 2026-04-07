// models/Carousel.js
const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true  // 必填
    },
    description: String,  // 可选
    imageUrl: {
        type: String,
        required: true  // 必填
    },
    linkUrl: String,
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true  // 默认激活
    }
}, {
    timestamps: true  // 自动生成 createdAt 和 updatedAt
});

// 为 order 字段创建索引，用于排序
carouselSchema.index({ order: 1 });

module.exports = mongoose.model('Carousel', carouselSchema);
