// routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: 统计信息接口
 */

// 服务器列表
/**
 * @swagger
 * /api/stats/servers:
 *   get:
 *     tags: [Stats]
 *     summary: 获取服务器列表
 *     description: 获取所有活跃的服务器列表
 *     responses:
 *       200:
 *         description: 成功获取服务器列表
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
 *                       name:
 *                         type: string
 *                       title:
 *                         type: string
 */
router.get('/servers', statsController.getServers);

// 服务器实时状态
/**
 * @swagger
 * /api/stats/servers/{id}/realtime:
 *   get:
 *     tags: [Stats]
 *     summary: 获取服务器实时状态
 *     description: 获取指定服务器的实时在线状态、玩家数量等信息
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 服务器ID（MongoDB ObjectId）
 *     responses:
 *       200:
 *         description: 成功获取服务器实时状态
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
 *                   type: object
 *                   properties:
 *                     serverId:
 *                       type: string
 *                     serverName:
 *                       type: string
 *                     onlineStatus:
 *                       type: boolean
 *                     currentPlayers:
 *                       type: number
 *                     maxPlayers:
 *                       type: number
 *                     version:
 *                       type: string
 *                     latency:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 无效的服务器ID
 *       404:
 *         description: 服务器不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/servers/:id/realtime', statsController.getServerRealTimeStats);

// 服务器最近10天热度
/**
 * @swagger
 * /api/stats/servers/{id}/last10day-heat:
 *   get:
 *     tags: [Stats]
 *     summary: 获取服务器最近10天热度
 *     description: 获取指定服务器的最近10天热度数据，用于绘制热度趋势图
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 服务器ID（MongoDB ObjectId）
 *     responses:
 *       200:
 *         description: 成功获取服务器最近10天热度
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
 *                     type: number
 *                   description: 最近10天热度数据数组
 *                   example: [20, 25, 30, 28, 32, 26, 29, 35, 33, 30]
 *       400:
 *         description: 无效的服务器ID
 *       404:
 *         description: 服务器不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/servers/:id/last10day-heat', statsController.getServerLast10DayHeat);

// 概览统计
/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     tags: [Stats]
 *     summary: 获取概览统计
 *     description: 获取整个系统的概览统计数据，包括总服务器数、在线服务器数、总玩家数等
 *     responses:
 *       200:
 *         description: 成功获取概览统计
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
 *                   type: object
 *                   properties:
 *                     totalServers:
 *                       type: integer
 *                       description: 总服务器数量
 *                     onlineServers:
 *                       type: integer
 *                       description: 在线服务器数量
 *                     totalPlayers:
 *                       type: integer
 *                       description: 当前总玩家数量
 *       500:
 *         description: 服务器内部错误
 */
router.get('/overview', statsController.getOverviewStats);

// 更新服务器数据
/**
 * @swagger
 * /api/stats/servers/{serverId}:
 *   put:
 *     tags: [Stats]    
 *     summary: 更新服务器数据
 *     description: 更新指定服务器的所有信息（包括基本信息和实时状态数据）
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *         description: 服务器ID（MongoDB ObjectId）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 服务器名称（唯一标识）
 *               title:
 *                 type: string
 *                 description: 服务器标题（显示名称）
 *               address:
 *                 type: string
 *                 description: 服务器IP或域名
 *               ip:
 *                 type: string
 *                 description: 服务器IP（与address效果相同，兼容性考虑）
 *               port:
 *                 type: number
 *                 description: 服务器端口
 *               type:
 *                 type: string
 *                 enum: ['生存', '创造', '小游戏', '测试', '其他']
 *                 description: 服务器类型
 *               description:
 *                 type: string
 *                 description: 服务器描述
 *               version:
 *                 type: string
 *                 description: 游戏版本
 *               currentPlayers:
 *                 type: number
 *                 description: 当前在线玩家数
 *               maxPlayers:
 *                 type: number
 *                 description: 最大玩家数
 *               isActive:
 *                 type: boolean
 *                 description: 服务器是否活跃
 *               thumbnail:
 *                 type: string
 *                 description: 服务器Logo/缩略图URL
 *               motd:
 *                 type: string
 *                 description: 服务器MOTD信息
 *               ping:
 *                 type: number
 *                 description: 延迟(ms)
 *               last_updated_str:
 *                 type: string
 *               last_updated:
 *                 type: number
 *               today_max:
 *                 type: number
 *               today_min:
 *                 type: number
 *               today_avg:
 *                 type: number
 *               history_max:
 *                 type: number
 *               total_queries:
 *                 type: number
 *               created_at:
 *                 type: number
 *               created_at_str:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功更新服务器数据
 *       400:
 *         description: 无效的服务器ID
 *       404:
 *         description: 服务器不存在
 *       500:
 *         description: 服务器内部错误
 */
router.put('/servers/:serverId', statsController.updateServer);

// 刷新所有服务器状态
/**
 * @swagger
 * /api/stats/servers/refresh-all:
 *   post:
 *     tags: [Stats]    
 *     summary: 刷新所有服务器状态
 *     description: 批量刷新所有服务器的在线状态、玩家数量、版本、延迟等实时数据
 *     responses:
 *       200:
 *         description: 所有服务器状态刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 所有服务器状态刷新成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 总服务器数量
 *                       example: 5
 *                     successCount:
 *                       type: integer
 *                       description: 刷新成功的服务器数量
 *                       example: 5
 *                     failedCount:
 *                       type: integer
 *                       description: 刷新失败的服务器数量
 *                       example: 0
 *       500:
 *         description: 服务器内部错误
 */
router.post('/servers/refresh-all', statsController.refreshAllServersStats);

module.exports = router;