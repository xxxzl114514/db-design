<template>
  <div class="w-full">
    <!-- 搜索和过滤工具栏 -->
    <div
      class="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-5 bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
    >
      <div class="flex gap-3 flex-wrap">
        <div v-if="searchable" class="relative group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索..."
            class="pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200 group-hover:shadow-md"
          />
          <svg
            class="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        <select
          v-if="filterable"
          v-model="currentFilter"
          class="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <option value="">全部</option>
          <option v-for="filter in availableFilters" :key="filter.key" :value="filter.key">
            {{ filter.label }}
          </option>
        </select>
      </div>

      <div class="flex gap-2">
        <slot name="actions" />
        <button
          v-if="refreshable"
          @click="refreshData"
          class="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
        >
          🔄 刷新
        </button>
      </div>
    </div>

    <!-- 数据表 -->
    <div
      class="rounded-xl overflow-hidden shadow-lg border border-gray-100/80 dark:border-gray-700/50 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80"
    >
      <table class="min-w-full">
        <thead
          class="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50"
        >
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 text-left text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 uppercase tracking-wider cursor-pointer transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-300 dark:hover:to-purple-300"
              @click="column.sortable !== false ? sortData(column.key) : null"
            >
              <div class="flex items-center justify-between">
                <span>{{ column.title }}</span>
                <div class="ml-2 flex-shrink-0">
                  <svg
                    v-if="sortConfig.key === column.key && sortConfig.direction === 'asc'"
                    class="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 15l7-7 7 7"
                    ></path>
                  </svg>
                  <svg
                    v-else-if="sortConfig.key === column.key && sortConfig.direction === 'desc'"
                    class="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                  <svg
                    v-else-if="column.sortable !== false"
                    class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    ></path>
                  </svg>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100/80 dark:divide-gray-700/50">
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-6 py-16 text-center">
              <div class="flex flex-col items-center justify-center space-y-4">
                <div class="relative">
                  <div
                    class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-800"
                  ></div>
                  <div
                    class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent absolute top-0 left-0"
                  ></div>
                </div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">正在加载数据...</p>
              </div>
            </td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="columns.length" class="px-6 py-16 text-center">
              <div class="flex flex-col items-center justify-center space-y-4">
                <div
                  class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center"
                >
                  ⚠️
                </div>
                <div class="text-center">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">数据加载失败</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ error }}</p>
                </div>
                <button
                  @click="refreshData"
                  class="mt-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  重试
                </button>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredData.length === 0">
            <td :colspan="columns.length" class="px-6 py-16 text-center">
              <div class="flex flex-col items-center justify-center space-y-4">
                <div
                  class="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center"
                >
                  📋
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">没有找到数据</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">请尝试调整搜索条件</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="(item, index) in paginatedData"
            :key="item.id || index"
            class="group transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:via-purple-50/20 hover:to-pink-50/30 dark:hover:from-gray-800/50 dark:hover:via-gray-800/30 dark:hover:to-gray-800/50 hover:shadow-sm"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200"
            >
              <slot :name="`col-${column.key}`" :value="item[column.key]" :row="item">
                <HighlightText 
                  v-if="props.highlightQuery"
                  :text="formatValue(item[column.key], column.type)" 
                  :query="props.highlightQuery"
                />
                <span v-else>{{ formatValue(item[column.key], column.type) }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div
      v-if="showPagination && totalPages > 1"
      class="flex items-center justify-between mt-4 p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
    >
      <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">
        显示 {{ startIndex + 1 }} - {{ endIndex }} 条，共 {{ filteredData.length }} 条
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
        >
          首页
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
        >
          上一页
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
          下一页
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
        >
          末页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import HighlightText from './HighlightText.vue'

  export interface Column {
    key: string
    title: string
    sortable?: boolean
    type?: 'text' | 'number' | 'date' | 'boolean' | 'status'
  }

    interface Props {
      data: unknown[]
      columns: Column[]
      searchable?: boolean
      filterable?: boolean
      refreshable?: boolean
      showPagination?: boolean
      pageSize?: number
      filters?: { key: string; label: string; value: string }[]
      highlightQuery?: string
    }  const props = withDefaults(defineProps<Props>(), {
    searchable: true,
    filterable: true,
    refreshable: true,
    showPagination: true,
    pageSize: 10,
    filters: () => [],
    highlightQuery: ''
  })
  const emit = defineEmits(['refresh', 'row-click'])

  const searchQuery = ref('')
  const currentFilter = ref('')
  const currentPage = ref(1)
  const sortConfig = ref({
    key: '',
    direction: 'asc' as 'asc' | 'desc'
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算可用过滤器
  const availableFilters = computed(() => {
    if (props.filters && props.filters.length > 0) {
      return props.filters
    }

    // 如果没有预定义过滤器，基于数据自动生成
    if (props.data.length > 0) {
      const uniqueValues: Record<string, Set<any>> = {}

      props.columns.forEach((column) => {
        uniqueValues[column.key] = new Set()
        props.data?.forEach((item) => {
          if (item && item[column.key] !== undefined) {
            uniqueValues[column.key].add(item[column.key])
          }
        })
      })

      return Object.entries(uniqueValues).flatMap(([key, values]) =>
        Array.from(values).map((value) => ({
          key,
          label: `${key}: ${value}`,
          value: String(value)
        }))
      )
    }

    return []
  })

  // 过滤数据
  const filteredData = computed(() => {
    let result = [...props.data]

    // 应用搜索过滤
    if (searchQuery.value) {
      result = result.filter((item) => {
        return props.columns.some((column) => {
          const value = item[column.key]
          return value && String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
        })
      })
    }

    // 应用过滤器
    if (currentFilter.value) {
      const [filterKey, filterValue] = currentFilter.value.split(':')
      if (filterKey && filterValue) {
        result = result.filter((item) => String(item[filterKey]) === filterValue)
      }
    }

    return result
  })

  // 排序数据
  const sortedData = computed(() => {
    if (!sortConfig.value.key) return filteredData.value

    return [...filteredData.value].sort((a, b) => {
      const aValue = a[sortConfig.value.key]
      const bValue = b[sortConfig.value.key]

      if (aValue < bValue) {
        return sortConfig.value.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.value.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  })

  // 分页数据
  const totalPages = computed(() => Math.ceil(sortedData.value.length / props.pageSize))
  const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
  const endIndex = computed(() =>
    Math.min(startIndex.value + props.pageSize, sortedData.value.length)
  )
  const paginatedData = computed(() => sortedData.value.slice(startIndex.value, endIndex.value))

  // 排序功能
  const sortData = (key: string) => {
    if (sortConfig.value.key === key) {
      sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sortConfig.value.key = key
      sortConfig.value.direction = 'asc'
    }
  }

  // 格式化值
  const formatValue = (value: any, type?: string) => {
    if (value === null || value === undefined) return '-'

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('zh-CN')
      case 'number':
        return new Intl.NumberFormat('zh-CN').format(Number(value))
      case 'boolean':
        return value ? '是' : '否'
      case 'status':
        return value === 'active' ? '活跃' : value === 'inactive' ? '非活跃' : value
      default:
        return String(value)
    }
  }

  // 刷新数据
  const refreshData = () => {
    loading.value = true
    error.value = null

    try {
      emit('refresh')
    } catch (err: any) {
      error.value = err.message || '刷新数据时出错'
    } finally {
      loading.value = false
    }
  }

  // 监听数据变化
  watch(
    () => props.data,
    () => {
      currentPage.value = 1 // 数据变化时重置到第一页
    },
    { immediate: true }
  )
</script>
