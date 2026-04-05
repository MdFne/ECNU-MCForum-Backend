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
                name: 'rebuild-putuo',
                title: '[复刻服]中北复刻',
                type: '创造',
                address: 'rebuildputuo.ecnumc.cn',
                port: 25565,
                thumbnail: 'https://example.com/survival.jpg',
                description: '复刻服中北复刻服务器',
                maxPlayers: 64,
                isActive: true
            },
            {
                name: 'rebuild-minhang',
                title: '[复刻服]闵行复刻',
                type: '创造',
                address: 'rebuildminhang.ecnumc.cn',
                port: 25566,
                thumbnail: 'https://example.com/creative.jpg',
                description: '复刻服闵行复刻服务器',
                maxPlayers: 64,
                isActive: true
            },
            {
                name: 'creative',
                title: '[模组服]机械动力-瓦尔基里',
                type: '生存',
                address: 'play.ecnumc.cn',
                port: 30065,
                thumbnail: 'https://example.com/snapshot.jpg',
                description: '机械动力-瓦尔基里模组服服务器',
                maxPlayers: 32,
                isActive: true
            },
            {
                name: 'wtf',
                title: '[模组服]机动乐事',
                type: '生存',
                address: 'play.ecnumc.cn',
                port: 30060,
                thumbnail: 'https://example.com/minigame.jpg',
                description: '机动乐事模组服服务器',
                maxPlayers: 100,
                isActive: true
            },
            {
                name: 'zhedoutmsha',
                title: '[模组服]愚者',
                type: '生存',
                address: 'play.ecnumc.cn',
                port: 30055,
                thumbnail: 'https://example.com/hardcore.jpg',
                description: '愚者模组服服务器',
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
