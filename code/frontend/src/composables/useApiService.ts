import { ref, type Ref } from 'vue'
import { apiService } from '@/services/api'

export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface ApiState {
  loading: boolean
  error: ApiError | null
  data: any
}

export function useApiService() {
  const apiState: Ref<ApiState> = ref({
    loading: false,
    error: null,
    data: null
  })

  const executeApiCall = async <T>(
    apiCall: () => Promise<any>,
    successCallback?: (data: T) => void,
    errorCallback?: (error: ApiError) => void
  ): Promise<T | null> => {
    apiState.value.loading = true
    apiState.value.error = null

    try {
      const response = await apiCall()
      apiState.value.data = response.data
      apiState.value.loading = false

      if (successCallback) {
        successCallback(response.data)
      }

      return response.data
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'API调用失败',
        status: error.response?.status
      }

      apiState.value.error = apiError
      apiState.value.loading = false

      console.error('API调用失败:', apiError)

      if (errorCallback) {
        errorCallback(apiError)
      }

      return null
    }
  }

  // 船舶相关API
  const getVessels = async (limit = 100, offset = 0) => {
    return executeApiCall(() => apiService.vessels.getAll(limit, offset))
  }

  const getVesselById = async (id: string | number) => {
    return executeApiCall(() => apiService.vessels.getById(id))
  }

  // 锚地相关API
  const getAnchorages = async (limit = 100, offset = 0) => {
    return executeApiCall(() => apiService.anchorages.getAll(limit, offset))
  }

  const getAnchorageById = async (id: string | number) => {
    return executeApiCall(() => apiService.anchorages.getById(id))
  }

  // 航次相关API
  const getTrips = async (limit = 100, offset = 0) => {
    return executeApiCall(() => apiService.trips.getAll(limit, offset))
  }

  const getTripById = async (id: string | number) => {
    return executeApiCall(() => apiService.trips.getById(id))
  }

  // 仪表板相关API
  const getDashboardOverview = async (days = 7) => {
    return executeApiCall(() => apiService.dashboard.getOverview(days))
  }

  const getDashboardTrends = async (days = 30) => {
    return executeApiCall(() => apiService.dashboard.getTrends(days))
  }

  return {
    apiState,
    executeApiCall,
    getVessels,
    getVesselById,
    getAnchorages,
    getAnchorageById,
    getTrips,
    getTripById,
    getDashboardOverview,
    getDashboardTrends
  }
}
