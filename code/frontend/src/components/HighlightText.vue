<template>
  <span v-html="highlightedText"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  query: string
  highlightClass?: string
  caseSensitive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  highlightClass: 'highlight',
  caseSensitive: false
})

const highlightedText = computed(() => {
  if (!props.query || !props.text) {
    return props.text
  }

  const flags = props.caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(`(${escapeRegex(props.query)})`, flags)
  
  return props.text.replace(regex, `<span class="${props.highlightClass}">$1</span>`)
})

const escapeRegex = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
:deep(.highlight) {
  background-color: #fef3c7;
  color: #92400e;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  :deep(.highlight) {
    background-color: #451a03;
    color: #fef3c7;
  }
}
</style>