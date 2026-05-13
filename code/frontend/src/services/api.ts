// src/services/api.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Vessel,
  Anchorage,
  Trip,
  VesselStats,
  PopularRoute,
  TrendData
} from '@/types'

// 从环境变量获取API基础URL，如果未设置则使用默认值
// 使用相对路径以便Vite代理可以正确处理
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 创建Axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // 处理不同类型的错误
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response

      switch (status) {
        case 400:
          console.error('请求参数错误:', data.message || 'Bad Request')
          break
        case 401:
          console.error('未授权访问:', data.message || 'Unauthorized')
          // 可以在这里处理登录跳转
          break
        case 403:
          console.error('禁止访问:', data.message || 'Forbidden')
          break
        case 404:
          console.error('资源不存在:', data.message || 'Not Found')
          break
        case 500:
          console.error('服务器内部错误:', data.message || 'Internal Server Error')
          break
        case 503:
          console.error('服务不可用:', data.message || 'Service Unavailable')
          break
        default:
          console.error(`请求失败 (${status}):`, data.message || 'Unknown Error')
      }
    } else if (error.request) {
      // 网络错误
      console.error('网络连接错误，请检查网络连接')
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message)
    }

    return Promise.reject(error)
  }
)

// API服务类
class ApiService {
  // 仪表板API
  dashboard = {
    getOverview: (days: number): Promise<AxiosResponse<ApiResponse<VesselStats>>> =>
      apiClient.get(`/dashboard/overview?days=${days}`),
    getTrends: (
      days?: number,
      startDate?: string,
      endDate?: string
    ): Promise<AxiosResponse<ApiResponse<{ daily_trends: TrendData[] }>>> => {
      if (startDate && endDate) {
        return apiClient.get(`/dashboard/trends?start_date=${startDate}&end_date=${endDate}`)
      } else {
        return apiClient.get(`/dashboard/trends?days=${days || 30}`)
      }
    },
    getAlerts: (): Promise<AxiosResponse<ApiResponse>> => apiClient.get('/dashboard/alerts')
  }

  vessels = {
    getAll: (limit?: number, offset?: number): Promise<AxiosResponse<PaginatedResponse<Vessel>>> =>
      apiClient.get(
        `/vessels${limit ? `?limit=${limit}` : ''}${offset ? `&offset=${offset}` : ''}`
      ),
    getById: (id: string): Promise<AxiosResponse<ApiResponse<Vessel>>> =>
      apiClient.get(`/vessels/${id}`),
    getByMMSI: (mmsi: string): Promise<AxiosResponse<ApiResponse<Vessel>>> =>
      apiClient.get(`/vessels/mmsi/${mmsi}`),
    getByType: (
      typeName: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Vessel>>> =>
      apiClient.get(`/vessels/type/${typeName}${limit ? `?limit=${limit}` : ''}`),
    getByCategory: (
      categoryName: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Vessel>>> =>
      apiClient.get(`/vessels/category/${categoryName}${limit ? `?limit=${limit}` : ''}`),
    getVesselTrips: (id: string, limit?: number): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(`/vessels/${id}/trips${limit ? `?limit=${limit}` : ''}`),
    getVesselHistory: (
      id: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(`/vessels/${id}/history${limit ? `?limit=${limit}` : ''}`),
    getVesselNavigationStats: (id: string): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/vessels/${id}/navigation-stats`),
    getVesselDetailedStats: (id: string): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/vessels/${id}/stats`),
    getVesselRecentActivity: (id: string, days?: number): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/vessels/${id}/activity${days ? `?days=${days}` : ''}`),
    getVesselPositionAndTrips: (id: string): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/vessels/${id}/position-trips`),
    getAllVesselsPositionAndTrips: (): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get('/vessels/all/position-trips'),
    search: (keyword: string, limit?: number): Promise<AxiosResponse<PaginatedResponse<Vessel>>> =>
      apiClient.get(`/vessels/search/${encodeURIComponent(keyword)}${limit ? `?limit=${limit}` : ''}`),
    getStats: (): Promise<AxiosResponse<ApiResponse<VesselStats>>> =>
      apiClient.get('/vessels/stats/overview'),
    create: (data: Partial<Vessel>): Promise<AxiosResponse<ApiResponse<Vessel>>> =>
      apiClient.post('/vessels', data),
    update: (id: string, data: Partial<Vessel>): Promise<AxiosResponse<ApiResponse<Vessel>>> =>
      apiClient.put(`/vessels/${id}`, data),
    delete: (id: string): Promise<AxiosResponse<ApiResponse>> => apiClient.delete(`/vessels/${id}`)
  }

  anchorages = {
    getAll: (
      limit?: number,
      offset?: number
    ): Promise<AxiosResponse<PaginatedResponse<Anchorage>>> =>
      apiClient.get(
        `/anchorages${limit ? `?limit=${limit}` : ''}${offset ? `&offset=${offset}` : ''}`
      ),
    getById: (id: string): Promise<AxiosResponse<ApiResponse<Anchorage>>> =>
      apiClient.get(`/anchorages/${id}`),
    getByType: (
      anchorageType: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Anchorage>>> =>
      apiClient.get(`/anchorages/type/${anchorageType}${limit ? `?limit=${limit}` : ''}`),
    getByZone: (
      areaZone: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Anchorage>>> =>
      apiClient.get(`/anchorages/zone/${areaZone}${limit ? `?limit=${limit}` : ''}`),
    getAnchorageActivity: (id: string, days?: number): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/anchorages/${id}/activity${days ? `?days=${days}` : ''}`),
    getPeakUsageTimes: (id: string, days?: number): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/anchorages/${id}/peaktimes${days ? `?days=${days}` : ''}`),
    getAnchorageTraffic: (id: string, days?: number): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/anchorages/${id}/traffic${days ? `?days=${days}` : ''}`),
    getCurrentAnchoredVessels: (
      id: string,
      referenceDate?: string
    ): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(
        `/anchorages/${id}/current-vessels${referenceDate ? `?date=${referenceDate}` : ''}`
      ),
    getAnchorageTrafficSummary: (id: string, days?: number): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/anchorages/${id}/traffic-summary${days ? `?days=${days}` : ''}`),
    getAnchorageComprehensiveInfo: (
      id: string,
      days?: number
    ): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/anchorages/${id}/comprehensive-info${days ? `?days=${days}` : ''}`),
    getAnchorageDetailedStats: (id: string): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/anchorages/${id}/stats`),
    getAnchorageCapacityInfo: (id: string): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/anchorages/${id}/capacity`),
    getAnchorageMonthlyTrends: (id: string, months?: number): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/anchorages/${id}/trends${months ? `?months=${months}` : ''}`),
    search: (
      keyword: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Anchorage>>> =>
      apiClient.get(`/anchorages/search/${encodeURIComponent(keyword)}${limit ? `?limit=${limit}` : ''}`),
    getSchedulingStats: (): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get('/anchorages/stats/scheduling'),
    getZoneStats: (): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get('/anchorages/stats/zones'),
    create: (data: Partial<Anchorage>): Promise<AxiosResponse<ApiResponse<Anchorage>>> =>
      apiClient.post('/anchorages', data),
    update: (
      id: string,
      data: Partial<Anchorage>
    ): Promise<AxiosResponse<ApiResponse<Anchorage>>> => apiClient.put(`/anchorages/${id}`, data),
    delete: (id: string): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.delete(`/anchorages/${id}`)
  }

  trips = {
    getAll: (): Promise<AxiosResponse<PaginatedResponse<Trip>>> => apiClient.get('/trips'),
    getById: (id: string): Promise<AxiosResponse<ApiResponse<Trip>>> =>
      apiClient.get(`/trips/${id}`),
    getByVessel: (
      vesselId: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(`/trips/vessel/${vesselId}${limit ? `?limit=${limit}` : ''}`),
    getByDateRange: (
      startDate: string,
      endDate: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(`/trips/daterange/${startDate}/${endDate}${limit ? `?limit=${limit}` : ''}`),
    getByDepartureDate: (
      date: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(`/trips/departure/${date}${limit ? `?limit=${limit}` : ''}`),
    getByArrivalDate: (
      date: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(`/trips/arrival/${date}${limit ? `?limit=${limit}` : ''}`),
    getByAnchorage: (
      anchorageId: string,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(`/trips/anchorage/${anchorageId}${limit ? `?limit=${limit}` : ''}`),
    getStats: (days?: number): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/trips/stats/overview${days ? `?days=${days}` : ''}`),
    getDailyStats: (days?: number): Promise<AxiosResponse<ApiResponse>> =>
      apiClient.get(`/trips/stats/daily${days ? `?days=${days}` : ''}`),
    getCurrentTrips: (): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get('/trips/current/active'),
    getLongTrips: (
      thresholdHours?: number,
      limit?: number
    ): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(
        `/trips/long/duration${thresholdHours ? `?threshold=${thresholdHours}` : ''}${limit ? `&limit=${limit}` : ''}`
      ),
    search: (keyword: string, limit?: number): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get(`/trips/search/${encodeURIComponent(keyword)}${limit ? `?limit=${limit}` : ''}`),
    getPopularRoutes: (limit: number): Promise<AxiosResponse<ApiResponse<PopularRoute[]>>> =>
      apiClient.get(`/trips/routes/popular?limit=${limit}`),
    getRecentActiveTrips: (): Promise<AxiosResponse<PaginatedResponse<Trip>>> =>
      apiClient.get('/trips/recent/active'),
    create: (data: Partial<Trip>): Promise<AxiosResponse<ApiResponse<Trip>>> =>
      apiClient.post('/trips', data),
    update: (id: string, data: Partial<Trip>): Promise<AxiosResponse<ApiResponse<Trip>>> =>
      apiClient.put(`/trips/${id}`, data),
    delete: (id: string): Promise<AxiosResponse<ApiResponse>> => apiClient.delete(`/trips/${id}`)
  }
}

// 导出API服务实例
export const apiService = new ApiService()

// 导出API客户端实例（供需要直接使用axios的场景）
export { apiClient }
