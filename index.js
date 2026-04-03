const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
require('dotenv').config();

const { errorHandler, notFound } = require('./utils/errorHandler');
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth');

app.use(express.json());

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

startServer();
