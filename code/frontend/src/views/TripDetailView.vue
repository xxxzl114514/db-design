<template>
  <div class="w-full animate-fade-in">
    <!-- 返回按钮和标题 -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <button
          @click="goBack"
          class="mb-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all flex items-center gap-2"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          返回列表
        </button>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">航次详情</h1>
      </div>
      <div class="flex items-center gap-4">
        <button @click="loadTripDetail" :disabled="loading" class="icon-btn">
          <span v-if="loading" class="animate-spin">🔄</span>
          <span v-else>🔄</span>
          刷新
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
    >
      <div class="flex items-center">
        ⚠️
        <div>
          <p class="font-medium">数据加载失败</p>
          <p class="text-sm">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-500">加载中...</p>
    </div>

    <!-- 航次详情内容 -->
    <div v-else-if="trip" class="space-y-6">
      <!-- 基本信息卡片 -->
      <section class="card">
        <div class="flex items-center mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white mr-4"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
              航次 #{{ trip.trip_id }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ trip.vessel_name || '未知船舶' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">船舶名称</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ trip.vessel_name || '未知' }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">MMSI</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white font-mono">
              {{ trip.mmsi || 'N/A' }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">船舶类型</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ trip.vessel_type || '未知类型' }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">起始锚地</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ trip.start_anchorage || '未知' }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">目的锚地</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ trip.end_anchorage || '未知' }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">航行状态</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              <span :class="getStatusClass(trip.trip_status)">
                {{ getStatusText(trip.trip_status) }}
              </span>
            </p>
          </div>
        </div>
      </section>

      <!-- 时间信息 -->
      <section class="card">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">时间信息</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="stat-icon">🚀</div>
            <div>
              <p class="stat-label">开始时间</p>
              <p class="stat-value text-sm">{{ formatDate(trip.trip_start) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active">🎯</div>
            <div>
              <p class="stat-label">结束时间</p>
              <p class="stat-value text-sm">{{ formatDate(trip.trip_end) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon vessels">⏱️</div>
            <div>
              <p class="stat-label">航行时长</p>
              <p class="stat-value">{{ formatDuration(trip.duration_hours) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon anchorages">📊</div>
            <div>
              <p class="stat-label">航行进度</p>
              <p class="stat-value">{{ getTripProgress() }}%</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 路线信息 -->
      <section class="card">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">路线信息</h3>
        <div class="space-y-4">
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold"
              >
                起
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ trip.start_anchorage || '未知起始锚地' }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ trip.start_anchorage_type || '未知类型' }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">出发时间</p>
              <p class="font-semibold">{{ formatDate(trip.trip_start) }}</p>
            </div>
          </div>

          <div class="flex items-center justify-center">
            <div class="flex-1 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
            <div class="mx-2 text-2xl">⛵</div>
            <div class="flex-1 h-1 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
          </div>

          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
              >
                终
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ trip.end_anchorage || '未知目的锚地' }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ trip.end_anchorage_type || '未知类型' }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">到达时间</p>
              <p class="font-semibold">{{ formatDate(trip.trip_end) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 相关统计 -->
      <section class="card">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">航次统计</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="stat-card">
            <div class="stat-icon vessels">🔄</div>
            <div>
              <p class="stat-label">船舶状态</p>
              <p class="stat-value">{{ getVesselStatus() }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon anchorages">📍</div>
            <div>
              <p class="stat-label">航次类型</p>
              <p class="stat-value">{{ getTripType() }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 船舶其他航次 -->
      <section class="card" v-if="relatedTrips.length > 0">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">船舶其他航次</h3>
          <div
            class="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded"
          >
            共 {{ relatedTrips.length }} 条记录
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  航次ID
                </th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  起始锚地
                </th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  目的锚地
                </th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  开始时间
                </th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  结束时间
                </th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  航行时长
                </th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  状态
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="relatedTrip in relatedTrips"
                :key="relatedTrip.trip_id"
                class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="py-3 px-4">
                  <span
                    class="font-mono text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded"
                  >
                    {{ relatedTrip.trip_id }}
                  </span>
                </td>
                <td class="py-3 px-4">{{ relatedTrip.start_anchorage || '未知' }}</td>
                <td class="py-3 px-4">{{ relatedTrip.end_anchorage || '未知' }}</td>
                <td class="py-3 px-4">{{ formatDate(relatedTrip.trip_start) }}</td>
                <td class="py-3 px-4">{{ formatDate(relatedTrip.trip_end) }}</td>
                <td class="py-3 px-4">
                  <span
                    class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm"
                  >
                    {{ formatDuration(relatedTrip.duration_hours) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span :class="getStatusClass(relatedTrip.trip_status)">
                    {{ getStatusText(relatedTrip.trip_status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- 航次不存在 -->
    <div v-else-if="!loading && !error" class="text-center py-12">
      <svg
        class="w-16 h-16 mx-auto text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">航次不存在</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        未找到ID为 {{ $route.params.id }} 的航次信息
      </p>
      <button
        @click="goBack"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        返回列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { apiService } from '@/services/api'

  const router = useRouter()
  const route = useRoute()

  // 航次数据
  const trip = ref<any>(null)
  const relatedTrips = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const goBack = () => {
    router.push('/trips')
  }

  const loadTripDetail = async () => {
    const tripId = route.params.id
    loading.value = true
    error.value = null

    try {
      const response = await apiService.trips.getById(tripId)
      trip.value = response.data?.data

      if (trip.value) {
        await loadRelatedTrips(trip.value.vessel_id || trip.value.mmsi)
      }
    } catch (err: any) {
      console.error('获取航次详情失败:', err)
      error.value = '获取航次详情失败，请检查航次ID是否正确'
      trip.value = null
    } finally {
      loading.value = false
    }
  }

  const loadRelatedTrips = async (vesselId: string | number) => {
    try {
      // 获取同一船舶的所有其他航次（排除当前航次）
      console.log(`获取船舶 ${vesselId} 的所有相关航次...`)
      const response = await apiService.trips.getByVessel(vesselId.toString())
      if (response.data?.success) {
        relatedTrips.value = response.data.data.filter(
          (t: any) => t.trip_id !== trip.value?.trip_id
        )
        console.log(`获取到 ${relatedTrips.value.length} 个相关航次`)
      } else if (response.data?.data) {
        // 如果没有success字段，直接使用data
        relatedTrips.value = response.data.data.filter(
          (t: any) => t.trip_id !== trip.value?.trip_id
        )
        console.log(`获取到 ${relatedTrips.value.length} 个相关航次`)
      }
    } catch (err: any) {
      console.error('获取相关航次失败:', err)
      relatedTrips.value = []
    }
  }

  const getStatusClass = (status?: string) => {
    if (!status)
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm'

    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm'
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm'
      case 'scheduled':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-sm'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm'
    }
  }

  const getStatusText = (status?: string) => {
    return '已完成'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'
    const date = new Date(dateString)

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString)
      return '无效日期'
    }

    // 返回完整的日期和时间
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (hours?: number | string) => {
    if (!hours) return '未知'
    const duration = parseFloat(hours.toString())

    // 检查是否为有效数字
    if (isNaN(duration) || !isFinite(duration)) {
      return '未知'
    }

    if (duration === 0) return '0分钟'

    // 如果超过24小时，显示天和小时
    if (duration >= 24) {
      const days = Math.floor(duration / 24)
      const remainingHours = Math.round(duration % 24)
      return `${days}天${remainingHours}小时`
    }

    // 如果不足1小时，显示分钟
    if (duration < 1) {
      const minutes = Math.round(duration * 60)
      return `${minutes}分钟`
    }

    // 1-24小时之间，显示小时
    return `${Math.round(duration)}小时`
  }

  const getTripProgress = () => {
    if (!trip.value?.trip_start || !trip.value?.trip_end) return 0

    const start = new Date(trip.value.trip_start)
    const end = new Date(trip.value.trip_end)
    const now = new Date()

    if (now >= end) return 100
    if (now <= start) return 0

    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / total) * 100)
  }

  const estimateDistance = () => {
    // 简单的距离估算，实际应用中可能需要更复杂的计算
    if (!trip.value?.start_anchorage || !trip.value?.end_anchorage) return '未知'
    return Math.round(Math.random() * 500 + 50) // 模拟距离
  }

  const calculateAverageSpeed = () => {
    if (!trip.value?.duration_hours) return '未知'
    const duration = parseFloat(trip.value.duration_hours.toString()) || 0
    if (duration <= 0) return '未知'

    // 简单速度计算：距离/时间
    const distance = parseFloat(estimateDistance())
    const speed = distance / duration
    return speed.toFixed(1)
  }

  const getVesselStatus = () => {
    return '已到达'
  }

  const getTripType = () => {
    if (!trip.value?.start_anchorage || !trip.value?.end_anchorage) return '未知'

    if (trip.value.start_anchorage === trip.value.end_anchorage) {
      return '往返航次'
    }
    return '单向航次'
  }

  onMounted(() => {
    loadTripDetail()
  })
</script>

<style scoped>
  /* 全局样式和设计令牌 */
  :root {
    --bg: #f7f9ff;
    --card: #ffffff;
    --muted: #6b7280;
    --accent: #7c57ff;
    --accent-2: #ff8a65;
    --glass: rgba(255, 255, 255, 0.6);
    --success: #37b24d;
    --shadow: 0 18px 50px rgba(12, 20, 60, 0.08);
    --radius: 16px;
    --radius-sm: 12px;
  }

  /* 卡片样式 */
  .card {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 250, 255, 0.9));
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow);
  }

  .icon-btn {
    background: linear-gradient(180deg, #fff, #fbfbff);
    padding: 10px;
    border-radius: var(--radius-sm);
    border: 1px solid #eef4ff;
    cursor: pointer;
    box-shadow: var(--shadow);
    transition: all 0.2s;
  }

  .icon-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(12, 20, 60, 0.12);
  }

  /* 统计卡片网格 */
  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 250, 255, 0.9));
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    transition: all 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(12, 20, 60, 0.12);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
  }

  .stat-icon.active {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
  }

  .stat-icon.vessels {
    background: linear-gradient(135deg, #10b981, #14b8a6);
  }

  .stat-icon.anchorages {
    background: linear-gradient(135deg, #f59e0b, #f97316);
  }

  .stat-label {
    font-size: 14px;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #071022;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .card {
      padding: 16px;
    }

    .stat-card {
      padding: 16px;
    }
  }
</style>
