// 引入express
const express = require('express');
// 引入mongoose
const mongoose = require('mongoose');
// 引入cors
const cors = require('cors');
// 引入 Swagger 配置
const setupSwagger = require('./swagger.js');

// 创建应用实例
const app = express();
const port = 3000;
// 配置环境变量
require('dotenv').config();

// 引入错误处理中间件
const { errorHandler, notFound } = require('./utils/errorHandler');
// 引入路由模块
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth');
const carouselRoutes = require('./routes/carousel');
const postCardRoutes = require('./routes/postCard');

// 解析 JSON 请求体
app.use(express.json());

// 配置 Swagger
setupSwagger(app);

// 允许跨域请求
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MCForum API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      stats: '/api/stats',
      carousel: '/api/carousel',
      postcard: '/api/postcard'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/postcard', postCardRoutes);

app.use(notFound);
app.use(errorHandler);

// 连接 MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mcforum';
    await mongoose.connect(mongoURI);
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

// 定时更新服务器数据
const scheduleServerUpdate = async () => {
  try {
    const Server = require('./models/Server');
    const servers = await Server.find({ isActive: true });

    for (const server of servers) {
      try {
        // 使用地址加端口的格式
        const apiResponse = await fetch(`https://www.minecraftservers.cn/api/query?ip=${server.address}%3A${server.port}`);

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();

          if (apiData.success && apiData.data) {
            // 更新last10dayHeat数据
            let updatedLast10dayHeat = [...(server.last10dayHeat || Array(10).fill(0))];
            // 移除最左边的元素，添加新的today_max值到最右边
            updatedLast10dayHeat.shift();
            updatedLast10dayHeat.push(apiData.data.today_max);

            // 更新服务器数据
            const updateData = {
              currentPlayers: apiData.data.p,
              maxPlayers: apiData.data.mp,
              last_updated_str: apiData.data.last_updated_str,
              last_updated: apiData.data.last_updated,
              motd: apiData.data.motd,
              ping: apiData.data.ping,
              today_max: apiData.data.today_max,
              today_min: apiData.data.today_min,
              today_avg: apiData.data.today_avg,
              history_max: apiData.data.history_max,
              total_queries: apiData.data.total_queries,
              created_at: apiData.data.created_at,
              created_at_str: apiData.data.created_at_str,
              last10dayHeat: updatedLast10dayHeat,
              updatedAt: new Date()
            };

            // 如果有logo，也更新
            if (apiData.data.logo) {
              updateData.thumbnail = apiData.data.logo;
            }

            await Server.findByIdAndUpdate(server._id, updateData);
            console.log(`更新服务器 ${server.title} 数据成功`);
          }
        }
      } catch (error) {
        console.error(`更新服务器 ${server.title} 数据失败:`, error);
      }
    }
  } catch (error) {
    console.error('定时更新服务器数据失败:', error);
  }
};

// 启动服务器
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`服务器运行在 http://localhost:${port}`);
      console.log(`API 文档: http://localhost:${port}`);
    });

    // 启动时执行一次更新
    scheduleServerUpdate();

    // 每隔24小时执行一次更新
    setInterval(scheduleServerUpdate, 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();
