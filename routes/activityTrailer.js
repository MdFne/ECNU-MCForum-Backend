const express = require('express');
const router = express.Router();
const activityTrailerController = require('../controllers/activityTrailerController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: ActivityTrailer
 *   description: 活动预告接口
 */

/**
 * @swagger
 * /api/activity-trailers:
 *   get:
 *     tags: [ActivityTrailer]
 *     summary: 获取所有活动预告
 *     description: 获取所有活动预告，并按开始时间排序
 *     responses:
 *       200:
 *         description: 成功获取活动预告列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                         format: date-time
 *                       title:
 *                         type: string
 *                       link:
 *                         type: string
 */
router.get('/', activityTrailerController.getAllTrailers);

/**
 * @swagger
 * /api/activity-trailers:
 *   put:
 *     tags: [ActivityTrailer]
 *     summary: 全量更新活动预告
 *     description: 删除所有现有的活动预告，并存入新的列表 (需要管理员权限)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - startTime
 *                 - title
 *                 - link
 *               properties:
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 title:
 *                   type: string
 *                 link:
 *                   type: string
 *     responses:
 *       200:
 *         description: 成功全量更新活动预告
 *       400:
 *         description: 请求数据格式错误
 *       401:
 *         description: 未授权，请提供有效的 token
 *       403:
 *         description: 权限不足，需要管理员权限
 *       500:
 *         description: 服务器内部错误
 */
router.put('/', authenticate, authorize('admin'), activityTrailerController.updateAllTrailers);

module.exports = router;
