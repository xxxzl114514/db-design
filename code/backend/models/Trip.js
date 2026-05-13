const db = require('../config/database');
const { getDatasetStartTimeCondition, getDatasetActiveCondition, DEFAULT_REFERENCE_DATE } = require('../utils/datasetTimeUtils');

class Trip {
    static async findAll(limit = null, offset = 0) {
        // 如果没有指定limit或者limit为-1，返回所有数据
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        const offsetNum = Math.max(0, Math.floor(Number(offset) || 0));
        
        let sql = `
            SELECT 
                trip_id,
                mmsi,
                vessel_name,
                vessel_type,
                trip_start,
                trip_end,
                duration_hours,
                start_anchorage,
                start_anchorage_type,
                end_anchorage,
                end_anchorage_type
            FROM trip_details_view
            ORDER BY trip_start DESC
        `;
        
        // 只有在有limit时才添加LIMIT和OFFSET
        if (hasLimit) {
            sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
        } else if (offsetNum > 0) {
            sql += ` OFFSET ${offsetNum}`;
        }
        
        return await db.query(sql);
    }

    static async findById(tripId) {
        const sql = `
            SELECT 
                trip_id,
                mmsi,
                vessel_name,
                vessel_type,
                trip_start,
                trip_end,
                duration_hours,
                start_anchorage,
                start_anchorage_type,
                end_anchorage,
                end_anchorage_type
            FROM trip_details_view
            WHERE trip_id = ?
        `;
        const results = await db.query(sql, [tripId]);
        return results[0] || null;
    }

    static async findByVessel(vesselId, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        let sql = `
            SELECT 
                trip_id,
                mmsi,
                vessel_name,
                vessel_type,
                trip_start,
                trip_end,
                duration_hours,
                start_anchorage,
                start_anchorage_type,
                end_anchorage,
                end_anchorage_type
            FROM trip_details_view
            WHERE vessel_id = ?
            ORDER BY trip_start DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, [vesselId]);
    }

    static async findByDateRange(startDate, endDate, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        // 构建灵活的日期查询条件和参数数组
        let dateConditions = [];
        let params = [];
        
        if (startDate) {
            dateConditions.push(`DATE(trip_start) >= ?`);
            params.push(startDate);
        }
        if (endDate) {
            dateConditions.push(`DATE(trip_end) <= ?`);
            params.push(endDate);
        }
        
        // 如果没有提供任何日期条件，返回空结果
        if (dateConditions.length === 0) {
            return [];
        }
        
        let sql = `
            SELECT 
                trip_id,
                mmsi,
                vessel_name,
                vessel_type,
                trip_start,
                trip_end,
                duration_hours,
                start_anchorage,
                start_anchorage_type,
                end_anchorage,
                end_anchorage_type
            FROM trip_details_view
            WHERE ${dateConditions.join(' AND ')}
            ORDER BY trip_start DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        
        return await db.query(sql, params);
    }

    static async findByAnchorage(anchorageId, limit = 50) {
        const limitNum = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 50)));
        
        const sql = `
            SELECT t.trip_id, t.trip_start, t.trip_end,
                   v.vessel_name, v.mmsi,
                   vt.type_name as vessel_type,
                   start_a.anchorage_name as start_anchorage,
                   start_a.anchorage_type as start_anchorage_type,
                   end_a.anchorage_name as end_anchorage,
                   end_a.anchorage_type as end_anchorage_type,
                   TIMESTAMPDIFF(HOUR, t.trip_start, t.trip_end) as duration_hours,
                   CASE
                     WHEN start_visit.anchorage_id = ? THEN 'departure'
                     WHEN end_visit.anchorage_id = ? THEN 'arrival'
                     ELSE 'transit'
                   END as visit_type
            FROM trips t
            JOIN vessels v ON t.vessel_id = v.vessel_id
            LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
            JOIN visits start_visit ON t.trip_id = start_visit.trip_id AND start_visit.visit_type = 'departure'
            JOIN anchorages start_a ON start_visit.anchorage_id = start_a.anchorage_id
            JOIN visits end_visit ON t.trip_id = end_visit.trip_id AND end_visit.visit_type = 'arrival'
            JOIN anchorages end_a ON end_visit.anchorage_id = end_a.anchorage_id
            WHERE start_visit.anchorage_id = ? OR end_visit.anchorage_id = ?
            ORDER BY t.trip_start DESC
            LIMIT ${limitNum}
        `;
        return await db.query(sql, [anchorageId, anchorageId, anchorageId, anchorageId]);
    }

    static async getTripStats(days = 30) {
        // 简化参数处理，确保是有效的数字
        const numDays = Math.max(1, Math.min(365, Math.floor(Number(days) || 30)));

        const sql = `
            SELECT
                COUNT(*) as total_trips,
                COUNT(DISTINCT mmsi) as active_vessels,
                AVG(duration_hours) as avg_duration_hours,
                MIN(duration_hours) as min_duration_hours,
                MAX(duration_hours) as max_duration_hours,
                AVG(CASE WHEN vessel_type = '渔船' THEN 1 ELSE 0 END) * 100 as fishing_percentage
            FROM trip_details_view
            WHERE ${getDatasetStartTimeCondition('trip_start', numDays)}
        `;
        return await db.query(sql, [numDays]);
    }

    static async getDailyTripStats(days = 30) {
        // 简化参数处理，确保是有效的数字
        const numDays = Math.max(1, Math.min(365, Math.floor(Number(days) || 30)));

        

        const sql = `
            SELECT
                DATE(trip_start) as trip_date,
                COUNT(*) as daily_trips,
                COUNT(DISTINCT mmsi) as daily_active_vessels,
                AVG(duration_hours) as avg_duration_hours
            FROM trip_details_view
            WHERE ${getDatasetStartTimeCondition('trip_start', numDays)}
            GROUP BY DATE(trip_start)
            ORDER BY trip_date DESC
        `;
        
        const result = await db.query(sql);
        return result;
    }

    static async getDailyTripStatsByDateRange(startDate, endDate) {
        
        
        const sql = `
            SELECT
                DATE(CONVERT_TZ(trip_start, '+00:00', '+08:00')) as trip_date,
                COUNT(*) as daily_trips,
                COUNT(DISTINCT mmsi) as daily_active_vessels,
                AVG(duration_hours) as avg_duration_hours
            FROM trip_details_view
            WHERE DATE(CONVERT_TZ(trip_start, '+00:00', '+08:00')) >= ? 
              AND DATE(CONVERT_TZ(trip_start, '+00:00', '+08:00')) <= ?
            GROUP BY DATE(CONVERT_TZ(trip_start, '+00:00', '+08:00'))
            ORDER BY trip_date DESC
        `;
        
        const result = await db.query(sql, [startDate, endDate]);
        return result;
    }

    static async getPopularRoutes(limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const numLimit = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        
        let sql = `
            SELECT
                start_anchorage,
                end_anchorage,
                COUNT(*) as trip_count,
                AVG(duration_hours) as avg_duration_hours,
                COUNT(DISTINCT mmsi) as unique_vessels,
                GROUP_CONCAT(DISTINCT vessel_type) as vessel_types
            FROM trip_details_view
            WHERE start_anchorage IS NOT NULL
              AND end_anchorage IS NOT NULL
              AND start_anchorage != end_anchorage
            GROUP BY start_anchorage, end_anchorage
            HAVING trip_count >= 2
            ORDER BY trip_count DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${numLimit}`;
        }
        
        return await db.query(sql);
    }

    static async getCurrentTrips() {
        const sql = `
            SELECT 
                tdv.trip_id,
                tdv.vessel_name,
                tdv.vessel_type,
                tdv.start_anchorage,
                tdv.end_anchorage,
                tdv.trip_start,
                tdv.trip_end,
                TIMESTAMPDIFF(MINUTE, tdv.trip_start, '${DEFAULT_REFERENCE_DATE}') as minutes_elapsed
            FROM trip_details_view tdv
            WHERE ${getDatasetActiveCondition('tdv.trip_start', 'tdv.trip_end')}
            ORDER BY tdv.trip_start DESC
        `;
        return await db.query(sql);
    }

    static async getLongTrips(thresholdHours = 48, limit = null) {
        // 简化参数处理，确保是有效的数字
        const numThreshold = Math.max(0, Math.min(1000, Math.floor(Number(thresholdHours) || 48)));
        const hasLimit = limit !== null && limit !== -1;
        const numLimit = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;

        let sql = `
            SELECT * FROM trip_details_view
            WHERE duration_hours >= ?
            ORDER BY duration_hours DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${numLimit}`;
        }
        
        return await db.query(sql, [numThreshold]);
    }

    static async findByDepartureDate(date, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        const searchTerm = `%${date}%`;
        
        // 使用更灵活的日期比较，支持不同的日期格式
        let sql = `
            SELECT 
                trip_id,
                mmsi,
                vessel_name,
                vessel_type,
                trip_start,
                trip_end,
                duration_hours,
                start_anchorage,
                start_anchorage_type,
                end_anchorage,
                end_anchorage_type
            FROM trip_details_view
            WHERE DATE(trip_start) = ?
               OR trip_start LIKE ?
               OR DATE_FORMAT(trip_start, '%Y-%m-%d') = ?
            ORDER BY trip_start DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        
        return await db.query(sql, [date, searchTerm, date]);
    }

    static async findByArrivalDate(date, limit = null) {
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        const searchTerm = `%${date}%`;
        
        // 使用更灵活的日期比较，支持不同的日期格式
        let sql = `
            SELECT 
                trip_id,
                mmsi,
                vessel_name,
                vessel_type,
                trip_start,
                trip_end,
                duration_hours,
                start_anchorage,
                start_anchorage_type,
                end_anchorage,
                end_anchorage_type
            FROM trip_details_view
            WHERE DATE(trip_end) = ?
               OR trip_end LIKE ?
               OR DATE_FORMAT(trip_end, '%Y-%m-%d') = ?
            ORDER BY trip_end DESC
        `;
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        
        return await db.query(sql, [date, searchTerm, date]);
    }

    static async searchTrips(keyword, limit = null) {
        // 确保参数是正确的类型
        const hasLimit = limit !== null && limit !== -1;
        const limitNum = hasLimit ? Math.max(1, Math.min(10000, Math.floor(Number(limit) || 10000))) : null;
        const keywordStr = String(keyword);
        const searchTerm = `%${keywordStr}%`;
        
        // 检测是否为MMSI格式（9位数字）
        const isMMSI = /^\d{9}$/.test(keyword);
        
        // 使用参数化查询来防止SQL注入
        let sql, params;
        
        if (isMMSI) {
            // MMSI精确匹配优先
            sql = `
                SELECT 
                    trip_id,
                    mmsi,
                    vessel_name,
                    vessel_type,
                    trip_start,
                    trip_end,
                    duration_hours,
                    start_anchorage,
                    start_anchorage_type,
                    end_anchorage,
                    end_anchorage_type,
                    1 as match_priority
                FROM trip_details_view
                WHERE mmsi = ?
                UNION ALL
                SELECT 
                    trip_id,
                    mmsi,
                    vessel_name,
                    vessel_type,
                    trip_start,
                    trip_end,
                    duration_hours,
                    start_anchorage,
                    start_anchorage_type,
                    end_anchorage,
                    end_anchorage_type,
                    0 as match_priority
                FROM trip_details_view
                WHERE vessel_name LIKE ? OR vessel_type LIKE ? OR start_anchorage LIKE ? OR end_anchorage LIKE ?
                ORDER BY match_priority DESC, trip_start DESC
            `;
            params = [keyword, searchTerm, searchTerm, searchTerm, searchTerm];
        } else {
            // 普通模糊搜索
            sql = `
                SELECT 
                    trip_id,
                    mmsi,
                    vessel_name,
                    vessel_type,
                    trip_start,
                    trip_end,
                    duration_hours,
                    start_anchorage,
                    start_anchorage_type,
                    end_anchorage,
                    end_anchorage_type,
                    0 as match_priority
                FROM trip_details_view
                WHERE vessel_name LIKE ?
                   OR vessel_type LIKE ?
                   OR start_anchorage LIKE ?
                   OR end_anchorage LIKE ?
                   OR CAST(mmsi AS CHAR) LIKE ?
                ORDER BY trip_start DESC
            `;
            params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
        }
        
        // 只有在有limit时才添加LIMIT
        if (hasLimit) {
            sql += ` LIMIT ${limitNum}`;
        }
        
        return await db.query(sql, params);
    }

    /**
     * 获取最近一周内出发或完成的航次
     * @returns {Promise<Array>} 最近一周内的航次列表
     */
    static async getRecentActiveTrips() {
        // 计算一周前的日期（相对于参考日期2025-01-01）
        const sql = `
            SELECT 
                tdv.trip_id,
                tdv.vessel_name,
                tdv.vessel_type,
                tdv.start_anchorage,
                tdv.end_anchorage,
                tdv.trip_start,
                tdv.trip_end,
                tdv.duration_hours,
                TIMESTAMPDIFF(MINUTE, tdv.trip_start, '${DEFAULT_REFERENCE_DATE}') as minutes_elapsed
            FROM trip_details_view tdv
            WHERE 
                (tdv.trip_start >= DATE_SUB('${DEFAULT_REFERENCE_DATE}', INTERVAL 7 DAY) AND 
                 tdv.trip_start <= '${DEFAULT_REFERENCE_DATE}')
                OR 
                (tdv.trip_end >= DATE_SUB('${DEFAULT_REFERENCE_DATE}', INTERVAL 7 DAY) AND 
                 tdv.trip_end <= '${DEFAULT_REFERENCE_DATE}')
            ORDER BY tdv.trip_start DESC
        `;
        return await db.query(sql);
    }
}

module.exports = Trip;