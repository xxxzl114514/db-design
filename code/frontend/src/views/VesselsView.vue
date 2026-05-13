<template>
  <div class="w-full animate-fade-in">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">船舶管理</h1>
      <p class="text-gray-600 dark:text-gray-400">查看和管理所有注册船舶的信息</p>
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
          <label class="filter-label">搜索船舶</label>
          <div class="relative">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="船舶名称、MMSI、类型..."
              class="filter-select"
              @keyup.enter="performSearch"
            />
          </div>
        </div>

        <div>
          <label class="filter-label">船舶类型</label>
          <select v-model="vesselType" class="filter-select">
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
          <label class="filter-label">船舶分类</label>
          <select v-model="vesselCategory" class="filter-select">
            <option value="">全部分类</option>
            <option value="货运船舶">货运船舶</option>
            <option value="客运船舶">客运船舶</option>
            <option value="渔业船舶">渔业船舶</option>
            <option value="辅助船舶">辅助船舶</option>
          </select>
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
        <div class="stat-icon">🚢</div>
        <div>
          <p class="stat-label">总船舶数</p>
          <p class="stat-value">{{ totalVessels }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon active">⚡</div>
        <div>
          <p class="stat-label">活跃船舶</p>
          <p class="stat-value">{{ activeVessels }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon anchorages">👥</div>
        <div>
          <p class="stat-label">航行中</p>
          <p class="stat-value">{{ sailingVessels }}</p>
        </div>
      </div>
    </div>

    <!-- 船舶列表 -->
    <section class="card">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h4 style="margin-top: 0">船舶列表</h4>
        <button @click="loadVessels" :disabled="loading" class="icon-btn">
          <span v-if="loading" class="animate-spin">🔄</span>
          <span v-else>🔄</span>
          刷新
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-500">加载中...</p>
      </div>

      <div v-else-if="vessels.length === 0" class="text-center py-8">
        <div
          class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <div class="text-4xl text-gray-400">🚢</div>
        </div>
        <p class="text-gray-500 text-lg">暂无船舶数据</p>
        <p class="text-gray-400 text-sm mt-2">请尝试调整筛选条件</p>
      </div>

      <div v-else>
        <!-- 船舶卡片网格布局 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="vessel in paginatedVessels"
            :key="vessel.id"
            class="group bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700"
          >
            <!-- 船舶卡片头部 -->
            <div
              class="relative p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            >
              <div class="absolute top-4 right-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm',
                    getVesselStatusClass(vessel.status)
                  ]"
                >
                  {{ getStatusLabel(vessel.status) }}
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">{{ vessel.name || '未知船舶' }}</h3>
                  <p class="text-white/80 text-sm">MMSI: {{ vessel.mmsi || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- 船舶详细信息 -->
            <div class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">船舶类型</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ getVesselTypeLabel(vessel.type) }}
                  </p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">当前位置</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ vessel.current_status || '未知' }}
                  </p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">累计航行次数</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ vessel.total_trips || 0 }}次
                  </p>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-2 pt-2">
                <button
                  @click="viewVesselDetails(vessel.id)"
                  class="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm flex items-center justify-center"
                >
                  👁️ 查看详情
                </button>
                <button
                  class="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  🔗
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
            {{ Math.min(currentPage * pageSize, vessels.length) }} 条记录，共
            {{ totalRecords || vessels.length }} 条
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
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
              class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              ◀️ 上一页
            </button>
            <div
              class="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md"
            >
              <span class="font-bold text-sm">{{ currentPage }}</span>
              <span class="mx-2 text-white/80">/</span>
              <span class="font-medium text-sm text-white/90">{{ totalPages }}</span>
            </div>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              下一页 ▶️
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
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

  // 定义表格列
  const tableColumns = [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'name', title: '名称', sortable: true },
    { key: 'mmsi', title: 'MMSI', sortable: true },
    { key: 'type', title: '类型', sortable: true },
    { key: 'length', title: '长度(m)', sortable: true },
    { key: 'dwt', title: '载重(吨)', sortable: true },
    { key: 'status', title: '状态', sortable: true },
    { key: 'last_position', title: '最后位置', sortable: true },
    { key: 'actions', title: '操作', sortable: false }
  ]

  interface Vessel {
    id: number | string
    name?: string
    mmsi?: string
    type?: string
    length?: number
    dwt?: number
    status?: string
    last_position?: string
  }

  // 船舶列表
  const vessels = ref<Vessel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 筛选和分页状态
  const searchKeyword = ref('')
  const vesselType = ref('')
  const vesselCategory = ref('')
  const currentPage = ref(1)
  const pageSize = ref(9) // 卡片布局使用3x3网格
  const totalPages = ref(1)
  const totalVessels = ref(0)
  const totalRecords = ref(0) // 用于保存总记录数

  // 统计数据
  const activeVessels = ref(0)
  const cargoVessels = ref(0)
  const sailingVessels = ref(0)

  // 计算总页数
  const totalPagesComputed = computed(() => {
    return Math.ceil(totalRecords.value / pageSize.value)
  })

  // 计算分页数据
  const paginatedVessels = computed(() => {
    // 直接返回当前页的数据
    return vessels.value
  })

  // 监听总页数变化
  watch(totalPagesComputed, (newVal) => {
    totalPages.value = newVal
    if (currentPage.value > newVal) {
      currentPage.value = 1
    }
  })

  const getVesselTypeLabel = (type?: string) => {
    if (!type) return '未知类型'
    const labels: Record<string, string> = {
      货轮: '货轮',
      油轮: '油轮',
      客轮: '客轮',
      渔船: '渔船',
      拖船: '拖船',
      集装箱船: '集装箱船',
      散货船: '散货船',
      邮轮: '邮轮'
    }
    return labels[type] || type
  }

  const getStatusLabel = (status?: string) => {
    if (!status) return '未知'
    const labels: Record<string, string> = {
      active: '活跃',
      inactive: '非活跃',
      sailing: '航行中',
      anchored: '锚泊',
      maintenance: '维护中'
    }
    return labels[status] || status
  }

  const getStatusClass = (status?: string) => {
    if (!status)
      return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900/30 dark:to-gray-800/30 dark:text-gray-300'
    const classes: Record<string, string> = {
      active:
        'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300',
      inactive:
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900/30 dark:to-gray-800/30 dark:text-gray-300',
      sailing:
        'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300',
      anchored:
        'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-300',
      maintenance:
        'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300'
    }
    return (
      classes[status] ||
      'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900/30 dark:to-gray-800/30 dark:text-gray-300'
    )
  }

  const getVesselStatusClass = (status?: string) => {
    if (!status) return 'bg-white/20 text-white'
    const classes: Record<string, string> = {
      active: 'bg-green-500/20 text-green-100 ring-1 ring-green-400/50',
      inactive: 'bg-gray-500/20 text-gray-100 ring-1 ring-gray-400/50',
      sailing: 'bg-blue-500/20 text-blue-100 ring-1 ring-blue-400/50',
      anchored: 'bg-yellow-500/20 text-yellow-100 ring-1 ring-yellow-400/50',
      maintenance: 'bg-red-500/20 text-red-100 ring-1 ring-red-400/50'
    }
    return classes[status] || 'bg-white/20 text-white'
  }

  const performSearch = async () => {
    currentPage.value = 1
    await fetchData()
  }

  const resetFilters = async () => {
    searchKeyword.value = ''
    vesselType.value = ''
    vesselCategory.value = ''
    currentPage.value = 1
    totalRecords.value = 0
    await fetchData()
  }

  const viewVesselDetails = (id: string | number) => {
    router.push(`/vessels/${id}`)
  }

  const loadVessels = async () => {
    await fetchData()
  }

  const fetchGlobalStats = async () => {
    try {
      // 获取船舶类型统计
      const vesselResponse = await apiService.vessels.getStats()
      const vesselStats = vesselResponse.data?.data || []

      // 计算总船舶数
      totalVessels.value = vesselStats.reduce(
        (sum: number, stat: any) => sum + stat.vessel_count,
        0
      )

      // 所有船舶都视为活跃
      activeVessels.value = totalVessels.value

      // 计算货船数量（包括所有货运类型的船舶）
      cargoVessels.value = vesselStats
        .filter((stat: any) => ['货轮', '集装箱船', '散货船'].includes(stat.type_name))
        .reduce((sum: number, stat: any) => sum + stat.vessel_count, 0)

      // 获取当前活跃航次数量（即航行中的船舶数量）
      try {
        const tripsResponse = await apiService.trips.getCurrentTrips()
        sailingVessels.value = tripsResponse.data?.count || 0
      } catch (tripsError) {
        console.warn('获取航行中船舶数量失败，使用估算值:', tripsError)
        sailingVessels.value = Math.floor(totalVessels.value * 0.3) // 估算值
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      let response
      let vesselsData

      let allResults: any[] = []

      // 如果有任何筛选条件，先获取所有数据进行前端筛选
      if (searchKeyword.value.trim() || vesselType.value || vesselCategory.value) {
        // 获取所有船舶数据作为筛选基础
        const allResponse = await apiService.vessels.getAll(10000, 0)
        allResults = allResponse.data?.data || []

        // 为所有船舶获取位置和航行次数
        const vesselsWithIds = allResults.filter((v) => v.vessel_id || v.id)
        if (vesselsWithIds.length > 0) {
          const positionResponse = await apiService.vessels.getAllVesselsPositionAndTrips()
          const positionData = positionResponse.data?.data || []

          // 合并位置和航行次数数据
          allResults = allResults.map((vessel: any) => {
            const positionInfo = positionData.find(
              (p) => p.vessel_id === (vessel.vessel_id || vessel.id)
            )
            return {
              ...vessel,
              current_status: positionInfo?.current_status || '未知',
              total_trips: positionInfo?.total_trips || 0
            }
          })
        }

        // 应用搜索关键词筛选
        if (searchKeyword.value.trim()) {
          const keyword = searchKeyword.value.trim().toLowerCase()
          allResults = allResults.filter((vessel: any) => {
            return (
              (vessel.vessel_name && vessel.vessel_name.toLowerCase().includes(keyword)) ||
              (vessel.mmsi && vessel.mmsi.toString().includes(keyword)) ||
              (vessel.type_name && vessel.type_name.toLowerCase().includes(keyword))
            )
          })
          console.log(`搜索关键词筛选后: ${allResults.length} 条`)
        }

        // 应用船舶类型筛选
        if (vesselType.value) {
          allResults = allResults.filter((vessel: any) => {
            return vessel.type_name === vesselType.value
          })
          console.log(`船舶类型筛选后: ${allResults.length} 条`)
        }

        // 应用船舶分类筛选
        if (vesselCategory.value) {
          allResults = allResults.filter((vessel: any) => {
            return vessel.type_category === vesselCategory.value
          })
          console.log(`船舶分类筛选后: ${allResults.length} 条`)
        }

        // 设置总记录数
        totalRecords.value = allResults.length

        // 进行前端分页
        const startIndex = (currentPage.value - 1) * pageSize.value
        const endIndex = startIndex + pageSize.value
        vesselsData = allResults.slice(startIndex, endIndex)

        console.log(`最终筛选结果: ${totalRecords.value} 条，当前页显示: ${vesselsData.length} 条`)
      }
      // 否则获取所有数据（使用后端分页）
      else {
        // 使用后端分页获取数据
        const offset = (currentPage.value - 1) * pageSize.value
        const response = await apiService.vessels.getAll(pageSize.value, offset)
        vesselsData = response.data?.data || []

        // 保存总记录数用于分页控件
        totalRecords.value = response.data?.pagination?.total || vesselsData.length

        // 为每页数据获取位置和航行次数
        const vesselsWithIds = vesselsData.filter((v) => v.vessel_id || v.id)
        if (vesselsWithIds.length > 0) {
          const positionResponse = await apiService.vessels.getAllVesselsPositionAndTrips()
          const positionData = positionResponse.data?.data || []

          // 合并位置和航行次数数据
          vesselsData = vesselsData.map((vessel: any) => {
            const positionInfo = positionData.find(
              (p) => p.vessel_id === (vessel.vessel_id || vessel.id)
            )
            return {
              ...vessel,
              current_status: positionInfo?.current_status || '未知',
              total_trips: positionInfo?.total_trips || 0
            }
          })
        }
      }

      console.log(
        `当前页: ${currentPage.value}, 每页大小: ${pageSize.value}, 总记录数: ${totalRecords.value}`
      )

      // 转换API数据以匹配前端结构
      vessels.value = vesselsData.map((vessel: any) => ({
        id: vessel.vessel_id || vessel.id,
        name: vessel.vessel_name || vessel.name,
        mmsi: vessel.mmsi,
        type: vessel.type_name || vessel.vessel_type || vessel.type || '货轮',
        type_category: vessel.type_category || '货运船舶',
        length: vessel.length || 0,
        dwt: vessel.dwt || 0,
        status: 'active', // 数据库中没有status字段，设为默认值
        current_status: vessel.current_status || '未知',
        total_trips: vessel.total_trips || 0
      }))

      console.log(`处理后船舶数组长度: ${vessels.value.length}`)

      // 获取统计数据 - 搜索时显示搜索结果统计，否则显示全局统计
      if (searchKeyword.value.trim() || vesselType.value || vesselCategory.value) {
        // 搜索或筛选时，使用当前结果的统计
        totalVessels.value = totalRecords.value
        activeVessels.value = vessels.value.length // 当前显示的船舶数视为活跃

        // 计算各类型船舶数量
        cargoVessels.value = vessels.value.filter((vessel) =>
          ['货轮', '集装箱船', '散货船', '油轮'].includes(vessel.type)
        ).length

        sailingVessels.value = vessels.value.filter(
          (vessel) => vessel.current_status === '航行中'
        ).length

        console.log(
          `搜索统计数据 - 总数: ${totalVessels.value}, 活跃: ${activeVessels.value}, 货船: ${cargoVessels.value}, 航行中: ${sailingVessels.value}`
        )
      } else {
        // 非搜索时，获取全局统计数据
        await fetchGlobalStats()
      }
    } catch (err: any) {
      console.error('获取船舶数据失败:', err)
      error.value = '获取船舶数据失败，请检查后端服务是否正常运行'
      vessels.value = []
      totalVessels.value = 0
    } finally {
      loading.value = false
    }
  }

  // 监听页码变化
  watch(currentPage, () => {
    fetchData()
  })

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
