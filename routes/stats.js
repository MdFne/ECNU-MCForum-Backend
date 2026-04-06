// routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// 服务器列表
/**
 * @swagger
 * /api/stats/servers:
 *   get:
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
 * /api/stats/servers/{id}:
 *   put:
 *     summary: 更新服务器数据
 *     description: 根据API响应数据更新服务器信息
 *     parameters:
 *       - in: path
 *         name: id
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
 *               currentPlayers:
 *                 type: number
 *               maxPlayers:
 *                 type: number
 *               last_updated_str:
 *                 type: string
 *               last_updated:
 *                 type: number
 *               motd:
 *                 type: string
 *               ping:
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
 *               thumbnail:
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
router.put('/servers/:id', statsController.updateServer);

router.post('/servers/refresh-all', statsController.refreshAllServersStats);

module.exports = router;