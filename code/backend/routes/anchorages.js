const express = require('express');
const router = express.Router();
const Anchorage = require('../models/Anchorage');

// 获取所有锚地/港口
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = parseInt(req.query.offset) || 0;
        const anchorages = await Anchorage.findAll(limit, offset);

        res.json({
            success: true,
            data: anchorages,
            pagination: {
                limit: limit || 'all',
                offset,
                count: anchorages.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地列表失败'
        });
    }
});

// 具体路径必须放在通用路径/:id之前，避免路由冲突

// 根据类型获取锚地
router.get('/type/:anchorageType', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        // 确保正确解码URL参数
        const anchorageType = decodeURIComponent(req.params.anchorageType);
        const anchorages = await Anchorage.findByType(anchorageType, limit);

        res.json({
            success: true,
            data: anchorages,
            type: anchorageType,
            count: anchorages.length
        });
    } catch (error) {
        console.error('获取指定类型锚地失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取指定类型锚地失败'
        });
    }
});

// 根据区域获取锚地
router.get('/zone/:areaZone', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        // 确保正确解码URL参数
        const areaZone = decodeURIComponent(req.params.areaZone);
        const anchorages = await Anchorage.findByZone(areaZone, limit);

        res.json({
            success: true,
            data: anchorages,
            zone: areaZone,
            count: anchorages.length
        });
    } catch (error) {
        console.error('获取指定区域锚地失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取指定区域锚地失败'
        });
    }
});

// 搜索锚地
router.get('/search/:keyword', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        // 确保正确解码URL参数
        const keyword = decodeURIComponent(req.params.keyword);
        const anchorages = await Anchorage.searchAnchorages(keyword, limit);

        res.json({
            success: true,
            data: anchorages,
            keyword: keyword,
            count: anchorages.length
        });
    } catch (error) {
        console.error('搜索锚地失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '搜索锚地失败'
        });
    }
});

// 获取港口调度统计信息
router.get('/stats/scheduling', async (req, res) => {
    try {
        const stats = await Anchorage.getPortSchedulingStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取港口调度统计失败'
        });
    }
});

// 获取区域使用统计
router.get('/stats/zones', async (req, res) => {
    try {
        const zoneStats = await Anchorage.getZoneUsageStats();

        res.json({
            success: true,
            data: zoneStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取区域使用统计失败'
        });
    }
});

// 根据ID获取锚地 - 必须放在所有具体路径之后
router.get('/:id', async (req, res) => {
    try {
        const anchorage = await Anchorage.findById(req.params.id);
        if (!anchorage) {
            return res.status(404).json({
                success: false,
                message: '锚地不存在'
            });
        }

        res.json({
            success: true,
            data: anchorage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地信息失败'
        });
    }
});

// 获取锚地近期活动
router.get('/:id/activity', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const anchorageWithActivity = await Anchorage.getAnchorageWithRecentActivity(req.params.id, days);

        if (!anchorageWithActivity) {
            return res.status(404).json({
                success: false,
                message: '锚地不存在'
            });
        }

        res.json({
            success: true,
            data: anchorageWithActivity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地活动信息失败'
        });
    }
});

// 获取锚地高峰使用时间
router.get('/:id/peaktimes', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const peakTimes = await Anchorage.getPeakUsageTimes(req.params.id, days);

        res.json({
            success: true,
            data: peakTimes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地高峰使用时间失败'
        });
    }
});



// 获取锚地详细统计信息
router.get('/:id/stats', async (req, res) => {
    try {
        const stats = await Anchorage.getAnchorageDetailedStats(req.params.id);
        if (!stats) {
            return res.status(404).json({
                success: false,
                message: '锚地不存在或无统计数据'
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
            message: '获取锚地详细统计信息失败'
        });
    }
});

// 获取锚地容量信息
router.get('/:id/capacity', async (req, res) => {
    try {
        const capacityInfo = await Anchorage.getAnchorageCapacityInfo(req.params.id);
        if (!capacityInfo) {
            return res.status(404).json({
                success: false,
                message: '锚地不存在'
            });
        }

        res.json({
            success: true,
            data: capacityInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地容量信息失败'
        });
    }
});

// 获取锚地月度趋势
router.get('/:id/trends', async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 12;
        const trends = await Anchorage.getAnchorageMonthlyTrends(req.params.id, months);

        res.json({
            success: true,
            data: trends,
            months: months
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地月度趋势失败'
        });
    }
});

// 获取锚地船只进出情况
router.get('/:id/traffic', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const traffic = await Anchorage.getAnchorageVesselTraffic(req.params.id, days);

        res.json({
            success: true,
            data: traffic,
            days: days,
            count: traffic.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地船只进出情况失败'
        });
    }
});

// 获取当前停留的船只
router.get('/:id/current-vessels', async (req, res) => {
    try {
        const referenceDate = req.query.date;
        const vessels = await Anchorage.getCurrentAnchoredVessels(req.params.id, referenceDate);

        res.json({
            success: true,
            data: vessels,
            count: vessels.length,
            reference_date: referenceDate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取当前停留船只失败'
        });
    }
});

// 获取锚地交通汇总
router.get('/:id/traffic-summary', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const summary = await Anchorage.getAnchorageTrafficSummary(req.params.id, days);

        if (!summary) {
            return res.status(404).json({
                success: false,
                message: '锚地不存在或无统计数据'
            });
        }

        res.json({
            success: true,
            data: summary,
            days: days
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地交通汇总失败'
        });
    }
});

// 获取锚地综合信息（包含当前船只数量和进出记录）
router.get('/:id/comprehensive-info', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const info = await Anchorage.getAnchorageComprehensiveInfo(req.params.id, days);

        if (!info || info.length === 0) {
            return res.status(404).json({
                success: false,
                message: '锚地不存在'
            });
        }

        res.json({
            success: true,
            data: info[0],
            days: days
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取锚地综合信息失败'
        });
    }
});

module.exports = router;