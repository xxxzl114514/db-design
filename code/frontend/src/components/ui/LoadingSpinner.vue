<!-- src/components/ui/LoadingSpinner.vue -->
<template>
  <div class="flex flex-col items-center justify-center py-12">
    <div class="relative">
      <!-- 主要的旋转圆圈 -->
      <div class="w-12 h-12 rounded-full border-4 border-blue-100 dark:border-gray-700"></div>
      <div
        class="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 animate-spin"
      ></div>
    </div>
    <p v-if="label" class="mt-4 text-gray-600 dark:text-gray-400 text-sm">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    label?: string
  }

  defineProps<Props>()
</script>
