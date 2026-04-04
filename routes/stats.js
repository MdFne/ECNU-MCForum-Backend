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

// 服务器历史数据
/**
 * @swagger
 * /api/stats/servers/{id}/history:
 *   get:
 *     summary: 获取服务器历史数据
 *     description: 获取指定服务器的历史统计数据，默认返回最近30天的数据
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 服务器ID（MongoDB ObjectId）
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: 查询的天数
 *     responses:
 *       200:
 *         description: 成功获取服务器历史数据
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
 *                       server:
 *                         type: string
 *                       onlineStatus:
 *                         type: boolean
 *                       currentPlayers:
 *                         type: number
 *                       maxPlayers:
 *                         type: number
 *                       version:
 *                         type: string
 *                       latency:
 *                         type: number
 *                       recordedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: 无效的服务器ID
 *       404:
 *         description: 服务器不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/servers/:id/history', statsController.getServerHistoryStats);

// 服务器月度热度
/**
 * @swagger
 * /api/stats/servers/{id}/monthly-heat:
 *   get:
 *     summary: 获取服务器月度热度
 *     description: 获取指定服务器的月度热度数据，用于绘制热度趋势图
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 服务器ID（MongoDB ObjectId）
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: 查询的月数
 *     responses:
 *       200:
 *         description: 成功获取服务器月度热度
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
 *                   description: 月度平均玩家数量数组
 *                   example: [45, 52, 38, 61, 55, 48, 67, 72, 58, 63, 70, 65]
 *       400:
 *         description: 无效的服务器ID
 *       404:
 *         description: 服务器不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/servers/:id/monthly-heat', statsController.getServerMonthlyHeat);

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

module.exports = router;