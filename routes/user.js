const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 用户信息接口
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: 更新用户资料
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               school:
 *                 type: string
 *               age:
 *                 type: number
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: 修改密码
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 密码修改成功
 */
router.put('/password', authenticate, userController.changePassword);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: 上传用户头像
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 头像上传成功
 */
router.post('/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
