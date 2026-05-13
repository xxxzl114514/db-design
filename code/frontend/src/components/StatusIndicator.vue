<template>
  <div class="flex items-center">
    <span
      class="inline-block w-3 h-3 rounded-full mr-2"
      :class="statusClass"
      :style="statusStyle"
    ></span>
    <span class="text-sm"><slot></slot></span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    status: 'active' | 'inactive' | 'warning' | 'error' | 'success' | 'pending'
  }

  const props = defineProps<Props>()

  const statusClass = computed(() => {
    switch (props.status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-gray-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      case 'success':
        return 'bg-green-500'
      case 'pending':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  })

  const statusStyle = computed(() => {
    if (props.status === 'pending') {
      return {
        animation: 'pulse 2s infinite'
      }
    }
    return {}
  })
</script>

<style>
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
</style>
