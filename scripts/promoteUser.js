// scripts/promoteUser.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();


// node scripts/promoteUser.js admin_user(用户名)
const username = process.argv[2]; // 从命令行获取用户名

if (!username) {
    console.error('❌ 请提供用户名，例如: node scripts/promoteUser.js your_username');
    process.exit(1);
}

const promoteUser = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mcforum';

        console.log('正在连接 MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('MongoDB 连接成功！');

        const user = await User.findOne({ username });

        if (!user) {
            console.error(`❌ 未找到用户: ${username}`);
            return;
        }

        user.role = 'admin';
        await user.save();

        console.log(`\n✅ 用户 ${username} 已成功提升为管理员 (admin)！`);

    } catch (error) {
        console.error('❌ 操作失败:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n数据库连接已关闭');
        process.exit(0);
    }
};

promoteUser();
