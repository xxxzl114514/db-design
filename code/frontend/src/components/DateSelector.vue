<template>
  <div class="date-selector">
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      选择日期
    </label>
    <input
      v-model="selectedDate"
      type="date"
      :min="'2024-12-01'"
      :max="'2024-12-31'"
      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      @change="handleDateChange"
    />
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">数据集时间范围：2024年12月</p>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  const emit = defineEmits<{
    dateChange: [date: string]
  }>()

  const selectedDate = ref<string>('2024-12-15')

  const handleDateChange = () => {
    emit('dateChange', selectedDate.value)
  }

  onMounted(() => {
    // 默认选择2024年12月15日
    emit('dateChange', selectedDate.value)
  })
</script>

<style scoped>
  .date-selector {
    width: 100%;
    max-width: 200px;
  }
</style>
