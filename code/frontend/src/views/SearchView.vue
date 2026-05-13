<template>
  <div class="search-view">
    <!-- 搜索头部 -->
    <div class="search-header">
      <h1 class="search-title">全局搜索</h1>
      <p class="search-subtitle">快速查找船舶、锚地、航次等信息</p>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-controls">
        <!-- 搜索框 -->
        <div class="search-input-container">
          <SearchBar
            placeholder="输入船舶名称、MMSI、锚地名称等..."
            :enable-suggestions="true"
            search-type="all"
            @search="handleSearch"
            @result-selected="handleResultSelected"
            ref="searchBarRef"
          />
        </div>

        
      </div>

      <!-- 搜索状态 -->
      <div v-if="searchQuery" class="search-status">
        <div class="status-info">
          <span class="status-text">
            搜索 "<strong>{{ searchQuery }}</strong>" 的结果
          </span>
          <span class="result-count">
            共找到 {{ totalResults }} 条结果
          </span>
        </div>
        <div class="status-actions">
          <button @click="clearSearch" class="clear-search-btn">
            清空搜索
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <SkeletonLoader type="list" :rows="5" />
      </div>

      <!-- 结果分类标签 -->
      <div v-else-if="!loading && searchResults.length > 0" class="result-tabs">
        <button
          v-for="tab in resultTabs"
          :key="tab.key"
          @click="handleTabChange(tab.key)"
          class="tab-button"
          :class="{ active: activeTab === tab.key }"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- 结果列表 -->
      <div v-if="!loading && searchResults.length > 0" class="result-content">
        <!-- 船舶结果 -->
                <div v-if="activeTab === 'vessels'" class="result-section">
                  <h3 class="section-title">
                    <span class="section-icon">🚢</span>
                    船舶结果
                  </h3>
                  <div v-if="filteredResults.vessels.length > 0">
                    <div class="result-grid">
                      <div
                        v-for="vessel in paginatedResults"
                        :key="vessel.id"
                        class="result-card card-hover"
                        @click="navigateToDetail('vessels', vessel.id)"
                      >
                        <div class="card-header">
                          <div class="card-icon">🚢</div>
                          <div class="card-title">
                            <HighlightText :text="vessel.vessel_name || vessel.name || '未知船舶'" :query="searchQuery" />
                            <div class="card-subtitle">MMSI: {{ vessel.mmsi || 'N/A' }}</div>
                          </div>
                          <div class="card-status">
                            <span class="status-badge active">
                              活跃
                            </span>
                          </div>
                        </div>
                        <div class="card-content">
                                        <div class="info-row">
                                          <span class="info-label">船舶类型:</span>
                                          <span class="info-value">{{ vessel.type_name || vessel.type || '未知' }}</span>
                                        </div>
                                        <div class="info-row">
                                                          <span class="info-label">累计航行次数:</span>
                                                          <span class="info-value">{{ vessel.total_trips || '0' }} 次</span>
                                                        </div>                                      </div>                      </div>
                    </div>
                    
                    <!-- 船舶分页 -->
                    <div v-if="totalPages > 1" class="pagination-container">
                      <div class="pagination">
                        <button 
                          @click="goToFirstPage" 
                          :disabled="currentPage === 1"
                          class="pagination-btn"
                          title="首页"
                        >
                          ⏮️
                        </button>
                        <button 
                          @click="goToPrevPage" 
                          :disabled="currentPage === 1"
                          class="pagination-btn"
                          title="上一页"
                        >
                          ◀️
                        </button>
                        
                        <div class="pagination-pages">
                          <button
                            v-for="page in pageRange"
                            :key="page"
                            @click="goToPage(page)"
                            class="pagination-page"
                            :class="{ active: currentPage === page }"
                          >
                            {{ page }}
                          </button>
                        </div>
                        
                        <button 
                          @click="goToNextPage" 
                          :disabled="currentPage === totalPages"
                          class="pagination-btn"
                          title="下一页"
                        >
                          ▶️
                        </button>
                        <button 
                          @click="goToLastPage" 
                          :disabled="currentPage === totalPages"
                          class="pagination-btn"
                          title="末页"
                        >
                          ⏭️
                        </button>
                      </div>
                      <div class="pagination-info">
                        第 {{ currentPage }} 页，共 {{ totalPages }} 页 ({{ currentTabResults.length }} 条记录)
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-category-state">
                    <div class="empty-category-icon">🚢</div>
                    <h4 class="empty-category-title">未找到船舶结果</h4>
                    <p class="empty-category-description">
                      没有找到与 "{{ searchQuery }}" 相关的船舶信息
                    </p>
                    <div class="empty-category-suggestions">
                      <p>搜索建议:</p>
                      <ul>
                        <li>尝试使用船舶名称或MMSI号码搜索</li>
                        <li>检查关键词拼写是否正确</li>
                        <li>使用更通用的船舶类型关键词</li>
                      </ul>
                    </div>
                  </div>
                </div>
        <!-- 锚地结果 -->
        <div v-if="activeTab === 'anchorages'" class="result-section">
          <h3 class="section-title">
            <span class="section-icon">📍</span>
            锚地结果
          </h3>
          <div v-if="filteredResults.anchorages.length > 0">
            <div class="result-grid">
              <div
                v-for="anchorage in paginatedResults"
                :key="anchorage.id"
                class="result-card card-hover"
                @click="navigateToDetail('anchorages', anchorage.id)"
              >
                <div class="card-header">
                  <div class="card-icon">📍</div>
                  <div class="card-title">
                    <HighlightText :text="anchorage.anchorage_name || anchorage.name || '未知锚地'" :query="searchQuery" />
                    <div class="card-subtitle">区域: {{ anchorage.area_zone || anchorage.zone || '未知' }}</div>
                  </div>
                  <div class="card-status">
                    <span class="status-badge active">
                      活跃
                    </span>
                  </div>
                </div>
                <div class="card-content">
                  <div class="info-row">
                    <span class="info-label">类型:</span>
                    <span class="info-value">{{ anchorage.anchorage_type || anchorage.type || '未知' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">容量:</span>
                    <span class="info-value">{{ anchorage.capacity || 'N/A' }}</span>
                  </div>
                  <div class="info-row">
                                    <span class="info-label">当前占用:</span>
                                    <span class="info-value">{{ anchorage.current_occupied || anchorage.current_count || '0' }}</span>
                                  </div>                </div>
              </div>
            </div>
            
            <!-- 锚地分页 -->
            <div v-if="totalPages > 1" class="pagination-container">
              <div class="pagination">
                <button 
                  @click="goToFirstPage" 
                  :disabled="currentPage === 1"
                  class="pagination-btn"
                  title="首页"
                >
                  ⏮️
                </button>
                <button 
                  @click="goToPrevPage" 
                  :disabled="currentPage === 1"
                  class="pagination-btn"
                  title="上一页"
                >
                  ◀️
                </button>
                
                <div class="pagination-pages">
                  <button
                    v-for="page in pageRange"
                    :key="page"
                    @click="goToPage(page)"
                    class="pagination-page"
                    :class="{ active: currentPage === page }"
                  >
                    {{ page }}
                  </button>
                </div>
                
                <button 
                  @click="goToNextPage" 
                  :disabled="currentPage === totalPages"
                  class="pagination-btn"
                  title="下一页"
                >
                  ▶️
                </button>
                <button 
                  @click="goToLastPage" 
                  :disabled="currentPage === totalPages"
                  class="pagination-btn"
                  title="末页"
                >
                  ⏭️
                </button>
              </div>
              <div class="pagination-info">
                第 {{ currentPage }} 页，共 {{ totalPages }} 页 ({{ currentTabResults.length }} 条记录)
              </div>
            </div>
          </div>
          <div v-else class="empty-category-state">
            <div class="empty-category-icon">📍</div>
            <h4 class="empty-category-title">未找到锚地结果</h4>
            <p class="empty-category-description">
              没有找到与 "{{ searchQuery }}" 相关的锚地信息
            </p>
            <div class="empty-category-suggestions">
              <p>搜索建议:</p>
              <ul>
                <li>尝试使用锚地名称或区域搜索</li>
                <li>检查关键词拼写是否正确</li>
                <li>使用更通用的锚地类型关键词</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 航次结果 -->
        <div v-if="activeTab === 'trips'" class="result-section">
          <h3 class="section-title">
            <span class="section-icon">📊</span>
            航次结果
          </h3>
          <div v-if="filteredResults.trips.length > 0">
            <div class="result-grid">
              <div
                v-for="trip in paginatedResults"
                :key="trip.id"
                class="result-card card-hover"
                @click="navigateToDetail('trips', trip.id)"
              >
                <div class="card-header">
                  <div class="card-icon">📊</div>
                  <div class="card-title">
                    <HighlightText :text="`航次 #${trip.trip_id || trip.id}`" :query="searchQuery" />
                    <div class="card-subtitle">
                      <HighlightText :text="trip.vessel_name || '未知船舶'" :query="searchQuery" />
                    </div>
                  </div>
                  <div class="card-status">
                    <span class="status-badge active">
                      已完成
                    </span>
                  </div>
                </div>
                <div class="card-content">
                  <div class="info-row">
                    <span class="info-label">起点:</span>
                    <span class="info-value">
                      <HighlightText :text="trip.start_anchorage || '未知'" :query="searchQuery" />
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">终点:</span>
                    <span class="info-value">
                      <HighlightText :text="trip.end_anchorage || '未知'" :query="searchQuery" />
                    </span>
                  </div>
                  <div class="info-row">
                                    <span class="info-label">开始时间:</span>
                                    <span class="info-value">{{ formatDate(trip.trip_start) }}</span>
                                  </div>
                                  <div class="info-row">
                                    <span class="info-label">结束时间:</span>
                                    <span class="info-value">{{ formatDate(trip.trip_end) }}</span>
                                  </div>                </div>
              </div>
            </div>
            
            <!-- 航次分页 -->
            <div v-if="totalPages > 1" class="pagination-container">
              <div class="pagination">
                <button 
                  @click="goToFirstPage" 
                  :disabled="currentPage === 1"
                  class="pagination-btn"
                  title="首页"
                >
                  ⏮️
                </button>
                <button 
                  @click="goToPrevPage" 
                  :disabled="currentPage === 1"
                  class="pagination-btn"
                  title="上一页"
                >
                  ◀️
                </button>
                
                <div class="pagination-pages">
                  <button
                    v-for="page in pageRange"
                    :key="page"
                    @click="goToPage(page)"
                    class="pagination-page"
                    :class="{ active: currentPage === page }"
                  >
                    {{ page }}
                  </button>
                </div>
                
                <button 
                  @click="goToNextPage" 
                  :disabled="currentPage === totalPages"
                  class="pagination-btn"
                  title="下一页"
                >
                  ▶️
                </button>
                <button 
                  @click="goToLastPage" 
                  :disabled="currentPage === totalPages"
                  class="pagination-btn"
                  title="末页"
                >
                  ⏭️
                </button>
              </div>
              <div class="pagination-info">
                第 {{ currentPage }} 页，共 {{ totalPages }} 页 ({{ currentTabResults.length }} 条记录)
              </div>
            </div>
          </div>
          <div v-else class="empty-category-state">
            <div class="empty-category-icon">📊</div>
            <h4 class="empty-category-title">未找到航次结果</h4>
            <p class="empty-category-description">
              没有找到与 "{{ searchQuery }}" 相关的航次信息
            </p>
            <div class="empty-category-suggestions">
              <p>搜索建议:</p>
              <ul>
                <li>尝试使用航次ID或船舶名称搜索</li>
                <li>检查关键词拼写是否正确</li>
                <li>使用锚地名称搜索相关航次</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && searchQuery && searchResults.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">未找到相关结果</h3>
        <p class="empty-description">
          尝试使用不同的关键词或调整筛选条件
        </p>
        <div class="empty-suggestions">
          <h4>搜索建议:</h4>
          <ul>
            <li>检查拼写是否正确</li>
            <li>尝试使用更通用的关键词</li>
            <li>使用MMSI号码进行精确搜索</li>
            <li>调整高级筛选条件</li>
          </ul>
        </div>
      </div>

      <!-- 初始状态 -->
      <div v-else-if="!loading && !searchQuery" class="initial-state">
        <div class="initial-content">
          <div class="initial-header">
            <div class="initial-icon">🔍</div>
            <h3 class="initial-title">开始搜索</h3>
            <p class="initial-description">
              输入关键词搜索船舶、锚地或航次信息
            </p>
          </div>
          
          <div class="initial-features">
            <!-- 快速搜索 -->
            <div class="quick-searches">
              <h4>快速搜索:</h4>
              <div class="quick-search-tags">
                <button
                  v-for="tag in quickSearchTags"
                  :key="tag.query"
                  @click="quickSearch(tag.query)"
                  class="quick-search-tag"
                >
                  {{ tag.label }}
                </button>
              </div>
            </div>
            
            <!-- 搜索历史 -->
            <div class="search-history-section">
              <div class="history-header">
                <h4>搜索历史</h4>
                <button 
                  @click="clearSearchHistory" 
                  class="clear-history-btn"
                  v-if="searchHistoryList.length > 0"
                >
                  清空历史
                </button>
              </div>
              
              <div v-if="searchHistoryList.length > 0" class="history-grid">
                <div
                  v-for="(item, index) in searchHistoryList"
                  :key="index"
                  class="history-item"
                  @click="searchFromHistory(item)"
                >
                  <div class="history-icon">🕐</div>
                  <div class="history-content">
                    <div class="history-query">{{ item.query }}</div>
                    <div class="history-time">{{ formatHistoryTime(item.timestamp) }}</div>
                  </div>
                  <button 
                    @click.stop="removeHistoryItem(index)" 
                    class="history-remove-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div v-else class="empty-history">
                <div class="empty-history-icon">🔍</div>
                <p>暂无搜索历史</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiService } from '@/services/api'
import SearchBar from '@/components/SearchBar.vue'
import EnhancedDataTable from '@/components/ui/EnhancedDataTable.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import HighlightText from '@/components/HighlightText.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const searchQuery = ref('')
const loading = ref(false)
const searchResults = ref<any[]>([])
const activeTab = ref('vessels')

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(9) // 每页显示9个卡片，3x3网格

// 搜索历史数据
const searchHistoryList = ref<any[]>([])
const MAX_HISTORY_ITEMS = 10

// 组件引用
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null)

// 航次表格列
const tripColumns = [
  { key: 'trip_id', title: '航次ID', sortable: false },
  { key: 'vessel_name', title: '船舶名称', sortable: false },
  { key: 'start_anchorage', title: '起点锚地', sortable: false },
  { key: 'end_anchorage', title: '终点锚地', sortable: false },
  { key: 'start_time', title: '开始时间', sortable: false },
  { key: 'end_time', title: '结束时间', sortable: false }
]

// 快速搜索标签
const quickSearchTags = [
  { label: '渔船', query: '渔船' },
  { label: '停泊区', query: '停泊区' }
]

// 结果分类
const resultTabs = computed(() => [
  {
    key: 'vessels',
    label: '船舶',
    icon: '🚢',
    count: filteredResults.value.vessels.length
  },
  {
    key: 'anchorages',
    label: '锚地',
    icon: '📍',
    count: filteredResults.value.anchorages.length
  },
  {
    key: 'trips',
    label: '航次',
    icon: '📊',
    count: filteredResults.value.trips.length
  }
])

// 过滤结果
const filteredResults = computed(() => {
  const vessels = searchResults.value.filter(item => item.type === 'vessel')
  const anchorages = searchResults.value.filter(item => item.type === 'anchorage')
  const trips = searchResults.value.filter(item => item.type === 'trip')

  return {
    vessels,
    anchorages,
    trips,
    all: searchResults.value
  }
})

// 总结果数
const totalResults = computed(() => searchResults.value.length)

// 当前分类的结果
const currentTabResults = computed(() => {
  switch (activeTab.value) {
    case 'vessels':
      return filteredResults.value.vessels
    case 'anchorages':
      return filteredResults.value.anchorages
    case 'trips':
      return filteredResults.value.trips
    default:
      return []
  }
})

// 分页后的结果
const paginatedResults = computed(() => {
  const results = currentTabResults.value
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return results.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(currentTabResults.value.length / pageSize.value)
})

// 页码显示范围
const pageRange = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2 // 当前页前后显示的页数
  
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)
  
  // 确保显示足够的页码
  if (end - start < 2 * delta) {
    if (start === 1) {
      end = Math.min(total, start + 2 * delta)
    } else if (end === total) {
      start = Math.max(1, end - 2 * delta)
    }
  }
  
  const range = []
  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  
  return range
})

// 处理搜索
const handleSearch = async (query: string) => {
  if (!query.trim()) return

  searchQuery.value = query
  loading.value = true
  currentPage.value = 1 // 重置到第一页

  // 添加到搜索历史
  addSearchHistory(query)

  try {
    console.log('开始搜索:', query)
    
    // 并行搜索各类数据
    const [vesselRes, anchorageRes, tripRes] = await Promise.allSettled([
      apiService.vessels.search(query),
      apiService.anchorages.search(query),
      apiService.trips.search(query)
    ])

    console.log('搜索响应:', { vesselRes, anchorageRes, tripRes })

    // 处理船舶结果
    const vessels = vesselRes.status === 'fulfilled' 
      ? (vesselRes.value.data?.data || []).map((item: any) => ({ ...item, type: 'vessel', id: item.vessel_id || item.id, name: item.vessel_name || item.name }))
      : []

    // 处理锚地结果  
    const anchorages = anchorageRes.status === 'fulfilled'
      ? (anchorageRes.value.data?.data || []).map((item: any) => ({ ...item, type: 'anchorage', id: item.anchorage_id || item.id, name: item.anchorage_name || item.name }))
      : []

    // 处理航次结果
    const trips = tripRes.status === 'fulfilled'
      ? (tripRes.value.data?.data || []).map((item: any) => ({ ...item, type: 'trip', id: item.trip_id || item.id, name: `航次 #${item.trip_id || item.id}` }))
      : []

    // 合并结果
    const results = [...vessels, ...anchorages, ...trips]
    console.log('合并后的结果:', results)

    searchResults.value = results

    // 自动切换到有结果的标签页
    if (results.length > 0) {
      const firstResultType = results[0].type
      if (['vessels', 'anchorages', 'trips'].includes(firstResultType)) {
        activeTab.value = firstResultType
      }
    }
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}



// 处理结果选择
const handleResultSelected = (result: any) => {
  navigateToDetail(result.type, result.id)
}

// 导航到详情页
const navigateToDetail = (type: string, id: string | number) => {
  const routeMap = {
    vessels: '/vessels',
    anchorages: '/anchorages',
    trips: '/trips'
  }
  
  const routePath = routeMap[type as keyof typeof routeMap]
  if (routePath) {
    router.push(`${routePath}/${id}`)
  }
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  activeTab.value = 'vessels'
  currentPage.value = 1
  if (searchBarRef.value) {
    searchBarRef.value.clearSearch()
  }
}

// 快速搜索
const quickSearch = (query: string) => {
  if (searchBarRef.value) {
    searchBarRef.value.searchQuery = query
    handleSearch(query)
  }
}

// 分页相关方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const goToFirstPage = () => {
  currentPage.value = 1
}

const goToLastPage = () => {
  currentPage.value = totalPages.value
}

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// 切换标签时重置到第一页
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  currentPage.value = 1
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap = {
    active: '活跃',
    inactive: '非活跃',
    pending: '待处理',
    completed: '已完成'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

// 搜索历史相关方法
const loadSearchHistory = () => {
  try {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      searchHistoryList.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
    searchHistoryList.value = []
  }
}

const saveSearchHistory = () => {
  try {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

const addSearchHistory = (query: string) => {
  if (!query || query.trim().length === 0) return

  const trimmedQuery = query.trim()
  
  // 检查是否已存在相同的搜索
  const existingIndex = searchHistoryList.value.findIndex(
    item => item.query.toLowerCase() === trimmedQuery.toLowerCase()
  )
  
  // 如果存在，先删除旧的
  if (existingIndex > -1) {
    searchHistoryList.value.splice(existingIndex, 1)
  }
  
  // 添加到开头
  searchHistoryList.value.unshift({
    query: trimmedQuery,
    timestamp: Date.now()
  })
  
  // 限制历史记录数量
  if (searchHistoryList.value.length > MAX_HISTORY_ITEMS) {
    searchHistoryList.value = searchHistoryList.value.slice(0, MAX_HISTORY_ITEMS)
  }
  
  saveSearchHistory()
}

const removeHistoryItem = (index: number) => {
  searchHistoryList.value.splice(index, 1)
  saveSearchHistory()
}

const clearSearchHistory = () => {
  searchHistoryList.value = []
  saveSearchHistory()
}

const searchFromHistory = (item: any) => {
  if (searchBarRef.value) {
    searchBarRef.value.searchQuery = item.query
    handleSearch(item.query)
  }
}

const formatHistoryTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  // 加载搜索历史
  loadSearchHistory()
  
  // 检查URL参数
  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
    handleSearch(query)
  }
})
</script>

<style scoped>
.search-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  text-align: center;
  margin-bottom: 32px;
}

.search-title {
  font-size: 32px;
  font-weight: 700;
  color: #263444;
  margin-bottom: 8px;
}

.search-subtitle {
  font-size: 16px;
  color: #6b7280;
}

.search-section {
  margin-bottom: 32px;
}

.search-controls {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.search-input-container {
  flex: 1;
}

.search-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 8px;
  margin-top: 16px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-text {
  font-size: 14px;
  color: #263444;
}

.result-count {
  font-size: 14px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 4px 8px;
  border-radius: 4px;
}

.clear-search-btn {
  background: none;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.loading-container {
  padding: 20px;
}

.result-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: #f8f9ff;
}

.tab-button.active {
  border-bottom-color: #7c57ff;
  color: #7c57ff;
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 14px;
  font-weight: 500;
}

.tab-count {
  background: #e5e7eb;
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: #7c57ff;
  color: white;
}

.result-content {
  min-height: 400px;
}

.result-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #263444;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 20px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.result-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 20px;
}

.card-title {
  flex: 1;
}

.card-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #263444;
}

.card-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.card-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
}

.info-value {
  color: #263444;
  font-weight: 500;
}

.empty-state,
.initial-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon,
.initial-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title,
.initial-title {
  font-size: 24px;
  font-weight: 600;
  color: #263444;
  margin-bottom: 8px;
}

.empty-description,
.initial-description {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
}

.empty-suggestions {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.empty-suggestions h4 {
  font-size: 16px;
  font-weight: 600;
  color: #263444;
  margin-bottom: 8px;
}

.empty-suggestions ul {
  list-style: none;
  padding: 0;
}

.empty-suggestions li {
  padding: 4px 0;
  color: #6b7280;
}

.empty-suggestions li::before {
  content: '• ';
  color: #7c57ff;
  font-weight: bold;
}

.empty-category-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9ff;
  border-radius: 8px;
  border: 1px solid #e9eefb;
}

.empty-category-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-category-title {
  font-size: 18px;
  font-weight: 600;
  color: #263444;
  margin-bottom: 8px;
}

.empty-category-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
}

.empty-category-suggestions {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.empty-category-suggestions p {
  font-size: 14px;
  font-weight: 600;
  color: #263444;
  margin-bottom: 8px;
}

.empty-category-suggestions ul {
  list-style: none;
  padding: 0;
}

.empty-category-suggestions li {
  padding: 4px 0;
  color: #6b7280;
  font-size: 13px;
}

.empty-category-suggestions li::before {
  content: '• ';
  color: #7c57ff;
  font-weight: bold;
}

/* 分页样式 */
.pagination-container {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 8px;
  border: 1px solid #e9eefb;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: white;
  border: 1px solid #e9eefb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.pagination-btn:hover:not(:disabled) {
  background: #7c57ff;
  border-color: #7c57ff;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  background: white;
  border: 1px solid #e9eefb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  padding: 0 8px;
}

.pagination-page:hover {
  background: #f8f9ff;
  border-color: #7c57ff;
  color: #7c57ff;
}

.pagination-page.active {
  background: #7c57ff;
  border-color: #7c57ff;
  color: white;
}

.pagination-info {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

/* 搜索历史样式 */
.initial-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.initial-header {
  text-align: center;
}

.initial-features {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.search-history-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e9eefb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff, #f0f1ff);
  border-bottom: 1px solid #e9eefb;
}

.history-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #263444;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #7c57ff;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background: rgba(124, 87, 255, 0.1);
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9ff;
  border: 1px solid #e9eefb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #eef2ff;
  border-color: #7c57ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(124, 87, 255, 0.15);
}

.history-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9eefb;
  border-radius: 6px;
  margin-right: 12px;
  font-size: 14px;
}

.history-content {
  flex: 1;
}

.history-query {
  font-weight: 500;
  color: #263444;
  font-size: 14px;
  margin-bottom: 2px;
}

.history-time {
  color: #6b7280;
  font-size: 12px;
}

.history-remove-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0;
}

.history-item:hover .history-remove-btn {
  opacity: 1;
}

.history-remove-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-history-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-history p {
  margin: 0;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-grid {
    grid-template-columns: 1fr;
  }
  
  .initial-features {
    gap: 24px;
  }
}

.quick-searches {
  max-width: 600px;
  margin: 0 auto;
}

.quick-searches h4 {
  font-size: 16px;
  font-weight: 600;
  color: #263444;
  margin-bottom: 12px;
}

.quick-search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-search-tag {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-search-tag:hover {
  background: #7c57ff;
  color: white;
  border-color: #7c57ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
  }
  
  .result-grid {
    grid-template-columns: 1fr;
  }
  
  .result-tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>