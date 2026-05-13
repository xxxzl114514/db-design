<template>
  <div
    class="w-full overflow-x-auto rounded-xl shadow-lg border border-gray-100/80 dark:border-gray-700/50 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80"
  >
    <table class="w-full">
      <thead
        class="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50"
      >
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="text-left p-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 uppercase tracking-wider border-b border-gray-200/30 dark:border-gray-700/30"
            :class="column.class || ''"
          >
            <div class="flex items-center justify-between">
              <span>{{ column.title }}</span>
              <button
                v-if="column.sortable"
                @click="sort(column.key)"
                class="ml-2 focus:outline-none transition-all duration-200 group"
              >
                <span
                  :class="{
                    'text-indigo-600 dark:text-indigo-400': currentSort.column === column.key,
                    'rotate-180':
                      currentSort.column === column.key && currentSort.direction === 'desc',
                    'text-gray-400 group-hover:text-indigo-500 dark:text-gray-500 dark:group-hover:text-indigo-400':
                      currentSort.column !== column.key
                  }"
                  class="transition-all flex-shrink-0"
                  >🔽</span
                >
              </button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100/80 dark:divide-gray-700/50">
        <tr
          v-for="(row, index) in paginatedData"
          :key="row.id || index"
          class="group transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:via-purple-50/20 hover:to-pink-50/30 dark:hover:from-gray-800/50 dark:hover:via-gray-800/30 dark:hover:to-gray-800/50 hover:shadow-sm"
          :class="rowClass ? rowClass(row) : ''"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="p-4 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200"
            :class="column.tdClass || ''"
          >
            <slot :name="`col-${column.key}`" :row="row" :value="getValue(row, column.key)">
              {{ formatValue(getValue(row, column.key), column.type) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div
      v-if="showPagination && totalPages > 1"
      class="p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-center"
    >
      <div class="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-0 font-medium">
        显示第 {{ (currentPage - 1) * pageSize + 1 }} 到
        {{ Math.min(currentPage * pageSize, filteredData.length) }} 条记录，共
        {{ filteredData.length }} 条
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
        >
          首页
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
        >
          上一页
        </button>

        <div class="flex space-x-1 mx-1">
          <button
            v-for="page in pagesToShow"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
              page === currentPage
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
        >
          下一页
        </button>
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
        >
          末页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
  import { ref, computed, watch } from 'vue'

  interface Column {
    key: string
    title: string
    sortable?: boolean
    type?: 'text' | 'number' | 'date' | 'status' | 'custom'
    class?: string
    tdClass?: string
  }

  interface SortState {
    column: string | null
    direction: 'asc' | 'desc'
  }

  const props = withDefaults(
    defineProps<{
      data: T[]
      columns: Column[]
      pageSize?: number
      showPagination?: boolean
      searchable?: boolean
      searchFields?: string[]
      rowClass?: (row: T) => string
    }>(),
    {
      pageSize: 10,
      showPagination: true,
      searchable: false,
      searchFields: () => [],
      rowClass: undefined
    }
  )

  defineEmits<{
    'row-click': [row: T]
  }>()

  const currentPage = ref(1)
  const currentSort = ref<SortState>({ column: null, direction: 'asc' })
  const searchQuery = ref('')

  // 计算过滤后的数据
  const filteredData = computed(() => {
    if (!props.searchable || !searchQuery.value) return props.data

    return props.data.filter((item) => {
      return props.searchFields.some((field) => {
        const value = String(getValue(item, field)).toLowerCase()
        return value.includes(searchQuery.value.toLowerCase())
      })
    })
  })

  // 计算排序后的数据
  const sortedData = computed(() => {
    if (!currentSort.value.column) return filteredData.value

    return [...filteredData.value].sort((a, b) => {
      const aVal = getValue(a, currentSort.value.column!)
      const bVal = getValue(b, currentSort.value.column!)

      // 处理不同类型数据的排序
      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        // 尝试转换为字符串比较
        comparison = String(aVal).localeCompare(String(bVal))
      }

      return currentSort.value.direction === 'desc' ? -comparison : comparison
    })
  })

  // 计算分页数据
  const paginatedData = computed(() => {
    if (!props.showPagination) return sortedData.value

    const start = (currentPage.value - 1) * props.pageSize
    const end = start + props.pageSize
    return sortedData.value.slice(start, end)
  })

  // 计算总页数
  const totalPages = computed(() => {
    return Math.ceil(sortedData.value.length / props.pageSize)
  })

  // 计算要显示的页码
  const pagesToShow = computed(() => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage.value - delta);
      i <= Math.min(totalPages.value - 1, currentPage.value + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage.value - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage.value + delta < totalPages.value - 1) {
      rangeWithDots.push('...', totalPages.value)
    } else if (totalPages.value > 1) {
      rangeWithDots.push(totalPages.value)
    }

    return rangeWithDots
  })

  // 获取嵌套属性值
  const getValue = (obj: T, path: string): unknown => {
    return path.split('.').reduce((current, key) => current?.[key], obj as unknown)
  }

  // 格式化值
  const formatValue = (value: unknown, type?: string): string => {
    if (value === null || value === undefined) return '-'

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('zh-CN')
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value)
      default:
        return String(value)
    }
  }

  // 排序函数
  const sort = (column: string) => {
    if (currentSort.value.column === column) {
      currentSort.value.direction = currentSort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      currentSort.value.column = column
      currentSort.value.direction = 'asc'
    }
    currentPage.value = 1 // 排序后返回第一页
  }

  // 分页函数
  const goToPage = (page: number | string) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    } else if (page === '...') {
      // 分页组件中省略号不需要操作
    }
  }

  // 监听数据变化，重置到第一页
  watch(
    () => props.data,
    () => {
      currentPage.value = 1
    }
  )
</script>
