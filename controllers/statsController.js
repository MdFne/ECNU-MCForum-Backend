// controllers/statsController.js
const mongoose = require('mongoose');
const Server = require('../models/Server');
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

    const response = await fetch(`https://www.minecraftservers.cn/api/query?ip=${server.address}`);

    if (!response.ok) {
        throw new BadRequestError('无法获取服务器状态');
    }

    const apiData = await response.json();

    console.log(id + '获取到的API数据:', apiData);

    // 直接更新Server模型
    const updateData = {
        currentPlayers: apiData.data.p || 0,
        maxPlayers: apiData.data.mp || server.maxPlayers,
        updatedAt: new Date()
    };

    const updatedServer = await Server.findByIdAndUpdate(id, updateData, { new: true });

    const data = {
        serverId: server._id,
        serverName: server.name,
        onlineStatus: apiData.data.ping !== null ? true : false,
        currentPlayers: updateData.currentPlayers,
        maxPlayers: updateData.maxPlayers,
        version: updateData.version,
        latency: apiData.data.ping || 0,
        lastUpdated: new Date()
    };

    return ApiResponse.success(res, data, '获取服务器实时状态成功');
});

const getServerLast10DayHeat = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的服务器ID');
    }

    // 获取服务器信息，返回last10dayHeat字段
    const server = await Server.findById(id);

    if (!server) {
        throw new NotFoundError('服务器不存在');
    }

    // 确保last10dayHeat字段存在且长度为10
    const last10dayHeat = server.last10dayHeat || Array(10).fill(0);

    return ApiResponse.success(res, last10dayHeat, '获取最近10天热度成功');
});

const getOverviewStats = asyncHandler(async (req, res) => {
    const servers = await Server.find({ isActive: true });

    const totalServers = servers.length;

    // 简单判断在线状态（这里可以根据实际情况调整判断逻辑）
    const onlineServers = servers.filter(server => server.ping !== null).length;

    // 计算总玩家数
    const totalPlayers = servers.reduce((sum, server) => sum + (server.currentPlayers || 0), 0);

    const data = {
        totalServers,
        onlineServers,
        totalPlayers
    };

    return ApiResponse.success(res, data, '获取概览统计成功');
});

const updateServer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的服务器ID');
    }

    const server = await Server.findById(id);

    if (!server) {
        throw new NotFoundError('服务器不存在');
    }

    // 更新服务器数据
    const updatedServer = await Server.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    return ApiResponse.success(res, updatedServer, '更新服务器数据成功');
});

module.exports = {
    getServers,
    getServerRealTimeStats,
    getServerLast10DayHeat,
    getOverviewStats,
    updateServer
};
