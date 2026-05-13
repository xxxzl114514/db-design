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
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">锚地详情</h1>
      </div>
      <div class="flex items-center gap-4">
        <button @click="loadAnchorageDetail" :disabled="loading" class="icon-btn">
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

    <!-- 锚地详情内容 -->
    <div v-else-if="anchorage" class="space-y-6">
      <!-- 基本信息卡片 -->
      <section class="card">
        <div class="flex items-center mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white mr-4"
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
              {{ anchorage.anchorage_name || '未知锚地' }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ anchorage.area_zone || '未知区域' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">锚地类型</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ anchorage.anchorage_type || '未知类型' }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">容量</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ anchorage.capacity || 0 }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">当前在锚地船只</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ filteredCurrentVessels.length }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">占用率</p>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  :class="[
                    'h-2 rounded-full transition-all duration-500',
                    getOccupancyClass(currentOccupancyRate)
                  ]"
                  :style="{ width: `${currentOccupancyRate}%` }"
                ></div>
              </div>
              <span class="text-sm font-bold">{{ currentOccupancyRate }}%</span>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">最近活动</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ formatDate(recentActivity?.last_visit_time) }}
            </p>
          </div>
        </div>
      </section>

      <!-- 近期活动 -->
      <section class="card">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">近期活动</h3>

        <div v-if="activityLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">加载活动数据中...</p>
        </div>

        <div
          v-else-if="recentActivity"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div>
              <p class="stat-label">近期访问次数</p>
              <p class="stat-value">{{ recentActivity.recent_visits || 0 }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active">🚢</div>
            <div>
              <p class="stat-label">独立船舶数</p>
              <p class="stat-value">{{ recentActivity.unique_vessels || 0 }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon vessels">⏰</div>
            <div>
              <p class="stat-label">最后访问时间</p>
              <p class="stat-value text-sm">{{ formatDate(recentActivity.last_visit_time) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon anchorages">📋</div>
            <div>
              <p class="stat-label">船舶类型</p>
              <p class="stat-value text-sm">{{ getVesselTypes(recentActivity.vessel_types) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 当前停留船只 -->
      <section class="card">
        <div class="flex items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">
            当前停留船只 ({{ filteredCurrentVessels.length }}艘)
          </h3>
        </div>

        <div v-if="currentVesselsLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">加载当前船只数据中...</p>
        </div>

        <div v-else-if="filteredCurrentVessels.length === 0" class="text-center py-8">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            ></path>
          </svg>
          <p class="text-gray-500">当前无停留船只</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  船舶名称
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  MMSI
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  船舶类型
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  到达时间
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  停留时长
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="vessel in filteredCurrentVessels"
                :key="vessel.vessel_id"
                class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="py-3 px-4 font-medium text-center">
                  {{ vessel.vessel_name || '未知' }}
                </td>
                <td class="py-3 px-4 text-center">
                  <span class="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {{ vessel.mmsi || 'N/A' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm"
                  >
                    {{ vessel.vessel_type || '未知类型' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">{{ formatDate(vessel.arrival_time) }}</td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm"
                  >
                    {{ formatDuration(vessel.hours_anchored) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 船只进出情况 -->
      <section class="card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">船只进出记录</h3>
          <div
            v-if="comprehensiveInfo"
            class="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded"
          >
            近期记录: {{ comprehensiveInfo.recent_records_count }}条
          </div>
        </div>

        <div v-if="trafficLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">加载进出数据中...</p>
        </div>

        <div v-else-if="vesselTraffic.length === 0" class="text-center py-8">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p class="text-gray-500">暂无进出记录</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  船舶名称
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  船舶类型
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  进出类型
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  时间
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="traffic in vesselTraffic"
                :key="traffic.visit_id"
                class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="py-3 px-4 font-medium text-center">
                  {{ traffic.vessel_name || '未知' }}
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm"
                  >
                    {{ traffic.vessel_type || '未知类型' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-sm font-medium',
                      traffic.original_visit_type === 'arrival'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                    ]"
                  >
                    {{ traffic.visit_type_label }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">{{ formatDate(traffic.visit_time) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 交通汇总统计 -->
      <section class="card">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">交通汇总统计</h3>

        <div v-if="trafficLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">加载交通汇总数据中...</p>
        </div>

        <div v-else-if="trafficSummary" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div>
                <p class="stat-label">总到达次数</p>
                <p class="stat-value">{{ formatNumber(trafficSummary.total_arrivals) }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon active">🚢</div>
              <div>
                <p class="stat-label">总离开次数</p>
                <p class="stat-value">{{ formatNumber(trafficSummary.total_departures) }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon vessels">📍</div>
              <div>
                <p class="stat-label">独立船舶数</p>
                <p class="stat-value">{{ formatNumber(trafficSummary.unique_vessels) }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon anchorages">⏱️</div>
              <div>
                <p class="stat-label">平均停留时长</p>
                <p class="stat-value">{{ formatDuration(trafficSummary.avg_stay_duration) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            ></path>
          </svg>
          <p class="text-gray-500">暂无交通汇总数据</p>
        </div>
      </section>

      <!-- 统计信息 -->
      <section class="card">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">锚地统计信息</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div>
              <p class="stat-label">总容量</p>
              <p class="stat-value">{{ anchorage.capacity || 0 }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon occupied">✅</div>
            <div>
              <p class="stat-label">已使用</p>
              <p class="stat-value">{{ filteredCurrentVessels.length }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon available">⬆️</div>
            <div>
              <p class="stat-label">可用容量</p>
              <p class="stat-value">
                {{ (anchorage.capacity || 0) - filteredCurrentVessels.length }}
              </p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon maintenance">📈</div>
            <div>
              <p class="stat-label">繁忙程度</p>
              <p class="stat-value">{{ getAnchorageStatusLabel(anchorage.occupancy_rate) }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 锚地不存在 -->
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
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">锚地不存在</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        未找到ID为 {{ $route.params.id }} 的锚地信息
      </p>
      <button
        @click="goBack"
        class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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

  // 锚地数据
  const anchorage = ref<any>(null)
  const recentActivity = ref<any>(null)
  const peakTimes = ref<any[]>([])
  const vesselTraffic = ref<any[]>([])
  const currentVessels = ref<any[]>([])
  const trafficSummary = ref<any>(null)
  const comprehensiveInfo = ref<any>(null)
  const loading = ref(false)
  const activityLoading = ref(false)
  const peakTimesLoading = ref(false)
  const trafficLoading = ref(false)
  const currentVesselsLoading = ref(false)
  const comprehensiveInfoLoading = ref(false)
  const error = ref<string | null>(null)

  const goBack = () => {
    router.push('/anchorages')
  }

  // 过滤当前停留船只
  const filteredCurrentVessels = computed(() => {
    return currentVessels.value || []
  })

  // 计算当前占用率
  const currentOccupancyRate = computed(() => {
    const capacity = anchorage.value?.capacity || 100
    const occupied = filteredCurrentVessels.value.length
    return Math.round((occupied / capacity) * 100)
  })

  const loadAnchorageDetail = async () => {
    const anchorageId = route.params.id
    loading.value = true
    error.value = null

    try {
      const response = await apiService.anchorages.getById(anchorageId)
      anchorage.value = response.data?.data

      if (anchorage.value) {
        // 并行加载所有数据，但不因某个失败而影响其他
        const loadPromises = [
          loadRecentActivity(anchorageId).catch((err) => {
            console.warn('加载近期活动失败:', err)
            return null
          }),
          loadPeakUsageTimes(anchorageId).catch((err) => {
            console.warn('加载高峰时间失败:', err)
            return null
          }),
          loadVesselTraffic(anchorageId).catch((err) => {
            console.warn('加载船只进出情况失败:', err)
            return null
          }),
          loadCurrentVessels(anchorageId).catch((err) => {
            console.warn('加载当前船只失败:', err)
            return null
          }),
          loadTrafficSummary(anchorageId).catch((err) => {
            console.warn('加载交通汇总失败:', err)
            return null
          }),
          loadComprehensiveInfo(anchorageId).catch((err) => {
            console.warn('加载综合信息失败:', err)
            return null
          })
        ]

        await Promise.allSettled(loadPromises)
      }
    } catch (err: any) {
      console.error('获取锚地详情失败:', err)
      if (
        err.code === 'ER_MALFORMED_PACKET' ||
        err.message?.includes('Malformed communication packet')
      ) {
        error.value = '数据库通信错误，请稍后重试'
      } else {
        error.value = '获取锚地详情失败，请检查锚地ID是否正确'
      }
      anchorage.value = null
    } finally {
      loading.value = false
    }
  }

  const loadRecentActivity = async (anchorageId: string | number) => {
    activityLoading.value = true
    try {
      const response = await apiService.anchorages.getAnchorageActivity(anchorageId)
      recentActivity.value = response.data?.data
    } catch (err: any) {
      console.error('获取锚地活动失败:', err)
      recentActivity.value = null
    } finally {
      activityLoading.value = false
    }
  }

  const loadPeakUsageTimes = async (anchorageId: string | number) => {
    peakTimesLoading.value = true
    try {
      const response = await apiService.anchorages.getPeakUsageTimes(anchorageId)
      peakTimes.value = response.data?.data || []
    } catch (err: any) {
      console.error('获取高峰使用时间失败:', err)
      peakTimes.value = []
    } finally {
      peakTimesLoading.value = false
    }
  }

  const getAnchorageStatusLabel = (occupancyRate?: number) => {
    if (!occupancyRate) return '未知'
    if (occupancyRate < 30) return '空闲'
    if (occupancyRate < 70) return '正常'
    if (occupancyRate < 90) return '繁忙'
    return '满载'
  }

  const getOccupancyClass = (rate?: number) => {
    if (!rate || rate < 30) return 'bg-green-500'
    if (rate < 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  const getDayOfWeek = (dayOfWeek: number) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[dayOfWeek - 1] || '未知'
  }

  const getVesselTypes = (vesselTypes?: string) => {
    if (!vesselTypes) return '无'
    const types = vesselTypes.split(',')
    return types.length > 2 ? `${types.length}种类型` : vesselTypes
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'currently_anchored':
        return '当前停留'
      case 'departed':
        return '已离开'
      case 'departure':
        return '离开'
      default:
        return '未知'
    }
  }

  const formatDuration = (hours?: number | null) => {
    if (hours === null) return '数据不足'
    if (!hours || isNaN(hours)) return '0小时'
    if (hours < 1) return `${Math.round(hours * 60)}分钟`
    if (hours < 24) return `${Math.round(hours)}小时`
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    return `${days}天${remainingHours}小时`
  }

  const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined || isNaN(num)) return '0'
    return Math.round(num).toLocaleString()
  }

  const loadVesselTraffic = async (anchorageId: string | number) => {
    trafficLoading.value = true
    try {
      const response = await apiService.anchorages.getAnchorageTraffic(anchorageId, 365) // 传递一个大的天数值，但后端已忽略时间限制
      vesselTraffic.value = response.data?.data || []
    } catch (err: any) {
      console.error('获取锚地船只进出情况失败:', err)
      vesselTraffic.value = []
      // 如果是数据库通信错误，显示友好的错误信息
      if (
        err.code === 'ER_MALFORMED_PACKET' ||
        err.message?.includes('Malformed communication packet')
      ) {
        console.warn('数据库通信错误，船只进出数据暂时不可用')
      }
    } finally {
      trafficLoading.value = false
    }
  }

  const loadCurrentVessels = async (anchorageId: string | number) => {
    currentVesselsLoading.value = true
    try {
      const response = await apiService.anchorages.getCurrentAnchoredVessels(anchorageId)
      currentVessels.value = response.data?.data || []
    } catch (err: any) {
      console.error('获取当前停留船只失败:', err)
      currentVessels.value = []
    } finally {
      currentVesselsLoading.value = false
    }
  }

  const loadTrafficSummary = async (anchorageId: string | number) => {
    try {
      const response = await apiService.anchorages.getAnchorageTrafficSummary(anchorageId)
      trafficSummary.value = response.data?.data
      console.log('交通汇总数据加载成功:', trafficSummary.value)
    } catch (err: any) {
      console.error('获取锚地交通汇总失败:', err)
      trafficSummary.value = null
      // 如果是数据库通信错误，显示友好的错误信息
      if (
        err.code === 'ER_MALFORMED_PACKET' ||
        err.message?.includes('Malformed communication packet')
      ) {
        console.warn('数据库通信错误，交通汇总数据暂时不可用')
      }
    }
  }

  const loadComprehensiveInfo = async (anchorageId: string | number) => {
    comprehensiveInfoLoading.value = true
    try {
      const response = await apiService.anchorages.getAnchorageComprehensiveInfo(anchorageId)
      comprehensiveInfo.value = response.data?.data
    } catch (err: any) {
      console.error('获取锚地综合信息失败:', err)
      comprehensiveInfo.value = null
    } finally {
      comprehensiveInfoLoading.value = false
    }
  }

  onMounted(() => {
    loadAnchorageDetail()
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
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
  }

  .stat-icon.occupied {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  .stat-icon.available {
    background: linear-gradient(135deg, #10b981, #14b8a6);
  }

  .stat-icon.maintenance {
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
