// scripts/initChannels.js — 初始化聊天频道
const mongoose = require('mongoose');
const Channel = require('../models/Channel');
require('dotenv').config();

const initChannels = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ECNU-MCForum';

        console.log('正在连接 MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('MongoDB 连接成功！');

        // 清空现有频道数据
        console.log('清空现有频道数据...');
        await Channel.deleteMany({});
        console.log('频道数据已清空');

        // 插入预设频道
        console.log('插入频道数据...');
        const channels = [
            {
                name: '技术讨论',
                description: '讨论编程、技术相关话题',
                icon: '💻',
                type: 'text',
                order: 1
            },
            {
                name: '生活分享',
                description: '分享日常生活、兴趣爱好',
                icon: '🌟',
                type: 'text',
                order: 2
            },
            {
                name: '学习交流',
                description: '交流学习经验、资源分享',
                icon: '📚',
                type: 'text',
                order: 3
            },
            {
                name: '游戏天地',
                description: '讨论游戏、游戏攻略',
                icon: '🎮',
                type: 'text',
                order: 4
            }
        ];

        const createdChannels = await Channel.insertMany(channels);
        console.log(`成功插入 ${createdChannels.length} 个频道`);

        console.log('\n✅ 频道初始化完成！');

        // 显示频道概览
        console.log('\n频道列表:');
        createdChannels.forEach(ch => {
            console.log(`  ${ch.icon} ${ch.name} — ${ch.description}`);
        });

    } catch (error) {
        console.error('初始化失败:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n数据库连接已关闭');
        process.exit(0);
    }
};

initChannels();
