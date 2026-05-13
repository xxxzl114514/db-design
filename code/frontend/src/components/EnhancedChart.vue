<template>
  <div class="w-full" v-bind="$attrs">
    <div v-if="loading" class="flex flex-col items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">加载图表数据...</p>
    </div>
    <div v-else-if="error" class="flex flex-col items-center justify-center h-64">
      ⚠️
      <p class="text-sm text-muted-foreground">图表加载失败</p>
      <p class="text-xs text-muted-foreground mt-1">{{ error }}</p>
      <button
        @click="retry"
        class="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs"
      >
        重试
      </button>
    </div>
    <div
      v-else-if="!chartData || chartData.length === 0"
      class="flex flex-col items-center justify-center h-64"
    >
      📊
      <p class="text-sm text-muted-foreground">暂无图表数据</p>
    </div>
    <div v-else class="bg-card p-4 rounded-lg border">
      <div class="flex justify-between items-center mb-4">
        <h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
        <div class="flex gap-2">
          <select
            v-if="showTypeSelector"
            v-model="currentChartType"
            class="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="line">折线图</option>
            <option value="bar">柱状图</option>
            <option value="area">面积图</option>
          </select>
          <select
            v-if="showTimeRangeSelector"
            v-model="selectedTimeRange"
            class="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="7">最近7天</option>
            <option value="30">最近30天</option>
            <option value="90">最近90天</option>
            <option value="365">最近1年</option>
          </select>
        </div>
      </div>

      <div :style="{ height: height || '300px' }">
        <div v-if="currentChartType === 'line'" class="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart :data="chartData">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                :contentStyle="{
                  background: 'hsl(var(--card))',
                  border: '1px solid',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }"
                :itemStyle="{ color: 'hsl(var(--foreground))' }"
                :labelStyle="{ color: 'hsl(var(--foreground))', fontWeight: '600' }"
              />
              <Legend />
              <Line
                v-for="dataKey in dataKeys"
                :key="dataKey"
                :type="lineType || 'monotone'"
                :dataKey="dataKey"
                :stroke="'hsl(var(--primary))'"
                :activeDot="{ r: 8 }"
                :fill="`url(#color-${dataKey})`"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div v-else-if="currentChartType === 'bar'" class="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart :data="chartData">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                :contentStyle="{
                  background: 'hsl(var(--card))',
                  border: '1px solid',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }"
                :itemStyle="{ color: 'hsl(var(--foreground))' }"
                :labelStyle="{ color: 'hsl(var(--foreground))', fontWeight: '600' }"
              />
              <Legend />
              <Bar
                v-for="dataKey in dataKeys"
                :key="dataKey"
                :dataKey="dataKey"
                :fill="'hsl(var(--primary))'"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div v-else class="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart :data="chartData">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                :contentStyle="{
                  background: 'hsl(var(--card))',
                  border: '1px solid',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }"
                :itemStyle="{ color: 'hsl(var(--foreground))' }"
                :labelStyle="{ color: 'hsl(var(--foreground))', fontWeight: '600' }"
              />
              <Legend />
              <Area
                v-for="dataKey in dataKeys"
                :key="dataKey"
                type="monotone"
                :dataKey="dataKey"
                :stroke="'hsl(var(--primary))'"
                :fill="'hsl(var(--primary) / 0.2)'"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import {
    LineChart,
    BarChart,
    AreaChart,
    Line,
    Bar,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
  } from 'recharts'

  export interface ChartData {
    name: string
    [key: string]: number | string
  }

  interface Props {
    data: ChartData[]
    dataKeys: string[]
    title?: string
    height?: string
    chartType?: 'line' | 'bar' | 'area'
    lineType?: 'basis' | 'linear' | 'monotone' | 'step' | 'natural'
    loading?: boolean
    error?: string
    showTypeSelector?: boolean
    showTimeRangeSelector?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    chartType: 'line',
    lineType: 'monotone',
    showTypeSelector: true,
    showTimeRangeSelector: true
  })

  const emit = defineEmits(['retry', 'time-range-change'])

  const currentChartType = ref(props.chartType)
  const selectedTimeRange = ref('30')
  const loading = ref(props.loading)
  const error = ref(props.error)

  // 初始数据
  const chartData = ref<ChartData[]>(props.data || [])

  // 监听props变化
  watch(
    () => props.data,
    (newData) => {
      chartData.value = newData || []
    }
  )

  watch(
    () => props.loading,
    (isLoading) => {
      loading.value = isLoading
    }
  )

  watch(
    () => props.error,
    (newError) => {
      error.value = newError
    }
  )

  // 重试方法
  const retry = () => {
    emit('retry')
  }

  // 监听时间范围变化
  watch(selectedTimeRange, (newRange) => {
    emit('time-range-change', newRange)
  })
</script>
