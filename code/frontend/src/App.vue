<script setup lang="ts">
  import { RouterView, useRouter, useRoute } from 'vue-router'
  import MainLayout from '@/components/MainLayout.vue'
  import { ref, onMounted, watch } from 'vue'

  const router = useRouter()
  const route = useRoute()
  const isLoggedIn = ref(false)

  // 模拟登录状态管理
  const checkLoginStatus = () => {
    const loginStatus = sessionStorage.getItem('isLoggedIn')
    isLoggedIn.value = loginStatus === 'true'

    // 如果未登录且不在登录页面，跳转到登录页
    if (!isLoggedIn.value && route.name !== 'login') {
      router.push('/login')
    }

    // 如果已登录且在登录页面，跳转到仪表板
    if (isLoggedIn.value && route.name === 'login') {
      router.push('/dashboard')
    }
  }

  // 监听路由变化
  watch(route, checkLoginStatus)

  // 初始化时检查登录状态
  onMounted(checkLoginStatus)
</script>

<template>
  <!-- 登录页面不需要主布局 -->
  <div v-if="route.name === 'login'">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>

  <!-- 其他页面使用主布局 -->
  <MainLayout v-else>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </MainLayout>
</template>

<style>
  /* 全局样式变量 - 参考时光胶囊项目设计 */
  :root {
    --bg: #f7f9ff;
    --card: #ffffff;
    --muted: #6b7280;
    --accent: #7c57ff;
    --accent-2: #ff8a65;
    --accent-3: #10b981;
    --accent-4: #f59e0b;
    --glass: rgba(255, 255, 255, 0.6);
    --success: #37b24d;
    --warning: #f59e0b;
    --error: #ef4444;
    --shadow: 0 18px 50px rgba(12, 20, 60, 0.08);
    --shadow-hover: 0 25px 60px rgba(12, 20, 60, 0.12);
    --shadow-active: 0 30px 70px rgba(12, 20, 60, 0.16);
    --radius: 16px;
    --radius-sm: 12px;
    --radius-lg: 20px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    height: 100%;
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft Yahei';
    color: #071022;
  }

  /* 背景样式 - 参考时光胶囊项目 */
  body {
    background-color: #eef4ff;
    --noise: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.03"/></svg>');
    background-image:
      var(--noise),
      radial-gradient(800px 420px at 8% 12%, rgba(124, 87, 255, 0.18), transparent 25%),
      radial-gradient(700px 360px at 92% 86%, rgba(255, 138, 101, 0.15), transparent 28%),
      radial-gradient(1400px 520px at 50% 6%, rgba(16, 185, 129, 0.08), transparent 32%),
      radial-gradient(1000px 400px at 25% 75%, rgba(245, 158, 11, 0.06), transparent 30%),
      linear-gradient(135deg, rgba(124, 87, 255, 0.02) 0%, rgba(255, 138, 101, 0.02) 50%, rgba(16, 185, 129, 0.02) 100%);
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%;
  }

  /* 通用卡片样式 */
  .card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    position: relative;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(124, 87, 255, 0.3), 
      transparent
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card:hover::before {
    opacity: 1;
  }

  .icon-btn {
    background: linear-gradient(135deg, #fff, #fbfdff);
    padding: 12px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(238, 244, 255, 0.8);
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(12, 20, 60, 0.06);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .icon-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 15px 35px rgba(12, 20, 60, 0.12);
    border-color: rgba(124, 87, 255, 0.3);
  }

  .badge {
    background: linear-gradient(135deg, var(--accent), #9a6cff);
    color: #fff;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(124, 87, 255, 0.2);
    position: relative;
    overflow: hidden;
  }

  .badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  .badge:hover::before {
    left: 100%;
  }

  .badge.success {
    background: linear-gradient(135deg, var(--accent-3), #059669);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  }

  .badge.warning {
    background: linear-gradient(135deg, var(--accent-4), #d97706);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  }

  .badge.error {
    background: linear-gradient(135deg, var(--error), #dc2626);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }

  .pill {
    padding: 10px 16px;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(246, 248, 255, 0.9), rgba(240, 244, 255, 0.8));
    font-size: 13px;
    color: var(--muted);
    border: 1px solid rgba(124, 87, 255, 0.1);
    box-shadow: 0 2px 8px rgba(12, 20, 60, 0.04);
    transition: all 0.3s ease;
  }

  .pill:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(12, 20, 60, 0.08);
    border-color: rgba(124, 87, 255, 0.2);
  }

  /* 渐变按钮样式 */
  .btn-gradient {
    background: linear-gradient(135deg, var(--accent), #9a6cff, #a855f7);
    background-size: 200% 200%;
    color: #fff;
    padding: 14px 24px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 12px 30px rgba(124, 87, 255, 0.15);
    position: relative;
    overflow: hidden;
  }

  .btn-gradient::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .btn-gradient:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 20px 45px rgba(124, 87, 255, 0.25);
    background-position: 100% 0;
  }

  .btn-gradient:hover::before {
    left: 100%;
  }

  /* 页面容器样式 */
  .page-container {
    max-width: 1400px;
    margin: 18px auto;
    padding: 12px 28px;
    position: relative;
    z-index: 1;
  }
</style>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
