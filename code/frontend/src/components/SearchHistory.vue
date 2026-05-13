<template>
  <div class="search-history">
    <!-- 搜索历史标题 -->
    <div class="history-header">
      <h4>搜索历史</h4>
      <button @click="clearHistory" class="clear-btn" v-if="searchHistory.length > 0">
        清空历史
      </button>
    </div>

    <!-- 搜索历史列表 -->
    <div v-if="searchHistory.length > 0" class="history-list">
      <div
        v-for="(item, index) in searchHistory"
        :key="index"
        class="history-item"
        @click="selectHistoryItem(item)"
      >
        <div class="history-icon">🕐</div>
        <div class="history-content">
          <div class="history-query">{{ item.query }}</div>
          <div class="history-time">{{ formatTime(item.timestamp) }}</div>
        </div>
        <button @click.stop="removeHistoryItem(index)" class="remove-btn">
          ✕
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>暂无搜索历史</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface HistoryItem {
  query: string
  timestamp: number
  type?: string
}

const emit = defineEmits<{
  selectHistory: [item: HistoryItem]
}>()

const searchHistory = ref<HistoryItem[]>([])
const MAX_HISTORY_ITEMS = 10

// 加载搜索历史
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
    searchHistory.value = []
  }
}

// 保存搜索历史
const saveHistory = () => {
  try {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 添加搜索历史
const addHistoryItem = (query: string, type?: string) => {
  if (!query || query.trim().length === 0) return

  const trimmedQuery = query.trim()
  
  // 检查是否已存在相同的搜索
  const existingIndex = searchHistory.value.findIndex(
    item => item.query.toLowerCase() === trimmedQuery.toLowerCase()
  )
  
  // 如果存在，先删除旧的
  if (existingIndex > -1) {
    searchHistory.value.splice(existingIndex, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift({
    query: trimmedQuery,
    timestamp: Date.now(),
    type
  })
  
  // 限制历史记录数量
  if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_ITEMS)
  }
  
  saveHistory()
}

// 删除单个历史记录
const removeHistoryItem = (index: number) => {
  searchHistory.value.splice(index, 1)
  saveHistory()
}

// 清空历史记录
const clearHistory = () => {
  searchHistory.value = []
  saveHistory()
}

// 选择历史记录
const selectHistoryItem = (item: HistoryItem) => {
  emit('selectHistory', item)
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN')
}

// 暴露方法给父组件
defineExpose({
  addHistoryItem,
  clearHistory
})

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.search-history {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.history-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.clear-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.history-list {
  max-height: 250px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background-color: #f9fafb;
}

.history-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 6px;
  margin-right: 12px;
  font-size: 14px;
}

.history-content {
  flex: 1;
}

.history-query {
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  margin-bottom: 2px;
}

.history-time {
  color: #6b7280;
  font-size: 12px;
}

.remove-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0;
}

.history-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #6b7280;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .history-header {
    background-color: #f8f9ff;
    border-bottom-color: #e9eefb;
  }

  .history-header h4 {
    color: #263444;
  }

  .clear-btn {
    color: #6b7280;
  }

  .clear-btn:hover {
    background-color: #e9eefb;
    color: #263444;
  }

  .history-item {
    border-bottom-color: #f3f4f6;
  }

  .history-item:hover {
    background-color: #f0f1ff;
  }

  .history-icon {
    background-color: #eef2ff;
  }

  .history-query {
    color: #263444;
  }

  .history-time {
    color: #6b7280;
  }

  .remove-btn {
    color: #6b7280;
  }

  .remove-btn:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }

  .empty-state {
    color: #6b7280;
  }
}
</style>