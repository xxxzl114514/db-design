const express = require('express');
const router = express.Router();
const Vessel = require('../models/Vessel');

// 获取所有船舶
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = parseInt(req.query.offset) || 0;
        const vessels = await Vessel.findAll(limit, offset);
        
        // 获取总记录数
        const totalCount = await Vessel.getTotalCount();

        res.json({
            success: true,
            data: vessels,
            pagination: {
                limit: limit || 'all',
                offset,
                count: vessels.length,
                total: totalCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶列表失败'
        });
    }
});

// 具体路径必须放在通用路径/:id之前，避免路由冲突

// 根据MMSI获取船舶
router.get('/mmsi/:mmsi', async (req, res) => {
    try {
        const vessel = await Vessel.findByMMSI(req.params.mmsi);
        if (!vessel) {
            return res.status(404).json({
                success: false,
                message: '船舶不存在'
            });
        }

        res.json({
            success: true,
            data: vessel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶信息失败'
        });
    }
});

// 根据类型获取船舶
router.get('/type/:typeName', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const vessels = await Vessel.findByType(req.params.typeName, limit);

        res.json({
            success: true,
            data: vessels,
            typeName: req.params.typeName,
            count: vessels.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取指定类型船舶失败'
        });
    }
});

// 根据分类获取船舶
router.get('/category/:categoryName', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const vessels = await Vessel.findByCategory(req.params.categoryName, limit);

        res.json({
            success: true,
            data: vessels,
            categoryName: req.params.categoryName,
            count: vessels.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取指定分类船舶失败'
        });
    }
});

// 搜索船舶
router.get('/search/:keyword', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const vessels = await Vessel.searchVessels(req.params.keyword, limit);

        res.json({
            success: true,
            data: vessels,
            keyword: req.params.keyword,
            count: vessels.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '搜索船舶失败'
        });
    }
});

// 获取船舶统计信息
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await Vessel.getVesselStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶统计信息失败'
        });
    }
});

// 获取所有船舶的位置和航行次数
router.get('/all/position-trips', async (req, res) => {
    try {
        const data = await Vessel.getAllVesselsWithPositionAndTripCount();

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取所有船舶位置和航行次数失败'
        });
    }
});

// 根据ID获取船舶 - 必须放在所有具体路径之后
router.get('/:id', async (req, res) => {
    try {
        const vessel = await Vessel.findById(req.params.id);
        if (!vessel) {
            return res.status(404).json({
                success: false,
                message: '船舶不存在'
            });
        }

        res.json({
            success: true,
            data: vessel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶信息失败'
        });
    }
});

// 获取船舶及其航次信息
router.get('/:id/trips', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const vesselWithTrips = await Vessel.getVesselWithTrips(req.params.id, limit);

        if (!vesselWithTrips || vesselWithTrips.length === 0) {
            return res.status(404).json({
                success: false,
                message: '船舶不存在或无航次记录'
            });
        }

        res.json({
            success: true,
            data: vesselWithTrips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶航次信息失败'
        });
    }
});

// 获取船舶详细统计信息
router.get('/:id/stats', async (req, res) => {
    try {
        const stats = await Vessel.getVesselDetailedStats(req.params.id);
        if (!stats) {
            return res.status(404).json({
                success: false,
                message: '船舶不存在或无统计数据'
            });
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶详细统计信息失败'
        });
    }
});

// 获取船舶近期活动
router.get('/:id/activity', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const activity = await Vessel.getVesselRecentActivity(req.params.id, days);

        res.json({
            success: true,
            data: activity,
            days: days
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶近期活动失败'
        });
    }
});

// 获取船舶完整航行历史
router.get('/:id/history', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const history = await Vessel.getVesselCompleteHistory(req.params.id, limit);

        res.json({
            success: true,
            data: history,
            count: history.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶航行历史失败'
        });
    }
});

// 获取船舶航行统计信息
router.get('/:id/navigation-stats', async (req, res) => {
    try {
        const stats = await Vessel.getVesselNavigationStats(req.params.id);
        if (!stats) {
            return res.status(404).json({
                success: false,
                message: '船舶不存在或无统计数据'
            });
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶航行统计失败'
        });
    }
});

// 获取船舶当前位置和航行次数
router.get('/:id/position-trips', async (req, res) => {
    try {
        const data = await Vessel.getCurrentPositionAndTripCount(req.params.id);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: '船舶不存在'
            });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶位置和航行次数失败'
        });
    }
});

module.exports = router;