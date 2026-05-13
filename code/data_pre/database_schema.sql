-- 近海渔船航行及港口调度分析数据库
-- 符合第三范式(3NF)的设计

-- 1. 船舶表 (Vessels) 存储船舶的基本信息
CREATE TABLE vessels (
    vessel_id VARCHAR(255) PRIMARY KEY COMMENT '船舶唯一标识符',
    mmsi BIGINT NOT NULL UNIQUE COMMENT '海事移动业务识别码',
    vessel_name VARCHAR(100) NOT NULL COMMENT '船舶名称',
    vessel_type VARCHAR(50) COMMENT '船舶类型 (从vessel_name中提取)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 添加索引提高查询性能
    INDEX idx_mmsi (mmsi),
    INDEX idx_vessel_type (vessel_type)
) COMMENT='船舶基本信息表';

-- 2. 锚地表 (Anchorages) 存储锚地/港口位置信息
CREATE TABLE anchorages (
    anchorage_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '锚地ID',
    anchorage_name VARCHAR(100) NOT NULL UNIQUE COMMENT '锚地名称',
    anchorage_type VARCHAR(50) COMMENT '锚地类型 (港口/码头区/停泊区/锚地等)',
    area_zone VARCHAR(50) COMMENT '区域 (南区/西区/北区等)',
    zone_number VARCHAR(20) COMMENT '区域编号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 添加索引
    INDEX idx_anchorage_type (anchorage_type),
    INDEX idx_area_zone (area_zone)
) COMMENT='锚地/港口位置信息表';

-- 3. 航次表 (Trips) 存储航次基本信息
CREATE TABLE trips (
    trip_id VARCHAR(100) PRIMARY KEY COMMENT '航次唯一标识符',
    vessel_id VARCHAR(255) NOT NULL COMMENT '关联船舶ID',

    -- 航次时间信息
    trip_start TIMESTAMP NOT NULL COMMENT '航次开始时间',
    trip_end TIMESTAMP NOT NULL COMMENT '航次结束时间',

    -- 航次持续时间（计算字段，不存储）

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 外键约束
    FOREIGN KEY (vessel_id) REFERENCES vessels(vessel_id) ON DELETE CASCADE,

    -- 添加索引
    INDEX idx_vessel_id (vessel_id),
    INDEX idx_trip_start (trip_start),
    INDEX idx_trip_end (trip_end)
) COMMENT='航次信息表';

-- 4. 访问记录表 (Visits) 存储船舶访问锚地的详细记录
CREATE TABLE visits (
    visit_id VARCHAR(40) PRIMARY KEY COMMENT '访问记录唯一标识符',
    trip_id VARCHAR(100) NOT NULL COMMENT '关联航次ID',
    vessel_id VARCHAR(255) NOT NULL COMMENT '关联船舶ID',
    anchorage_id INT NOT NULL COMMENT '关联锚地ID',

    -- 访问时间信息
    visit_time TIMESTAMP NOT NULL COMMENT '访问时间',

    -- 访问类型
    visit_type ENUM('departure', 'arrival') NOT NULL COMMENT '出发或到达',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 外键约束
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (vessel_id) REFERENCES vessels(vessel_id) ON DELETE CASCADE,
    FOREIGN KEY (anchorage_id) REFERENCES anchorages(anchorage_id) ON DELETE RESTRICT,

    -- 添加索引
    INDEX idx_trip_id (trip_id),
    INDEX idx_vessel_id (vessel_id),
    INDEX idx_anchorage_id (anchorage_id),
    INDEX idx_visit_time (visit_time),
    INDEX idx_visit_type (visit_type)
) COMMENT='船舶访问锚地记录表';

-- 5. 船舶类型表 (Vessel_Types)
-- 为了满足3NF，将船舶类型信息单独存储
CREATE TABLE vessel_types (
    vessel_type_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '船舶类型ID',
    type_name VARCHAR(50) NOT NULL UNIQUE COMMENT '类型名称',
    type_category VARCHAR(30) COMMENT '类型分类 (渔船/客轮/货轮等)',
    description TEXT COMMENT '类型描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='船舶类型分类表';

-- 6. 添加船舶类型外键到船舶表
ALTER TABLE vessels ADD COLUMN vessel_type_id INT;
ALTER TABLE vessels ADD FOREIGN KEY (vessel_type_id) REFERENCES vessel_types(vessel_type_id);



-- 创建视图用于常用查询
-- 7. 航次详情视图 (Trip_Details_View)
CREATE VIEW trip_details_view AS
SELECT
    t.trip_id,
    v.mmsi,
    v.vessel_name,
    vt.type_name as vessel_type,
    t.trip_start,
    t.trip_end,
    TIMESTAMPDIFF(HOUR, t.trip_start, t.trip_end) as duration_hours,

    -- 起始锚地信息
    start_a.anchorage_name as start_anchorage,
    start_a.anchorage_type as start_anchorage_type,

    -- 终点锚地信息
    end_a.anchorage_name as end_anchorage,
    end_a.anchorage_type as end_anchorage_type

FROM trips t
JOIN vessels v ON t.vessel_id = v.vessel_id
LEFT JOIN vessel_types vt ON v.vessel_type_id = vt.vessel_type_id
JOIN visits start_visit ON t.trip_id = start_visit.trip_id AND start_visit.visit_type = 'departure'
JOIN visits end_visit ON t.trip_id = end_visit.trip_id AND end_visit.visit_type = 'arrival'
JOIN anchorages start_a ON start_visit.anchorage_id = start_a.anchorage_id
JOIN anchorages end_a ON end_visit.anchorage_id = end_a.anchorage_id;

-- 8. 港口调度统计视图 (Port_Scheduling_Stats)
CREATE VIEW port_scheduling_stats AS
SELECT
    a.anchorage_name,
    a.anchorage_type,
    COUNT(*) as total_visits,
    COUNT(DISTINCT v.vessel_id) as unique_vessels,
    MIN(visit_time) as first_visit,
    MAX(visit_time) as last_visit,
    AVG(TIMESTAMPDIFF(HOUR,
        (SELECT MIN(visit_time) FROM visits v2 WHERE v2.trip_id = visits.trip_id),
        (SELECT MAX(visit_time) FROM visits v3 WHERE v3.trip_id = visits.trip_id)
    )) as avg_trip_duration_hours
FROM visits
JOIN anchorages a ON visits.anchorage_id = a.anchorage_id
JOIN vessels v ON visits.vessel_id = v.vessel_id
GROUP BY a.anchorage_id, a.anchorage_name, a.anchorage_type;

-- 添加触发器以自动更新时间戳
DELIMITER //
CREATE TRIGGER update_vessels_timestamp
BEFORE UPDATE ON vessels
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_anchorages_timestamp
BEFORE UPDATE ON anchorages
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_vessel_types_timestamp
BEFORE UPDATE ON vessel_types
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- 插入示例数据（根据CSV文件中的锚地类型）
INSERT IGNORE INTO vessel_types (type_name, type_category) VALUES
('客轮', '客运船舶'),
('渔船', '渔业船舶'),
('拖船', '辅助船舶'),
('集装箱船', '货运船舶'),
('货轮', '货运船舶'),
('散货船', '货运船舶'),
('油轮', '货运船舶'),
('邮轮', '客运船舶');

-- 添加约束确保数据完整性
ALTER TABLE trips ADD CONSTRAINT chk_trip_time
CHECK (trip_end > trip_start);

-- 数据库和表注释已在CREATE TABLE语句中定义