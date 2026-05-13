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
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">船舶详情</h1>
      </div>
      <div class="flex items-center gap-4">
        <button @click="loadVesselDetail" :disabled="loading" class="icon-btn">
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

    <!-- 船舶详情内容 -->
    <div v-else-if="vessel" class="space-y-6">
      <!-- 基本信息卡片 -->
      <section class="card">
        <div class="flex items-center mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white mr-4"
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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              ></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
              {{ vessel.vessel_name || '未知船舶' }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">MMSI: {{ vessel.mmsi || 'N/A' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">船舶类型</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ vessel.type_name || '未知类型' }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">类型分类</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ vessel.type_category || '未分类' }}
            </p>
          </div>
          <div v-if="vessel.build_year" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">建造年份</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ vessel.build_year }}
            </p>
          </div>
          <div v-if="vessel.length" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">长度</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ vessel.length }}米</p>
          </div>
          <div v-if="vessel.width" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">宽度</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ vessel.width }}米</p>
          </div>
          <div v-if="vessel.dwt" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">载重吨位</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ vessel.dwt }}吨</p>
          </div>
        </div>
      </section>

      <!-- 航行记录 -->
      <section class="card w-full">
        <div class="mb-4">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">航行记录</h3>
        </div>

        <div v-if="tripsLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">加载航行记录中...</p>
        </div>

        <div v-else-if="trips.length === 0" class="text-center py-8">
          <svg
            class="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            ></path>
          </svg>
          <p class="text-gray-500">暂无航行记录</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full table-fixed" style="table-layout: fixed">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th
                  class="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300"
                  style="width: 220px"
                >
                  航次ID
                </th>
                <th
                  class="text-center py-3 px-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  style="width: 140px"
                >
                  起始锚地
                </th>
                <th
                  class="text-center py-3 px-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  style="width: 140px"
                >
                  目的锚地
                </th>
                <th
                  class="text-center py-3 px-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  style="width: 180px"
                >
                  开始时间
                </th>
                <th
                  class="text-center py-3 px-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  style="width: 180px"
                >
                  结束时间
                </th>
                <th
                  class="text-center py-3 px-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  style="width: 120px"
                >
                  航行时长
                </th>
                <th
                  class="text-center py-3 px-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  style="width: 100px"
                >
                  状态
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="trip in trips"
                :key="trip.trip_id"
                class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="py-3 px-2 align-top text-center" style="width: 220px">
                  <span
                    class="font-mono text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-1 py-1 rounded inline-block"
                    style="
                      max-width: 216px;
                      word-wrap: break-word;
                      line-height: 1.3;
                      display: inline-block;
                    "
                    :title="trip.trip_id"
                  >
                    {{ trip.trip_id }}
                  </span>
                </td>
                <td class="py-3 px-3 whitespace-nowrap text-sm text-center">
                  {{ trip.start_anchorage || trip.origin_anchorage || '未知' }}
                </td>
                <td class="py-3 px-3 whitespace-nowrap text-sm text-center">
                  {{ trip.end_anchorage || trip.destination_anchorage || '未知' }}
                </td>
                <td class="py-3 px-3 whitespace-nowrap text-sm text-center">
                  {{ formatDate(trip.trip_start) }}
                </td>
                <td class="py-3 px-3 whitespace-nowrap text-sm text-center">
                  {{ formatDate(trip.trip_end) }}
                </td>
                <td class="py-3 px-3 whitespace-nowrap text-center">
                  <span
                    class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1 py-1 rounded text-xs whitespace-nowrap"
                  >
                    {{ formatDuration(trip.duration_hours) }}
                  </span>
                </td>
                <td class="py-3 px-3 whitespace-nowrap text-center">
                  <span
                    :class="getStatusClass(trip.trip_status || trip.status)"
                    class="text-xs whitespace-nowrap"
                  >
                    {{ getStatusText(trip.trip_status || trip.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 统计信息 -->
      <section class="card w-full">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">统计信息</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div>
              <p class="stat-label">总航次数</p>
              <p class="stat-value">{{ trips.length }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active">⏱️</div>
            <div>
              <p class="stat-label">平均航行时长</p>
              <p class="stat-value">{{ averageDuration }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon vessels">📍</div>
            <div>
              <p class="stat-label">访问锚地数</p>
              <p class="stat-value">{{ uniqueAnchorages }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon anchorages">📈</div>
            <div>
              <p class="stat-label">活跃度</p>
              <p class="stat-value">{{ activityLevel }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 船舶不存在 -->
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
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">船舶不存在</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        未找到ID为 {{ $route.params.id }} 的船舶信息
      </p>
      <button
        @click="goBack"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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

  // 船舶数据
  const vessel = ref<any>(null)
  const trips = ref<any[]>([])
  const loading = ref(false)
  const tripsLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算统计信息
  const averageDuration = computed(() => {
    if (trips.value.length === 0) return '0小时'
    const validTrips = trips.value.filter(
      (trip) =>
        trip.duration_hours !== null &&
        trip.duration_hours !== undefined &&
        !isNaN(Number(trip.duration_hours)) &&
        Number(trip.duration_hours) >= 0
    )
    if (validTrips.length === 0) return '0小时'
    const totalHours = validTrips.reduce((sum, trip) => sum + Number(trip.duration_hours), 0)
    const avgHours = totalHours / validTrips.length
    if (avgHours < 24) return `${avgHours.toFixed(1)}小时`
    const days = Math.floor(avgHours / 24)
    const remainingHours = parseFloat((avgHours % 24).toFixed(1))
    return `${days}天${remainingHours}小时`
  })

  const uniqueAnchorages = computed(() => {
    const anchorages = new Set()
    trips.value.forEach((trip) => {
      if (trip.start_anchorage) anchorages.add(trip.start_anchorage)
      if (trip.end_anchorage) anchorages.add(trip.end_anchorage)
    })
    return anchorages.size
  })

  const activityLevel = computed(() => {
    const recentTrips = trips.value.filter((trip) => {
      const tripDate = new Date(trip.trip_start)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return tripDate >= thirtyDaysAgo
    })

    if (recentTrips.length === 0) return '低'
    if (recentTrips.length <= 3) return '中'
    return '高'
  })

  const goBack = () => {
    router.push('/vessels')
  }

  const loadVesselDetail = async () => {
    const vesselId = route.params.id
    loading.value = true
    error.value = null

    try {
      const response = await apiService.vessels.getById(vesselId)
      vessel.value = response.data?.data

      if (vessel.value) {
        await loadVesselTrips(vesselId)
      }
    } catch (err: any) {
      console.error('获取船舶详情失败:', err)
      error.value = '获取船舶详情失败，请检查船舶ID是否正确'
      vessel.value = null
    } finally {
      loading.value = false
    }
  }

  const loadVesselTrips = async (vesselId: string | number) => {
    tripsLoading.value = true
    try {
      const response = await apiService.vessels.getVesselHistory(vesselId)
      console.log('API响应数据:', response.data) // 调试日志
      trips.value = response.data?.data || []
      console.log('处理后的航行记录:', trips.value) // 调试日志
    } catch (err: any) {
      console.error('获取船舶航行记录失败:', err)
      trips.value = []
    } finally {
      tripsLoading.value = false
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
    if (!status) return '已完成'

    switch (status) {
      case 'active':
        return '进行中'
      case 'completed':
        return '已完成'
      case 'scheduled':
        return '已计划'
      default:
        return status
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  const formatDuration = (hours?: number) => {
    if (hours === null || hours === undefined || isNaN(Number(hours))) return '未知'
    const numHours = Number(hours)
    if (numHours < 24) return `${numHours.toFixed(1)}小时`
    const days = Math.floor(numHours / 24)
    const remainingHours = parseFloat((numHours % 24).toFixed(1))
    return `${days}天${remainingHours}小时`
  }

  onMounted(() => {
    loadVesselDetail()
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
