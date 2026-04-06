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

        // 清空现有数据
        console.log('清空现有数据...');
        await Server.deleteMany({});
        console.log('数据已清空');

        // 插入服务器数据（只设置 address，其他使用默认值）
        console.log('插入服务器数据...');
        const servers = [
            {
                name: 'server-1',
                title: '服务器 1',
                address: 'rebuildputuo.ecnumc.cn'
            },
            {
                name: 'server-2',
                title: '服务器 2',
                address: 'rebuildminhang.ecnumc.cn'
            },
            {
                name: 'server-3',
                title: '服务器 3',
                address: 'play.ecnumc.cn'
            },
            {
                name: 'server-4',
                title: '服务器 4',
                address: 'mc.ecnu.edu.cn'
            },
            {
                name: 'server-5',
                title: '服务器 5',
                address: 'minecraft.ecnu.edu.cn'
            }
        ];

        const createdServers = await Server.insertMany(servers);
        console.log(`成功插入 ${createdServers.length} 个服务器`);

        console.log('\n✅ 数据库初始化完成！');
        console.log('现在你可以在 MongoDB Compass 中看到 ECNU-MCForum 数据库了');

        // 显示数据概览
        const serverCount = await Server.countDocuments();
        console.log('\n数据概览:');
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
