// services/commentService.js
const Comment = require('../models/Comment');

class CommentService {
  /**
   * 获取某文章的评论列表（分页 + 排序）
   * @param {string} postcardId 文章ID
   * @param {Object} query 查询参数 (page, limit, sortBy, sortOrder)
   * @returns {Promise<Object>}
   */
  async getComments(postcardId, query = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'asc'
    } = query;

    const filter = {
      postcard: postcardId,
      isActive: true
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('author', 'username avatar role')
        .populate({
          path: 'replyTo',
          select: 'content author',
          populate: {
            path: 'author',
            select: 'username'
          }
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Comment.countDocuments(filter)
    ]);

    return {
      comments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  /**
   * 创建评论
   * @param {string} postcardId 文章ID
   * @param {string} userId 用户ID
   * @param {string} content 评论内容
   * @param {string} replyTo 被回复的评论ID（可选）
   * @returns {Promise<Object>}
   */
  async createComment(postcardId, userId, content, replyTo = null) {
    // HTML 转义，防止 XSS
    const escaped = this._escapeHtml(content);

    // 如果是回复，验证被回复的评论属于同一文章
    if (replyTo) {
      const parentComment = await Comment.findById(replyTo);
      if (!parentComment) {
        const error = new Error('被回复的评论不存在');
        error.statusCode = 404;
        throw error;
      }
      if (parentComment.postcard.toString() !== postcardId) {
        const error = new Error('被回复的评论不属于该文章');
        error.statusCode = 400;
        throw error;
      }
    }

    const comment = new Comment({
      postcard: postcardId,
      author: userId,
      content: escaped,
      replyTo: replyTo || undefined
    });

    await comment.save();

    // 返回 populate 后的结果
    return await Comment.findById(comment._id)
      .populate('author', 'username avatar role')
      .populate({
        path: 'replyTo',
        select: 'content author',
        populate: {
          path: 'author',
          select: 'username'
        }
      });
  }

  /**
   * 删除评论
   * @param {string} commentId 评论ID
   * @param {string} userId 当前用户ID
   * @param {string} userRole 当前用户角色
   * @returns {Promise<Object>}
   */
  async deleteComment(commentId, userId, userRole) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      const error = new Error('评论不存在');
      error.statusCode = 404;
      throw error;
    }

    // 权限检查：本人或 admin/moderator 可删除
    const isOwner = comment.author.toString() === userId;
    const isAdmin = ['admin', 'moderator'].includes(userRole);

    if (!isOwner && !isAdmin) {
      const error = new Error('无权删除该评论');
      error.statusCode = 403;
      throw error;
    }

    return await Comment.findByIdAndDelete(commentId);
  }

  /**
   * HTML 转义
   * @param {string} str 原始字符串
   * @returns {string} 转义后的字符串
   */
  _escapeHtml(str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, (c) => map[c]);
  }
}

module.exports = new CommentService();
