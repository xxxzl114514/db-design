// API响应类型定义
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp?: string
}

// 分页响应类型
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    total: number
    page: number
    limit: number
  }
}

// 船舶类型
export interface Vessel {
  vessel_id: string
  mmsi: number
  vessel_name: string
  vessel_type?: string
  vessel_type_id?: number
  created_at?: string
  updated_at?: string
}

// 锚地类型
export interface Anchorage {
  anchorage_id: number
  anchorage_name: string
  anchorage_type?: string
  area_zone?: string
  zone_number?: string
  current_vessel_count?: number
  occupancy_rate?: number
  capacity?: number
  created_at?: string
  updated_at?: string
}

// 航次类型
export interface Trip {
  trip_id: string
  vessel_id: string
  trip_start: string
  trip_end: string
  duration_hours?: number
  start_anchorage?: string
  end_anchorage?: string
  start_anchorage_type?: string
  end_anchorage_type?: string
}

// 访问记录类型
export interface Visit {
  visit_id: string
  trip_id: string
  vessel_id: string
  anchorage_id: number
  visit_time: string
  visit_type: 'departure' | 'arrival'
}

// 船舶类型定义
export interface VesselType {
  vessel_type_id: number
  type_name: string
  type_category?: string
  description?: string
}

// 统计数据类型
export interface VesselStats {
  total_vessels: number
  total_anchorages: number
  total_trips: number
  active_vessels: number
}

// 热门航线类型
export interface PopularRoute {
  name: string
  origin: string
  destination: string
  trip_count: number
  avg_duration: number
}

// 趋势数据类型
export interface TrendData {
  name: string
  航次: number
  活跃船舶: number
  平均时长: number
}
