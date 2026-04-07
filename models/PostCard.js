const mongoose = require('mongoose');

/*
    字段定义:
    - _id: ObjectId (MongoDB自动生成)
    - title: String (必填，文章标题)
    - author: String (必填，文章作者)
    - publishDate: Date (必填，发布日期)
    - coverImage: String (可选，封面图片URL)
    - summary: String (可选，文章摘要)
    - content: String (必填，文章内容)
    - views: Number (可选，文章浏览量，默认0)
    - tags: [String] (可选，文章标签)
    - isActive: Boolean (是否激活，默认true，用于控制显示/隐藏)
    - createdAt: Date (创建时间)
    - updatedAt: Date (更新时间)

    索引:
    - publishDate: 降序索引，用于按发布日期排序 
 */

const postcardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: String,
    publishDate: {
        type: Date,
        required: true
    },
    coverImage: String,
    summary: String,
    // 这里存富文本编辑器生成的 HTML
    content: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// 按发布时间倒序
postcardSchema.index({ publishDate: -1 });

module.exports = mongoose.model('Postcard', postcardSchema);