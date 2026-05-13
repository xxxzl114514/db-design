<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-4">
      <h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
      <div v-if="$slots.controls">
        <slot name="controls"></slot>
      </div>
    </div>
    <div class="bg-card p-4 rounded-lg border" :style="{ height: height }">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center">
          🔄
          <span class="text-muted-foreground">加载中...</span>
        </div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full text-center">
        <div class="flex flex-col items-center">
          ⚠️
          <span class="text-red-500">图表加载失败</span>
          <button @click="retry" class="mt-2 text-sm text-primary hover:underline">重试</button>
        </div>
      </div>
      <div v-else class="h-full" ref="chartContainerRef">
        <div v-if="chartType === 'bar'" class="h-full">
          <!-- Bar Chart Placeholder -->
          <div class="h-full flex items-center justify-center text-muted-foreground">
            <div class="text-center">
              📊
              <p>柱状图</p>
              <p class="text-sm mt-1">数据: {{ data.length }} 项</p>
            </div>
          </div>
        </div>
        <div v-else-if="chartType === 'line'" class="h-full">
          <!-- Line Chart Placeholder -->
          <div class="h-full flex items-center justify-center text-muted-foreground">
            <div class="text-center">
              📈
              <p>折线图</p>
              <p class="text-sm mt-1">数据: {{ data.length }} 项</p>
            </div>
          </div>
        </div>
        <div v-else-if="chartType === 'pie'" class="h-full">
          <!-- Pie Chart Placeholder -->
          <div class="h-full flex items-center justify-center text-muted-foreground">
            <div class="text-center">
              🥧
              <p>饼图</p>
              <p class="text-sm mt-1">数据: {{ data.length }} 项</p>
            </div>
          </div>
        </div>
        <div v-else class="h-full">
          <!-- 未知图表类型 -->
          <div class="h-full flex items-center justify-center text-muted-foreground">
            <div class="text-center">
              📋
              <p>未知图表类型</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  interface ChartData {
    name: string
    value: number
    [key: string]: unknown
  }

  interface Props {
    title?: string
    data: ChartData[]
    chartType: 'bar' | 'line' | 'pie'
    height?: string
    loading?: boolean
    error?: boolean
  }

  defineProps<Props>()

  const emit = defineEmits<{
    retry: []
  }>()

  const chartContainerRef = ref<HTMLElement | null>(null)

  const retry = () => {
    emit('retry')
  }
</script>
