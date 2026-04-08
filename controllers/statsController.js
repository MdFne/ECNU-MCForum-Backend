const mongoose = require('mongoose');
const Server = require('../models/Server');
const ApiResponse = require('../utils/response');
const { NotFoundError, BadRequestError, asyncHandler } = require('../utils/errorHandler');
const statsService = require('../services/statsService');

const getServers = asyncHandler(async (req, res) => {
    const servers = await Server.find({}).sort({ createdAt: 1 });
    return ApiResponse.success(res, servers, '获取服务器列表成功');
});

const getServerRealTimeStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的服务器ID');
    }

    try {
        const { updatedServer, isOnline, apiData } = await statsService.refreshServerRealTime(id);

        const data = {
            serverId: updatedServer._id,
            serverName: updatedServer.name,
            onlineStatus: isOnline,
            currentPlayers: updatedServer.currentPlayers,
            maxPlayers: updatedServer.maxPlayers,
            version: updatedServer.version,
            latency: updatedServer.ping || 0,
            lastUpdated: updatedServer.updatedAt
        };

        return ApiResponse.success(res, data, '获取服务器实时状态成功');
    } catch (error) {
        if (error.message === '服务器不存在') {
            throw new NotFoundError('服务器不存在');
        }
        throw new BadRequestError('无法获取服务器状态');
    }
});

const getServerLast10DayHeat = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的服务器ID');
    }

    const server = await Server.findById(id);

    if (!server) {
        throw new NotFoundError('服务器不存在');
    }

    const last10dayHeat = server.last10dayHeat || Array(10).fill(0);

    return ApiResponse.success(res, last10dayHeat, '获取最近10天热度成功');
});

const getOverviewStats = asyncHandler(async (req, res) => {
    const servers = await Server.find({});

    const totalServers = servers.length;
    const onlineServers = servers.filter(server => server.isActive).length;
    const totalPlayers = servers.reduce((sum, server) =>
        sum + (server.currentPlayers === -1 ? 0 : server.currentPlayers)
        , 0);

    const data = {
        totalServers,
        onlineServers,
        totalPlayers
    };

    return ApiResponse.success(res, data, '获取概览统计成功');
});

const updateServer = asyncHandler(async (req, res) => {
    const { serverId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(serverId)) {
        throw new BadRequestError('无效的服务器ID');
    }

    const server = await Server.findById(serverId);

    if (!server) {
        throw new NotFoundError('服务器不存在');
    }

    // 兼容性处理：如果传入了 ip 但没有传入 address，则将 ip 赋值给 address
    if (updateData.ip && !updateData.address) {
        updateData.address = updateData.ip;
    }

    const updatedServer = await Server.findByIdAndUpdate(
        serverId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
    );

    return ApiResponse.success(res, updatedServer, '更新服务器数据成功');
});

const refreshAllServersStats = asyncHandler(async (req, res) => {
    const results = await statsService.refreshAllServers();

    const successCount = results.filter(r => !r.error).length;
    const failCount = results.filter(r => r.error).length;

    return ApiResponse.success(res, {
        total: results.length,
        success: successCount,
        failed: failCount,
        results
    }, '刷新所有服务器状态完成');
});

module.exports = {
    getServers,
    getServerRealTimeStats,
    getServerLast10DayHeat,
    getOverviewStats,
    updateServer,
    refreshAllServersStats
};
