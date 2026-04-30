// routes/comment.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: 文章评论接口
 */

/**
 * @swagger
 * /api/postcard/{postcardId}/comments:
 *   get:
 *     summary: 获取某文章的评论列表
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: postcardId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 20 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: 'createdAt' }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: 'asc' }
 *     responses:
 *       200: { description: 获取成功 }
 */
router.get('/postcard/:postcardId/comments', commentController.getComments);

/**
 * @swagger
 * /api/postcard/{postcardId}/comments:
 *   post:
 *     summary: 发表评论
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postcardId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string, maxLength: 500 }
 *               replyTo: { type: string }
 *     responses:
 *       201: { description: 评论发表成功 }
 *       401: { description: 未认证 }
 */
router.post('/postcard/:postcardId/comments', authenticate, commentController.createComment);

/**
 * @swagger
 * /api/comment/{commentId}:
 *   delete:
 *     summary: 删除评论（本人或管理员）
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 删除成功 }
 *       403: { description: 无权限 }
 */
router.delete('/comment/:commentId', authenticate, commentController.deleteComment);

module.exports = router;
