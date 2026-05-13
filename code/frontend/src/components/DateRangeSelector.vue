<template>
  <div class="date-range-selector">
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      选择日期范围
    </label>
    <div class="date-inputs">
      <div class="date-input-group">
        <label class="text-xs text-gray-500 dark:text-gray-400">开始日期</label>
        <input
          v-model="startDate"
          type="date"
          :min="'2024-12-01'"
          :max="'2024-12-31'"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          @change="handleDateChange"
        />
      </div>
      <div class="date-separator">至</div>
      <div class="date-input-group">
        <label class="text-xs text-gray-500 dark:text-gray-400">结束日期</label>
        <input
          v-model="endDate"
          type="date"
          :min="'2024-12-01'"
          :max="'2024-12-31'"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          @change="handleDateChange"
        />
      </div>
    </div>
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">数据集时间范围：2024年12月</p>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue'

  const emit = defineEmits<{
    dateRangeChange: [startDate: string, endDate: string]
  }>()

  const startDate = ref<string>('2024-12-01')
  const endDate = ref<string>('2024-12-31')
  let isInitialized = false

  const handleDateChange = () => {
    // 确保开始日期不晚于结束日期
    if (startDate.value > endDate.value) {
      endDate.value = startDate.value
    }
    // 只有在初始化完成后才触发事件
    if (isInitialized) {
      emit('dateRangeChange', startDate.value, endDate.value)
    }
  }

  // 强制重置日期到默认值并触发事件
  const resetToDefaultDates = () => {
    startDate.value = '2024-12-01'
    endDate.value = '2024-12-31'

    // 使用nextTick确保DOM更新后再触发事件
    nextTick(() => {
      emit('dateRangeChange', startDate.value, endDate.value)
    })
  }

  onMounted(async () => {
    // 等待多个tick确保DOM完全渲染
    await nextTick()
    await nextTick()

    // 强制重置到默认日期
    resetToDefaultDates()

    // 标记为已初始化
    isInitialized = true
  })

  // 暴露方法给父组件
  defineExpose({
    resetToDefaultDates
  })
</script>

<style scoped>
  .date-range-selector {
    width: 100%;
    max-width: 320px;
  }

  .date-inputs {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }

  .date-input-group {
    flex: 1;
  }

  .date-separator {
    margin-bottom: 8px;
    color: #6b7280;
    font-size: 14px;
  }
</style>
