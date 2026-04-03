// controllers/statsController.js
const mongoose = require('mongoose');
const Server = require('../models/Server');
const ServerStats = require('../models/ServerStats');
const ApiResponse = require('../utils/response');
const { NotFoundError, BadRequestError, asyncHandler } = require('../utils/errorHandler');

const getServers = asyncHandler(async (req, res) => {
    const servers = await Server.find({ isActive: true }).sort({ createdAt: 1 });
    return ApiResponse.success(res, servers, '获取服务器列表成功');
});

const getServerRealTimeStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的服务器ID');
    }

    const server = await Server.findById(id);

    if (!server) {
        throw new NotFoundError('服务器不存在');
    }

    const response = await fetch(`https://www.minecraftservers.cn/api/query?ip=${server.address}:${server.port}`);

    if (!response.ok) {
        throw new BadRequestError('无法获取服务器状态');
    }

    const apiData = await response.json();

    const serverStats = new ServerStats({
        server: server._id,
        onlineStatus: apiData.status || false,
        currentPlayers: apiData.players?.online || 0,
        maxPlayers: apiData.players?.max || server.maxPlayers,
        version: apiData.version || server.version,
        latency: apiData.latency || 0
    });

    await serverStats.save();

    const data = {
        serverId: server._id,
        serverName: server.name,
        onlineStatus: serverStats.onlineStatus,
        currentPlayers: serverStats.currentPlayers,
        maxPlayers: serverStats.maxPlayers,
        version: serverStats.version,
        latency: serverStats.latency,
        lastUpdated: serverStats.recordedAt
    };

    return ApiResponse.success(res, data, '获取服务器实时状态成功');
});

const getServerHistoryStats = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { days = 30 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的服务器ID');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await ServerStats.find({
        server: id,
        recordedAt: { $gte: startDate }
    }).sort({ recordedAt: 1 });

    return ApiResponse.success(res, stats, '获取历史数据成功');
});

const getServerMonthlyHeat = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { months = 12 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的服务器ID');
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const monthlyStats = await ServerStats.aggregate([
        {
            $match: {
                server: new mongoose.Types.ObjectId(id),
                recordedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$recordedAt' },
                    month: { $month: '$recordedAt' }
                },
                avgPlayers: { $avg: '$currentPlayers' },
                maxPlayers: { $max: '$currentPlayers' },
                totalRecords: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);

    const heatData = monthlyStats.map(stat => Math.round(stat.avgPlayers));

    return ApiResponse.success(res, heatData, '获取月度热度成功');
});

const getOverviewStats = asyncHandler(async (req, res) => {
    const totalServers = await Server.countDocuments({ isActive: true });

    const onlineServers = await ServerStats.distinct('server', {
        onlineStatus: true,
        recordedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    const totalPlayers = await ServerStats.aggregate([
        {
            $match: {
                recordedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
            }
        },
        {
            $group: {
                _id: null,
                totalPlayers: { $sum: '$currentPlayers' }
            }
        }
    ]);

    const data = {
        totalServers,
        onlineServers: onlineServers.length,
        totalPlayers: totalPlayers[0]?.totalPlayers || 0
    };

    return ApiResponse.success(res, data, '获取概览统计成功');
});

module.exports = {
    getServers,
    getServerRealTimeStats,
    getServerHistoryStats,
    getServerMonthlyHeat,
    getOverviewStats
};
