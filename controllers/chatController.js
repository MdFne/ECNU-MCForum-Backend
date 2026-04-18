// controllers/chatController.js
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const ApiResponse = require('../utils/response');
const { BadRequestError, NotFoundError, asyncHandler } = require('../utils/errorHandler');

// 获取所有频道列表
const getChannels = asyncHandler(async (req, res) => {
    const channels = await Channel.find({ isActive: true })
        .sort({ order: 1 })
        .select('name description icon type order');

    return ApiResponse.success(res, channels, '获取频道列表成功');
});

// 获取指定频道的历史消息（游标分页）
const getMessages = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before;

    // 检查频道是否存在
    const channel = await Channel.findById(channelId);
    if (!channel || !channel.isActive) {
        throw new NotFoundError('频道不存在');
    }

    // 构建查询条件
    const filter = { channel: channelId };
    if (before) {
        filter._id = { $lt: before };
    }

    const messages = await Message.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .populate('sender', 'id username avatar')
        .populate({
            path: 'replyTo',
            select: 'content createdAt',
            populate: {
                path: 'sender',
                select: 'id username avatar'
            }
        });

    // 多查一条来判断是否还有更多消息
    const hasMore = messages.length > limit;
    if (hasMore) {
        messages.pop();
    }

    // 返回时按时间正序排列（最早的消息在前）
    messages.reverse();

    return ApiResponse.success(res, { messages, hasMore }, '获取消息成功');
});

// 创建新频道（管理员）
const createChannel = asyncHandler(async (req, res) => {
    const { name, description, icon, type, order } = req.body;

    if (!name) {
        throw new BadRequestError('频道名称不能为空');
    }

    // 检查频道名是否已存在
    const existing = await Channel.findOne({ name });
    if (existing) {
        const { ConflictError } = require('../utils/errorHandler');
        throw new ConflictError('频道名称已存在');
    }

    const channel = await Channel.create({
        name,
        description: description || '',
        icon: icon || '💬',
        type: type || 'text',
        order: order || 0,
        createdBy: req.user?.id
    });

    return ApiResponse.created(res, channel, '创建频道成功');
});

module.exports = {
    getChannels,
    getMessages,
    createChannel
};
