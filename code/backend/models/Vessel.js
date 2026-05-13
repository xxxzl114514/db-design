const db = require('../config/database');
const { getDatasetStartTimeCondition, getDatasetActiveCondition, getDatasetCompletedCondition } = require('../utils/datasetTimeUtils');

class Vessel {
    static async findAll(limit = null, offset = 0) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        const offsetNum = Math.max(0, Math.floor(Number(offset) || 0));
        
        let sql = `
            SELECT v.*, vt.type_name, vt.type_category
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            ORDER BY v.created_at DESC
        `;
        
        // 只有在有limit时才添加LIMIT和OFFSET
        if (hasLimit) {
            sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
        } else if (offsetNum > 0) {
            sql += ` OFFSET ${offsetNum}`;
        }
        
        return await db.query(sql);
    }

    static async getTotalCount() {
        const sql = `SELECT COUNT(*) as total FROM vessels`;
        const result = await db.query(sql);
        return result[0].total;
    }

    static async findById(vesselId) {
        const sql = `
            SELECT v.*, vt.type_name, vt.type_category
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            WHERE v.vessel_id = ?
        `;
        const results = await db.query(sql, [vesselId]);
        return results[0] || null;
    }

    static async findByMMSI(mmsi) {
        const sql = `
            SELECT v.*, vt.type_name, vt.type_category
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            WHERE v.mmsi = ?
        `;
        const results = await db.query(sql, [mmsi]);
        return results[0] || null;
    }

    static async findByType(typeName, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        let sql = `
            SELECT v.*, vt.type_name, vt.type_category
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            WHERE vt.type_name = ?
            ORDER BY v.created_at DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, [typeName]);
    }

    static async findByCategory(categoryName, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        let sql = `
            SELECT v.*, vt.type_name, vt.type_category
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            WHERE vt.type_category = ?
            ORDER BY v.created_at DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, [categoryName]);
    }

    static async getVesselStats() {
        const sql = `
            SELECT
                vt.type_name,
                COUNT(DISTINCT v.vessel_id) as vessel_count,
                AVG(CASE WHEN EXISTS (
                    SELECT 1 FROM trips t2 
                    WHERE t2.vessel_id = v.vessel_id 
                    AND ${getDatasetStartTimeCondition('t2.trip_end', 30)}
                ) THEN 1 ELSE 0 END) * 100 as active_percentage
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            GROUP BY vt.type_name
            ORDER BY vessel_count DESC
        `;
        return await db.query(sql);
    }

    static async searchVessels(keyword, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        const searchTerm = `%${keyword}%`;
        
        // 检测是否为MMSI格式（9位数字）
        const isMMSI = /^\d{9}$/.test(keyword);
        
        let sql, params;
        
        if (isMMSI) {
            // MMSI精确匹配优先，然后模糊匹配其他字段，包含航次统计
            sql = `
                SELECT v.*, vt.type_name, vt.type_category,
                       COALESCE(trip_counts.trip_count, 0) as total_trips,
                       CASE 
                         WHEN v.mmsi = ? THEN 1
                         ELSE 0
                       END as match_priority
                FROM vessels v
                LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
                LEFT JOIN (
                    SELECT vessel_id, COUNT(trip_id) as trip_count
                    FROM trips
                    GROUP BY vessel_id
                ) trip_counts ON v.vessel_id = trip_counts.vessel_id
                WHERE v.mmsi = ? OR v.vessel_name LIKE ? OR vt.type_name LIKE ?
                ORDER BY match_priority DESC, v.vessel_name
            `;
            params = [keyword, keyword, searchTerm, searchTerm];
        } else {
            // 普通模糊搜索，包含航次统计
            sql = `
                SELECT v.*, vt.type_name, vt.type_category,
                       COALESCE(trip_counts.trip_count, 0) as total_trips,
                       0 as match_priority
                FROM vessels v
                LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
                LEFT JOIN (
                    SELECT vessel_id, COUNT(trip_id) as trip_count
                    FROM trips
                    GROUP BY vessel_id
                ) trip_counts ON v.vessel_id = trip_counts.vessel_id
                WHERE v.vessel_name LIKE ?
                   OR v.mmsi LIKE ?
                   OR vt.type_name LIKE ?
                ORDER BY v.vessel_name
            `;
            params = [searchTerm, searchTerm, searchTerm];
        }
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, params);
    }

    static async getVesselWithTrips(vesselId, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        let sql = `
            SELECT
                v.vessel_id, v.mmsi, v.vessel_name, vt.type_name,
                t.trip_id, t.trip_start, t.trip_end,
                TIMESTAMPDIFF(HOUR, t.trip_start, t.trip_end) as duration_hours,
                start_a.anchorage_name as start_anchorage,
                end_a.anchorage_name as end_anchorage
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            LEFT JOIN trips t ON v.vessel_id = t.vessel_id
            LEFT JOIN visits start_visit ON t.trip_id = start_visit.trip_id AND start_visit.visit_type = 'departure'
            LEFT JOIN visits end_visit ON t.trip_id = end_visit.trip_id AND end_visit.visit_type = 'arrival'
            LEFT JOIN anchorages start_a ON start_visit.anchorage_id = start_a.anchorage_id
            LEFT JOIN anchorages end_a ON end_visit.anchorage_id = end_a.anchorage_id
            WHERE v.vessel_id = ?
            ORDER BY t.trip_start DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, [vesselId]);
    }

    static async getVesselDetailedStats(vesselId) {
        const sql = `
            SELECT
                v.vessel_id, v.vessel_name, v.mmsi,
                vt.type_name, vt.type_category,
                COUNT(t.trip_id) as total_trips,
                AVG(TIMESTAMPDIFF(HOUR, t.trip_start, t.trip_end)) as avg_trip_duration,
                MIN(t.trip_start) as first_trip,
                MAX(t.trip_start) as last_trip,
                COUNT(DISTINCT start_a.anchorage_id) as unique_start_ports,
                COUNT(DISTINCT end_a.anchorage_id) as unique_end_ports
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            LEFT JOIN trips t ON v.vessel_id = t.vessel_id
            LEFT JOIN visits start_visit ON t.trip_id = start_visit.trip_id AND start_visit.visit_type = 'departure'
            LEFT JOIN visits end_visit ON t.trip_id = end_visit.trip_id AND end_visit.visit_type = 'arrival'
            LEFT JOIN anchorages start_a ON start_visit.anchorage_id = start_a.anchorage_id
            LEFT JOIN anchorages end_a ON end_visit.anchorage_id = end_a.anchorage_id
            WHERE v.vessel_id = ?
            GROUP BY v.vessel_id
        `;
        const results = await db.query(sql, [vesselId]);
        return results[0] || null;
    }

    static async getVesselRecentActivity(vesselId, days = 30) {
        // 参数验证和清理
        let numDays;
        if (Array.isArray(days)) {
            numDays = Number(days[0]);
        } else {
            numDays = Number(days);
        }
        
        // 严格的数字验证
        if (isNaN(numDays) || numDays < 1 || !isFinite(numDays)) {
            numDays = 30;
        }
        if (numDays > 365) {
            numDays = 365;
        }

        // 确保是整数
        numDays = Math.floor(Number(numDays));

        // 使用参数化查询避免SQL注入
        const sql = `
            SELECT 
                t.trip_id, t.trip_start, t.trip_end,
                start_a.anchorage_name as start_anchorage,
                end_a.anchorage_name as end_anchorage,
                TIMESTAMPDIFF(HOUR, t.trip_start, t.trip_end) as duration_hours
            FROM vessels v
            JOIN trips t ON v.vessel_id = t.vessel_id
            LEFT JOIN visits start_visit ON t.trip_id = start_visit.trip_id AND start_visit.visit_type = 'departure'
            LEFT JOIN visits end_visit ON t.trip_id = end_visit.trip_id AND end_visit.visit_type = 'arrival'
            LEFT JOIN anchorages start_a ON start_visit.anchorage_id = start_a.anchorage_id
            LEFT JOIN anchorages end_a ON end_visit.anchorage_id = end_a.anchorage_id
            WHERE v.vessel_id = ? 
                AND t.trip_start >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
            ORDER BY t.trip_start DESC
        `;

        return await db.query(sql, [vesselId, numDays]);
    }

    static async getVesselCompleteHistory(vesselId, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        let sql = `
            SELECT 
                v.vessel_id,
                v.vessel_name,
                v.mmsi,
                vt.type_name,
                tdv.trip_id,
                tdv.trip_start,
                tdv.trip_end,
                tdv.duration_hours,
                tdv.start_anchorage,
                tdv.end_anchorage
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            LEFT JOIN trip_details_view tdv ON v.vessel_id = tdv.vessel_id
            WHERE v.vessel_id = ?
            ORDER BY tdv.trip_start DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, [vesselId]);
    }

    static async getVesselNavigationStats(vesselId) {
        const sql = `
            SELECT 
                COUNT(*) as total_trips,
                AVG(TIMESTAMPDIFF(HOUR, t.trip_start, t.trip_end)) as avg_duration_hours,
                MIN(t.trip_start) as first_trip_date,
                MAX(t.trip_start) as last_trip_date,
                COUNT(DISTINCT start_a.anchorage_id) as unique_start_ports,
                COUNT(DISTINCT end_a.anchorage_id) as unique_end_ports,
                COUNT(DISTINCT COALESCE(start_a.anchorage_id, end_a.anchorage_id)) as total_unique_ports,
                SUM(CASE WHEN ${getDatasetActiveCondition('t.trip_start', 't.trip_end')} THEN 1 ELSE 0 END) as active_trips,
                SUM(CASE WHEN ${getDatasetStartTimeCondition('t.trip_start', 30)} THEN 1 ELSE 0 END) as recent_trips_30d,
                SUM(CASE WHEN ${getDatasetStartTimeCondition('t.trip_start', 7)} THEN 1 ELSE 0 END) as recent_trips_7d
            FROM vessels v
            JOIN trips t ON v.vessel_id = t.vessel_id
            LEFT JOIN visits start_visit ON t.trip_id = start_visit.trip_id AND start_visit.visit_type = 'departure'
            LEFT JOIN visits end_visit ON t.trip_id = end_visit.trip_id AND end_visit.visit_type = 'arrival'
            LEFT JOIN anchorages start_a ON start_visit.anchorage_id = start_a.anchorage_id
            LEFT JOIN anchorages end_a ON end_visit.anchorage_id = end_a.anchorage_id
            WHERE v.vessel_id = ?
        `;
        const results = await db.query(sql, [vesselId]);
        return results[0] || null;
    }

    static async getCurrentPositionAndTripCount(vesselId) {
        const sql = `
            SELECT 
                v.vessel_id,
                v.vessel_name,
                v.mmsi,
                vt.type_name,
                vt.type_category,
                COUNT(t.trip_id) as total_trips,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM trips t2 
                        WHERE t2.vessel_id = v.vessel_id 
                        AND ${getDatasetActiveCondition('t2.trip_start', 't2.trip_end')}
                    ) THEN '航行中'
                    ELSE (
                        SELECT COALESCE(a.anchorage_name, '未知位置')
                        FROM trips t3
                        LEFT JOIN visits v3 ON t3.trip_id = v3.trip_id AND v3.visit_type = 'arrival'
                        LEFT JOIN anchorages a ON v3.anchorage_id = a.anchorage_id
                        WHERE t3.vessel_id = v.vessel_id
                        ORDER BY t3.trip_end DESC
                        LIMIT 1
                    )
                END as current_status
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            LEFT JOIN trips t ON v.vessel_id = t.vessel_id
            WHERE v.vessel_id = ?
            GROUP BY v.vessel_id
        `;
        const results = await db.query(sql, [vesselId]);
        return results[0] || null;
    }

    static async getAllVesselsWithPositionAndTripCount() {
        const sql = `
            SELECT 
                v.vessel_id,
                v.vessel_name,
                v.mmsi,
                vt.type_name,
                vt.type_category,
                COUNT(t.trip_id) as total_trips,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM trips t2 
                        WHERE t2.vessel_id = v.vessel_id 
                        AND ${getDatasetActiveCondition('t2.trip_start', 't2.trip_end')}
                    ) THEN '航行中'
                    ELSE (
                        SELECT COALESCE(a.anchorage_name, '未知位置')
                        FROM trips t3
                        LEFT JOIN visits v3 ON t3.trip_id = v3.trip_id AND v3.visit_type = 'arrival'
                        LEFT JOIN anchorages a ON v3.anchorage_id = a.anchorage_id
                        WHERE t3.vessel_id = v.vessel_id
                        ORDER BY t3.trip_end DESC
                        LIMIT 1
                    )
                END as current_status
            FROM vessels v
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            LEFT JOIN trips t ON v.vessel_id = t.vessel_id
            GROUP BY v.vessel_id
            ORDER BY v.vessel_name
        `;
        return await db.query(sql);
    }
}

module.exports = Vessel;