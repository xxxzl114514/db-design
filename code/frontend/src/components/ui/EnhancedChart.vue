<template>
  <div class="w-full">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <LoadingSpinner label="加载图表数据..." />
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
            <span class="font-medium">图表加载失败:</span> {{ error }}
            <button @click="handleRetry" class="ml-2 text-red-700 underline">重试</button>
          </p>
        </div>
      </div>
    </div>

    <!-- 图表容器 -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">{{ title || '数据图表' }}</h3>
      </div>

      <!-- 数据为空时的提示 -->
      <div
        v-if="!data || data.length === 0"
        class="flex items-center justify-center py-12 text-gray-500"
      >
        <div class="text-center">
          <div class="text-4xl mb-4">📊</div>
          <p>暂无数据</p>
          <button @click="handleRetry" class="mt-2 text-blue-500 hover:text-blue-700 underline">
            重试
          </button>
        </div>
      </div>

      <div v-else :style="{ height: height || '400px' }" class="w-full">
        <!-- 图表渲染 -->
        <div style="height: 350px; width: 100%">
          <!-- 使用 Vue Chart.js -->
          <Bar :data="chartData" :options="chartOptions" style="max-height: 300px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import LoadingSpinner from './LoadingSpinner.vue'
  import { Bar } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
  } from 'chart.js'

  // 注册 Chart.js 组件
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

  interface Props {
    data: unknown[]
    dataKeys: string[]
    title?: string
    height?: string
    loading?: boolean
    error?: string | null
    barSize?: number
    chartType?: 'bar' | 'line' | 'composed'
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    error: null,
    barSize: 20,
    chartType: 'composed'
  })

  const emit = defineEmits(['retry'])

  const selectedTimeRange = ref(30)

  // 图表颜色方案
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4' // cyan-500
  ]

  // 方法：重试
  const handleRetry = () => {
    emit('retry')
  }

  // 方法：选择时间范围
  const selectTimeRange = (value: number) => {
    selectedTimeRange.value = value
    console.log(`选择时间范围: ${value}天`)
  }

  // 转换数据为 Chart.js 格式
  const chartData = computed(() => {
    if (!props.data || props.data.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    return {
      labels: props.data.map((item) => item.name),
      datasets: props.dataKeys.map((key, index) => ({
        label: key,
        data: props.data.map((item) => item[key]),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1
      }))
    }
  })

  // Chart.js 配置选项
  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  }))
</script>
