<template>
  <div class="search-container">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        @keyup.enter="handleSearch"
        @input="handleInput"
      />
      <button @click="handleSearch" :disabled="loading" class="search-button">
        <span v-if="loading" class="animate-spin">🔄</span>
        <span v-else>🔍</span>
      </button>
    </div>

    <!-- 搜索建议下拉框 -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
      <!-- 搜索历史 -->
      <SearchHistory 
        v-if="!searchQuery || searchQuery.length < 2"
        @select-history="selectHistoryItem"
        ref="searchHistoryRef"
      />
      
      <!-- 搜索建议 -->
      <div v-if="searchQuery && searchQuery.length >= 2">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          <div class="suggestion-icon">
            {{ getSuggestionIcon(suggestion.type) }}
          </div>
          <div class="suggestion-content">
            <div class="suggestion-title">
              <HighlightText :text="suggestion.title" :query="searchQuery" />
            </div>
            <div class="suggestion-subtitle">
              <HighlightText :text="suggestion.subtitle" :query="searchQuery" />
            </div>
          </div>
          <div class="suggestion-type">
            {{ getSuggestionTypeLabel(suggestion.type) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { apiService } from '@/services/api'
  import SearchHistory from './SearchHistory.vue'
  import HighlightText from './HighlightText.vue'

  interface SearchSuggestion {
    id: string | number
    title: string
    subtitle: string
    type: 'vessel' | 'anchorage' | 'trip'
    data: any
  }

  const props = defineProps<{
    placeholder?: string
    enableSuggestions?: boolean
    searchType?: 'all' | 'vessels' | 'anchorages' | 'trips'
  }>()

  const emit = defineEmits<{
    search: [query: string]
    resultSelected: [result: any]
  }>()

  const router = useRouter()
  const searchQuery = ref('')
  const loading = ref(false)
  const suggestions = ref<SearchSuggestion[]>([])
  const showSuggestions = ref(false)
  const searchHistoryRef = ref<InstanceType<typeof SearchHistory> | null>(null)

  const placeholder = computed(() => {
    return props.placeholder || '搜索船舶、锚地、航次...'
  })

  const handleInput = async () => {
    if (!props.enableSuggestions) {
      return
    }

    if (searchQuery.value.trim().length < 2) {
      suggestions.value = []
      showSuggestions.value = false
      return
    }

    try {
      loading.value = true
      const query = searchQuery.value.trim()
      suggestions.value = []

      // 检测是否为MMSI格式（9位数字）
      const isMMSI = /^\d{9}$/.test(query)

      // 根据搜索类型获取建议
      if (props.searchType === 'all' || props.searchType === 'vessels') {
        try {
          console.log('正在搜索船舶:', query)
          const vesselResponse = await apiService.vessels.search(query, 5)
          console.log('船舶搜索结果:', vesselResponse.data)
          const vesselSuggestions = (vesselResponse.data?.data || []).map((vessel: any) => ({
            id: vessel.vessel_id || vessel.id,
            title:
              isMMSI && vessel.mmsi === query
                ? `MMSI: ${vessel.mmsi}`
                : vessel.vessel_name || vessel.name || '未知船舶',
            subtitle:
              isMMSI && vessel.mmsi === query
                ? `船舶名称: ${vessel.vessel_name || vessel.name || '未知'} | 类型: ${vessel.type_name || vessel.type || '未知'}`
                : `MMSI: ${vessel.mmsi || 'N/A'} | 类型: ${vessel.type_name || vessel.type || '未知'}`,
            type: 'vessel' as const,
            data: vessel,
            priority: isMMSI && vessel.mmsi === query ? 1 : 0 // MMSI精确匹配优先级更高
          }))
          suggestions.value.push(...vesselSuggestions)
        } catch (err) {
          console.error('获取船舶建议失败:', err)
        }
      }

      if (props.searchType === 'all' || props.searchType === 'anchorages') {
        try {
          console.log('正在搜索锚地:', query)
          const anchorageResponse = await apiService.anchorages.search(query, 5)
          console.log('锚地搜索结果:', anchorageResponse.data)
          const anchorageSuggestions = (anchorageResponse.data?.data || []).map(
            (anchorage: any) => ({
              id: anchorage.anchorage_id || anchorage.id,
              title: anchorage.anchorage_name || anchorage.name || '未知锚地',
              subtitle: `类型: ${anchorage.anchorage_type || anchorage.type || '未知'} | 区域: ${anchorage.area_zone || anchorage.zone || '未知'}`,
              type: 'anchorage' as const,
              data: anchorage
            })
          )
          suggestions.value.push(...anchorageSuggestions)
        } catch (err) {
          console.error('获取锚地建议失败:', err)
        }
      }

      if (props.searchType === 'all' || props.searchType === 'trips') {
        try {
          console.log('正在搜索航次:', query)
          const tripResponse = await apiService.trips.search(query, 5)
          console.log('航次搜索结果:', tripResponse.data)
          const tripSuggestions = (tripResponse.data?.data || []).map((trip: any) => ({
            id: trip.trip_id || trip.id,
            title:
              isMMSI && trip.mmsi === query
                ? `MMSI: ${trip.mmsi} 的航次`
                : `航次 #${trip.trip_id || trip.id}`,
            subtitle: `船舶: ${trip.vessel_name || '未知'} (MMSI: ${trip.mmsi || 'N/A'}) | 路线: ${trip.start_anchorage || '未知'} → ${trip.end_anchorage || '未知'}`,
            type: 'trip' as const,
            data: trip,
            priority: isMMSI && trip.mmsi === query ? 1 : 0 // MMSI精确匹配优先级更高
          }))
          suggestions.value.push(...tripSuggestions)
        } catch (err) {
          console.error('获取航次建议失败:', err)
        }
      }

      // 按优先级排序，MMSI精确匹配优先显示
      suggestions.value.sort((a, b) => (b.priority || 0) - (a.priority || 0))

      // 限制建议数量
      suggestions.value = suggestions.value.slice(0, 10)
      showSuggestions.value = suggestions.value.length > 0
      console.log('最终建议列表:', suggestions.value)
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      suggestions.value = []
      showSuggestions.value = false
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    const query = searchQuery.value.trim()
    if (query) {
      // 添加到搜索历史
      searchHistoryRef.value?.addHistoryItem(query, props.searchType)
      
      emit('search', query)
      showSuggestions.value = false
    }
  }

  const selectHistoryItem = (item: any) => {
    searchQuery.value = item.query
    showSuggestions.value = false
    handleSearch()
  }

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    searchQuery.value = suggestion.title
    showSuggestions.value = false
    emit('resultSelected', suggestion)

    // 根据类型导航到相应页面
    switch (suggestion.type) {
      case 'vessel':
        router.push(`/vessels/${suggestion.id}`)
        break
      case 'anchorage':
        router.push(`/anchorages/${suggestion.id}`)
        break
      case 'trip':
        router.push(`/trips/${suggestion.id}`)
        break
    }
  }

  const getSuggestionIcon = (type: string) => {
    const icons = {
      vessel: '🚢',
      anchorage: '📍',
      trip: '📊'
    }
    return icons[type as keyof typeof icons] || '📄'
  }

  const getSuggestionTypeLabel = (type: string) => {
    const labels = {
      vessel: '船舶',
      anchorage: '锚地',
      trip: '航次'
    }
    return labels[type as keyof typeof labels] || '其他'
  }

  // 清空搜索框
  const clearSearch = () => {
    searchQuery.value = ''
    suggestions.value = []
    showSuggestions.value = false
  }

  // 暴露方法给父组件
  defineExpose({
    clearSearch,
    searchQuery
  })

  // 点击外部关闭建议下拉框
  document.addEventListener('click', (e) => {
    if (!e.target || !(e.target as Element).closest('.search-container')) {
      showSuggestions.value = false
    }
  })
</script>

<style scoped>
  .search-container {
    position: relative;
    width: 100%;
  }

  .search-input {
    width: 100%;
    padding: 10px 40px 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    transition: all 0.2s;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .search-button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .search-button:hover {
    background-color: #f3f4f6;
  }

  .search-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    z-index: 50;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 4px;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #f3f4f6;
  }

  .suggestion-item:last-child {
    border-bottom: none;
  }

  .suggestion-item:hover {
    background-color: #f9fafb;
  }

  .suggestion-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f6;
    border-radius: 6px;
    margin-right: 12px;
    font-size: 16px;
  }

  .suggestion-content {
    flex: 1;
  }

  .suggestion-title {
    font-weight: 500;
    color: #111827;
    font-size: 14px;
    margin-bottom: 2px;
  }

  .suggestion-subtitle {
    color: #6b7280;
    font-size: 12px;
  }

  .suggestion-type {
    font-size: 12px;
    color: #6b7280;
    background-color: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 500;
  }

  /* 深色模式支持 */
  @media (prefers-color-scheme: dark) {
    .search-input {
      background-color: #f8f9ff;
      border-color: #e9eefb;
      color: #263444;
    }

    .search-input::placeholder {
      color: #6b7280;
    }

    .search-input:focus {
      border-color: #7c57ff;
      box-shadow: 0 0 0 3px rgba(124, 87, 255, 0.1);
    }

    .search-button:hover {
      background-color: #f3f4f6;
    }

    .suggestions-dropdown {
      background-color: #f8f9ff;
      border-color: #e9eefb;
    }

    .suggestion-item:hover {
      background-color: #f0f1ff;
    }

    .suggestion-icon {
      background-color: #eef2ff;
    }

    .suggestion-title {
      color: #263444;
    }

    .suggestion-subtitle {
      color: #6b7280;
    }

    .suggestion-type {
      color: #6b7280;
      background-color: #eef2ff;
    }
  }
</style>
