// services/carouselService.js
const Carousel = require('../models/Carousel');

class CarouselService {
    /**
     * 创建轮播图
     * @param {Object} data 轮播图数据
     * @returns {Promise<Object>}
     */
    async createCarousel(data) {
        const carousel = new Carousel(data);
        return await carousel.save();
    }

    /**
     * 获取所有轮播图
     * @param {Object} query 查询参数
     * @returns {Promise<Array>}
     */
    async getAllCarousels(query = {}) {
        const { isActive, sortBy = 'order', sortOrder = 'asc' } = query;
        const filter = {};
        
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true' || isActive === true;
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        return await Carousel.find(filter).sort(sort);
    }

    /**
     * 获取单个轮播图
     * @param {string} id 轮播图ID
     * @returns {Promise<Object>}
     */
    async getCarouselById(id) {
        return await Carousel.findById(id);
    }

    /**
     * 更新轮播图
     * @param {string} id 轮播图ID
     * @param {Object} data 更新的数据
     * @returns {Promise<Object>}
     */
    async updateCarousel(id, data) {
        return await Carousel.findByIdAndUpdate(id, data, { 
            new: true, 
            runValidators: true 
        });
    }

    /**
     * 删除轮播图
     * @param {string} id 轮播图ID
     * @returns {Promise<Object>}
     */
    async deleteCarousel(id) {
        return await Carousel.findByIdAndDelete(id);
    }
}

module.exports = new CarouselService();
