<template>
  <div class="skeleton-container">
    <!-- 卡片骨架屏 -->
    <div v-if="type === 'card'" class="skeleton-card skeleton"></div>
    
    <!-- 列表骨架屏 -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="n in rows" :key="n" class="skeleton-item">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-text" :style="{ width: Math.random() * 40 + 60 + '%' }"></div>
          <div class="skeleton skeleton-text" :style="{ width: Math.random() * 30 + 40 + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- 表格骨架屏 -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div v-for="n in columns" :key="n" class="skeleton skeleton-text"></div>
      </div>
      <div v-for="row in rows" :key="row" class="skeleton-table-row">
        <div v-for="col in columns" :key="col" class="skeleton skeleton-text"></div>
      </div>
    </div>
    
    <!-- 统计卡片骨架屏 -->
    <div v-else-if="type === 'stats'" class="skeleton-stats">
      <div v-for="n in count" :key="n" class="skeleton-stat-card">
        <div class="skeleton skeleton-icon"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    </div>
    
    <!-- 图表骨架屏 -->
    <div v-else-if="type === 'chart'" class="skeleton-chart">
      <div class="skeleton skeleton-chart-header"></div>
      <div class="skeleton skeleton-chart-body"></div>
    </div>
    
    <!-- 通用骨架屏 -->
    <div v-else class="skeleton skeleton-text" :style="{ width: width || '100%' }"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'list' | 'table' | 'stats' | 'chart' | 'text'
  rows?: number
  columns?: number
  count?: number
  width?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 3,
  columns: 4,
  count: 4
})
</script>

<style scoped>
.skeleton-container {
  width: 100%;
}

/* 卡片骨架屏 */
.skeleton-card {
  height: 120px;
  border-radius: var(--radius);
}

/* 列表骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 表格骨架屏 */
.skeleton-table {
  width: 100%;
}

.skeleton-table-header {
  display: grid;
  grid-template-columns: repeat(var(--columns, 4), 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: repeat(var(--columns, 4), 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

/* 统计卡片骨架屏 */
.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.skeleton-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.skeleton-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

/* 图表骨架屏 */
.skeleton-chart {
  width: 100%;
  height: 350px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-chart-header {
  height: 24px;
  width: 150px;
}

.skeleton-chart-body {
  flex: 1;
  border-radius: 8px;
}

/* 通用骨架屏样式 */
.skeleton {
  background: linear-gradient(90deg, 
    #f0f0f0 25%, 
    #e0e0e0 50%, 
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-text {
  height: 1em;
  border-radius: 4px;
}

.skeleton-title {
  height: 1.5em;
  width: 60%;
  border-radius: 4px;
}
</style>