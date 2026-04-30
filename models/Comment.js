// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postcard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Postcard',
    required: [true, '文章ID不能为空']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID不能为空']
  },
  content: {
    type: String,
    required: [true, '评论内容不能为空'],
    maxlength: [500, '评论不能超过500字']
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// 复合索引：按文章查评论 + 排序
commentSchema.index({ postcard: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
