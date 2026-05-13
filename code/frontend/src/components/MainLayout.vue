<template>
  <div class="min-h-screen">
    <!-- 背景插画组件 - 参考时光胶囊项目 -->
    <div class="bg-illustration" aria-hidden>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stop-color="#7c57ff" stop-opacity="0.15" />
            <stop offset="50%" stop-color="#ff8a65" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.08" />
          </linearGradient>
          <radialGradient id="lg" cx="30%" cy="15%">
            <stop offset="0%" stop-color="#7c57ff" stop-opacity="0.2" />
            <stop offset="40%" stop-color="#ff8a65" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="rg" cx="85%" cy="85%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.15" />
            <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="cg" cx="50%" cy="50%">
            <stop offset="0%" stop-color="#ff8a65" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#lg)" />
        <rect width="100%" height="100%" fill="url(#rg)" />
        <rect width="100%" height="100%" fill="url(#cg)" />
        
        <!-- 动态椭圆背景 -->
        <g opacity="0.1">
          <ellipse cx="200" cy="120" rx="420" ry="160" fill="url(#g1)" filter="url(#blur1)">
            <animate attributeName="rx" values="420;440;420" dur="8s" repeatCount="indefinite" />
            <animate attributeName="ry" values="160;180;160" dur="6s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="1400" cy="760" rx="360" ry="140" fill="url(#g1)" filter="url(#blur1)">
            <animate attributeName="rx" values="360;380;360" dur="7s" repeatCount="indefinite" />
            <animate attributeName="ry" values="140;160;140" dur="9s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="800" cy="300" rx="280" ry="120" fill="#10b981" opacity="0.05" filter="url(#blur2)">
            <animate attributeName="rx" values="280;300;280" dur="10s" repeatCount="indefinite" />
          </ellipse>
        </g>
        
        <!-- 城市建筑剪影 -->
        <g transform="translate(0,620)" fill="#f6f8ff" opacity="0.8">
          <rect x="0" y="40" width="90" height="60" rx="6" />
          <rect x="110" y="0" width="140" height="100" rx="6" />
          <rect x="270" y="20" width="80" height="80" rx="6" />
          <rect x="370" y="10" width="120" height="90" rx="6" />
          <rect x="520" y="30" width="100" height="70" rx="6" />
          <rect x="660" y="0" width="220" height="100" rx="6" />
          <rect x="920" y="20" width="140" height="80" rx="6" />
          <rect x="1080" y="10" width="160" height="90" rx="6" />
          <rect x="1260" y="30" width="220" height="70" rx="6" />
          <rect x="1520" y="40" width="80" height="60" rx="6" />
        </g>
        
        <!-- 装饰性粒子 -->
        <g opacity="0.3">
          <circle cx="300" cy="200" r="2" fill="#7c57ff">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="500" cy="150" r="1.5" fill="#ff8a65">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="700" cy="250" r="2.5" fill="#10b981">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="900" cy="180" r="1.8" fill="#f59e0b">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="1100" cy="220" r="2.2" fill="#7c57ff">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="1300" cy="160" r="1.6" fill="#ff8a65">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4.2s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>

    <div class="page-container">
      <!-- 顶部导航栏 - 参考时光胶囊项目设计 -->
      <header class="header">
        <div class="logo">
          <div class="mark">海事</div>
          <div>
            <h2>近海渔船航行及港口调度系统</h2>
            <div class="muted">
              欢迎回来，<strong>{{ currentUser?.name || '用户' }}</strong>
            </div>
          </div>
        </div>

        <div class="search">
          <SearchBar
            placeholder="搜索船舶、锚地、航次..."
            :enable-suggestions="true"
            search-type="all"
            @search="handleSearch"
            @result-selected="handleResultSelected"
          />
        </div>

        <div class="actions">
          <div class="icon-btn ripple-button" @click="handleNotifications" title="通知">
            🔔
            <span
              v-if="notificationCount > 0"
              class="badge pulse-effect"
              style="margin-left: 8px; display: inline-block"
              >{{ notificationCount }}</span
            >
          </div>

          <!-- 用户菜单 -->
          <div class="user-menu" :class="{ active: showUserDropdown }">
            <div class="icon-btn ripple-button" @click="toggleUserDropdown" title="用户菜单">
              👤 {{ currentUser?.name?.charAt(0) || 'U' }}
            </div>

            <div v-if="showUserDropdown" class="user-dropdown">
              <div class="user-dropdown-content">
                <div class="user-info">
                  <div style="font-weight: 700">{{ currentUser?.name || '用户' }}</div>
                  <div class="muted" style="font-size: 13px">
                    {{ currentUser?.email || 'user@demo.com' }}
                  </div>
                </div>
                <button class="logout-btn" @click="handleLogout">🚪 退出登录</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 主网格布局 - 参考时光胶囊项目 -->
      <div class="main-grid" :class="{ 'no-sidebar': isVesselDetailPage }">
        <!-- 侧边栏导航 -->
        <aside class="card card-hover">
          <nav class="nav" aria-label="主导航">
            <RouterLink to="/" class="nav-link" active-class="active">📊 仪表板</RouterLink>
            <RouterLink to="/search" class="nav-link" active-class="active">🔍 全局搜索</RouterLink>
            <RouterLink to="/vessels" class="nav-link" active-class="active"
              >🚢 船舶管理</RouterLink
            >
            <RouterLink to="/anchorages" class="nav-link" active-class="active"
              >⚓ 锚地管理</RouterLink
            >
            <RouterLink to="/trips" class="nav-link" active-class="active">🛳️ 航次管理</RouterLink>
          </nav>
        </aside>

        <!-- 主内容区域 -->
        <main>
          <slot />
        </main>

        <!-- 右侧边栏 -->
        <aside v-if="!isVesselDetailPage" class="card card-hover">
          <h4 style="margin-top: 0">系统状态</h4>
          <div class="system-stats">
            <div class="stat-item">
              <div class="pill">在线: {{ onlineCount }}</div>
              <div class="pill" style="background: #10b981; color: white">
                活跃: {{ activeVessels }}
              </div>
            </div>

            <div class="stat-row">
              <div class="stat-label">AIS数据更新</div>
              <div class="stat-value" style="color: #10b981">正常</div>
            </div>

            <div class="stat-row">
              <div class="stat-label">锚地占用率</div>
              <div class="stat-value" style="color: #f59e0b">72%</div>
            </div>

            <div class="stat-row">
              <div class="stat-label">系统响应时间</div>
              <div class="stat-value">128ms</div>
            </div>

            <div class="storage-info">
              <div class="muted">存储使用</div>
              <div class="storage-bar">
                <div class="storage-used" :style="{ width: storagePercentage + '%' }"></div>
              </div>
              <div class="muted">{{ storageUsed }} / {{ storageTotal }}</div>
            </div>

            <div
              class="weather-info"
              style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px"
            >
              <div style="font-weight: 600; margin-bottom: 6px; color: #0369a1">🌊 海况信息</div>
              <div style="font-size: 13px; color: #64748b">
                <div>风力: 4-5级 东南风</div>
                <div>浪高: 0.8-1.2米</div>
                <div>能见度: 5海里</div>
                <div style="margin-top: 4px; color: #0ea5e9">适宜航行</div>
              </div>
            </div>
          </div>

          <div style="margin-top: 20px">
            <h4 style="margin-bottom: 8px">最近活动</h4>
            <div class="recent-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="recent-item">
                <div class="activity-icon">{{ activity.icon }}</div>
                <div style="flex: 1">
                  <div style="font-weight: 700; font-size: 14px">{{ activity.title }}</div>
                  <div class="muted" style="font-size: 12px; margin-top: 2px">
                    {{ activity.detail }}
                  </div>
                  <div class="muted" style="font-size: 11px; margin-top: 4px">
                    {{ activity.time }} • {{ activity.user }}
                  </div>
                </div>
              </div>
            </div>

            <div style="margin-top: 16px; text-align: center">
              <button
                style="
                  padding: 8px 16px;
                  background: #f1f5f9;
                  border: none;
                  border-radius: 6px;
                  color: #64748b;
                  font-size: 13px;
                  cursor: pointer;
                  transition: all 0.2s;
                "
                @mouseover="$event.target.style.background = '#e2e8f0'"
                @mouseout="$event.target.style.background = '#f1f5f9'"
              >
                查看全部活动
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div class="footer">近海渔船航行及港口调度系统 • © 2025 海事管理部门</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import SearchBar from './SearchBar.vue'

  const router = useRouter()
  const route = useRoute()

  // 用户信息
  const currentUser = ref<unknown>(null)
  const showUserDropdown = ref(false)

  // 初始化用户信息
  onMounted(() => {
    const userStr = sessionStorage.getItem('currentUser')
    if (userStr) {
      currentUser.value = JSON.parse(userStr)
    }
  })

  // 检测当前是否是船舶详情页面
  const isVesselDetailPage = computed(() => {
    return route.path.startsWith('/vessels/') && route.params.id
  })

  // 响应式数据
  const notificationCount = ref(5)
  const onlineCount = ref(32)
  const activeVessels = ref(24)
  const storageUsed = ref('12GB')
  const storageTotal = ref('100GB')
  const storagePercentage = ref(12) // 12GB / 100GB = 12%

  // 通知数据
  const notifications = ref([
    {
      id: 1,
      title: '船舶"浙渔运3021"即将到达锚地',
      content: '预计15分钟后到达宁波港3号锚地，请做好接驳准备',
      time: '5分钟前',
      read: false
    },
    {
      id: 2,
      title: '恶劣天气预警',
      content: '东海海域将于今晚20:00起出现7-8级大风，请通知相关船只注意安全',
      time: '30分钟前',
      read: false
    },
    {
      id: 3,
      title: '系统维护通知',
      content: '系统将于明日凌晨2:00-4:00进行例行维护，期间服务可能短暂中断',
      time: '1小时前',
      read: false
    },
    {
      id: 4,
      title: '锚地容量预警',
      content: '舟山港1号锚地容量已达90%，请引导部分船只前往备用锚地',
      time: '2小时前',
      read: false
    },
    {
      id: 5,
      title: '新航次计划审批',
      content: '船舶"闽渔运5087"提交的航次计划待审批，请及时处理',
      time: '3小时前',
      read: false
    }
  ])

  // 最近活动数据
  const recentActivities = ref([
    {
      id: 1,
      title: '船舶"浙渔运3021"位置更新',
      time: '10分钟前',
      user: '陈海峰',
      icon: '🚢',
      detail: '船舶已进入宁波港航道'
    },
    {
      id: 2,
      title: '舟山港1号锚地状态更新',
      time: '25分钟前',
      user: '林涛',
      icon: '⚓',
      detail: '当前占用率90%，18艘船舶停泊'
    },
    {
      id: 3,
      title: '航次计划审批通过',
      time: '1小时前',
      user: '王建国',
      icon: '🛳️',
      detail: '"闽渔运5087"计划已获批准'
    },
    {
      id: 4,
      title: '数据同步完成',
      time: '2小时前',
      user: '系统',
      icon: '🔄',
      detail: 'AIS数据已更新至最新'
    },
    {
      id: 5,
      title: '新增船舶注册',
      time: '3小时前',
      user: '刘明远',
      icon: '📋',
      detail: '"苏渔运6033"完成注册登记'
    },
    {
      id: 6,
      title: '锚地调度优化',
      time: '4小时前',
      user: '周振华',
      icon: '⚙️',
      detail: '宁波港锚地分配算法已优化'
    }
  ])

  // 处理搜索
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push({
        path: '/search',
        query: { q: query }
      })
    }
  }

  // 处理搜索结果选择
  const handleResultSelected = (result: unknown) => {
    // 结果选择时已经在SearchBar组件中处理了导航
    console.log('搜索结果被选择:', result)
  }

  // 处理通知
  const handleNotifications = () => {
    const unreadNotifications = notifications.value.filter((n) => !n.read)
    const notificationText = unreadNotifications
      .map((n) => `【${n.title}】\n${n.content}\n时间：${n.time}`)
      .join('\n\n')

    if (notificationText) {
      // 标记所有通知为已读
      notifications.value.forEach((n) => (n.read = true))
      notificationCount.value = 0

      alert(`您有${unreadNotifications.length}条未读通知：\n\n${notificationText}`)
    } else {
      alert('暂无新通知')
    }
  }

  // 处理用户下拉菜单
  const toggleUserDropdown = () => {
    showUserDropdown.value = !showUserDropdown.value
  }

  // 处理退出登录
  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn')
    sessionStorage.removeItem('currentUser')
    router.push('/login')
  }
</script>

<style scoped>
  /* 背景插画样式 */
  .bg-illustration {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.95;
  }

  /* 页面容器样式 */
  .page-container {
    max-width: 1400px;
    margin: 18px auto;
    padding: 12px 28px;
    position: relative;
    z-index: 1;
  }

  /* 顶部导航栏样式 */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo .mark {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 20px;
    box-shadow: 0 18px 46px rgba(124, 87, 255, 0.14);
  }

  .logo h2 {
    margin: 0;
    font-size: 20px;
    color: var(--accent);
  }

  .search {
    flex: 1;
    margin: 0 24px;
  }

  .search input {
    width: 100%;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid #e9eefb;
    background: linear-gradient(180deg, #ffffff, #fbfdff);
    box-shadow: 0 8px 30px rgba(12, 20, 60, 0.03);
    transition: all 0.2s;
  }

  .search input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 8px 30px rgba(124, 87, 255, 0.1);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* 主网格布局 */
  .main-grid {
    display: grid;
    grid-template-columns: 220px minmax(720px, 1fr) 320px;
    gap: 18px;
  }

  .main-grid.no-sidebar {
    grid-template-columns: 220px minmax(720px, 1fr);
  }

  /* 侧边栏导航样式 */
  .nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .nav-link {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px;
    border-radius: var(--radius-sm);
    color: #263444;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.18s;
  }

  .nav-link.active {
    background: linear-gradient(90deg, var(--accent), #9a6cff);
    color: #fff;
    box-shadow: 0 12px 30px rgba(124, 87, 255, 0.12);
  }

  .nav-link:hover {
    transform: translateX(4px);
    background: rgba(124, 87, 255, 0.05);
  }

  .nav-tip {
    margin-top: 12px;
    color: var(--muted);
    font-size: 13px;
  }

  /* 用户菜单样式 */
  .user-menu {
    position: relative;
  }

  .user-menu.active .icon-btn {
    background: rgba(124, 87, 255, 0.1);
    border-color: var(--accent);
  }

  /* 用户下拉菜单样式 */
  .user-dropdown {
    position: absolute;
    top: 60px;
    right: 0;
    z-index: 50;
  }

  .user-dropdown-content {
    background: #fff;
    border-radius: var(--radius);
    padding: 16px;
    box-shadow: var(--shadow);
    min-width: 200px;
  }

  .user-info {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eef4ff;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s;
  }

  .logout-btn:hover {
    background: rgba(124, 87, 255, 0.05);
  }

  /* 系统状态样式 */
  .system-stats {
    margin-top: 12px;
  }

  .stat-item {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .stat-label {
    font-size: 13px;
    color: #64748b;
  }

  .stat-value {
    font-size: 13px;
    font-weight: 600;
  }

  .storage-info {
    margin-top: 12px;
  }

  .storage-bar {
    width: 100%;
    height: 8px;
    background: #eef4ff;
    border-radius: 4px;
    margin: 8px 0;
    overflow: hidden;
  }

  .storage-used {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #9a6cff);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  /* 最近活动样式 */
  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .recent-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px;
    border-radius: var(--radius-sm);
    transition: all 0.2s;
  }

  .recent-item:hover {
    background: rgba(124, 87, 255, 0.05);
  }

  .activity-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  /* 页脚样式 */
  .footer {
    margin-top: 18px;
    text-align: center;
    color: #9aa4b2;
    font-size: 13px;
  }

  /* 响应式设计 */
  @media (max-width: 1100px) {
    .main-grid {
      grid-template-columns: 1fr;
    }
    .page-container {
      padding: 12px;
    }
    .search {
      margin: 8px 0;
    }
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: flex-start;
    }
    .logo {
      flex-direction: column;
      text-align: center;
    }
    .logo h2 {
      font-size: 16px;
    }
  }
</style>
