// 1. 引入express
const express = require('express');
// 2. 引入mongoose
const mongoose = require('mongoose');
// 3. 引入cors
const cors = require('cors');

// 4. 创建应用实例
const app = express();
const port = 3000;
// 5. 配置环境变量
require('dotenv').config();

// 引入错误处理中间件
const { errorHandler, notFound } = require('./utils/errorHandler');
// 引入路由模块
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth');

// 解析 JSON 请求体
app.use(express.json());

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
      stats: '/api/stats'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);

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

// 启动服务器
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`服务器运行在 http://localhost:${port}`);
      console.log(`API 文档: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();
