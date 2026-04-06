const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     description: 创建新用户账号，注册成功后返回JWT令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名（3-20个字符）
 *                 example: testuser
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码（至少6位）
 *                 example: 123456
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: 确认密码
 *                 example: 123456
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 注册成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: 请求参数错误（缺少字段、密码不匹配、密码太短）
 *       409:
 *         description: 用户名或邮箱已被注册
 *       500:
 *         description: 服务器内部错误
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 使用用户名或邮箱和密码登录，返回JWT令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名或邮箱
 *                 example: testuser
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码
 *                 example: 123456
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 登录成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: 请求参数错误（缺少字段）
 *       401:
 *         description: 用户名或密码错误，或账号已被禁用
 *       500:
 *         description: 服务器内部错误
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 刷新访问令牌
 *     description: 使用刷新令牌获取新的访问令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新令牌
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: 令牌刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 令牌刷新成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: 刷新令牌为空
 *       401:
 *         description: 无效或过期的刷新令牌
 *       500:
 *         description: 服务器内部错误
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 用户退出登录
 *     description: 退出登录，使当前令牌失效
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 退出登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 退出登录成功
 *                 data:
 *                   type: null
 *       401:
 *         description: 未授权访问（无效或过期的令牌）
 *       500:
 *         description: 服务器内部错误
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     description: 获取已登录用户的详细信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取用户信息成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     school:
 *                       type: string
 *                     age:
 *                       type: number
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 未授权访问（无效或过期的令牌）
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
