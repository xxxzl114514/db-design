<template>
  <div
    class="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transform hover:-translate-y-1"
    :class="{
      'border-0': !showBorder,
      'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50':
        variant === 'muted',
      'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900':
        variant === 'default'
    }"
  >
    <!-- 卡片头部 -->
    <div
      v-if="header || $slots.header"
      class="p-6 pb-4 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30"
      :class="{ 'border-b border-gray-200 dark:border-gray-700': showDivider }"
    >
      <slot name="header">
        <div class="flex justify-between items-start">
          <div>
            <h3
              v-if="header"
              class="text-xl font-bold text-gray-800 dark:text-white flex items-center"
            >
              <slot name="header-icon"></slot>
              {{ header }}
            </h3>
            <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ description }}
            </p>
          </div>
          <div v-if="$slots['header-actions']" class="ml-4 flex-shrink-0">
            <slot name="header-actions"></slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- 卡片内容 -->
    <div
      class="p-6"
      :class="{
        'pt-4': header || $slots.header,
        'pb-4': footer || $slots.footer,
        'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900':
          contentBg === 'gradient'
      }"
    >
      <slot></slot>
    </div>

    <!-- 卡片底部 -->
    <div
      v-if="footer || $slots.footer"
      class="p-6 pt-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-700/20 dark:to-gray-800/20"
      :class="{ 'border-t border-gray-200 dark:border-gray-700': showDivider }"
    >
      <slot name="footer">
        <div class="flex justify-between items-center">
          <div v-if="footer" class="text-sm text-gray-600 dark:text-gray-400">{{ footer }}</div>
          <div v-if="$slots['footer-actions']" class="ml-4 flex-shrink-0">
            <slot name="footer-actions"></slot>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    header?: string
    description?: string
    footer?: string
    showBorder?: boolean
    showDivider?: boolean
    variant?: 'default' | 'muted'
    contentBg?: 'default' | 'gradient'
  }

  withDefaults(defineProps<Props>(), {
    showBorder: true,
    showDivider: true,
    variant: 'default',
    contentBg: 'default'
  })
</script>
