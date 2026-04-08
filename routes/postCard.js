// routes/postCard.js
const express = require('express');
const router = express.Router();
const postCardController = require('../controllers/postCardController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Postcard
 *   description: 文章 (Postcard) 管理接口
 */

/**
 * @swagger
 * /api/postcard:
 *   post:
 *     summary: 创建新文章
 *     tags: [Postcard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, content]
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               publishDate: { type: string, format: date-time }
 *               coverImage: { type: string }
 *               summary: { type: string }
 *               content: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               isActive: { type: boolean }
 *     responses:
 *       201: { description: 创建成功 }
 *       401: { description: 未认证 }
 *       403: { description: 无权限 }
 */
router.post('/', authenticate, authorize('admin'), postCardController.createPostcard);

/**
 * @swagger
 * /api/postcard:
 *   get:
 *     summary: 获取所有文章列表
 *     tags: [Postcard]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: 'publishDate' }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: 'desc' }
 *     responses:
 *       200: { description: 获取成功 }
 */
router.get('/', postCardController.getAllPostcards);

/**
 * @swagger
 * /api/postcard/{id}:
 *   get:
 *     summary: 获取单篇文章详情
 *     tags: [Postcard]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 获取成功 }
 *       404: { description: 未找到 }
 */
router.get('/:id', postCardController.getPostcardById);

/**
 * @swagger
 * /api/postcard/{id}:
 *   put:
 *     summary: 更新文章内容
 *     tags: [Postcard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               publishDate: { type: string, format: date-time }
 *               coverImage: { type: string }
 *               summary: { type: string }
 *               content: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: 更新成功 }
 *       404: { description: 未找到 }
 */
router.put('/:id', authenticate, authorize('admin'), postCardController.updatePostcard);

/**
 * @swagger
 * /api/postcard/{id}:
 *   delete:
 *     summary: 删除文章
 *     tags: [Postcard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 删除成功 }
 *       404: { description: 未找到 }
 */
router.delete('/:id', authenticate, authorize('admin'), postCardController.deletePostcard);

module.exports = router;
