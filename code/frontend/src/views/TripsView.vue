<template>
  <div class="w-full animate-fade-in">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">航次管理</h1>
      <p class="text-gray-600 dark:text-gray-400">查看和管理所有航次记录</p>
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
          <p class="text-sm mt-1">提示：请确保后端服务已启动并正在运行</p>
        </div>
      </div>
    </div>

    <!-- 搜索和过滤区域 -->
    <section class="card mb-8">
      <div class="filter-grid">
        <div>
          <label class="filter-label">搜索航次</label>
          <div class="relative">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="航次ID、船舶、路线..."
              class="filter-select"
              @keyup.enter="performSearch"
            />
          </div>
        </div>

        <div>
          <label class="filter-label">船舶类型</label>
          <select v-model="vesselFilter" class="filter-select">
            <option value="">全部类型</option>
            <option value="货轮">货轮</option>
            <option value="油轮">油轮</option>
            <option value="客轮">客轮</option>
            <option value="渔船">渔船</option>
            <option value="拖船">拖船</option>
            <option value="集装箱船">集装箱船</option>
            <option value="散货船">散货船</option>
            <option value="邮轮">邮轮</option>
          </select>
        </div>

        <div>
          <label class="filter-label">航次状态</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="">全部状态</option>
            <option value="long">长航次(≥48小时)</option>
            <option value="completed">标准航次(≥24小时)</option>
            <option value="short">短航次(<24小时)</option>
          </select>
        </div>

        <div>
          <label class="filter-label">出发日期</label>
          <input
            ref="startDateInput"
            v-model="startDate"
            type="date"
            class="filter-select"
            min="2024-01-01"
            max="2025-12-31"
          />
          <div class="mt-2 flex gap-2">
            <button
              @click="startDate = '2024-12-01'"
              class="icon-btn flex items-center gap-1 px-4 text-xs"
            >
              📅 设置为2024年12月
            </button>
          </div>
        </div>

        <div>
          <label class="filter-label">到达日期</label>
          <input
            ref="endDateInput"
            v-model="endDate"
            type="date"
            class="filter-select"
            min="2024-01-01"
            max="2025-12-31"
          />
          <div class="mt-2 flex gap-2">
            <button
              @click="endDate = '2024-12-31'"
              class="icon-btn flex items-center gap-1 px-4 text-xs"
            >
              📅 设置为2024年12月
            </button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-between mt-4">
        <button @click="performSearch" class="icon-btn flex items-center gap-1 px-6">
          🔍 搜索
        </button>
        <button @click="resetFilters" class="icon-btn flex items-center gap-1 px-6">
          🔄 重置筛选
        </button>
      </div>
    </section>

    <!-- 统计信息 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon trips">📊</div>
        <div>
          <p class="stat-label">总航次数</p>
          <p class="stat-value">{{ totalTrips }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon active">⏱️</div>
        <div>
          <p class="stat-label">长航次</p>
          <p class="stat-value">{{ delayedTrips }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon vessels">✅</div>
        <div>
          <p class="stat-label">已完成</p>
          <p class="stat-value">{{ completedTrips }}</p>
        </div>
      </div>
    </div>

    <!-- 航次列表 -->
    <section class="card">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h4 style="margin-top: 0">航次列表</h4>
        <button @click="loadTrips" :disabled="loading" class="icon-btn">
          <span v-if="loading" class="animate-spin">🔄</span>
          <span v-else>🔄</span>
          刷新
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-500">加载中...</p>
      </div>

      <div v-else-if="paginatedTrips.length === 0" class="text-center py-8">
        <div
          class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <div class="text-4xl text-gray-400">🗺️</div>
        </div>
        <p class="text-gray-500 text-lg">暂无航次数据</p>
        <p class="text-gray-400 text-sm mt-2">请尝试调整筛选条件</p>
      </div>

      <div v-else>
        <!-- 航次时间线布局 -->
        <div class="space-y-6">
          <div
            v-for="trip in paginatedTrips"
            :key="trip.id"
            class="group bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700"
          >
            <!-- 航次卡片头部 -->
            <div
              class="relative p-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white"
            >
              <div class="absolute top-4 right-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm',
                    getTripStatusClass(trip.status)
                  ]"
                >
                  {{ getTripTypeLabel(trip) }}
                </span>
              </div>
              <div class="flex items-center mb-3">
                <div
                  class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4"
                >
                  <svg
                    class="w-6 h-6 text-white"
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
                  <h3 class="text-xl font-bold text-white">航次 #{{ trip.id }}</h3>
                  <p class="text-white/80 text-sm">{{ trip.vessel_name || '未知船舶' }}</p>
                </div>
              </div>
            </div>

            <!-- 航次详细信息 -->
            <div class="p-6 space-y-4">
              <!-- 路线信息 -->
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-center">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">起点</p>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ getStartPoint(trip.route) }}
                    </p>
                  </div>
                  <div class="flex-1 px-4">
                    <div class="relative">
                      <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          :class="[
                            'h-2 rounded-full transition-all duration-500',
                            getTripProgressClass(trip.status)
                          ]"
                          :style="{ width: getTripProgressWidth(trip.status) }"
                        ></div>
                      </div>
                      <div class="flex justify-between mt-1">
                        <span class="text-xs">✅</span>
                        <span class="text-xs">⏸️</span>
                      </div>
                    </div>
                    <p class="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {{ trip.route }}
                    </p>
                  </div>
                  <div class="text-center">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">终点</p>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ getEndPoint(trip.route) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 航次信息网格 -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">出发时间</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ formatDate(trip.start_time) }}
                  </p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">预计到达</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ formatDate(trip.estimated_arrival) }}
                  </p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">持续时间</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ formatDuration(trip.duration_hours) }}
                  </p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">航次属性</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ getTripTypeLabel(trip) }}
                  </p>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-2 pt-2">
                <button
                  @click="viewTripDetails(trip.id)"
                  class="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm flex items-center justify-center"
                >
                  👁️ 查看详情
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between mt-8 p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">
            显示第 {{ (currentPage - 1) * pageSize + 1 }} 到
            {{ Math.min(currentPage * pageSize, totalTrips) }} 条记录，共 {{ totalTrips }} 条
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              首页
            </button>
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              ◀️ 上一页
            </button>
            <div
              class="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-md"
            >
              <span class="font-bold text-sm">{{ currentPage }}</span>
              <span class="mx-2 text-white/80">/</span>
              <span class="font-medium text-sm text-white/90">{{ totalPages }}</span>
            </div>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              下一页 ▶️
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              末页
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { apiService } from '@/services/api'
  import EnhancedDataTable from '@/components/EnhancedDataTable.vue'

  const router = useRouter()
  const route = useRoute()

  // 日期输入框的引用
  const startDateInput = ref<HTMLInputElement | null>(null)
  const endDateInput = ref<HTMLInputElement | null>(null)

  // 定义表格列
  const tableColumns = [
    { key: 'id', title: '航次ID', sortable: true },
    { key: 'vessel_name', title: '船舶', sortable: true },
    { key: 'route', title: '路线', sortable: true },
    { key: 'start_time', title: '出发时间', sortable: true },
    { key: 'estimated_arrival', title: '预计到达', sortable: true },
    { key: 'status', title: '状态', sortable: true },
    { key: 'duration_hours', title: '持续时间', sortable: true },
    { key: 'actions', title: '操作', sortable: false }
  ]

  interface Trip {
    id: number | string
    vessel_name?: string
    vessel_id?: string | number
    route?: string
    start_time?: string
    estimated_arrival?: string
    status?: string
    duration_hours?: number
  }

  interface VesselOption {
    id: string | number
    name: string
  }

  // 航次列表和过滤选项
  const trips = ref<Trip[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 筛选和分页状态
  const searchKeyword = ref('')
  const vesselFilter = ref('')
  const statusFilter = ref('')
  const startDate = ref('')
  const endDate = ref('')
  const currentPage = ref(1)
  const pageSize = ref(12) // 卡片布局使用3x4网格
  const totalPages = ref(1)
  const totalTrips = ref(0)

  // 统计数据
  const activeTrips = ref(0)
  const completedTrips = ref(0)
  const delayedTrips = ref(0)

  // 存储所有筛选后的数据
  const allFilteredTrips = ref<Trip[]>([])

  // 计算分页数据
  const paginatedTrips = computed(() => {
    // 基于当前页码从所有筛选后的数据中分页
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    return allFilteredTrips.value.slice(startIndex, endIndex)
  })

  // 计算总页数
  const totalPagesComputed = computed(() => {
    return Math.ceil(totalTrips.value / pageSize.value)
  })

  // 监听总页数变化
  watch(totalPagesComputed, (newVal) => {
    totalPages.value = newVal
    if (currentPage.value > newVal && newVal > 0) {
      currentPage.value = 1
    }
  })

  // 监听页码变化，重新获取数据
  watch(currentPage, () => {
    fetchData()
  })

  // 监听筛选条件变化，重置页码并重新获取数据
  watch([searchKeyword, vesselFilter, statusFilter, startDate, endDate], () => {
    currentPage.value = 1
    fetchData()
  })

  const getStatusLabel = (status?: string) => {
    if (!status) return '未知'
    const statusTexts: Record<string, string> = {
      active: '进行中',
      completed: '已完成',
      ongoing: '进行中',
      long: '长航次',
      short: '短航次',
      delayed: '长航次',
      cancelled: '已取消'
    }
    return statusTexts[status] || '未知'
  }

  const getStatusClass = (status?: string) => {
    if (!status)
      return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900/30 dark:to-gray-800/30 dark:text-gray-300'
    const classes: Record<string, string> = {
      active:
        'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300',
      completed:
        'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300',
      ongoing:
        'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300',
      long: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300',
      short:
        'bg-gradient-to-r from-green-100 to-lime-100 text-green-800 dark:from-green-900/30 dark:to-lime-900/30 dark:text-green-300',
      delayed:
        'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-300',
      cancelled:
        'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300'
    }
    return (
      classes[status] ||
      'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900/30 dark:to-gray-800/30 dark:text-gray-300'
    )
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
    if (!hours && hours !== 0) return '0分钟'

    const duration = parseFloat(hours.toString())

    // 检查是否为有效数字
    if (isNaN(duration) || !isFinite(duration)) {
      console.warn('Invalid duration value:', hours)
      return '0分钟'
    }

    if (duration === 0) return '0分钟'

    // 如果超过24小时，显示天和小时
    if (duration >= 24) {
      const days = Math.floor(duration / 24)
      const remainingHours = (duration % 24).toFixed(1)
      return `${days}天${remainingHours}小时`
    }

    // 如果不足1小时，显示分钟
    if (duration < 1) {
      const minutes = Math.round(duration * 60)
      return `${minutes}分钟`
    }

    // 1-24小时之间，显示小时
    return `${duration.toFixed(1)}小时`
  }

  const getStartPoint = (route?: string) => {
    if (!route) return '未知'
    return route.split(' - ')[0] || '未知'
  }

  const getEndPoint = (route?: string) => {
    if (!route) return '未知'
    const parts = route.split(' - ')
    return parts[parts.length - 1] || '未知'
  }

  const getTripStatusClass = (status?: string) => {
    if (!status) return 'bg-white/20 text-white'
    const classes: Record<string, string> = {
      active: 'bg-blue-500/20 text-blue-100 ring-1 ring-blue-400/50',
      completed: 'bg-green-500/20 text-green-100 ring-1 ring-green-400/50',
      ongoing: 'bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/50',
      long: 'bg-purple-500/20 text-purple-100 ring-1 ring-purple-400/50',
      short: 'bg-lime-500/20 text-lime-100 ring-1 ring-lime-400/50',
      delayed: 'bg-yellow-500/20 text-yellow-100 ring-1 ring-yellow-400/50',
      cancelled: 'bg-red-500/20 text-red-100 ring-1 ring-red-400/50'
    }
    return classes[status] || 'bg-white/20 text-white'
  }

  const getTripProgressClass = (status?: string) => {
    if (!status) return 'bg-gray-400'
    const classes: Record<string, string> = {
      active: 'bg-gradient-to-r from-blue-400 to-blue-600',
      completed: 'bg-gradient-to-r from-green-400 to-green-600',
      ongoing: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
      long: 'bg-gradient-to-r from-purple-400 to-purple-600',
      short: 'bg-gradient-to-r from-lime-400 to-lime-600',
      delayed: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      cancelled: 'bg-gradient-to-r from-red-400 to-red-600'
    }
    return classes[status] || 'bg-gray-400'
  }

  const getTripProgressWidth = (status?: string) => {
    if (!status) return '0%'
    const widths: Record<string, string> = {
      active: '60%',
      completed: '100%',
      ongoing: '60%',
      long: '100%',
      short: '100%',
      delayed: '75%',
      cancelled: '40%'
    }
    return widths[status] || '0%'
  }

  const getTripProgressText = (status?: string) => {
    if (!status) return '未知'
    const statusTexts: Record<string, string> = {
      active: '进行中',
      completed: '已完成',
      ongoing: '进行中',
      long: '长航次',
      short: '短航次',
      delayed: '长航次',
      cancelled: '已取消'
    }
    return statusTexts[status] || '未知'
  }

  const performSearch = async () => {
    currentPage.value = 1
    await fetchData()
  }

  const setStartDate = (date: string) => {
    startDate.value = date
    // 自动触发搜索
    performSearch()
  }

  const setEndDate = (date: string) => {
    endDate.value = date
    // 自动触发搜索
    performSearch()
  }

  const resetFilters = async () => {
    searchKeyword.value = ''
    vesselFilter.value = ''
    statusFilter.value = ''
    startDate.value = ''
    endDate.value = ''
    currentPage.value = 1
    await fetchData()
  }

  const viewTripDetails = (id: string | number) => {
    router.push(`/trips/${id}`)
  }

  const loadTrips = async () => {
    await fetchData()
  }

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      console.log(
        `获取航次数据，筛选条件 - 搜索: ${searchKeyword.value}, 船舶: ${vesselFilter.value}, 状态: ${statusFilter.value}, 开始日期: ${startDate.value}, 结束日期: ${endDate.value}`
      )

      // 获取所有航次数据作为筛选基础
      const allResponse = await apiService.trips.getAll()
      let allResults = allResponse.data?.data || []
      console.log(`获取到原始数据: ${allResults.length} 条`)

      // 应用所有筛选条件
      // 1. 应用搜索关键词筛选
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim().toLowerCase()
        allResults = allResults.filter((trip: any) => {
          return (
            (trip.vessel_name && trip.vessel_name.toLowerCase().includes(keyword)) ||
            (trip.trip_id && trip.trip_id.toString().toLowerCase().includes(keyword)) ||
            (trip.start_anchorage && trip.start_anchorage.toLowerCase().includes(keyword)) ||
            (trip.end_anchorage && trip.end_anchorage.toLowerCase().includes(keyword))
          )
        })
        console.log(`搜索关键词筛选后: ${allResults.length} 条`)
      }

      // 2. 应用船舶筛选
      if (vesselFilter.value) {
        allResults = allResults.filter((trip: any) => {
          return trip.vessel_type === vesselFilter.value
        })
        console.log(`船舶类型筛选后: ${allResults.length} 条`)
      }

      // 3. 应用日期筛选
      if (startDate.value) {
        // 筛选出发日期等于所选日期的航次
        allResults = allResults.filter((trip: any) => {
          const tripStartDate = new Date(trip.trip_start).toDateString()
          const startDateStr = new Date(startDate.value).toDateString()
          return tripStartDate === startDateStr
        })
        console.log(`出发日期筛选后: ${allResults.length} 条`)
      }

      if (endDate.value) {
        // 筛选到达日期等于所选日期的航次
        allResults = allResults.filter((trip: any) => {
          const tripEndDate = new Date(trip.trip_end).toDateString()
          const endDateStr = new Date(endDate.value).toDateString()
          return tripEndDate === endDateStr
        })
        console.log(`到达日期筛选后: ${allResults.length} 条`)
      }

      // 4. 应用状态筛选
      if (statusFilter.value) {
        allResults = allResults.filter((trip: any) => {
          const duration = parseFloat(trip.duration_hours) || 0
          const referenceDate = new Date('2025-01-01 12:00:00')
          const tripEnd = new Date(trip.trip_end)
          const tripStatus = getTripStatus(trip)

          switch (statusFilter.value) {
            case 'ongoing':
              // 进行中的航次：状态为'ongoing'
              return tripStatus === 'ongoing'
            case 'completed':
              // 已完成的航次：状态为'completed'
              return tripStatus === 'completed'
            case 'long':
              // 长航次：状态为'long'
              return tripStatus === 'long'
            case 'short':
              // 短航次：状态为'short'
              return tripStatus === 'short'
            default:
              return true
          }
        })
        console.log(`状态筛选后: ${allResults.length} 条`)
      }

      // 设置总航次数（筛选后的总数）
      totalTrips.value = allResults.length

      console.log(`最终筛选结果: ${allResults.length} 条`)

      // 转换所有筛选后的API数据以匹配前端结构
      allFilteredTrips.value = allResults.map((trip: any) => {
        const duration = parseFloat(trip.duration_hours)

        return {
          id: trip.trip_id || trip.id,
          vessel_name: trip.vessel_name || '未知船舶',
          vessel_id: trip.vessel_id || 'unknown',
          mmsi: trip.mmsi || 0,
          route: `${trip.start_anchorage || '未知'} - ${trip.end_anchorage || '未知'}`,
          start_time: trip.trip_start,
          estimated_arrival: trip.trip_end,
          status: getTripStatus(trip),
          duration_hours: isNaN(duration) ? 0 : duration,
          vessel_type: trip.vessel_type || '未知类型'
        }
      })

      // 保存所有筛选后的数据用于统计计算
      const allTripsForStats = allResults.map((trip: any) => {
        const duration = parseFloat(trip.duration_hours)
        return {
          ...trip,
          duration_hours: isNaN(duration) ? 0 : duration
        }
      })

      console.log(`处理统计数据，总航次数: ${totalTrips.value}`)

      // 更新统计数据 - 获取最近一周内活跃的航次
      const referenceDate = new Date('2025-01-01 12:00:00')

      try {
        const recentActiveResponse = await apiService.trips.getRecentActiveTrips()
        activeTrips.value = recentActiveResponse.data?.count || 0
      } catch (err) {
        console.error('获取最近一周内活跃航次失败:', err)
        // 如果API调用失败，使用原有逻辑作为备选
        activeTrips.value = allTripsForStats.filter((t) => {
          const tripEnd = new Date(t.estimated_arrival || t.trip_end)
          return tripEnd > referenceDate
        }).length
      }

      // 统计已完成的航次（结束时间在参考时间之前或当天）
      completedTrips.value = allTripsForStats.filter((t) => {
        const tripEnd = new Date(t.estimated_arrival || t.trip_end)
        return tripEnd <= referenceDate
      }).length

      // 统计长航次（持续时间超过48小时）
      delayedTrips.value = allTripsForStats.filter((t) => parseFloat(t.duration_hours) >= 48).length

      console.log(
        `统计数据 - 活跃: ${activeTrips.value}, 完成: ${completedTrips.value}, 延误: ${delayedTrips.value}`
      )
    } catch (err: any) {
      console.error('获取航次数据失败:', err)
      error.value = '获取航次数据失败，请检查后端服务是否正常运行'
      allFilteredTrips.value = []
      totalTrips.value = 0
    } finally {
      loading.value = false
    }
  }

  // 根据航次数据判断状态
  const getTripStatus = (trip: any) => {
    const duration = parseFloat(trip.duration_hours) || 0

    // 数据集参考时间：2025-01-01 12:00:00
    const referenceDate = new Date('2025-01-01 12:00:00')
    const tripStart = new Date(trip.trip_start)
    const tripEnd = new Date(trip.trip_end)

    // 判断航次状态：如果结束时间在参考时间之后，则为进行中；否则为已完成
    if (tripEnd > referenceDate) {
      // 进行中的航次，不再根据持续时间分类，统一为ongoing
      return 'ongoing'
    } else {
      // 已完成的航次
      if (duration >= 48) return 'long'
      if (duration >= 24) return 'completed'
      return 'short'
    }
  }

  // 获取航次类型标签（短航次或长航次）
  const getTripTypeLabel = (trip: any) => {
    const status = getTripStatus(trip)
    if (status === 'long') return '长航次'
    if (status === 'short') return '短航次'
    return '标准航次' // 对于completed状态
  }

  // 监听路由查询参数变化
  watch(
    () => route.query.search,
    (newSearch) => {
      if (newSearch && typeof newSearch === 'string') {
        searchKeyword.value = newSearch
        performSearch()
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    // 检查URL中是否有搜索参数
    if (route.query.search && typeof route.query.search === 'string') {
      searchKeyword.value = route.query.search
    }

    fetchData()
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

  /* 搜索和筛选网格 */
  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 14px;
  }

  .filter-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }

  .filter-select {
    width: 100%;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid #e9eefb;
    background: linear-gradient(180deg, #ffffff, #fbfdff);
    box-shadow: 0 8px 30px rgba(12, 20, 60, 0.03);
    transition: all 0.2s;
  }

  .filter-select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 8px 30px rgba(124, 87, 255, 0.1);
  }

  /* 统计卡片网格 */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
    margin: 18px 0;
  }

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
  }

  .stat-icon.trips {
    background: linear-gradient(135deg, #10b981, #14b8a6);
  }

  .stat-icon.active {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
  }

  .stat-icon.vessels {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
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

  /* 卡片样式 */
  .card {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 250, 255, 0.9));
    border-radius: var(--radius);
    padding: 18px;
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

  /* 响应式设计 */
  @media (max-width: 768px) {
    .filter-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
