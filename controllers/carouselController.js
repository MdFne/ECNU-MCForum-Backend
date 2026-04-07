// controllers/carouselController.js
const mongoose = require('mongoose');
const carouselService = require('../services/carouselService');
const ApiResponse = require('../utils/response');
const { BadRequestError, NotFoundError, asyncHandler } = require('../utils/errorHandler');

/**
 * 创建轮播图
 */
const createCarousel = asyncHandler(async (req, res) => {
    const { title, imageUrl } = req.body;
    
    if (!title || !imageUrl) {
        throw new BadRequestError('标题和图片URL是必填项');
    }

    const carousel = await carouselService.createCarousel(req.body);
    return ApiResponse.success(res, carousel, '创建轮播图成功', 201);
});

/**
 * 获取所有轮播图
 */
const getAllCarousels = asyncHandler(async (req, res) => {
    const carousels = await carouselService.getAllCarousels(req.query);
    return ApiResponse.success(res, carousels, '获取轮播图列表成功');
});

/**
 * 获取单个轮播图
 */
const getCarouselById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的轮播图ID');
    }

    const carousel = await carouselService.getCarouselById(id);

    if (!carousel) {
        throw new NotFoundError('未找到指定的轮播图');
    }

    return ApiResponse.success(res, carousel, '获取轮播图详情成功');
});

/**
 * 更新轮播图
 */
const updateCarousel = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的轮播图ID');
    }

    const carousel = await carouselService.updateCarousel(id, req.body);

    if (!carousel) {
        throw new NotFoundError('未找到指定的轮播图');
    }

    return ApiResponse.success(res, carousel, '更新轮播图成功');
});

/**
 * 删除轮播图
 */
const deleteCarousel = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的轮播图ID');
    }

    const carousel = await carouselService.deleteCarousel(id);

    if (!carousel) {
        throw new NotFoundError('未找到指定的轮播图');
    }

    return ApiResponse.success(res, null, '删除轮播图成功');
});

module.exports = {
    createCarousel,
    getAllCarousels,
    getCarouselById,
    updateCarousel,
    deleteCarousel
};
