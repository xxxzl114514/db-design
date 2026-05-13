-- 创建必要的视图以支持新功能

-- 创建访问详情视图
CREATE OR REPLACE VIEW visit_details_view AS
SELECT 
    v.visit_id,
    v.trip_id,
    v.vessel_id,
    v.anchorage_id,
    v.visit_time,
    v.visit_type,
    a.anchorage_name,
    a.anchorage_type,
    a.area_zone
FROM visits v
JOIN anchorages a ON v.anchorage_id = a.anchorage_id;

-- 创建航次详情视图
CREATE OR REPLACE VIEW trip_details_view AS
SELECT
    t.trip_id,
    t.vessel_id,
    v.mmsi,
    v.vessel_name,
    vt.type_name as vessel_type,
    t.trip_start,
    t.trip_end,
    ROUND(TIMESTAMPDIFF(MINUTE, t.trip_start, t.trip_end) / 60.0, 2) as duration_hours,

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

-- 创建当前锚地船只视图
CREATE OR REPLACE VIEW current_anchored_vessels_view AS
SELECT 
    v.vessel_id,
    ves.vessel_name,
    ves.mmsi,
    vt.type_name as vessel_type,
    a.anchorage_id,
    a.anchorage_name,
    arrival.visit_time as arrival_time,
    TIMESTAMPDIFF(HOUR, arrival.visit_time, NOW()) as hours_anchored
FROM vessels ves
LEFT JOIN vessel_types vt ON ves.vessel_type_id = vt.vessel_type_id
JOIN (
    SELECT v.vessel_id, v.anchorage_id, v.visit_time
    FROM visits v
    WHERE v.visit_type = 'arrival'
      AND NOT EXISTS (
          SELECT 1 FROM visits v2 
          WHERE v2.vessel_id = v.vessel_id 
            AND v2.anchorage_id = v.anchorage_id 
            AND v2.visit_type = 'departure' 
            AND v2.visit_time > v.visit_time
      )
) arrival ON ves.vessel_id = arrival.vessel_id
JOIN anchorages a ON arrival.anchorage_id = a.anchorage_id
ORDER BY arrival.visit_time DESC;