const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: 聊天频道接口
 */

/**
 * @swagger
 * /api/chat/channels:
 *   get:
 *     summary: 获取频道列表
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: 获取频道列表成功
 */
router.get('/channels', chatController.getChannels);

/**
 * @swagger
 * /api/chat/channels/{channelId}/messages:
 *   get:
 *     summary: 获取历史消息
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before
 *         description: 游标分页，传入最早一条消息的 id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取消息成功
 */
router.get('/channels/:channelId/messages', chatController.getMessages);

/**
 * @swagger
 * /api/chat/channels:
 *   post:
 *     summary: 创建新频道（管理员）
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, announcement]
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: 创建频道成功
 */
router.post('/channels', authenticate, authorize('admin', 'moderator'), chatController.createChannel);

module.exports = router;
