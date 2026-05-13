<!-- src/components/ui/EnhancedDataTable.vue -->
<template>
  <div class="w-full">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <LoadingSpinner label="加载中..." />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            <span class="font-medium">加载失败:</span> {{ error }}
            <button @click="refreshData" class="ml-2 text-red-700 underline">重试</button>
          </p>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div
      v-else
      class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead
          class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800"
        >
          <tr>
            <th
              v-if="selectable"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12"
            >
              <input
                type="checkbox"
                v-model="allSelected"
                @change="toggleAll"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="column.sortable ? sortData(column.key) : null"
            >
              <div class="flex items-center">
                {{ column.title }}
                <svg
                  v-if="column.sortable && currentSort.key === column.key"
                  class="w-4 h-4 ml-1"
                  :class="{ 'transform rotate-180': currentSort.direction === 'desc' }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  ></path>
                </svg>
              </div>
            </th>
            <th
              v-if="$slots['row-actions']"
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(item, index) in paginatedData"
            :key="item.id || index"
            :class="{
              'bg-gray-50 dark:bg-gray-800/50': index % 2 === 0,
              'hover:bg-blue-50 dark:hover:bg-gray-750 transition-colors': true,
              'bg-blue-100 dark:bg-blue-900/30': selectedRows.includes(item.id || index)
            }"
          >
            <td v-if="selectable" class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                :value="item.id || index"
                v-model="selectedRows"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
            >
              <slot :name="`col-${column.key}`" :value="item[column.key]" :item="item">
                {{ item[column.key] }}
              </slot>
            </td>
            <td
              v-if="$slots['row-actions']"
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <slot name="row-actions" :item="item"></slot>
            </td>
          </tr>

          <!-- 空状态 -->
          <tr v-if="paginatedData.length === 0">
            <td
              :colspan="columns.length + (selectable ? 1 : 0) + ($slots['row-actions'] ? 1 : 0)"
              class="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
            >
              <div class="flex flex-col items-center">
                <svg
                  class="w-12 h-12 text-gray-400 mb-4"
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
                <p class="text-lg font-medium">暂无数据</p>
                <p class="mt-1">没有找到匹配的记录</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div
      v-if="!loading && data.length > 0 && pagination !== false"
      class="flex flex-col md:flex-row items-center justify-between mt-6 space-y-4 md:space-y-0"
    >
      <div class="text-sm text-gray-700 dark:text-gray-400">
        显示第 {{ startIndex + 1 }} 到 {{ endIndex }} 条，共 {{ filteredData.length }} 条记录
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>

        <span class="px-3 py-1 text-gray-700 dark:text-gray-300">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>

        <select
          v-model="pageSize"
          class="ml-2 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option :value="5">5条/页</option>
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import LoadingSpinner from './LoadingSpinner.vue'

  interface Column {
    key: string
    title: string
    sortable?: boolean
  }

  interface Props {
    data: any[]
    columns: Column[]
    pageSize?: number
    loading?: boolean
    error?: string | null
    selectable?: boolean
    searchable?: boolean
    pagination?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    pageSize: 10,
    loading: false,
    error: null,
    selectable: false,
    searchable: true,
    pagination: true
  })

  const emit = defineEmits(['refresh'])

  // 分页状态
  const currentPage = ref(1)
  const pageSize = ref(props.pageSize)
  const searchQuery = ref('')

  // 排序状态
  const currentSort = ref({
    key: '',
    direction: 'asc' as 'asc' | 'desc'
  })

  // 选中行状态
  const selectedRows = ref<any[]>([])

  // 计算属性：过滤后的数据
  const filteredData = computed(() => {
    if (!props.searchable || !searchQuery.value) {
      return props.data
    }

    return props.data.filter((item) => {
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })
  })

  // 计算属性：排序后的数据
  const sortedData = computed(() => {
    if (!currentSort.value.key) {
      return filteredData.value
    }

    return [...filteredData.value].sort((a, b) => {
      const aValue = a[currentSort.value.key]
      const bValue = b[currentSort.value.key]

      // 处理不同数据类型的比较
      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return currentSort.value.direction === 'asc' ? comparison : -comparison
    })
  })

  // 计算属性：当前页数据
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sortedData.value.slice(start, end)
  })

  // 计算属性：分页信息
  const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() =>
    Math.min(currentPage.value * pageSize.value, filteredData.value.length)
  )

  // 计算属性：全选状态
  const allSelected = computed(() => {
    return selectedRows.value.length > 0 && selectedRows.value.length === paginatedData.value.length
  })

  // 方法：排序
  const sortData = (key: string) => {
    if (currentSort.value.key === key) {
      currentSort.value.direction = currentSort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      currentSort.value.key = key
      currentSort.value.direction = 'asc'
    }
    currentPage.value = 1 // 排序后回到第一页
  }

  // 方法：分页
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  // 方法：全选/取消全选
  const toggleAll = () => {
    if (allSelected.value) {
      selectedRows.value = []
    } else {
      selectedRows.value = paginatedData.value.map((item) => item.id || item[Object.keys(item)[0]])
    }
  }

  // 方法：刷新数据
  const refreshData = () => {
    currentPage.value = 1
    selectedRows.value = []
    emit('refresh')
  }

  // 方法：处理批量删除
  const handleBulkDelete = () => {
    // 这里可以发出事件让父组件处理删除逻辑
    console.log('删除选中的行:', selectedRows.value)
    selectedRows.value = []
  }

  // 监听页面大小变化
  watch(pageSize, () => {
    currentPage.value = 1
  })
</script>
