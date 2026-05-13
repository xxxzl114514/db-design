const express = require('express');
const router = express.Router();
const Vessel = require('../models/Vessel');
const Anchorage = require('../models/Anchorage');
const Trip = require('../models/Trip');
const db = require('../config/database');

// 获取仪表板总览信息
router.get('/overview', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;

        // 并行获取各项统计数据
        const [vesselStats, anchorageStats, tripStats, currentTrips, recentActiveTrips, popularRoutes, totalAnchoragesResult, totalTripsResult] = await Promise.all([
            Vessel.getVesselStats(),
            Anchorage.getPortSchedulingStats(),
            Trip.getTripStats(days),
            Trip.getCurrentTrips(),
            Trip.getRecentActiveTrips(),
            Trip.getPopularRoutes(10),
            // 获取所有锚地总数
            db.query('SELECT COUNT(*) as total FROM anchorages'),
            // 获取所有航次总数
            db.query('SELECT COUNT(*) as total FROM trip_details_view')
        ]);

        // 计算总览数据
        const totalVessels = vesselStats.reduce((sum, stat) => sum + stat.vessel_count, 0);
        const totalAnchorages = totalAnchoragesResult[0].total; // 使用所有锚地的总数
        const totalTrips = totalTripsResult[0].total; // 使用所有航次的总数
        const activeVessels = tripStats[0]?.active_vessels || 0;
        
        // 活跃航次数：最近一周内出发或完成的航次数量
        const recentActiveTripsCount = recentActiveTrips.length;

        res.json({
            success: true,
            data: {
                summary: {
                    total_vessels: totalVessels,
                    total_anchorages: totalAnchorages,
                    total_trips: totalTrips,
                    active_vessels: activeVessels,
                    current_active_trips: recentActiveTripsCount, // 使用最近一周内活跃的航次数量
                    avg_trip_duration: tripStats[0]?.avg_duration_hours || 0,
                    period_days: days
                },
                vessel_stats: vesselStats,
                top_anchorages: anchorageStats.slice(0, 10),
                popular_routes: popularRoutes.slice(0, 5),
                current_trips: currentTrips.slice(0, 10),
                recent_active_trips: recentActiveTrips.slice(0, 10) // 添加最近一周活跃航次的详细数据
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取仪表板总览失败'
        });
    }
});

// 获取实时状态信息
router.get('/realtime', async (req, res) => {
    try {
        // 获取当前进行中的航次
        const currentTrips = await Trip.getCurrentTrips();

        // 获取数据集时间范围内的活跃锚地
        const anchorageStats = await Anchorage.getPortSchedulingStats();
        const referenceDate = new Date('2024-12-15');
        const sevenDaysBefore = new Date(referenceDate);
        sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
        const recentActivity = anchorageStats
            .filter(a => a.last_visit && new Date(a.last_visit) >= sevenDaysBefore && new Date(a.last_visit) <= referenceDate)
            .slice(0, 20);

        // 获取船舶类型分布
        const vesselStats = await Vessel.getVesselStats();

        res.json({
            success: true,
            data: {
                current_active_trips: currentTrips,
                recent_anchorage_activity: recentActivity,
                vessel_distribution: vesselStats,
                last_updated: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取实时状态失败'
        });
    }
});

// 获取趋势分析数据
router.get('/trends', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;

        

        let dailyTripStats;
        let periodDays = days;

        // 如果提供了日期范围，使用日期范围查询
        if (startDate && endDate) {
            dailyTripStats = await Trip.getDailyTripStatsByDateRange(startDate, endDate);
        } else {
            // 否则使用天数查询
            dailyTripStats = await Trip.getDailyTripStats(days);
        }

        // 获取区域使用统计
        const zoneStats = await Anchorage.getZoneUsageStats();

        // 计算趋势数据
        const tripsByDay = dailyTripStats.map(stat => ({
            date: stat.trip_date,
            trips: stat.daily_trips,
            active_vessels: stat.daily_active_vessels,
            avg_duration: parseFloat(stat.avg_duration_hours || 0)
        }));

        const usageByZone = zoneStats.map(stat => ({
            zone: stat.area_zone,
            weekly_visits: stat.weekly_visits,
            port_percentage: parseFloat(stat.port_percentage || 0),
            anchorage_count: stat.anchorage_count
        }));

        res.json({
            success: true,
            data: {
                daily_trends: tripsByDay,
                zone_trends: usageByZone,
                period_days: periodDays,
                date_range: startDate && endDate ? { start: startDate, end: endDate } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取趋势分析失败'
        });
    }
});

// 获取警报和异常信息
router.get('/alerts', async (req, res) => {
    try {
        // 获取超过48小时的长时间航次
        const longTrips = await Trip.getLongTrips(48, 20);

        // 获取统计数据
        const tripStats = await Trip.getTripStats(7);

        const alerts = [];

        // 长时间航次警报
        if (longTrips.length > 0) {
            alerts.push({
                type: 'long_trips',
                severity: 'warning',
                count: longTrips.length,
                message: `${longTrips.length}个航次超过48小时`,
                data: longTrips.slice(0, 5)
            });
        }

        // 活跃度低警报
        const activePercentage = tripStats[0] ?
            (tripStats[0].active_vessels / (tripStats[0].total_trips || 1)) * 100 : 0;

        if (activePercentage < 50) {
            alerts.push({
                type: 'low_activity',
                severity: 'info',
                count: 1,
                message: '最近7天船舶活跃度较低',
                data: { active_percentage: activePercentage }
            });
        }

        res.json({
            success: true,
            data: {
                alerts: alerts,
                total_alerts: alerts.length,
                last_checked: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '获取警报信息失败'
        });
    }
});

module.exports = router;