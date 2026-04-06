// scripts/initDatabase.js
const mongoose = require('mongoose');
const Server = require('../models/Server');
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
                status: true,
                players: 45,
                version: '1.20.4',
                monthlyHeat: [35, 42, 48, 52, 45, 50, 48, 55, 60, 58, 62, 65],
                requiredMods: ['1', '2']
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
                status: true,
                players: 23,
                version: '1.20.4',
                monthlyHeat: [35, 42, 48, 52, 45, 50, 48, 55, 60, 58, 62, 65],
                requiredMods: []
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
                status: true,
                players: 32,
                version: '1.20.4',
                monthlyHeat: [35, 42, 48, 52, 45, 50, 48, 55, 60, 58, 62, 65],
                requiredMods: []
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
                status: true,
                players: 18,
                version: '1.20.4',
                monthlyHeat: [35, 42, 48, 52, 45, 50, 48, 55, 60, 58, 62, 65],
                requiredMods: []
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
                status: true,
                players: 12,
                version: '1.20.4',
                monthlyHeat: [35, 42, 48, 52, 45, 50, 48, 55, 60, 58, 62, 65],
                requiredMods: []
            }
        ];

        const createdServers = await Server.insertMany(servers);
        console.log(`成功插入 ${createdServers.length} 个服务器`);

        console.log('\n✅ 数据库初始化完成！');
        console.log('现在你可以在 MongoDB Compass 中看到 ECNU-MCForum 数据库了');

        // 显示数据概览
        const serverCount = await Server.countDocuments();
        console.log(`\n数据概览:`);
        console.log(`- 服务器数量: ${serverCount}`);

    } catch (error) {
        console.error('初始化失败:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n数据库连接已关闭');
        process.exit(0);
    }
};

initDatabase();
