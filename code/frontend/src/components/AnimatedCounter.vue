<template>
  <span class="animated-counter" :class="{ 'counter-animation': isAnimating }">
    {{ displayValue }}
  </span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1000,
  decimals: 0
})

const displayValue = ref('0')
const isAnimating = ref(false)

const formatNumber = (num: number): string => {
  const fixed = num.toFixed(props.decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

const animateValue = (start: number, end: number, duration: number) => {
  isAnimating.value = true
  const startTime = performance.now()
  
  const updateValue = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const currentValue = start + (end - start) * easeOutQuart
    
    displayValue.value = formatNumber(currentValue)
    
    if (progress < 1) {
      requestAnimationFrame(updateValue)
    } else {
      isAnimating.value = false
    }
  }
  
  requestAnimationFrame(updateValue)
}

// 监听值变化
watch(() => props.value, (newValue, oldValue) => {
  if (oldValue !== undefined) {
    animateValue(oldValue, newValue, props.duration)
  } else {
    displayValue.value = formatNumber(newValue)
  }
}, { immediate: true })

onMounted(() => {
  displayValue.value = formatNumber(props.value)
})
</script>

<style scoped>
.animated-counter {
  display: inline-block;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.counter-animation {
  animation: countUp 0.6s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>