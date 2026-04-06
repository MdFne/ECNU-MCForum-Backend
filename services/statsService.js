const mongoose = require('mongoose');
const Server = require('../models/Server');

const MINECRAFT_API_BASE = 'https://www.minecraftservers.cn/api/query';

async function fetchMinecraftServerStatus(address, port) {
    const response = await fetch(`${MINECRAFT_API_BASE}?ip=${address}%3A${port}`);
    
    if (!response.ok) {
        return null;
    }
    
    const data = await response.json();
    return data;
}

function buildOfflineUpdateData() {
    return {
        isActive: false,
        currentPlayers: -1,
        maxPlayers: -1,
        updatedAt: new Date()
    };
}

function buildOnlineUpdateData(apiData, currentServer) {
    const last10dayHeat = [...(currentServer.last10dayHeat || Array(10).fill(0))];
    last10dayHeat.shift();
    last10dayHeat.push(apiData.data?.today_max || 0);

    const updateData = {
        isActive: true,
        currentPlayers: apiData.data?.p || 0,
        maxPlayers: apiData.data?.mp || currentServer.maxPlayers,
        last_updated_str: apiData.data?.last_updated_str || '',
        last_updated: apiData.data?.last_updated || 0,
        motd: apiData.data?.motd || '',
        ping: apiData.data?.ping || 0,
        today_max: apiData.data?.today_max || 0,
        today_min: apiData.data?.today_min || 0,
        today_avg: apiData.data?.today_avg || 0,
        history_max: apiData.data?.history_max || 0,
        total_queries: apiData.data?.total_queries || 0,
        created_at: apiData.data?.created_at || 0,
        created_at_str: apiData.data?.created_at_str || '',
        last10dayHeat,
        updatedAt: new Date()
    };

    if (apiData.data?.logo) {
        updateData.thumbnail = apiData.data.logo;
    }

    return updateData;
}

async function updateServerStatus(serverId, apiData) {
    if (!mongoose.Types.ObjectId.isValid(serverId)) {
        throw new Error('无效的服务器ID');
    }

    const server = await Server.findById(serverId);
    if (!server) {
        throw new Error('服务器不存在');
    }

    let updateData;
    let isOnline = false;

    if (!apiData || !apiData.success || apiData.data?.ping === null) {
        updateData = buildOfflineUpdateData();
        isOnline = false;
    } else {
        updateData = buildOnlineUpdateData(apiData, server);
        isOnline = true;
    }

    const updatedServer = await Server.findByIdAndUpdate(serverId, updateData, { new: true });
    
    return { updatedServer, isOnline, apiData };
}

async function refreshServerRealTime(serverId) {
    if (!mongoose.Types.ObjectId.isValid(serverId)) {
        throw new Error('无效的服务器ID');
    }

    const server = await Server.findById(serverId);
    if (!server) {
        throw new Error('服务器不存在');
    }

    const apiData = await fetchMinecraftServerStatus(server.address, server.port);
    
    return updateServerStatus(serverId, apiData);
}

async function refreshAllServers() {
    const servers = await Server.find({});
    const results = [];

    for (const server of servers) {
        try {
            const apiData = await fetchMinecraftServerStatus(server.address, server.port);
            const result = await updateServerStatus(server._id, apiData);
            results.push(result);
        } catch (error) {
            console.error(`刷新服务器 ${server.title} 失败:`, error);
            results.push({ serverId: server._id, error: error.message });
        }
    }

    return results;
}

module.exports = {
    fetchMinecraftServerStatus,
    updateServerStatus,
    refreshServerRealTime,
    refreshAllServers,
    buildOfflineUpdateData,
    buildOnlineUpdateData
};
