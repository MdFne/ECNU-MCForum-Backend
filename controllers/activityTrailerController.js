const ActivityTrailer = require('../models/ActivityTrailer');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * 获取所有活动预告，按开始时间正序排列
 */
const getAllTrailers = asyncHandler(async (req, res) => {
    const trailers = await ActivityTrailer.find({}).sort({ startTime: 1 });
    return ApiResponse.success(res, trailers, '获取活动预告成功');
});

/**
 * 全量更新活动预告
 * 逻辑：先删除所有现有预告，再存入新的预告
 */
const updateAllTrailers = asyncHandler(async (req, res) => {
    const newTrailers = req.body;

    if (!Array.isArray(newTrailers)) {
        return ApiResponse.error(res, '请求数据必须是数组', 400);
    }

    // 使用事务或简单地先删后增
    await ActivityTrailer.deleteMany({});

    if (newTrailers.length > 0) {
        await ActivityTrailer.insertMany(newTrailers);
    }

    const updatedTrailers = await ActivityTrailer.find({}).sort({ startTime: 1 });
    return ApiResponse.success(res, updatedTrailers, '全量更新活动预告成功');
});

module.exports = {
    getAllTrailers,
    updateAllTrailers
};
