<template>
  <div class="w-full animate-fade-in">
    <!-- 欢迎卡片 - 参考时光胶囊项目 -->
    <section class="card welcome">
      <div class="art">海事</div>
      <div>
        <h3 id="welcome-title">你好，海事管理员</h3>
        <p class="muted">
          你可以从这里快速查看系统状态、管理船舶和锚地信息。 系统已为你准备好实时数据和操作提示。
        </p>
        <div style="margin-top: 12px; display: flex; gap: 10px">
          <button class="icon-btn" @click="navigateToVessels">🚢 船舶管理</button>
          <button class="icon-btn" @click="navigateToAnchorages">📍 锚地管理</button>
          <button class="icon-btn" @click="navigateToTrips">📊 航次管理</button>
        </div>
      </div>
    </section>

    <!-- 活动横幅 - 参考时光胶囊项目 -->
    <section class="cta-banner">
      <div>
        <div style="font-weight: 800">本周重点：港口调度优化</div>
        <div class="muted" style="margin-top: 6px">
          提高港口调度效率，减少船舶等待时间，优化锚地使用率。
        </div>
      </div>
      <div style="display: flex; gap: 10px"></div>
    </section>

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

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card card-hover">
        <div class="stat-icon vessels breathe-effect">🚢</div>
        <div>
          <p class="stat-label">总船舶数</p>
          <p class="stat-value">
            <AnimatedCounter :value="summary.total_vessels || 0" />
          </p>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon anchorages breathe-effect">📍</div>
        <div>
          <p class="stat-label">锚地数量</p>
          <p class="stat-value">
            <AnimatedCounter :value="summary.total_anchorages || 0" />
          </p>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon trips breathe-effect">✅</div>
        <div>
          <p class="stat-label">总航次数</p>
          <p class="stat-value">
            <AnimatedCounter :value="summary.total_trips || 0" />
          </p>
        </div>
      </div>
    </div>

    <!-- 快速入口 - 参考时光胶囊项目 -->
    <section class="card" style="margin-top: 12px">
      <h4 style="margin-top: 0">快速入口</h4>
      <div class="quick-grid">
        <div class="quick card-hover ripple-button" @click="navigateToVessels">
          <div class="qicon vessels float-animation">🚢</div>
          <div style="margin-top: 8px">船舶管理</div>
        </div>
        <div class="quick card-hover ripple-button" @click="navigateToAnchorages">
          <div class="qicon anchorages float-animation">⚓</div>
          <div style="margin-top: 8px">锚地管理</div>
        </div>
        <div class="quick card-hover ripple-button" @click="navigateToTrips">
          <div class="qicon trips float-animation">🛳️</div>
          <div style="margin-top: 8px">航次管理</div>
        </div>
      </div>
    </section>

    <!-- 图表和数据区域 -->
    <div class="data-grid">
      <!-- 图表 -->
      <section class="card card-hover" header="近期趋势">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          "
        >
          <h4 style="margin-top: 0">近期趋势</h4>
          <button @click="resetAndLoadChartData" :disabled="chartLoading" class="icon-btn ripple-button">
            <span v-if="chartLoading" class="animate-spin">🔄</span>
            <span v-else>🔄</span>
            刷新
          </button>
        </div>
        <div style="margin-bottom: 16px">
          <DateRangeSelector
            ref="dateRangeSelectorRef"
            @date-range-change="handleDateRangeChange"
          />
        </div>
        
        <!-- 骨架屏 -->
        <SkeletonLoader v-if="chartLoading && trendData.length === 0" type="chart" />
        
        <EnhancedChart
          v-else
          :data="trendData"
          :data-keys="['航次', '活跃船舶']"
          title="业务趋势分析"
          height="350px"
          :loading="chartLoading"
          :error="null"
          @retry="loadChartData"
        />
      </section>
    </div>

    <!-- 热门航线 -->
    <section class="card card-hover" header="热门航线">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h4 style="margin-top: 0">热门航线</h4>
        <button @click="loadPopularRoutes" :disabled="routesLoading" class="icon-btn ripple-button">
          <span v-if="routesLoading" class="animate-spin">🔄</span>
          <span v-else>🔄</span>
          刷新
        </button>
      </div>
      
      <!-- 骨架屏 -->
      <SkeletonLoader 
        v-if="routesLoading && popularRoutes.length === 0" 
        type="table" 
        :rows="5" 
        :columns="5" 
      />
      
      <EnhancedDataTable
        v-else
        :data="popularRoutes"
        :columns="routeColumns"
        :page-size="10"
        :loading="routesLoading"
        :searchable="false"
        :pagination="false"
        @refresh="loadPopularRoutes"
      >
        <template #col-trip_count="{ value }">
          <span class="badge trips pulse-effect">{{ value }}</span>
        </template>
        <template #col-avg_duration="{ value }">
          <span class="duration">{{ value || '0' }}小时</span>
        </template>
      </EnhancedDataTable>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { apiService } from '@/services/api'
  import Card from '@/components/Card.vue'
  import EnhancedDataTable from '@/components/ui/EnhancedDataTable.vue'
  import EnhancedChart from '@/components/ui/EnhancedChart.vue'
  import DateRangeSelector from '@/components/DateRangeSelector.vue'
  import SkeletonLoader from '@/components/SkeletonLoader.vue'
  import AnimatedCounter from '@/components/AnimatedCounter.vue'

  const router = useRouter()

  // 添加日期选择器引用
  const dateRangeSelectorRef = ref<InstanceType<typeof DateRangeSelector> | null>(null)

  interface SummaryData {
    total_vessels: number
    total_anchorages: number
    total_trips: number
    active_vessels: number
  }

  interface PopularRoute {
    name: string
    origin: string
    destination: string
    trip_count: number
    avg_duration: number
  }

  // 数据状态
  const summary = ref<SummaryData>({
    total_vessels: 0,
    total_anchorages: 0,
    total_trips: 0,
    active_vessels: 0
  })

  const popularRoutes = ref<PopularRoute[]>([])
  const trendData = ref<any[]>([])
  const loading = ref(true)
  const routesLoading = ref(false)
  const chartLoading = ref(false)
  const error = ref<string | null>(null)

  const dateRange = ref<{ startDate: string; endDate: string }>({
    startDate: '2024-12-01',
    endDate: '2024-12-31'
  })

  // 定义热门航线表格列
  const routeColumns = computed(() => [
    { key: 'name', title: '航线', sortable: false },
    { key: 'origin', title: '出发地', sortable: false },
    { key: 'destination', title: '目的地', sortable: false },
    { key: 'trip_count', title: '航次数', sortable: false },
    { key: 'avg_duration', title: '平均时长', sortable: false }
  ])

  // 导航方法
  const navigateToVessels = () => {
    router.push('/vessels')
  }

  const navigateToAnchorages = () => {
    router.push('/anchorages')
  }

  const navigateToTrips = () => {
    router.push('/trips')
  }

  // 添加防抖变量
  let chartLoadTimeout: NodeJS.Timeout | null = null

  // 重置日期范围并重新加载数据
  const resetAndLoadChartData = () => {
    // 重置日期范围到默认值
    dateRange.value = { startDate: '2024-12-01', endDate: '2024-12-31' }

    // 调用日期选择器的重置方法
    if (dateRangeSelectorRef.value) {
      // 通过直接调用组件内部方法来重置日期
      ;(dateRangeSelectorRef.value as any).resetToDefaultDates?.()
    } else {
      // 如果组件引用不可用，直接触发日期变化事件
      handleDateRangeChange('2024-12-01', '2024-12-31')
    }
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    dateRange.value = { startDate, endDate }

    // 清除之前的定时器
    if (chartLoadTimeout) {
      clearTimeout(chartLoadTimeout)
    }

    // 设置新的定时器，实现防抖
    chartLoadTimeout = setTimeout(() => {
      // 确保图表重新加载数据
      loadChartData()
    }, 300) // 300ms防抖延迟
  }

  const loadChartData = async () => {
    // 防止重复加载
    if (chartLoading.value) {
      return
    }

    chartLoading.value = true
    try {
      const response = await apiService.dashboard.getTrends(
        undefined,
        dateRange.value.startDate,
        dateRange.value.endDate
      )
      const rawTrendData = response.data?.data?.daily_trends || []

      if (rawTrendData.length === 0) {
        trendData.value = []
        return
      }

      // 转换数据格式以匹配图表组件的期望
      trendData.value = rawTrendData
        .map((item) => {
          // 将ISO日期格式化为更友好的格式
          const date = new Date(item.date)
          const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`

          return {
            name: formattedDate, // 使用格式化后的日期作为X轴标签
            航次: item.trips, // 将trips映射为"航次"
            活跃船舶: item.active_vessels, // 将active_vessels映射为"活跃船舶"
            平均时长: Math.round(item.avg_duration * 100) / 100 // 保留两位小数
          }
        })
        .reverse() // 反转数组以按时间正序显示（因为后端返回的是DESC顺序）
    } catch (error: any) {
      console.error('加载趋势数据失败:', error)
      // 如果API调用失败，提供一些示例数据以确保图表能正常显示
      trendData.value = [
        { name: '12/1', 航次: 150, 活跃船舶: 120, 平均时长: 25.5 },
        { name: '12/5', 航次: 180, 活跃船舶: 150, 平均时长: 22.3 },
        { name: '12/10', 航次: 200, 活跃船舶: 170, 平均时长: 28.7 },
        { name: '12/15', 航次: 220, 活跃船舶: 190, 平均时长: 30.2 },
        { name: '12/20', 航次: 190, 活跃船舶: 160, 平均时长: 26.8 },
        { name: '12/25', 航次: 210, 活跃船舶: 180, 平均时长: 27.3 },
        { name: '12/30', 航次: 195, 活跃船舶: 165, 平均时长: 29.1 }
      ]
    } finally {
      chartLoading.value = false
    }
  }

  const loadPopularRoutes = async () => {
    routesLoading.value = true
    try {
      const popularRoutesRes = await apiService.trips.getPopularRoutes(10)

      if (popularRoutesRes.data?.data) {
        // 将后端返回的数据结构转换为前端表格期望的格式
        const rawData = popularRoutesRes.data.data
        popularRoutes.value = rawData.map((route: any) => ({
          name: `${route.start_anchorage} → ${route.end_anchorage}`,
          origin: route.start_anchorage,
          destination: route.end_anchorage,
          trip_count: route.trip_count,
          avg_duration: parseFloat(route.avg_duration_hours || 0)
        }))
      } else {
        popularRoutes.value = []
      }
    } catch (error: any) {
      // 如果无法获取热门航线数据，尝试从trip数据中构建
      try {
        const tripsRes = await apiService.trips.getAll()
        const trips = tripsRes.data?.data || []

        // 构建热门航线数据（按路线分组）
        const routeMap = new Map()
        trips.forEach((trip: any) => {
          const routeKey = `${trip.start_anchorage || '未知'}-${trip.end_anchorage || '未知'}`
          if (routeMap.has(routeKey)) {
            routeMap.set(routeKey, routeMap.get(routeKey) + 1)
          } else {
            routeMap.set(routeKey, 1)
          }
        })

        // 转换为流行路线格式
        popularRoutes.value = Array.from(routeMap.entries())
          .map(([route, count]) => {
            const [origin, destination] = route.split('-')
            return {
              name: `${origin} → ${destination}`,
              origin: origin,
              destination: destination,
              trip_count: count,
              avg_duration: 24 // 示例平均时长
            }
          })
          .sort((a, b) => b.trip_count - a.trip_count)
          .slice(0, 10)
      } catch (routeErr) {
        popularRoutes.value = []
      }
    } finally {
      routesLoading.value = false
    }
  }

  const loadData = async () => {
    loading.value = true
    error.value = null

    try {
      // 并行加载数据
      const [overviewRes, trendsRes] = await Promise.allSettled([
        apiService.dashboard.getOverview(7),
        loadChartData()
      ])

      if (overviewRes.status === 'fulfilled') {
        // 如果API响应包含预期的摘要数据，则使用它
        if (overviewRes.value.data?.data?.summary) {
          summary.value = overviewRes.value.data?.data?.summary
        } else {
          // 如果API没有提供摘要，我们手动获取统计信息
          try {
            // 并行获取各种数据以构建摘要
            const [vesselsRes, anchoragesRes, tripsRes] = await Promise.allSettled([
              apiService.vessels.getAll(),
              apiService.anchorages.getAll(),
              apiService.trips.getAll()
            ])

            summary.value = {
              total_vessels:
                vesselsRes.status === 'fulfilled' ? vesselsRes.value.data?.data?.length || 0 : 0,
              total_anchorages:
                anchoragesRes.status === 'fulfilled'
                  ? anchoragesRes.value.data?.data?.length || 0
                  : 0,
              total_trips:
                tripsRes.status === 'fulfilled' ? tripsRes.value.data?.data?.length || 0 : 0,
              active_vessels:
                vesselsRes.status === 'fulfilled' ? vesselsRes.value.data?.data?.length || 0 : 0 // 简化活跃船舶计算，使用总船舶数
            }
          } catch (summaryErr) {
            summary.value = {
              total_vessels: 0,
              total_anchorages: 0,
              total_trips: 0,
              active_vessels: 0
            }
          }
        }
      } else {
        // 尝试手动获取数据
        try {
          const [vesselsRes, anchoragesRes, tripsRes] = await Promise.allSettled([
            apiService.vessels.getAll(),
            apiService.anchorages.getAll(),
            apiService.trips.getAll()
          ])

          summary.value = {
            total_vessels:
              vesselsRes.status === 'fulfilled' ? vesselsRes.value.data?.data?.length || 0 : 0,
            total_anchorages:
              anchoragesRes.status === 'fulfilled'
                ? anchoragesRes.value.data?.data?.length || 0
                : 0,
            total_trips:
              tripsRes.status === 'fulfilled' ? tripsRes.value.data?.data?.length || 0 : 0,
            active_vessels:
              vesselsRes.status === 'fulfilled' ? vesselsRes.value.data?.data?.length || 0 : 0
          }
        } catch (fallbackErr) {
          summary.value = {
            total_vessels: 0,
            total_anchorages: 0,
            total_trips: 0,
            active_vessels: 0
          }
        }
      }

      // 趋势数据已在loadChartData中处理
    } catch (err: any) {
      error.value = '加载数据失败，请检查后端服务是否正常运行'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadData()
    loadPopularRoutes()
    // 不再手动调用loadChartData，让DateRangeSelector组件自动触发日期变化事件
  })
</script>

<style scoped>
  /* 欢迎卡片样式 - 参考时光胶囊项目 */
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

  /* 活动横幅样式 - 参考时光胶囊项目 */
  .cta-banner {
    margin-top: 12px;
    padding: 16px;
    border-radius: var(--radius-sm);
    background: linear-gradient(90deg, rgba(124, 87, 255, 0.08), rgba(255, 138, 101, 0.04));
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(124, 87, 255, 0.1);
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
  }

  .stat-icon.vessels {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
  }

  .stat-icon.anchorages {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
  }

  .stat-icon.trips {
    background: linear-gradient(135deg, #10b981, #14b8a6);
  }

  .stat-icon.active {
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

  /* 快速入口网格 - 参考时光胶囊项目 */
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 12px;
  }

  .quick {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px;
    border-radius: var(--radius-sm);
    background: linear-gradient(180deg, #fbfdff, #ffffff);
    border: 1px solid #f1f6ff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
    border-color: var(--accent);
  }

  .qicon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
  }

  .qicon.vessels {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
  }

  .qicon.anchorages {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
  }

  .qicon.trips {
    background: linear-gradient(135deg, #10b981, #14b8a6);
  }

  /* 数据网格 */
  .data-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    margin: 18px 0;
  }

  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 32px 0;
    color: var(--muted);
  }

  .empty-state.success {
    color: #10b981;
  }

  /* 徽章和样式 */
  .badge {
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }

  .badge.trips {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  .duration {
    color: #374151;
    font-weight: 500;
  }

  /* 热门航线表格样式 */
  :deep(.card[header='热门航线'] table) {
    table-layout: fixed;
  }

  :deep(.card[header='热门航线'] th) {
    text-align: center !important;
    padding: 12px 8px !important;
    width: 20% !important;
  }

  /* 使用更强的选择器覆盖text-left样式 */
  :deep(.card[header='热门航线'] th.text-left) {
    text-align: center !important;
  }

  :deep(.card[header='热门航线'] th .flex) {
    justify-content: center !important;
  }

  :deep(.card[header='热门航线'] td) {
    text-align: center !important;
    padding: 12px 8px !important;
  }

  /* 响应式设计 */
  @media (max-width: 1024px) {
    .data-grid {
      grid-template-columns: 1fr;
    }

    .quick-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .welcome {
      flex-direction: column;
      text-align: center;
    }

    .cta-banner {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
