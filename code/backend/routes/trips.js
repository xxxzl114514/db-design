const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const db = require('../config/database');

// 获取所有航次
router.get('/', async (req, res) => {
    try {
        // 只有在明确指定limit参数时才传递，否则获取所有数据
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = parseInt(req.query.offset) || 0;
        const trips = await Trip.findAll(limit, offset);

        res.json({
            success: true,
            data: trips,
            pagination: {
                limit: limit || 'all',
                offset,
                count: trips.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取航次列表失败'
        });
    }
});

// 具体路径必须放在通用路径/:id之前，避免路由冲突

// 根据船舶获取航次
router.get('/vessel/:vesselId', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const trips = await Trip.findByVessel(req.params.vesselId, limit);

        res.json({
            success: true,
            data: trips,
            vesselId: req.params.vesselId,
            count: trips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取船舶航次失败'
        });
    }
});

// 根据日期范围获取航次
router.get('/daterange/:startDate/:endDate', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const trips = await Trip.findByDateRange(req.params.startDate, req.params.endDate, limit);

        res.json({
            success: true,
            data: trips,
            dateRange: {
                start: req.params.startDate,
                end: req.params.endDate
            },
            count: trips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取指定日期范围航次失败'
        });
    }
});

// 根据出发日期获取航次
router.get('/departure/:date', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const trips = await Trip.findByDepartureDate(req.params.date, limit);

        res.json({
            success: true,
            data: trips,
            departureDate: req.params.date,
            count: trips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取指定出发日期航次失败'
        });
    }
});

// 根据到达日期获取航次
router.get('/arrival/:date', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const trips = await Trip.findByArrivalDate(req.params.date, limit);

        res.json({
            success: true,
            data: trips,
            arrivalDate: req.params.date,
            count: trips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取指定到达日期航次失败'
        });
    }
});

// 根据锚地获取航次
router.get('/anchorage/:anchorageId', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const trips = await Trip.findByAnchorage(req.params.anchorageId, limit);

        res.json({
            success: true,
            data: trips,
            anchorageId: req.params.anchorageId,
            count: trips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地相关航次失败'
        });
    }
});

// 搜索航次
router.get('/search/:keyword', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const trips = await Trip.searchTrips(req.params.keyword, limit);

        res.json({
            success: true,
            data: trips,
            keyword: req.params.keyword,
            count: trips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '搜索航次失败'
        });
    }
});

// 获取航次统计信息
router.get('/stats/overview', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const stats = await Trip.getTripStats(days);

        res.json({
            success: true,
            data: {
                ...stats[0],
                period_days: days
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取航次统计信息失败'
        });
    }
});

// 获取每日航次统计
router.get('/stats/daily', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const dailyStats = await Trip.getDailyTripStats(days);

        res.json({
            success: true,
            data: dailyStats,
            period_days: days
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取每日航次统计失败'
        });
    }
});

// 获取热门航线
router.get('/routes/popular', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const popularRoutes = await Trip.getPopularRoutes(limit);

        res.json({
            success: true,
            data: popularRoutes,
            count: popularRoutes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取热门航线失败'
        });
    }
});

// 获取当前进行中的航次
router.get('/current/active', async (req, res) => {
    try {
        const currentTrips = await Trip.getCurrentTrips();

        res.json({
            success: true,
            data: currentTrips,
            count: currentTrips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取当前航次失败'
        });
    }
});

// 获取长时间航次
router.get('/long/duration', async (req, res) => {
    try {
        const thresholdHours = parseInt(req.query.threshold) || 48;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const longTrips = await Trip.getLongTrips(thresholdHours, limit);

        res.json({
            success: true,
            data: longTrips,
            threshold_hours: thresholdHours,
            count: longTrips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取长时间航次失败'
        });
    }
});

// 获取最近一周内活跃的航次
router.get('/recent/active', async (req, res) => {
    try {
        const recentActiveTrips = await Trip.getRecentActiveTrips();
        
        res.json({
            success: true,
            data: recentActiveTrips,
            count: recentActiveTrips.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取最近一周内活跃航次失败'
        });
    }
});

// 根据ID获取航次 - 必须放在所有具体路径之后
router.get('/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: '航次不存在'
            });
        }

        res.json({
            success: true,
            data: trip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取航次信息失败'
        });
    }
});

module.exports = router;