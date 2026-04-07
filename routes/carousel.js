// routes/carousel.js
const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Carousel
 *   description: 轮播图管理接口
 */

/**
 * @swagger
 * /api/carousel:
 *   post:
 *     summary: 创建轮播图
 *     tags: [Carousel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, imageUrl]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               imageUrl: { type: string }
 *               linkUrl: { type: string }
 *               order: { type: number }
 *               isActive: { type: boolean }
 *     responses:
 *       201: { description: 创建成功 }
 *       401: { description: 未认证 }
 *       403: { description: 无权限 }
 */
router.post('/', authenticate, authorize('admin'), carouselController.createCarousel);

/**
 * @swagger
 * /api/carousel:
 *   get:
 *     summary: 获取所有轮播图
 *     tags: [Carousel]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: 获取成功 }
 */
router.get('/', carouselController.getAllCarousels);

/**
 * @swagger
 * /api/carousel/{id}:
 *   get:
 *     summary: 获取单个轮播图
 *     tags: [Carousel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 获取成功 }
 *       404: { description: 未找到 }
 */
router.get('/:id', carouselController.getCarouselById);

/**
 * @swagger
 * /api/carousel/{id}:
 *   put:
 *     summary: 更新轮播图
 *     tags: [Carousel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               imageUrl: { type: string }
 *               linkUrl: { type: string }
 *               order: { type: number }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: 更新成功 }
 *       404: { description: 未找到 }
 */
router.put('/:id', authenticate, authorize('admin'), carouselController.updateCarousel);

/**
 * @swagger
 * /api/carousel/{id}:
 *   delete:
 *     summary: 删除轮播图
 *     tags: [Carousel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 删除成功 }
 *       404: { description: 未找到 }
 */
router.delete('/:id', authenticate, authorize('admin'), carouselController.deleteCarousel);

module.exports = router;
