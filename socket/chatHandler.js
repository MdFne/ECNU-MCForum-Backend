// socket/chatHandler.js — 聊天 Socket.IO 事件处理
const Message = require('../models/Message');
const Channel = require('../models/Channel');

/**
 * 注册聊天相关的 Socket.IO 事件
 * @param {import('socket.io').Server} io - Socket.IO 服务端实例
 */
function chatHandler(io) {
    io.on('connection', (socket) => {
        console.log(`用户已连接: ${socket.user.username} (${socket.id})`);

        // 记录用户当前所在的频道
        let currentChannel = null;

        // 加入频道
        socket.on('join-channel', async (data) => {
            try {
                const { channelId } = data;

                // 验证频道是否存在
                const channel = await Channel.findById(channelId);
                if (!channel || !channel.isActive) {
                    socket.emit('error', { message: '频道不存在' });
                    return;
                }

                // 离开之前的频道
                if (currentChannel) {
                    socket.leave(currentChannel);
                    io.to(currentChannel).emit('user-left', {
                        username: socket.user.username,
                        channelId: currentChannel
                    });
                }

                // 加入新频道
                socket.join(channelId);
                currentChannel = channelId;

                // 通知频道内其他用户
                io.to(channelId).emit('user-joined', {
                    username: socket.user.username,
                    channelId
                });

                console.log(`${socket.user.username} 加入频道: ${channel.name}`);
            } catch (error) {
                console.error('加入频道失败:', error);
                socket.emit('error', { message: '加入频道失败' });
            }
        });

        // 离开频道
        socket.on('leave-channel', () => {
            if (currentChannel) {
                socket.leave(currentChannel);
                io.to(currentChannel).emit('user-left', {
                    username: socket.user.username,
                    channelId: currentChannel
                });
                console.log(`${socket.user.username} 离开频道: ${currentChannel}`);
                currentChannel = null;
            }
        });

        // 发送消息
        socket.on('send-message', async (data, ack) => {
            try {
                const { channelId, content, replyTo } = data;

                // 基本校验
                if (!content || !content.trim()) {
                    if (ack) ack({ success: false, message: '消息内容不能为空' });
                    return;
                }

                if (!channelId || channelId !== currentChannel) {
                    if (ack) ack({ success: false, message: '请先加入该频道' });
                    return;
                }

                // 如果是回复消息，验证目标消息是否存在且属于同一频道
                if (replyTo) {
                    const targetMessage = await Message.findById(replyTo);
                    if (!targetMessage || targetMessage.channel.toString() !== channelId) {
                        if (ack) ack({ success: false, message: '回复的目标消息不存在' });
                        return;
                    }
                }

                // 写入数据库
                const message = await Message.create({
                    channel: channelId,
                    sender: socket.user.id,
                    content: content.trim(),
                    type: 'text',
                    replyTo: replyTo || null
                });

                // Populate 发送者和回复信息
                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'id username avatar')
                    .populate({
                        path: 'replyTo',
                        select: 'content createdAt',
                        populate: {
                            path: 'sender',
                            select: 'id username avatar'
                        }
                    });

                // 构造广播数据
                const messageData = {
                    id: populatedMessage._id,
                    content: populatedMessage.content,
                    type: populatedMessage.type,
                    createdAt: populatedMessage.createdAt,
                    sender: populatedMessage.sender,
                    replyTo: populatedMessage.replyTo || null
                };

                // 向频道内所有人广播（包括发送者）
                io.to(channelId).emit('new-message', messageData);

                // 返回确认给发送者
                if (ack) ack({ success: true, data: messageData });

            } catch (error) {
                console.error('发送消息失败:', error);
                if (ack) ack({ success: false, message: '发送消息失败' });
            }
        });

        // 断开连接
        socket.on('disconnect', () => {
            if (currentChannel) {
                io.to(currentChannel).emit('user-left', {
                    username: socket.user.username,
                    channelId: currentChannel
                });
                console.log(`${socket.user.username} 已断开连接`);
            }
        });
    });
}

module.exports = chatHandler;
