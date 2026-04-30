// controllers/commentController.js
const mongoose = require('mongoose');
const commentService = require('../services/commentService');
const ApiResponse = require('../utils/response');
const { BadRequestError, NotFoundError, ForbiddenError, asyncHandler } = require('../utils/errorHandler');
const User = require('../models/User');

/**
 * 获取某文章的评论列表
 */
const getComments = asyncHandler(async (req, res) => {
  const { postcardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postcardId)) {
    throw new BadRequestError('无效的文章ID');
  }

  const data = await commentService.getComments(postcardId, req.query);
  return ApiResponse.success(res, data, '获取评论列表成功');
});

/**
 * 发表评论
 */
const createComment = asyncHandler(async (req, res) => {
  const { postcardId } = req.params;
  const { content, replyTo } = req.body;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(postcardId)) {
    throw new BadRequestError('无效的文章ID');
  }

  if (!content || !content.trim()) {
    throw new BadRequestError('评论内容不能为空');
  }

  const comment = await commentService.createComment(
    postcardId,
    userId,
    content.trim(),
    replyTo || null
  );

  return ApiResponse.created(res, comment, '评论发表成功');
});

/**
 * 删除评论
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new BadRequestError('无效的评论ID');
  }

  // 获取用户角色
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  await commentService.deleteComment(commentId, userId, user.role);
  return ApiResponse.success(res, null, '评论删除成功');
});

module.exports = {
  getComments,
  createComment,
  deleteComment
};
