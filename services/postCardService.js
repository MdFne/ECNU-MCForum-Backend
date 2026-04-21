// services/postCardService.js
const Postcard = require('../models/PostCard');

class PostCardService {
    /**
     * 创建文章
     * @param {Object} data 文章数据
     * @returns {Promise<Object>}
     */
    async createPostcard(data) {
        if (!data.publishDate) {
            data.publishDate = new Date();
        }
        const postcard = new Postcard(data);
        return await postcard.save();
    }

    /**
     * 获取所有文章（支持分页、搜索、过滤、排序）
     * @param {Object} query 查询参数
     * @returns {Promise<Object>}
     */
    async getAllPostcards(query = {}) {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            tag, 
            isActive, 
            sortBy = 'publishDate', 
            sortOrder = 'desc' 
        } = query;

        const filter = {};
        
        // 激活状态过滤
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true' || isActive === true;
        }

        // 标签过滤
        if (tag) {
            filter.tags = tag;
        }

        // 搜索（标题或内容）
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [postcards, total] = await Promise.all([
            Postcard.find(filter, '-content')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Postcard.countDocuments(filter)
        ]);

        return {
            postcards,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        };
    }

    /**
     * 获取单个文章详情
     * @param {string} id 文章ID
     * @param {boolean} incrementViews 是否增加浏览量
     * @returns {Promise<Object>}
     */
    async getPostcardById(id, incrementViews = false) {
        if (incrementViews) {
            return await Postcard.findByIdAndUpdate(
                id, 
                { $inc: { views: 1 } }, 
                { new: true }
            );
        }
        return await Postcard.findById(id);
    }

    /**
     * 更新文章
     * @param {string} id 文章ID
     * @param {Object} data 更新的数据
     * @returns {Promise<Object>}
     */
    async updatePostcard(id, data) {
        return await Postcard.findByIdAndUpdate(id, data, { 
            new: true, 
            runValidators: true 
        });
    }

    /**
     * 删除文章
     * @param {string} id 文章ID
     * @returns {Promise<Object>}
     */
    async deletePostcard(id) {
        return await Postcard.findByIdAndDelete(id);
    }
}

module.exports = new PostCardService();
