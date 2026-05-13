const db = require('../config/database');
const { getDatasetStartTimeCondition, getDatasetCurrentStayDuration, DEFAULT_REFERENCE_DATE, DATASET_START_DATE, DATASET_END_DATE } = require('../utils/datasetTimeUtils');

class Anchorage {
    static async findAll(limit = null, offset = 0) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        const offsetNum = Math.max(0, Math.floor(Number(offset) || 0));
        
        // 使用子查询获取每个锚地的实际船只数量和占用率
        let sql = `
            SELECT 
                a.*,
                COALESCE(current_anchored.current_count, 0) as current_vessel_count,
                COALESCE(current_anchored.current_count, 0) as current_occupied,
                COALESCE(current_anchored.occupancy_rate, 0) as occupancy_rate,
                100 as capacity,
                (
                    SELECT COUNT(*) 
                    FROM visits v 
                    WHERE v.anchorage_id = a.anchorage_id
                ) as recent_records_count
            FROM anchorages a
            LEFT JOIN (
                SELECT
                    v.anchorage_id,
                    COUNT(*) as current_count,
                    ROUND((COUNT(*) * 100.0 / 100), 2) as occupancy_rate -- 假设每个锚地容量为100
                FROM visits v
                WHERE v.visit_type = 'arrival'
                AND NOT EXISTS (
                    SELECT 1 FROM visits v2
                    WHERE v2.vessel_id = v.vessel_id
                    AND v2.anchorage_id = v.anchorage_id
                    AND v2.visit_type = 'departure'
                    AND v2.visit_time > v.visit_time
                )
                GROUP BY v.anchorage_id
            ) current_anchored ON a.anchorage_id = current_anchored.anchorage_id
            ORDER BY a.anchorage_name
        `;
        
        // 只有在有limit时才添加LIMIT和OFFSET
        if (hasLimit) {
            sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
        } else if (offsetNum > 0) {
            sql += ` OFFSET ${offsetNum}`;
        }
        
        return await db.query(sql);
    }

    static async findById(anchorageId) {
        const sql = `
            SELECT 
                a.*,
                COALESCE(current_anchored.current_count, 0) as current_vessel_count,
                COALESCE(current_anchored.current_count, 0) as occupied_capacity,
                COALESCE(current_anchored.occupancy_rate, 0) as occupancy_rate,
                100 as capacity
            FROM anchorages a
            LEFT JOIN (
                SELECT
                    v.anchorage_id,
                    COUNT(*) as current_count,
                    ROUND((COUNT(*) * 100.0 / 100), 2) as occupancy_rate
                FROM visits v
                WHERE v.visit_type = 'arrival'
                AND NOT EXISTS (
                    SELECT 1 FROM visits v2
                    WHERE v2.vessel_id = v.vessel_id
                    AND v2.anchorage_id = v.anchorage_id
                    AND v2.visit_type = 'departure'
                    AND v2.visit_time > v.visit_time
                )
                GROUP BY v.anchorage_id
            ) current_anchored ON a.anchorage_id = current_anchored.anchorage_id
            WHERE a.anchorage_id = ?
        `;
        const results = await db.query(sql, [anchorageId]);
        return results[0] || null;
    }

    static async findByType(anchorageType, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        let sql = `
            SELECT 
                a.*,
                COALESCE(current_anchored.current_count, 0) as current_vessel_count,
                COALESCE(current_anchored.current_count, 0) as current_occupied,
                COALESCE(current_anchored.occupancy_rate, 0) as occupancy_rate,
                100 as capacity,
                (
                    SELECT COUNT(*) 
                    FROM visits v 
                    WHERE v.anchorage_id = a.anchorage_id
                ) as recent_records_count
            FROM anchorages a
            LEFT JOIN (
                SELECT
                    v.anchorage_id,
                    COUNT(*) as current_count,
                    ROUND((COUNT(*) * 100.0 / 100), 2) as occupancy_rate -- 假设每个锚地容量为100
                FROM visits v
                WHERE v.visit_type = 'arrival'
                AND NOT EXISTS (
                    SELECT 1 FROM visits v2
                    WHERE v2.vessel_id = v.vessel_id
                    AND v2.anchorage_id = v.anchorage_id
                    AND v2.visit_type = 'departure'
                    AND v2.visit_time > v.visit_time
                )
                GROUP BY v.anchorage_id
            ) current_anchored ON a.anchorage_id = current_anchored.anchorage_id
            WHERE a.anchorage_type = ?
            ORDER BY a.anchorage_name
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, [anchorageType]);
    }

    static async findByZone(areaZone, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        let sql = `
            SELECT 
                a.*,
                COALESCE(current_anchored.current_count, 0) as current_vessel_count,
                COALESCE(current_anchored.current_count, 0) as current_occupied,
                COALESCE(current_anchored.occupancy_rate, 0) as occupancy_rate,
                100 as capacity,
                (
                    SELECT COUNT(*) 
                    FROM visits v 
                    WHERE v.anchorage_id = a.anchorage_id
                ) as recent_records_count
            FROM anchorages a
            LEFT JOIN (
                SELECT
                    v.anchorage_id,
                    COUNT(*) as current_count,
                    ROUND((COUNT(*) * 100.0 / 100), 2) as occupancy_rate -- 假设每个锚地容量为100
                FROM visits v
                WHERE v.visit_type = 'arrival'
                AND NOT EXISTS (
                    SELECT 1 FROM visits v2
                    WHERE v2.vessel_id = v.vessel_id
                    AND v2.anchorage_id = v.anchorage_id
                    AND v2.visit_type = 'departure'
                    AND v2.visit_time > v.visit_time
                )
                GROUP BY v.anchorage_id
            ) current_anchored ON a.anchorage_id = current_anchored.anchorage_id
            WHERE a.area_zone = ?
            ORDER BY a.anchorage_name
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, [areaZone]);
    }

    static async getPortSchedulingStats() {
        const sql = `
            SELECT * FROM port_scheduling_stats
            ORDER BY total_visits DESC
        `;
        return await db.query(sql);
    }

    static async getAnchorageWithRecentActivity(anchorageId, days = 7) {
        let numDays;
        if (Array.isArray(days)) {
            numDays = Number(days[0]);
        } else {
            numDays = Number(days);
        }
        if (isNaN(numDays) || numDays < 1) {
            numDays = 7;
        }
        if (numDays > 365) {
            numDays = 365;
        }

        // 确保是整数
        numDays = Math.floor(Number(numDays));

        // 额外验证：确保参数是有效数字
        if (typeof numDays !== 'number' || isNaN(numDays) || !isFinite(numDays)) {
            numDays = 7;
        }

        // 创建纯净的数字值，避免任何潜在的原型污染或附加属性
        const cleanDays = Number(numDays);

        const sql = `
            SELECT
                a.*,
                COUNT(v.visit_id) as recent_visits,
                COUNT(DISTINCT v.vessel_id) as unique_vessels,
                MAX(v.visit_time) as last_visit_time,
                MAX(v.visit_time) as last_activity,
                GROUP_CONCAT(DISTINCT vt.type_name) as vessel_types
            FROM anchorages a
            LEFT JOIN visits v ON a.anchorage_id = v.anchorage_id
                AND v.visit_time >= ?
                AND v.visit_time <= ?
            LEFT JOIN vessels ves ON v.vessel_id = ves.vessel_id
            LEFT JOIN vessel_types vt ON ves.vessel_type_id = vt.vessel_type_id
            WHERE a.anchorage_id = ?
            GROUP BY a.anchorage_id
        `;
        const results = await db.query(sql, [DATASET_START_DATE, DATASET_END_DATE, anchorageId]);
        return results[0] || null;
    }

    static async getPeakUsageTimes(anchorageId, days = 30) {
        const sql = `
            SELECT
                HOUR(v.visit_time) as hour_of_day,
                DAYOFWEEK(v.visit_time) as day_of_week,
                COUNT(*) as visit_count,
                COUNT(DISTINCT v.vessel_id) as unique_vessels
            FROM visits v
            WHERE v.anchorage_id = ?
                AND v.visit_time >= ?
                AND v.visit_time <= ?
            GROUP BY HOUR(v.visit_time), DAYOFWEEK(v.visit_time)
            ORDER BY visit_count DESC
            LIMIT 24
        `;
        let numDays;
        if (Array.isArray(days)) {
            numDays = Number(days[0]);
        } else {
            numDays = Number(days);
        }
        if (isNaN(numDays) || numDays < 1 || !isFinite(numDays)) {
            numDays = 30;
        }
        if (numDays > 365) {
            numDays = 365;
        }

        // 确保是整数
        numDays = Math.floor(Number(numDays));

        // 额外验证：确保参数是有效数字
        if (typeof numDays !== 'number' || isNaN(numDays) || !isFinite(numDays)) {
            numDays = 30;
        }

        // 创建纯净的数字值，避免任何潜在的原型污染或附加属性
        const cleanDays = Number(numDays);

            // 使用数据集的开始和结束时间
            const queryParams = [anchorageId, DATASET_START_DATE, DATASET_END_DATE];
        
            return await db.query(sql, queryParams);    }

static async searchAnchorages(keyword, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        const searchTerm = `%${keyword}%`;
        let sql = `
            SELECT 
                a.*,
                COALESCE(current_anchored.current_count, 0) as current_vessel_count,
                COALESCE(current_anchored.current_count, 0) as current_occupied,
                COALESCE(current_anchored.occupancy_rate, 0) as occupancy_rate,
                100 as capacity,
                (
                    SELECT COUNT(*) 
                    FROM visits v 
                    WHERE v.anchorage_id = a.anchorage_id
                ) as recent_records_count
            FROM anchorages a
            LEFT JOIN (
                SELECT
                    v.anchorage_id,
                    COUNT(*) as current_count,
                    ROUND((COUNT(*) * 100.0 / 100), 2) as occupancy_rate -- 假设每个锚地容量为100
                FROM visits v
                WHERE v.visit_type = 'arrival'
                AND NOT EXISTS (
                    SELECT 1 FROM visits v2
                    WHERE v2.vessel_id = v.vessel_id
                    AND v2.anchorage_id = v.anchorage_id
                    AND v2.visit_type = 'departure'
                    AND v2.visit_time > v.visit_time
                )
                GROUP BY v.anchorage_id
            ) current_anchored ON a.anchorage_id = current_anchored.anchorage_id
            WHERE a.anchorage_name LIKE ?
            ORDER BY a.anchorage_name
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, [searchTerm]);
    }

    static async getZoneUsageStats() {
        const sql = `
            SELECT
                area_zone,
                COUNT(*) as anchorage_count,
                COUNT(DISTINCT v.vessel_id) as total_vessels_served,
                SUM(CASE WHEN ${getDatasetStartTimeCondition('v.visit_time', 7)} THEN 1 ELSE 0 END) as weekly_visits,
                AVG(CASE WHEN a.anchorage_type IN ('港口', '码头') THEN 1 ELSE 0 END) * 100 as port_percentage
            FROM anchorages a
            LEFT JOIN visits v ON a.anchorage_id = v.anchorage_id
            GROUP BY area_zone
            ORDER BY weekly_visits DESC
        `;
        return await db.query(sql);
    }

    static async getAnchorageDetailedStats(anchorageId) {
        const sql = `
            SELECT 
                a.*,
                COUNT(v.visit_id) as total_visits,
                COUNT(DISTINCT v.vessel_id) as unique_vessels,
                MAX(v.visit_time) as last_visit_time,
                MIN(v.visit_time) as first_visit_time,
                AVG(TIMESTAMPDIFF(HOUR, 
                    (SELECT visit_time FROM visits v2 WHERE v2.trip_id = v.trip_id AND v2.visit_type = 'departure' LIMIT 1),
                    (SELECT visit_time FROM visits v3 WHERE v3.trip_id = v.trip_id AND v3.visit_type = 'arrival' LIMIT 1)
                )) as avg_stay_duration,
                GROUP_CONCAT(DISTINCT vt.type_name) as vessel_types
            FROM anchorages a
            LEFT JOIN visits v ON a.anchorage_id = v.anchorage_id
            LEFT JOIN vessels ves ON v.vessel_id = ves.vessel_id
            LEFT JOIN vessel_types vt ON ves.vessel_type_id = vt.vessel_type_id
            WHERE a.anchorage_id = ?
            GROUP BY a.anchorage_id
        `;
        const results = await db.query(sql, [anchorageId]);
        return results[0] || null;
    }

    static async getAnchorageCapacityInfo(anchorageId) {
        const sql = `
            SELECT
                a.*,
                COALESCE(currently_anchored.current_count, 0) as current_occupied,
                COALESCE(currently_anchored.current_count, 0) as occupied_capacity,
                COALESCE(currently_anchored.occupancy_rate, 0) as occupancy_rate
            FROM anchorages a
            LEFT JOIN (
                SELECT
                    v.anchorage_id,
                    COUNT(*) as current_count,
                    ROUND((COUNT(*) * 10.0), 2) as occupancy_rate -- 简化计算，实际应基于真实容量
                FROM visits v
                WHERE v.visit_type = 'arrival'
                AND NOT EXISTS (
                    SELECT 1 FROM visits v2
                    WHERE v2.vessel_id = v.vessel_id
                    AND v2.anchorage_id = v.anchorage_id
                    AND v2.visit_type = 'departure'
                    AND v2.visit_time > v.visit_time
                )
                GROUP BY v.anchorage_id
            ) currently_anchored ON a.anchorage_id = currently_anchored.anchorage_id
            WHERE a.anchorage_id = ?
        `;
        const results = await db.query(sql, [anchorageId]);
        return results[0] || null;
    }

    static async getAnchorageMonthlyTrends(anchorageId, months = 12) {
        const sql = `
            SELECT
                DATE_FORMAT(v.visit_time, '%Y-%m') as month,
                COUNT(*) as visit_count,
                COUNT(DISTINCT v.vessel_id) as unique_vessels
            FROM visits v
            WHERE v.anchorage_id = ?
                AND v.visit_time >= DATE_SUB(?, INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(v.visit_time, '%Y-%m')
            ORDER BY month DESC
        `;
        let numMonths;
        if (Array.isArray(months)) {
            numMonths = Number(months[0]);
        } else {
            numMonths = Number(months);
        }
        if (isNaN(numMonths) || numMonths < 1 || !isFinite(numMonths)) {
            numMonths = 12;
        }
        if (numMonths > 120) {
            numMonths = 120;
        }

        // 确保是整数
        numMonths = Math.floor(Number(numMonths));

        // 额外验证：确保参数是有效数字
        if (typeof numMonths !== 'number' || isNaN(numMonths) || !isFinite(numMonths)) {
            numMonths = 12;
        }

        // 创建纯净的数字值，避免任何潜在的原型污染或附加属性
        const cleanMonths = Number(numMonths);

        // 使用最基础的方式创建参数数组，确保没有任何额外属性
        const params = [anchorageId, DEFAULT_REFERENCE_DATE, Number(cleanMonths)];

        // 确保参数是基础类型，通过JSON序列化和反序列化去除可能的元数据
        const normalizedParams = JSON.parse(JSON.stringify(params));

        return await db.query(sql, normalizedParams);
    }

    static async getAnchorageVesselTraffic(anchorageId, days = 7) {
        // 简化SQL查询，添加数据集时间范围筛选
        const sql = `
            SELECT 
                v.visit_id,
                v.vessel_id,
                ves.vessel_name,
                vt.type_name as vessel_type,
                v.visit_time,
                v.visit_type,
                CASE 
                    WHEN v.visit_type = 'arrival' THEN '到达'
                    ELSE '离开'
                END as visit_type_label,
                v.visit_type as original_visit_type
            FROM visits v
            JOIN vessels ves ON v.vessel_id = ves.vessel_id
            LEFT JOIN vessel_types vt ON ves.vessel_type_id = vt.vessel_type_id
            WHERE v.anchorage_id = ? 
                AND v.visit_time >= ?
                AND v.visit_time <= ?
            ORDER BY v.visit_time DESC
            LIMIT 200
        `;

        // 使用参数化查询防止SQL注入
        const params = [anchorageId, DATASET_START_DATE, DATASET_END_DATE];

        try {
            return await db.query(sql, params);
        } catch (error) {
            console.error('Error in getAnchorageVesselTraffic:', error);
            // 如果查询失败，返回空数组而不是抛出错误
            return [];
        }
    }

    static async getCurrentAnchoredVessels(anchorageId, referenceDate = null) {
        // 按MMSI筛选，每个船只只显示最晚进入的一次
        const sql = `
            SELECT
                ves.vessel_id,
                ves.vessel_name,
                ves.mmsi,
                vt.type_name as vessel_type,
                latest_arrival.visit_time as arrival_time,
                TIMESTAMPDIFF(HOUR, latest_arrival.visit_time, ?) as hours_anchored
            FROM vessels ves
            JOIN vessel_types vt ON ves.vessel_type_id = vt.vessel_type_id
            JOIN (
                SELECT 
                    v.vessel_id,
                    v.visit_time,
                    ROW_NUMBER() OVER (PARTITION BY ves.mmsi ORDER BY v.visit_time DESC) as rn
                FROM visits v
                JOIN vessels ves ON v.vessel_id = ves.vessel_id
                WHERE v.anchorage_id = ?
                    AND v.visit_type = 'arrival'
                    AND v.visit_time >= ?
                    AND v.visit_time <= ?
                    AND NOT EXISTS (
                        SELECT 1 FROM visits v2
                        WHERE v2.vessel_id = v.vessel_id
                           AND v2.anchorage_id = v.anchorage_id
                           AND v2.visit_type = 'departure'
                           AND v2.visit_time > v.visit_time
                           AND v2.visit_time >= ?
                           AND v2.visit_time <= ?
                    )
            ) latest_arrival ON ves.vessel_id = latest_arrival.vessel_id
            WHERE latest_arrival.rn = 1
            ORDER BY latest_arrival.visit_time DESC
        `;
        return await db.query(sql, [DATASET_END_DATE, anchorageId, DATASET_START_DATE, DATASET_END_DATE, DATASET_START_DATE, DATASET_END_DATE]);
    }

    static async getAnchorageTrafficSummary(anchorageId, days = 30) {
        let numDays;
        if (Array.isArray(days)) {
            numDays = Number(days[0]);
        } else {
            numDays = Number(days);
        }
        if (isNaN(numDays) || numDays < 1) {
            numDays = 30;
        }
        if (numDays > 365) {
            numDays = 365;
        }

        // 确保是整数
        numDays = Math.floor(Number(numDays));

        // 额外验证：确保参数是有效数字
        if (typeof numDays !== 'number' || isNaN(numDays) || !isFinite(numDays)) {
            numDays = 30;
        }

        // 创建纯净的数字值，避免任何潜在的原型污染或附加属性
        const cleanDays = Number(numDays);

        // 简化SQL查询，避免复杂的嵌套子查询
        const sql = `
            SELECT
                COUNT(CASE WHEN visit_type = 'arrival' THEN 1 END) as total_arrivals,
                COUNT(CASE WHEN visit_type = 'departure' THEN 1 END) as total_departures,
                COUNT(DISTINCT vessel_id) as unique_vessels,
                MAX(visit_time) as last_activity
            FROM visits
            WHERE anchorage_id = ?
                AND visit_time >= ?
                AND visit_time <= ?
        `;

        try {
            // 首先执行主查询
            const results = await db.query(sql, [anchorageId, DATASET_START_DATE, DATASET_END_DATE]);
            const result = results[0] || null;
            
            // 确保返回的数据格式正确
            if (result) {
                // 确保数值字段是数字类型
                result.total_arrivals = parseInt(result.total_arrivals) || 0;
                result.total_departures = parseInt(result.total_departures) || 0;
                result.unique_vessels = parseInt(result.unique_vessels) || 0;
                
                // 分别计算当前停留船只数量
                try {
                    const currentVesselsQuery = `
                        SELECT COUNT(DISTINCT vessel_id) as count
                        FROM visits
                        WHERE anchorage_id = ?
                          AND visit_type = 'arrival'
                          AND visit_time >= ?
                          AND visit_time <= ?
                          AND NOT EXISTS (
                              SELECT 1 FROM visits v2
                              WHERE v2.vessel_id = visits.vessel_id
                                AND v2.anchorage_id = visits.anchorage_id
                                AND v2.visit_type = 'departure'
                                AND v2.visit_time > visits.visit_time
                                AND v2.visit_time >= ?
                                AND v2.visit_time <= ?
                          )
                    `;
                    const currentVesselsResult = await db.query(currentVesselsQuery, [anchorageId, DATASET_START_DATE, DATASET_END_DATE, DATASET_START_DATE, DATASET_END_DATE]);
                    result.currently_anchored = parseInt(currentVesselsResult[0]?.count) || 0;
                } catch (error) {
                    console.error('Error calculating current vessels:', error);
                    result.currently_anchored = 0;
                }
                
                // 分别计算平均停留时长：计算当前在锚地停留的船只的停留时长均值
                try {
                    const avgStayQuery = `
                        SELECT AVG(TIMESTAMPDIFF(HOUR, v.visit_time, ?)) as avg_duration
                        FROM visits v
                        WHERE v.anchorage_id = ?
                          AND v.visit_type = 'arrival'
                          AND v.visit_time >= ?
                          AND v.visit_time <= ?
                          AND NOT EXISTS (
                              SELECT 1 FROM visits v2
                              WHERE v2.vessel_id = v.vessel_id
                                AND v2.anchorage_id = v.anchorage_id
                                AND v2.visit_type = 'departure'
                                AND v2.visit_time > v.visit_time
                                AND v2.visit_time >= ?
                                AND v2.visit_time <= ?
                          )
                    `;
                    const avgStayResult = await db.query(avgStayQuery, [DATASET_END_DATE, anchorageId, DATASET_START_DATE, DATASET_END_DATE, DATASET_START_DATE, DATASET_END_DATE]);
                    const avgDuration = parseFloat(avgStayResult[0]?.avg_duration);
                    
                    // 特殊处理平均停留时长：如果没有当前停留的船只，设置为null而不是0
                    result.avg_stay_duration = avgDuration && avgDuration > 0 ? avgDuration : null;
                    
                    // 添加一个标志位，指示数据是否充足
                    result.has_sufficient_data = result.avg_stay_duration !== null;
                } catch (error) {
                    console.error('Error calculating average stay duration:', error);
                    result.avg_stay_duration = null;
                    result.has_sufficient_data = false;
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error in getAnchorageTrafficSummary:', error);
            // 返回默认值而不是抛出错误
            return {
                total_arrivals: 0,
                total_departures: 0,
                unique_vessels: 0,
                currently_anchored: 0,
                avg_stay_duration: null,
                has_sufficient_data: false,
                last_activity: null
            };
        }
    }

    static async getAnchorageComprehensiveInfo(anchorageId, days = 7) {
        // 使用简化的SQL查询，避免复杂的嵌套子查询
        const sql = `
            SELECT
                a.anchorage_id,
                a.anchorage_name,
                a.anchorage_type,
                a.area_zone,
                a.zone_number,
                0 as current_vessel_count,
                0 as recent_records_count
            FROM anchorages a
            WHERE a.anchorage_id = ?
        `;

        try {
            // 先获取锚地基本信息
            const anchorageInfo = await db.query(sql, [anchorageId]);
            
            if (!anchorageInfo || anchorageInfo.length === 0) {
                return [];
            }

            // 分别获取当前船只数量和近期记录数量
            const currentVesselsSql = `
                SELECT COUNT(DISTINCT v1.vessel_id) as count
                FROM visits v1
                WHERE v1.anchorage_id = ?
                  AND v1.visit_type = 'arrival'
                  AND v1.visit_time >= ?
                  AND v1.visit_time <= ?
                  AND NOT EXISTS (
                      SELECT 1 FROM visits v2
                      WHERE v2.vessel_id = v1.vessel_id
                        AND v2.anchorage_id = v1.anchorage_id
                        AND v2.visit_type = 'departure'
                        AND v2.visit_time > v1.visit_time
                        AND v2.visit_time >= ?
                        AND v2.visit_time <= ?
                  )
            `;
            
            const recentRecordsSql = `
                SELECT COUNT(*) as count
                FROM visits v 
                WHERE v.anchorage_id = ?
                  AND v.visit_time >= ?
                  AND v.visit_time <= ?
            `;

            const [currentVesselsResult, recentRecordsResult] = await Promise.all([
                db.query(currentVesselsSql, [anchorageId, DATASET_START_DATE, DATASET_END_DATE, DATASET_START_DATE, DATASET_END_DATE]),
                db.query(recentRecordsSql, [anchorageId, DATASET_START_DATE, DATASET_END_DATE])
            ]);

            // 更新结果
            anchorageInfo[0].current_vessel_count = currentVesselsResult[0]?.count || 0;
            anchorageInfo[0].recent_records_count = recentRecordsResult[0]?.count || 0;

            return anchorageInfo;
        } catch (error) {
            console.error('Error in getAnchorageComprehensiveInfo:', error);
            // 如果查询失败，返回基本信息
            const fallbackResult = await db.query(sql, [anchorageId]);
            return fallbackResult || [];
        }
    }
}

module.exports = Anchorage;