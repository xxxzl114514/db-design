<template>
  <div class="w-full animate-fade-in">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">锚地管理</h1>
      <p class="text-gray-600 dark:text-gray-400">查看和管理所有锚地及港口信息</p>
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
          <label class="filter-label">搜索锚地</label>
          <div class="relative">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="锚地名称、位置、类型..."
              class="filter-select"
              @keyup.enter="performSearch"
            />
          </div>
        </div>

        <div>
          <label class="filter-label">锚地类型</label>
          <select v-model="anchorageType" class="filter-select">
            <option value="">全部类型</option>
            <option value="港口">港口</option>
            <option value="锚地">锚地</option>
            <option value="码头区">码头区</option>
            <option value="停泊区">停泊区</option>
            <option value="港区">港区</option>
          </select>
        </div>

        <div>
          <label class="filter-label">所在区域</label>
          <select v-model="zoneFilter" class="filter-select">
            <option value="">全部区域</option>
            <option value="南区">南区</option>
            <option value="西区">西区</option>
            <option value="北区">北区</option>
            <option value="东区">东区</option>
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
        <div class="stat-icon">📍</div>
        <div>
          <p class="stat-label">总锚地数</p>
          <p class="stat-value">{{ totalAnchorages }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon occupied">✅</div>
        <div>
          <p class="stat-label">已占用</p>
          <p class="stat-value">{{ anchorageStats.occupied || 0 }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon available">⬆️</div>
        <div>
          <p class="stat-label">可用</p>
          <p class="stat-value">{{ anchorageStats.available || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- 锚地列表 -->
    <section class="card">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h4 style="margin-top: 0">锚地列表</h4>
        <button @click="loadAnchorages" :disabled="loading" class="icon-btn">
          <span v-if="loading" class="animate-spin">🔄</span>
          <span v-else>🔄</span>
          刷新
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-500">加载中...</p>
      </div>

      <div v-else-if="anchorages.length === 0" class="text-center py-8">
        <div
          class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <div class="text-4xl text-gray-400">⚓</div>
        </div>
        <p class="text-gray-500 text-lg">暂无锚地数据</p>
        <p class="text-gray-400 text-sm mt-2">请尝试调整筛选条件</p>
      </div>

      <!-- 锚地卡片网格布局 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="anchorage in paginatedAnchorages"
          :key="anchorage.id"
          class="group bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700"
        >
          <!-- 锚地卡片头部 -->
          <div
            class="relative p-6 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white"
          >
            <div class="absolute top-4 right-4">
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/20 text-white ring-1 ring-white/30"
              >
                {{ getAnchorageTypeLabel(anchorage.type) }}
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
                <h3 class="text-xl font-bold text-white">{{ anchorage.name || '未知锚地' }}</h3>
                <p class="text-white/80 text-sm">{{ anchorage.zone || '未知区域' }}</p>
              </div>
            </div>
          </div>

          <!-- 锚地详细信息 -->
          <div class="p-6 space-y-4">
            <!-- 锚地信息网格 -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">锚地类型</p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ getAnchorageTypeLabel(anchorage.type) }}
                </p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">容量</p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ anchorage.capacity || 0 }}
                </p>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 pt-2">
              <button
                @click="viewAnchorageDetails(anchorage.id)"
                class="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm flex items-center justify-center"
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
          {{ Math.min(currentPage * pageSize, anchorages.length) }} 条记录，共
          {{ anchorages.length }} 条
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
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
            class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
          >
            ◀️ 上一页
          </button>
          <div
            class="flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg shadow-md"
          >
            <span class="font-bold text-sm">{{ currentPage }}</span>
            <span class="mx-2 text-white/80">/</span>
            <span class="font-medium text-sm text-white/90">{{ totalPages }}</span>
          </div>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
          >
            下一页 ▶️
          </button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
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
    { key: 'name', title: '名称', sortable: true },
    { key: 'type', title: '类型', sortable: true },
    { key: 'zone', title: '区域', sortable: true },
    { key: 'capacity', title: '容量', sortable: true },
    { key: 'occupied_capacity', title: '已用容量', sortable: true },
    { key: 'occupancy_rate', title: '繁忙程度', sortable: true },
    { key: 'last_activity', title: '最近活动', sortable: true },
    { key: 'actions', title: '操作', sortable: false }
  ]

  interface Anchorage {
    id: number | string
    name?: string
    location?: string
    type?: string
    zone?: string
    capacity?: number
    occupied_capacity?: number
    occupancy_rate?: number
    last_activity?: string
  }

  interface AnchorageStats {
    total: number
    occupied: number
    available: number
    maintenance: number
  }

  // 筛选和分页状态
  const searchKeyword = ref('')
  const anchorageType = ref('')
  const zoneFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(9) // 卡片布局使用3x3网格
  const totalPages = ref(1)
  const totalAnchorages = ref(0)

  // 锚地列表
  const anchorages = ref<Anchorage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 统计数据
  const anchorageStats = ref<AnchorageStats>({
    total: 0,
    occupied: 0,
    available: 0,
    maintenance: 0
  })

  // 计算分页数据
  const paginatedAnchorages = computed(() => {
    // 直接返回当前页的数据，分页已在fetchData中处理
    return anchorages.value
  })

  // 计算总页数
  const totalPagesComputed = computed(() => {
    return Math.ceil(totalAnchorages.value / pageSize.value)
  })

  // 监听总页数变化
  watch(totalPagesComputed, (newVal) => {
    totalPages.value = newVal
    if (currentPage.value > newVal) {
      currentPage.value = 1
    }
  })

  const getAnchorageTypeLabel = (type?: string) => {
    if (!type || typeof type !== 'string') return '未知类型'

    const labels: Record<string, string> = {
      港口: '港口',
      锚地: '锚地',
      码头区: '码头区',
      停泊区: '停泊区',
      港区: '港区',
      port: '港口',
      anchorage: '锚地',
      terminal: '码头区',
      harbor: '港湾'
    }

    return labels[type] || type || '未知类型'
  }

  const getAnchorageStatusLabel = (occupancyRate?: number) => {
    if (occupancyRate === null || occupancyRate === undefined || isNaN(occupancyRate)) return '未知'
    const rate = Number(occupancyRate)
    if (rate < 30) return '空闲'
    if (rate < 70) return '正常'
    if (rate < 90) return '繁忙'
    return '满载'
  }

  const getOccupancyClass = (rate?: number) => {
    if (rate === null || rate === undefined || isNaN(rate)) return 'bg-gray-500'
    const numRate = Number(rate)
    if (numRate < 30) return 'bg-green-500'
    if (numRate < 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getCurrentOccupancyRate = (anchorage: Anchorage) => {
    const capacity = anchorage.capacity || 100
    const occupied = anchorage.current_occupied || anchorage.current_count || 0
    return Math.round((occupied / capacity) * 100)
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '暂无数据'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '暂无数据'

      // 检查是否是数据导入日期 2025/11/13
      const formattedDate = date.toLocaleDateString('zh-CN')
      if (formattedDate === '2025/11/13') {
        return '暂无数据'
      }

      // 检查是否是无效或默认日期
      if (formattedDate === '1970/1/1' || formattedDate === '1/1/1970') {
        return '暂无数据'
      }

      return formattedDate
    } catch (err) {
      console.error('日期格式化错误:', err, dateString)
      return '暂无数据'
    }
  }

  const performSearch = async () => {
    currentPage.value = 1
    await fetchData()
  }

  const resetFilters = async () => {
    searchKeyword.value = ''
    anchorageType.value = ''
    zoneFilter.value = ''
    currentPage.value = 1
    await fetchData()
  }

  const viewAnchorageDetails = (id: string | number) => {
    router.push(`/anchorages/${id}`)
  }

  const loadAnchorages = async () => {
    await fetchData()
  }

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      let response

      let allResults: any[] = []

      // 如果有任何筛选条件，先获取所有数据进行前端筛选
      if (searchKeyword.value.trim() || anchorageType.value || zoneFilter.value) {
        console.log(
          `应用筛选条件 - 搜索: ${searchKeyword.value}, 类型: ${anchorageType.value}, 区域: ${zoneFilter.value}`
        )

        // 获取所有锚地数据作为筛选基础
        const allResponse = await apiService.anchorages.getAll(10000, 0)
        allResults = allResponse.data?.data || []

        // 应用搜索关键词筛选
        if (searchKeyword.value.trim()) {
          const keyword = searchKeyword.value.trim().toLowerCase()
          allResults = allResults.filter((anchorage: any) => {
            return (
              (anchorage.anchorage_name &&
                anchorage.anchorage_name.toLowerCase().includes(keyword)) ||
              (anchorage.area_zone && anchorage.area_zone.toLowerCase().includes(keyword)) ||
              (anchorage.anchorage_type && anchorage.anchorage_type.toLowerCase().includes(keyword))
            )
          })
          console.log(`搜索关键词筛选后: ${allResults.length} 条`)
        }

        // 应用锚地类型筛选
        if (anchorageType.value) {
          allResults = allResults.filter((anchorage: any) => {
            return anchorage.anchorage_type === anchorageType.value
          })
          console.log(`锚地类型筛选后: ${allResults.length} 条`)
        }

        // 应用区域筛选
        if (zoneFilter.value) {
          allResults = allResults.filter((anchorage: any) => {
            return anchorage.area_zone === zoneFilter.value
          })
          console.log(`区域筛选后: ${allResults.length} 条`)
        }

        // 进行前端分页
        const startIndex = (currentPage.value - 1) * pageSize.value
        const endIndex = startIndex + pageSize.value
        const paginatedResults = allResults.slice(startIndex, endIndex)

        // 构造响应对象以保持兼容性
        response = {
          data: {
            data: paginatedResults,
            pagination: {
              total: allResults.length,
              count: paginatedResults.length,
              offset: startIndex,
              limit: pageSize.value
            }
          }
        }

        console.log(
          `最终筛选结果: ${allResults.length} 条，当前页显示: ${paginatedResults.length} 条`
        )
      }
      // 否则获取所有数据（使用后端分页）
      else {
        const offset = (currentPage.value - 1) * pageSize.value
        console.log('获取所有锚地数据...')
        response = await apiService.anchorages.getAll(null, offset)
      }

      // 检查响应数据结构
      if (!response || !response.data) {
        throw new Error('API响应数据格式错误')
      }

      const apiAnchorages = response.data.data || []
      console.log(`获取到锚地数据: ${apiAnchorages.length} 条`)

      // 检查数据是否为数组
      if (!Array.isArray(apiAnchorages)) {
        console.error('API返回的数据不是数组:', apiAnchorages)
        anchorages.value = []
        totalAnchorages.value = 0
        return
      }

      // 转换API数据以匹配前端结构，使用后端返回的current_count字段
      anchorages.value = apiAnchorages
        .map((anchorage: any) => {
          try {
            // 使用后端返回的current_count字段
            const currentVessels = anchorage.current_count || 0
            const capacity = anchorage.capacity || 100

            console.log(
              `锚地 ${anchorage.anchorage_name}: current_count=${currentVessels}, capacity=${capacity}`
            )

            return {
              id: anchorage.anchorage_id || anchorage.id || '',
              name: anchorage.anchorage_name || anchorage.name || '未知锚地',
              type: anchorage.anchorage_type || anchorage.type || '锚地',
              zone: anchorage.area_zone || anchorage.zone || '未知区域',
              zone_number: anchorage.zone_number || '',
              capacity: capacity,
              current_occupied: currentVessels,
              current_count: currentVessels,
              occupancy_rate: Math.round((currentVessels / capacity) * 100),
              last_activity: anchorage.updated_at || new Date().toISOString()
            }
          } catch (err) {
            console.error('转换锚地数据时出错:', err, anchorage)
            return {
              id: '',
              name: '数据错误',
              type: '锚地',
              zone: '未知区域',
              zone_number: '',
              capacity: 100,
              current_occupied: 0,
              current_count: 0,
              occupancy_rate: 0,
              last_activity: new Date().toISOString()
            }
          }
        })
        .filter((item) => item.id !== '') // 过滤掉无效数据

      // 设置总锚地数 - 如果有筛选条件，使用筛选后的总数，否则使用后端返回的总数
      if (searchKeyword.value.trim() || anchorageType.value || zoneFilter.value) {
        totalAnchorages.value = response.data?.pagination?.total || anchorages.value.length
      } else {
        totalAnchorages.value = response.data?.pagination?.total || anchorages.value.length
      }

      // 更新统计数据
      anchorageStats.value = {
        total: anchorages.value.length,
        occupied: anchorages.value.filter((a) => (a.occupancy_rate || 0) > 30).length,
        available: anchorages.value.filter((a) => (a.occupancy_rate || 0) <= 30).length,
        maintenance: 0 // 数据库中没有维护状态字段
      }
    } catch (err: any) {
      console.error('获取锚地数据失败:', err)
      // 区分不同类型的错误
      if (
        err.code === 'ER_MALFORMED_PACKET' ||
        err.message?.includes('Malformed communication packet')
      ) {
        error.value = '数据库通信错误，请稍后重试'
      } else if (err.response?.status === 429) {
        error.value = '请求过于频繁，请稍后重试'
      } else {
        error.value = `获取锚地数据失败: ${err.message || '请检查后端服务是否正常运行'}`
      }
      anchorages.value = []
      totalAnchorages.value = 0
    } finally {
      loading.value = false
    }
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

  /* 欢迎卡片样式 */
  .welcome {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .welcome .art {
    width: 180px;
    height: 120px;
    border-radius: 14px;
    background: linear-gradient(180deg, #fff6f8, #f9fbff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    font-weight: 800;
    font-size: 18px;
    box-shadow: 0 18px 40px rgba(124, 87, 255, 0.08);
  }

  .welcome h3 {
    margin: 0;
    font-size: 20px;
  }

  .welcome p {
    margin: 8px 0 0;
    color: var(--muted);
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
    .welcome {
      flex-direction: column;
      text-align: center;
    }

    .filter-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
