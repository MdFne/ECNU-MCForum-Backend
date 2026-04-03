// routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// 服务器列表
router.get('/servers', statsController.getServers);

// 服务器实时状态
router.get('/servers/:id/realtime', statsController.getServerRealTimeStats);

// 服务器历史数据
router.get('/servers/:id/history', statsController.getServerHistoryStats);

// 服务器月度热度
router.get('/servers/:id/monthly-heat', statsController.getServerMonthlyHeat);

// 概览统计
router.get('/overview', statsController.getOverviewStats);

module.exports = router;