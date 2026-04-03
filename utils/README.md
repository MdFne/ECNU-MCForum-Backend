# Utils 工具使用说明

## 文件说明

### 1. response.js - 统一响应格式
提供标准化的 API 响应格式，确保所有接口返回的数据结构一致。

### 2. errorHandler.js - 错误处理
提供自定义错误类和错误处理中间件，统一错误处理逻辑。

### 3. example.js - 使用示例
展示如何使用 response 和 errorHandler 工具。

## 使用方法

### 1. 在控制器中使用 ApiResponse

```javascript
const ApiResponse = require('../utils/response');

const exampleController = {
  // 成功响应
  getUsers: async (req, res, next) => {
    try {
      const users = await User.find();
      return ApiResponse.success(res, users, '获取用户列表成功');
    } catch (error) {
      next(error);
    }
  },

  // 创建成功
  createUser: async (req, res, next) => {
    try {
      const user = await User.create(req.body);
      return ApiResponse.created(res, user, '用户创建成功');
    } catch (error) {
      next(error);
    }
  },

  // 错误响应
  handleError: (req, res) => {
    return ApiResponse.badRequest(res, '请求参数错误');
  }
};
```

### 2. 使用自定义错误类

```javascript
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  asyncHandler
} = require('../utils/errorHandler');

const userController = {
  // 使用 asyncHandler 简化错误处理
  getUserById: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    
    return ApiResponse.success(res, user);
  }),

  // 使用自定义错误
  validateUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email) {
      throw new BadRequestError('邮箱不能为空');
    }
    
    if (!password) {
      throw new BadRequestError('密码不能为空');
    }
    
    // 业务逻辑...
  })
};
```

### 3. 在 app.js 中配置错误处理

```javascript
const express = require('express');
const { errorHandler, notFound } = require('./utils/errorHandler');

const app = express();

// 路由配置
app.use('/api/users', userRoutes);

// 404 处理
app.use(notFound);

// 全局错误处理
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## ApiResponse 方法列表

| 方法 | 说明 | 状态码 |
|------|------|--------|
| `success(res, data, message, statusCode)` | 成功响应 | 200 |
| `error(res, message, statusCode, error)` | 错误响应 | 自定义 |
| `created(res, data, message)` | 创建成功 | 201 |
| `noContent(res, message)` | 无内容 | 204 |
| `badRequest(res, message, error)` | 错误请求 | 400 |
| `unauthorized(res, message)` | 未授权 | 401 |
| `forbidden(res, message)` | 禁止访问 | 403 |
| `notFound(res, message)` | 资源未找到 | 404 |
| `conflict(res, message, error)` | 资源冲突 | 409 |
| `unprocessableEntity(res, message, error)` | 无法处理的实体 | 422 |
| `internalError(res, message, error)` | 内部服务器错误 | 500 |
| `serviceUnavailable(res, message)` | 服务不可用 | 503 |

## 自定义错误类列表

| 错误类 | 说明 | 状态码 |
|--------|------|--------|
| `AppError` | 基础错误类 | 自定义 |
| `BadRequestError` | 错误请求 | 400 |
| `UnauthorizedError` | 未授权 | 401 |
| `ForbiddenError` | 禁止访问 | 403 |
| `NotFoundError` | 资源未找到 | 404 |
| `ConflictError` | 资源冲突 | 409 |
| `ValidationError` | 验证错误 | 422 |
| `InternalServerError` | 内部服务器错误 | 500 |
| `ServiceUnavailableError` | 服务不可用 | 503 |

## 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... },
  "timestamp": "2024-04-04T12:00:00.000Z"
}
```

### 错误响应（开发环境）
```json
{
  "success": false,
  "message": "错误信息",
  "error": {
    "name": "Error",
    "stack": "错误堆栈...",
    "statusCode": 500
  },
  "timestamp": "2024-04-04T12:00:00.000Z"
}
```

### 错误响应（生产环境）
```json
{
  "success": false,
  "message": "操作失败",
  "timestamp": "2024-04-04T12:00:00.000Z"
}
```

## 特性

1. **统一响应格式**：所有 API 返回相同的数据结构
2. **环境区分**：开发环境显示详细错误信息，生产环境隐藏敏感信息
3. **自动错误处理**：asyncHandler 自动捕获异步错误
4. **数据库错误处理**：自动处理 Mongoose 验证错误、重复键错误等
5. **JWT 错误处理**：自动处理 token 相关错误
6. **时间戳**：所有响应都包含时间戳

## 最佳实践

1. 使用 `asyncHandler` 包装所有异步控制器函数
2. 使用自定义错误类抛出业务错误
3. 在生产环境中设置 `NODE_ENV=production`
4. 使用 `ApiResponse` 方法返回标准化响应
5. 在路由配置的最后添加 404 和错误处理中间件