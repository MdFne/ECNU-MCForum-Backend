# MCForum 后端 API

基于 Express.js + MongoDB 的论坛后端服务

## 技术栈

- **框架**: Express.js 5.x
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (JSON Web Token)
- **架构**: MVC 分层架构

## 项目结构

```
ECNU-MCForum-Backend/
├── config/              # 配置文件
│   └── jwt.js          # JWT 配置
├── controllers/         # 业务逻辑控制器
│   ├── authController.js
│   └── statsController.js
├── middleware/          # 中间件
│   └── auth.js         # 认证中间件
├── models/             # 数据模型
│   ├── Server.js
│   └── ServerStats.js
├── routes/             # 路由定义
│   ├── auth.js
│   └── stats.js
├── utils/              # 工具函数
│   ├── response.js     # 统一响应格式
│   ├── errorHandler.js # 错误处理
│   └── README.md       # 工具使用说明
├── .env                # 环境变量配置
├── index.js            # 应用入口
└── package.json        # 依赖配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并修改配置：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# MongoDB 配置
MONGO_URI=mongodb://localhost:27017/ECNU-MCForum

# JWT 配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### 3. 启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# Windows
net start MongoDB

# 或使用 MongoDB Compass 连接
```

### 4. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 运行

## API 接口

### 认证模块 (`/api/auth`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | ❌ |
| POST | /api/auth/refresh | 刷新令牌 | ❌ |
| GET | /api/auth/me | 获取当前用户 | ✅ |

### 统计模块 (`/api/stats`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/stats/servers | 获取服务器列表 | ❌ |
| GET | /api/stats/servers/:id/realtime | 获取实时状态 | ❌ |
| GET | /api/stats/servers/:id/history | 获取历史数据 | ❌ |
| GET | /api/stats/servers/:id/monthly-heat | 获取月度热度 | ❌ |
| GET | /api/stats/overview | 获取概览统计 | ❌ |

## 请求示例

### 登录

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

响应：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "1",
      "username": "admin",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2024-04-04T12:00:00.000Z"
}
```

### 获取服务器列表

```bash
GET /api/stats/servers
```

响应：
```json
{
  "success": true,
  "message": "获取服务器列表成功",
  "data": [
    {
      "_id": "...",
      "name": "主服",
      "title": "[主服]生存世界",
      "type": "生存",
      "address": "mc.example.com",
      "port": 25565,
      "isActive": true
    }
  ],
  "timestamp": "2024-04-04T12:00:00.000Z"
}
```

## 错误处理

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "message": "错误信息",
  "timestamp": "2024-04-04T12:00:00.000Z"
}
```

### 常见错误码

- `400` - 请求参数错误
- `401` - 未授权访问
- `403` - 禁止访问
- `404` - 资源未找到
- `500` - 服务器内部错误

## 开发指南

### 使用统一响应格式

```javascript
const ApiResponse = require('../utils/response');

// 成功响应
return ApiResponse.success(res, data, '操作成功');

// 错误响应
return ApiResponse.badRequest(res, '参数错误');
```

### 使用错误处理

```javascript
const { NotFoundError, asyncHandler } = require('../utils/errorHandler');

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('用户不存在');
  }
  
  return ApiResponse.success(res, user);
});
```

## 数据库模型

### Server 模型

```javascript
{
  name: String,           // 服务器名称
  title: String,          // 服务器标题
  type: String,           // 类型：生存/创造/小游戏/测试/其他
  address: String,        // 服务器地址
  port: Number,           // 端口号
  thumbnail: String,      // 缩略图
  description: String,    // 描述
  maxPlayers: Number,     // 最大玩家数
  isActive: Boolean       // 是否激活
}
```

### ServerStats 模型

```javascript
{
  server: ObjectId,       // 关联的服务器
  onlineStatus: Boolean,  // 在线状态
  currentPlayers: Number, // 当前玩家数
  maxPlayers: Number,     // 最大玩家数
  version: String,        // 服务器版本
  latency: Number,        // 延迟
  recordedAt: Date        // 记录时间
}
```

## 环境要求

- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

## 许可证

ISC
