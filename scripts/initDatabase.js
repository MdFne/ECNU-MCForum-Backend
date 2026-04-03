// scripts/initDatabase.js
const mongoose = require('mongoose');
const Server = require('../models/Server');
const ServerStats = require('../models/ServerStats');

require('dotenv').config();

const initDatabase = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ECNU-MCForum';
        
        console.log('正在连接 MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('MongoDB 连接成功！');

        // 清空现有数据（可选）
        console.log('清空现有数据...');
        await Server.deleteMany({});
        await ServerStats.deleteMany({});
        console.log('数据已清空');

        // 插入测试服务器数据
        console.log('插入测试服务器数据...');
        const servers = [
            {
                name: 'main-survival',
                title: '[主服]生存世界',
                type: '生存',
                address: 'rebuildputuo.ecnumc.cn',
                port: 25565,
                thumbnail: 'https://example.com/survival.jpg',
                description: '主生存服务器，体验原汁原味的 Minecraft 生存乐趣',
                maxPlayers: 64,
                isActive: true
            },
            {
                name: 'creative',
                title: '[主服]创造世界',
                type: '创造',
                address: 'rebuildputuo.ecnumc.cn',
                port: 25566,
                thumbnail: 'https://example.com/creative.jpg',
                description: '创造模式服务器，尽情发挥你的想象力',
                maxPlayers: 64,
                isActive: true
            },
            {
                name: 'snapshot',
                title: '[测试服]快照版',
                type: '测试',
                address: 'test.ecnumc.cn',
                port: 25565,
                thumbnail: 'https://example.com/snapshot.jpg',
                description: '最新快照版本测试服务器',
                maxPlayers: 32,
                isActive: true
            },
            {
                name: 'minigame',
                title: '[小游戏]空岛战争',
                type: '小游戏',
                address: 'minigame.ecnumc.cn',
                port: 25565,
                thumbnail: 'https://example.com/minigame.jpg',
                description: '空岛战争小游戏服务器',
                maxPlayers: 100,
                isActive: true
            },
            {
                name: 'hardcore',
                title: '[生存]硬核模式',
                type: '生存',
                address: 'hardcore.ecnumc.cn',
                port: 25565,
                thumbnail: 'https://example.com/hardcore.jpg',
                description: '硬核生存模式，死亡即删档',
                maxPlayers: 32,
                isActive: true
            }
        ];

        const createdServers = await Server.insertMany(servers);
        console.log(`成功插入 ${createdServers.length} 个服务器`);

        // 生成历史统计数据
        console.log('生成历史统计数据...');
        const statsData = [];
        
        for (const server of createdServers) {
            // 生成最近 30 天的数据
            for (let i = 0; i < 30; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                
                // 每天生成 24 条记录（每小时一条）
                for (let hour = 0; hour < 24; hour++) {
                    const recordDate = new Date(date);
                    recordDate.setHours(hour, 0, 0, 0);
                    
                    // 模拟玩家数量（根据服务器类型不同）
                    let basePlayers = 20;
                    if (server.type === '小游戏') basePlayers = 40;
                    if (server.type === '测试') basePlayers = 5;
                    
                    const randomPlayers = Math.floor(Math.random() * basePlayers);
                    
                    statsData.push({
                        server: server._id,
                        onlineStatus: Math.random() > 0.1, // 90% 在线率
                        currentPlayers: randomPlayers,
                        maxPlayers: server.maxPlayers,
                        version: '1.20.4',
                        latency: Math.floor(Math.random() * 100) + 20,
                        recordedAt: recordDate
                    });
                }
            }
        }

        await ServerStats.insertMany(statsData);
        console.log(`成功插入 ${statsData.length} 条统计数据`);

        console.log('\n✅ 数据库初始化完成！');
        console.log('现在你可以在 MongoDB Compass 中看到 ECNU-MCForum 数据库了');
        
        // 显示数据概览
        const serverCount = await Server.countDocuments();
        const statsCount = await ServerStats.countDocuments();
        console.log(`\n数据概览:`);
        console.log(`- 服务器数量: ${serverCount}`);
        console.log(`- 统计数据条数: ${statsCount}`);

    } catch (error) {
        console.error('初始化失败:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n数据库连接已关闭');
        process.exit(0);
    }
};

initDatabase();
