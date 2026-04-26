// controllers/postCardController.js
const mongoose = require('mongoose');
const postCardService = require('../services/postCardService');
const ApiResponse = require('../utils/response');
const { BadRequestError, NotFoundError, asyncHandler } = require('../utils/errorHandler');

/**
 * 创建文章
 */
const createPostcard = asyncHandler(async (req, res) => {
    const { title, author, content } = req.body;
    
    if (!title || !author || !content) {
        throw new BadRequestError('标题、作者和内容是必填项');
    }

    const postcard = await postCardService.createPostcard(req.body);
    return ApiResponse.created(res, postcard, '文章创建成功');
});

/**
 * 获取所有文章列表
 */
const getAllPostcards = asyncHandler(async (req, res) => {
    const data = await postCardService.getAllPostcards(req.query);
    return ApiResponse.success(res, data, '获取文章列表成功');
});

/**
 * 获取单个文章详情
 */
const getPostcardById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的文章ID');
    }

    // 默认获取详情时增加一次浏览量
    const postcard = await postCardService.getPostcardById(id, true);

    if (!postcard) {
        throw new NotFoundError('未找到指定的文章');
    }

    return ApiResponse.success(res, postcard, '获取文章详情成功');
});

/**
 * 更新文章内容
 */
const updatePostcard = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的文章ID');
    }

    const postcard = await postCardService.updatePostcard(id, req.body);

    if (!postcard) {
        throw new NotFoundError('未找到指定的文章');
    }

    return ApiResponse.success(res, postcard, '文章更新成功');
});

/**
 * 删除文章
 */
const deletePostcard = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('无效的文章ID');
    }

    const postcard = await postCardService.deletePostcard(id);

    if (!postcard) {
        throw new NotFoundError('未找到指定的文章');
    }

    return ApiResponse.success(res, null, '文章删除成功');
});

/**
 * 获取所有不重复标签
 */
const getAllTags = asyncHandler(async (req, res) => {
    const tags = await postCardService.getDistinctTags();
    return ApiResponse.success(res, tags, '获取标签列表成功');
});

module.exports = {
    createPostcard,
    getAllPostcards,
    getAllTags,
    getPostcardById,
    updatePostcard,
    deletePostcard
};
