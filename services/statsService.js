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

// 解析MOTD，将title、version、type等提取出来
function parseMotd(motd) {
    if (!motd) return { title: null, version: null, type: null };

    // 统一换行符（处理 \n 或 \\n）
    const motdStr = motd.replace(/\\n/g, '\n');
    const parts = motdStr.split('\n');
    const firstLine = parts[0]?.trim() || '';
    const secondLine = parts[1]?.trim() || '';

    let title = '未知服务器';
    let version = '未知版本';
    let type = '未知类型';

    // ==================== 解析标题 ====================
    if (firstLine) {
        // 去掉末尾的 "MC" 字样（保留前面的服务器名）
        title = firstLine.replace(/\s*MC\s*$/i, '').trim();
    }

    // ==================== 解析版本号 ====================
    if (secondLine) {
        // 匹配 1.21.7 / 1.20 / 1.20.4 这类版本号
        const versionMatch = secondLine.match(/\b(\d+\.\d+(?:\.\d+)?)\b/);
        if (versionMatch) {
            version = versionMatch[1];
        }
    }

    // ==================== 解析服务器类型 ====================
    if (secondLine) {
        const typePatterns = [
            { pattern: /创造|创造模式|creative/i, value: '创造' },
            { pattern: /生存|生存模式|survival/i, value: '生存' },
            { pattern: /小游戏|minigame/i, value: '小游戏' },
            { pattern: /测试|test/i, value: '测试' },
            { pattern: /复刻|复原/i, value: '复刻' }
        ];

        for (const { pattern, value } of typePatterns) {
            if (pattern.test(secondLine)) {
                type = value;
                break;
            }
        }
    }

    return { title, version, type };
}

function buildOnlineUpdateData(apiData, currentServer) {
    const last10dayHeat = [...(currentServer.last10dayHeat || Array(10).fill(0))];
    last10dayHeat.shift();
    last10dayHeat.push(apiData.data?.today_max || 0);

    const motd = apiData.data?.motd || '';
    const parsedMotd = parseMotd(motd);
    console.log('原始MOTD:', motd);
    console.log('解析后的MOTD:', parsedMotd);

    const updateData = {
        isActive: true,
        currentPlayers: apiData.data?.p || 0,
        maxPlayers: apiData.data?.mp || currentServer.maxPlayers,
        last_updated_str: apiData.data?.last_updated_str || '',
        last_updated: apiData.data?.last_updated || 0,
        motd: motd,
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

    if (parsedMotd.title) {
        updateData.title = parsedMotd.title;
    }
    if (parsedMotd.version) {
        updateData.version = parsedMotd.version;
    }
    if (parsedMotd.type) {
        updateData.type = parsedMotd.type;
    }

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
