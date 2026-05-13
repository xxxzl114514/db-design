<template>
  <div class="advanced-filter">
    <!-- 筛选器触发按钮 -->
    <button 
      @click="toggleFilter" 
      class="filter-trigger"
      :class="{ active: showFilter }"
    >
      <span class="filter-icon">🔍</span>
      <span>高级筛选</span>
      <span v-if="activeFilterCount > 0" class="filter-count">
        {{ activeFilterCount }}
      </span>
    </button>

    <!-- 筛选器面板 -->
    <transition name="slide-down">
      <div v-if="showFilter" class="filter-panel">
        <div class="filter-header">
          <h3>高级筛选</h3>
          <button @click="resetFilters" class="reset-btn">重置</button>
        </div>

        <div class="filter-content">
          <!-- 时间范围筛选 -->
          <div class="filter-group">
            <label class="filter-label">时间范围</label>
            <div class="date-range">
              <input
                v-model="filters.startDate"
                type="date"
                class="date-input"
                placeholder="开始日期"
              />
              <span class="date-separator">至</span>
              <input
                v-model="filters.endDate"
                type="date"
                class="date-input"
                placeholder="结束日期"
              />
            </div>
          </div>

          <!-- 状态筛选 -->
          <div class="filter-group">
            <label class="filter-label">状态</label>
            <div class="checkbox-group">
              <label
                v-for="status in statusOptions"
                :key="status.value"
                class="checkbox-item"
              >
                <input
                  v-model="filters.status"
                  type="checkbox"
                  :value="status.value"
                />
                <span class="checkbox-text">{{ status.label }}</span>
                <span class="checkbox-color" :style="{ backgroundColor: status.color }"></span>
              </label>
            </div>
          </div>

          <!-- 类型筛选 -->
          <div class="filter-group">
            <label class="filter-label">类型</label>
            <select v-model="filters.type" class="select-input">
              <option value="">全部类型</option>
              <option
                v-for="type in typeOptions"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- 数值范围筛选 -->
          <div class="filter-group">
            <label class="filter-label">数值范围</label>
            <div class="range-inputs">
              <input
                v-model.number="filters.minValue"
                type="number"
                class="range-input"
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <input
                v-model.number="filters.maxValue"
                type="number"
                class="range-input"
                placeholder="最大值"
              />
            </div>
          </div>

          <!-- 关键词筛选 -->
          <div class="filter-group">
            <label class="filter-label">关键词</label>
            <div class="keyword-inputs">
              <div
                v-for="(keyword, index) in filters.keywords"
                :key="index"
                class="keyword-item"
              >
                <input
                  v-model="filters.keywords[index]"
                  type="text"
                  class="keyword-input"
                  placeholder="输入关键词"
                />
                <button
                  @click="removeKeyword(index)"
                  class="keyword-remove"
                  v-if="filters.keywords.length > 1"
                >
                  ✕
                </button>
              </div>
              <button @click="addKeyword" class="keyword-add">
                + 添加关键词
              </button>
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <button @click="applyFilters" class="apply-btn">
            应用筛选
          </button>
          <button @click="toggleFilter" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface FilterOptions {
  startDate: string
  endDate: string
  status: string[]
  type: string
  minValue: number | null
  maxValue: number | null
  keywords: string[]
}

const emit = defineEmits<{
  filterChange: [filters: FilterOptions]
  filterReset: []
}>()

const showFilter = ref(false)
const filters = ref<FilterOptions>({
  startDate: '',
  endDate: '',
  status: [],
  type: '',
  minValue: null,
  maxValue: null,
  keywords: ['']
})

// 状态选项
const statusOptions = [
  { value: 'active', label: '活跃', color: '#10b981' },
  { value: 'inactive', label: '非活跃', color: '#6b7280' },
  { value: 'pending', label: '待处理', color: '#f59e0b' },
  { value: 'completed', label: '已完成', color: '#3b82f6' }
]

// 类型选项
const typeOptions = [
  { value: 'vessel', label: '船舶' },
  { value: 'anchorage', label: '锚地' },
  { value: 'trip', label: '航次' },
  { value: 'cargo', label: '货船' },
  { value: 'fishing', label: '渔船' }
]

// 计算活跃筛选器数量
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.startDate) count++
  if (filters.value.endDate) count++
  if (filters.value.status.length > 0) count++
  if (filters.value.type) count++
  if (filters.value.minValue !== null) count++
  if (filters.value.maxValue !== null) count++
  
  const nonEmptyKeywords = filters.value.keywords.filter(k => k.trim().length > 0)
  if (nonEmptyKeywords.length > 0) count++
  
  return count
})

// 切换筛选器显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

// 重置筛选器
const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    status: [],
    type: '',
    minValue: null,
    maxValue: null,
    keywords: ['']
  }
  emit('filterReset')
}

// 应用筛选器
const applyFilters = () => {
  // 清理空的关键词
  filters.value.keywords = filters.value.keywords.filter(k => k.trim().length > 0)
  if (filters.value.keywords.length === 0) {
    filters.value.keywords = ['']
  }
  
  emit('filterChange', { ...filters.value })
  showFilter.value = false
}

// 添加关键词
const addKeyword = () => {
  filters.value.keywords.push('')
}

// 删除关键词
const removeKeyword = (index: number) => {
  filters.value.keywords.splice(index, 1)
}

// 监听筛选器变化
watch(
  () => filters.value,
  () => {
    // 可以在这里添加实时筛选逻辑
  },
  { deep: true }
)

// 暴露方法给父组件
defineExpose({
  resetFilters,
  getFilters: () => ({ ...filters.value }),
  setFilters: (newFilters: Partial<FilterOptions>) => {
    filters.value = { ...filters.value, ...newFilters }
  }
})
</script>

<style scoped>
.advanced-filter {
  position: relative;
}

.filter-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border: 1px solid #e9eefb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #263444;
}

.filter-trigger:hover {
  background: linear-gradient(135deg, #f8f9ff, #f0f1ff);
  border-color: #7c57ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 87, 255, 0.15);
}

.filter-trigger.active {
  background: linear-gradient(135deg, #7c57ff, #9a6cff);
  color: white;
  border-color: #7c57ff;
}

.filter-icon {
  font-size: 16px;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.filter-trigger:not(.active) .filter-count {
  background: #7c57ff;
  color: white;
}

.filter-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9eefb;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(12, 20, 60, 0.15);
  z-index: 100;
  margin-top: 8px;
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff, #f0f1ff);
  border-bottom: 1px solid #e9eefb;
}

.filter-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #263444;
}

.reset-btn {
  background: none;
  border: none;
  color: #7c57ff;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(124, 87, 255, 0.1);
}

.filter-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #263444;
  margin-bottom: 8px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9eefb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: #7c57ff;
  box-shadow: 0 0 0 3px rgba(124, 87, 255, 0.1);
}

.date-separator {
  color: #6b7280;
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 12px;
  border: 1px solid #e9eefb;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  background: #f8f9ff;
  border-color: #7c57ff;
}

.checkbox-item input[type="checkbox"] {
  margin: 0;
}

.checkbox-text {
  font-size: 14px;
  color: #263444;
}

.checkbox-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.select-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e9eefb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
}

.select-input:focus {
  outline: none;
  border-color: #7c57ff;
  box-shadow: 0 0 0 3px rgba(124, 87, 255, 0.1);
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9eefb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.range-input:focus {
  outline: none;
  border-color: #7c57ff;
  box-shadow: 0 0 0 3px rgba(124, 87, 255, 0.1);
}

.range-separator {
  color: #6b7280;
  font-size: 14px;
}

.keyword-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keyword-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.keyword-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9eefb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.keyword-input:focus {
  outline: none;
  border-color: #7c57ff;
  box-shadow: 0 0 0 3px rgba(124, 87, 255, 0.1);
}

.keyword-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.keyword-remove:hover {
  background: #fee2e2;
  color: #dc2626;
}

.keyword-add {
  background: none;
  border: 1px dashed #7c57ff;
  color: #7c57ff;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.keyword-add:hover {
  background: rgba(124, 87, 255, 0.05);
  border-style: solid;
}

.filter-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #f8f9ff;
  border-top: 1px solid #e9eefb;
}

.apply-btn {
  flex: 1;
  padding: 10px 16px;
  background: linear-gradient(135deg, #7c57ff, #9a6cff);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-btn:hover {
  background: linear-gradient(135deg, #6a47e6, #8856f0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 87, 255, 0.3);
}

.cancel-btn {
  padding: 10px 16px;
  background: white;
  color: #6b7280;
  border: 1px solid #e9eefb;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f8f9ff;
  border-color: #7c57ff;
  color: #7c57ff;
}

/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>