<template>
  <div class="auth-container">
    <div class="auth-wrapper">
      <!-- 品牌介绍卡片 -->
      <section class="card brand-card">
        <div class="shape-top" aria-hidden></div>
        <div class="shape-btm" aria-hidden></div>

        <div class="logo-wrap">
          <div class="logo">船舶</div>
          <div>
            <h1>近海船只航行和港口管理系统</h1>
            <div class="small muted">实时监控、智能分析、高效管理</div>
          </div>
        </div>

        <p class="lead">
          欢迎使用近海船只航行和港口管理系统。本系统提供全面的船只监控、港口管理和航行数据分析功能。
          通过本系统，您可以实时了解船只动态、港口状态和航行轨迹。
        </p>

        <div style="margin-top: 18px; display: flex; gap: 12px; flex-wrap: wrap">
          <div style="min-width: 200px">
            <div style="font-weight: 700">系统功能</div>
            <div class="muted">船只监控、港口管理、航行分析</div>
          </div>
          <div style="min-width: 200px">
            <div style="font-weight: 700">技术特点</div>
            <div class="muted">实时数据、智能分析</div>
          </div>
        </div>

        <div class="footer">船舶管理系统 • 数据演示平台 • 2025</div>
      </section>

      <!-- 认证卡片 -->
      <section class="card auth-card pulse" aria-labelledby="auth-heading">
        <div class="auth-header">
          <div>
            <div class="auth-title" id="auth-heading">登录或注册</div>
          </div>
          <div class="links">
            <a href="#" @click.prevent="showTermsModal">隐私政策</a>
            <a href="#" @click.prevent="showTermsModal">服务条款</a>
          </div>
        </div>

        <!-- 标签页 -->
        <div class="tabs" role="tablist">
          <button
            class="tab"
            :class="{ active: activeTab === 'login' }"
            @click="activeTab = 'login'"
            role="tab"
            aria-selected="true"
          >
            登录
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'register' }"
            @click="activeTab = 'register'"
            role="tab"
          >
            注册
          </button>
        </div>

        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" class="form" @submit.prevent="handleLogin">
          <div class="field">
            <label for="login-id">邮箱 / 用户名</label>
            <input
              id="login-id"
              type="text"
              v-model="loginForm.username"
              placeholder="admin@maritime.com"
              required
            />
          </div>

          <div class="field">
            <label for="login-pw">密码</label>
            <input
              id="login-pw"
              type="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              required
            />
          </div>

          <div class="helper">
            <a href="#" @click.prevent="showForgotPasswordModal">忘记密码？</a>
          </div>

          <div style="display: flex; gap: 10px">
            <button type="submit" class="btn primary">登录</button>
            <button type="button" class="btn ghost" @click="activeTab = 'register'">注册</button>
          </div>

          <!-- 演示信息 -->
          <div class="example">
            <strong>演示账号</strong>
            <div style="margin-top: 6px; font-size: 13px">
              admin@maritime.com / admin123 （管理员）<br />
              operator@maritime.com / op456 （操作员）
            </div>
          </div>
        </form>

        <!-- 注册表单 -->
        <form v-if="activeTab === 'register'" class="form" @submit.prevent="handleRegister">
          <div class="field">
            <label for="reg-email">邮箱</label>
            <input
              id="reg-email"
              type="email"
              v-model="registerForm.email"
              placeholder="your@maritime.com"
              required
            />
          </div>

          <div class="row">
            <div style="flex: 1">
              <label for="reg-code">验证码</label>
              <input
                id="reg-code"
                type="text"
                v-model="registerForm.code"
                placeholder="请输入验证码"
                required
              />
            </div>
            <div>
              <button
                type="button"
                class="btn ghost"
                @click="handleSendCode"
                :disabled="codeCountdown > 0"
              >
                {{ codeCountdown > 0 ? `已发送 (${codeCountdown}s)` : '发送验证码' }}
              </button>
            </div>
          </div>

          <div class="field">
            <label for="reg-name">昵称</label>
            <input
              id="reg-name"
              type="text"
              v-model="registerForm.name"
              placeholder="请输入您的昵称"
              required
            />
          </div>

          <div class="field">
            <label for="reg-pw">设置密码</label>
            <input
              id="reg-pw"
              type="password"
              v-model="registerForm.password"
              placeholder="至少6位"
              required
            />
          </div>

          <div class="field">
            <label for="reg-pw2">确认密码</label>
            <input
              id="reg-pw2"
              type="password"
              v-model="registerForm.confirmPassword"
              placeholder="再次输入密码"
              required
            />
          </div>

          <div class="field checkbox">
            <input id="agree" type="checkbox" v-model="registerForm.agree" />
            <label for="agree" class="small"
              >我已阅读并同意<a href="#" @click.prevent="showTermsModal">隐私政策</a></label
            >
          </div>

          <div style="display: flex; gap: 10px">
            <button type="submit" class="btn primary">注册并登录</button>
            <button type="button" class="btn ghost" @click="activeTab = 'login'">返回登录</button>
          </div>
        </form>
      </section>
    </div>

    <!-- 忘记密码模态框 -->
    <div
      v-if="showForgotPassword"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-title"
    >
      <div class="modal-panel">
        <div class="modal-header">
          <h3 id="forgot-title">找回密码</h3>
          <button class="modal-close" @click="showForgotPassword = false">✕</button>
        </div>
        <p class="muted">请输入邮箱并完成验证，然后设置新密码。</p>

        <div class="field" style="margin: 16px 0">
          <label for="forgot-email">邮箱</label>
          <input
            id="forgot-email"
            type="email"
            v-model="forgotPasswordForm.email"
            placeholder="your@maritime.com"
            required
          />
        </div>

        <div class="field">
          <label for="forgot-code">验证码</label>
          <div class="row">
            <input
              id="forgot-code"
              type="text"
              v-model="forgotPasswordForm.code"
              placeholder="请输入验证码"
              required
            />
            <button
              type="button"
              class="btn ghost"
              @click="handleForgotSendCode"
              :disabled="
                forgotCodeCountdown > 0 ||
                !forgotPasswordForm.email ||
                !/^\S+@\S+\.\S+$/.test(forgotPasswordForm.email)
              "
            >
              {{ forgotCodeCountdown > 0 ? `已发送 (${forgotCodeCountdown}s)` : '发送验证码' }}
            </button>
          </div>
        </div>

        <div class="field">
          <label for="forgot-new-password">新密码</label>
          <input
            id="forgot-new-password"
            type="password"
            v-model="forgotPasswordForm.newPassword"
            placeholder="至少6位"
            required
          />
        </div>

        <div class="field">
          <label for="forgot-confirm-password">确认新密码</label>
          <input
            id="forgot-confirm-password"
            type="password"
            v-model="forgotPasswordForm.confirmPassword"
            placeholder="再次输入新密码"
            required
          />
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px">
          <button class="btn ghost" @click="showForgotPassword = false">取消</button>
          <button class="btn primary" @click="handleForgotPasswordSubmit">重置密码</button>
        </div>
      </div>
    </div>

    <!-- 条款协议模态框 -->
    <div v-if="showTerms" class="modal" role="dialog" aria-modal="true" aria-labelledby="doc-title">
      <div class="modal-panel terms-modal">
        <div class="modal-header">
          <h3 id="doc-title">隐私政策 / 服务条款</h3>
          <button class="modal-close" @click="showTerms = false">✕</button>
        </div>
        <div class="terms-content">
          <h4 style="margin: 16px 0 8px 0">隐私政策</h4>
          <p><strong>生效日期：</strong>2025年1月1日</p>
          <p><strong>1. 信息收集</strong></p>
          <p>我们仅收集为提供近海船只航行和港口管理服务所必需的个人信息，包括但不限于：</p>
          <ul style="margin-left: 20px; margin-top: 8px">
            <li>用户身份信息（姓名、邮箱、联系方式）</li>
            <li>船只位置和航行数据（用于实时监控）</li>
            <li>操作记录和系统使用日志（用于服务优化）</li>
          </ul>

          <p><strong>2. 信息使用</strong></p>
          <p>收集的信息将严格用于以下目的：</p>
          <ul style="margin-left: 20px; margin-top: 8px">
            <li>提供和维护船只管理服务</li>
            <li>改善用户体验和服务质量</li>
            <li>确保系统安全和防止欺诈行为</li>
            <li>遵守法律法规要求</li>
          </ul>

          <p><strong>3. 信息保护</strong></p>
          <p>
            我们采用业界标准的安全措施保护您的个人信息，包括数据加密、访问控制和安全审计。未经您的明确同意，我们不会向第三方共享您的个人信息，法律要求的除外。
          </p>

          <p><strong>4. 用户权利</strong></p>
          <p>
            您有权访问、更正、删除您的个人信息，并撤回已给予的同意。如需行使这些权利，请通过系统提供的功能或联系我们的客服。
          </p>

          <h4 style="margin: 16px 0 8px 0">服务条款</h4>
          <p><strong>生效日期：</strong>2025年1月1日</p>
          <p><strong>1. 服务说明</strong></p>
          <p>
            近海船只航行和港口管理系统（以下简称"本系统"）是一个提供船只监控、港口管理和航行数据分析的专业平台。
          </p>

          <p><strong>2. 使用许可</strong></p>
          <p>
            在遵守本条款的前提下，我们授予您有限的、非独占的、不可转让的许可，使用本系统提供的服务。
          </p>

          <p><strong>3. 用户义务</strong></p>
          <p>使用本系统时，您必须：</p>
          <ul style="margin-left: 20px; margin-top: 8px">
            <li>提供真实、准确、完整的注册信息</li>
            <li>维护账户安全，不与他人共享登录凭据</li>
            <li>遵守所有适用的法律法规</li>
            <li>不从事任何可能损害系统安全或性能的行为</li>
          </ul>

          <p><strong>4. 知识产权</strong></p>
          <p>
            本系统的所有内容、功能、设计均受知识产权法保护，未经授权不得复制、修改、分发或创建衍生作品。
          </p>

          <p><strong>5. 免责声明</strong></p>
          <p>
            本系统按"现状"提供服务，不保证服务的连续性、准确性或可靠性。因使用本系统而产生的任何直接或间接损失，我们不承担责任。
          </p>

          <p><strong>6. 条款变更</strong></p>
          <p>
            我们保留随时修改本条款的权利。重大变更将通过系统通知或其他方式告知用户。继续使用本系统即表示您接受修改后的条款。
          </p>

          <p><strong>7. 联系我们</strong></p>
          <p>如有任何关于隐私政策或服务条款的问题，请通过以下方式联系我们：</p>
          <p>
            邮箱：legal@maritime-system.com<br />
            电话：400-888-9999
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn primary" @click="showTerms = false">我已阅读并同意</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  // 模拟用户数据
  const DEMO_USERS = [
    { id: 1, email: 'admin@maritime.com', password: 'admin123', name: '管理员' },
    { id: 2, email: 'operator@maritime.com', password: 'op456', name: '操作员' }
  ]

  const FIXED_CODE = '123456'

  // 状态管理
  const activeTab = ref<'login' | 'register'>('login')
  const codeCountdown = ref(0)
  const forgotCodeCountdown = ref(0)
  let codeTimer: number | null = null
  let forgotCodeTimer: number | null = null

  // 模态框状态
  const showForgotPassword = ref(false)
  const showTerms = ref(false)

  // 表单数据
  const loginForm = reactive({
    username: '',
    password: ''
  })

  const registerForm = reactive({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
    name: '',
    agree: false
  })

  const forgotPasswordForm = reactive({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 初始化
  onMounted(() => {
    // 初始化代码
  })

  // 发送验证码
  const handleSendCode = () => {
    if (!registerForm.email || !/^\S+@\S+\.\S+$/.test(registerForm.email)) {
      alert('请先输入有效的邮箱地址！')
      return
    }

    // 开始倒计时
    codeCountdown.value = 60

    codeTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        if (codeTimer) clearInterval(codeTimer)
        codeTimer = null
      }
    }, 1000)

    // 显示发送成功提示
    alert('验证码已发送！\n\n提示：演示验证码为 123456')
  }

  // 登录处理
  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      alert('请输入用户名/邮箱和密码！')
      return
    }

    const found = DEMO_USERS.find(
      (u) => u.email === loginForm.username && u.password === loginForm.password
    )

    if (found) {
      // 设置登录状态
      sessionStorage.setItem('isLoggedIn', 'true')
      sessionStorage.setItem('currentUser', JSON.stringify(found))

      // 模拟跳转到主页
      router.push('/dashboard')
    } else {
      alert(
        '用户名/邮箱或密码错误！\n\n提示：\n- 管理员账号：admin@maritime.com / admin123\n- 操作员账号：operator@maritime.com / op456'
      )
    }
  }

  // 注册处理
  const handleRegister = () => {
    if (!registerForm.email || !/^\S+@\S+\.\S+$/.test(registerForm.email)) {
      alert('请输入有效的邮箱地址！')
      return
    }
    if (registerForm.code !== FIXED_CODE) {
      alert('验证码错误！\n\n提示：演示验证码为 123456')
      return
    }
    if (!registerForm.name || registerForm.name.trim() === '') {
      alert('请输入您的昵称！')
      return
    }
    if (!registerForm.password || registerForm.password.length < 6) {
      alert('密码长度至少为6位！')
      return
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('两次输入的密码不一致！')
      return
    }
    if (!registerForm.agree) {
      alert('请阅读并同意隐私政策！')
      return
    }

    // 设置登录状态
    const newUser = {
      id: Date.now(),
      email: registerForm.email,
      name: registerForm.name
    }
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('currentUser', JSON.stringify(newUser))

    // 模拟注册成功
    router.push('/dashboard')
  }

  // 忘记密码验证码发送
  const handleForgotSendCode = () => {
    if (!forgotPasswordForm.email || !/^\S+@\S+\.\S+$/.test(forgotPasswordForm.email)) {
      alert('请先输入有效的邮箱地址！')
      return
    }

    // 开始倒计时
    forgotCodeCountdown.value = 60

    forgotCodeTimer = setInterval(() => {
      forgotCodeCountdown.value--
      if (forgotCodeCountdown.value <= 0) {
        if (forgotCodeTimer) clearInterval(forgotCodeTimer)
        forgotCodeTimer = null
      }
    }, 1000)

    // 显示发送成功提示
    alert('验证码已发送！\n\n提示：演示验证码为 123456')
  }

  // 忘记密码提交
  const handleForgotPasswordSubmit = () => {
    // 验证邮箱
    if (!forgotPasswordForm.email || !/^\S+@\S+\.\S+$/.test(forgotPasswordForm.email)) {
      alert('请输入有效的邮箱地址！')
      return
    }

    // 验证验证码
    if (forgotPasswordForm.code !== FIXED_CODE) {
      alert('验证码错误！\n\n提示：演示验证码为 123456')
      return
    }

    // 验证新密码
    if (!forgotPasswordForm.newPassword || forgotPasswordForm.newPassword.length < 6) {
      alert('新密码长度至少为6位！')
      return
    }

    // 验证密码确认
    if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword) {
      alert('两次输入的新密码不一致！')
      return
    }

    // 模拟密码重置成功
    showForgotPassword.value = false

    // 重置表单
    Object.assign(forgotPasswordForm, {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: ''
    })

    // 显示成功提示
    alert('密码重置成功！请使用新密码登录。')
  }

  // 显示模态框
  const showForgotPasswordModal = () => {
    showForgotPassword.value = true
  }

  const showTermsModal = () => {
    showTerms.value = true
  }
</script>

<style scoped>
  /* 全局样式和设计令牌 */
  :root {
    --bg: #f6f8fb;
    --card: #ffffff;
    --muted: #6b7280;
    --accent: #7c57ff;
    --accent-2: #ff8a65;
    --glass: rgba(255, 255, 255, 0.6);
    --shadow: 0 12px 40px rgba(16, 24, 64, 0.08);
    --radius: 14px;
    --radius-sm: 10px;
  }

  .auth-container {
    min-height: 100vh;
    background: linear-gradient(180deg, #f3f6ff 0%, #fff 60%);
    padding: 20px;
  }

  .auth-wrapper {
    max-width: 1180px;
    margin: 36px auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    min-height: calc(100vh - 72px);
    align-items: center;
  }

  /* 通用组件样式 */
  .card {
    background: var(--card);
    border-radius: var(--radius);
    padding: 28px;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    font-size: 14px;
  }

  .btn.primary {
    background: linear-gradient(90deg, var(--accent), #9a6cff);
    color: #fff;
    box-shadow: 0 8px 20px rgba(124, 87, 255, 0.14);
  }

  .btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(124, 87, 255, 0.2);
  }

  .btn.ghost {
    background: transparent;
    border: 1px solid #eef2ff;
    color: var(--muted);
  }

  .btn.ghost:hover {
    background: rgba(124, 87, 255, 0.05);
    border-color: var(--accent);
    color: var(--accent);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* BrandCard 组件样式 */
  .brand-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 10px;
  }

  .logo-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .logo {
    width: 86px;
    height: 86px;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 20px;
    box-shadow: 0 8px 30px rgba(124, 87, 255, 0.18);
  }

  h1 {
    margin: 0;
    font-size: 28px;
    color: var(--accent);
  }

  .lead {
    color: var(--muted);
    max-width: 42ch;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  /* 装饰形状 */
  .shape-top {
    position: absolute;
    right: -60px;
    top: -60px;
    width: 260px;
    height: 260px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    opacity: 0.08;
    border-radius: 54px;
    transform: rotate(20deg);
  }

  .shape-btm {
    position: absolute;
    left: -40px;
    bottom: -40px;
    width: 200px;
    height: 200px;
    background: linear-gradient(90deg, #ffe6d9, #f8f1ff);
    opacity: 0.06;
    border-radius: 34px;
  }

  /* AuthCard 组件样式 */
  .auth-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .auth-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .auth-title {
    font-size: 18px;
    font-weight: 800;
    margin: 0;
  }

  .auth-subtitle {
    color: var(--muted);
    margin-top: 6px;
    font-size: 14px;
  }

  .links {
    display: flex;
    gap: 10px;
  }

  .links a {
    font-size: 13px;
    color: var(--muted);
    transition: color 0.2s;
  }

  .links a:hover {
    color: var(--accent);
  }

  /* Tabs 组件样式 */
  .tabs {
    display: flex;
    background: transparent;
    border-radius: 12px;
    padding: 6px;
    gap: 6px;
    margin-bottom: 8px;
  }

  .tab {
    flex: 1;
    padding: 12px;
    border-radius: var(--radius-sm);
    border: none;
    background: transparent;
    font-weight: 700;
    color: #5b6170;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab.active {
    background: linear-gradient(90deg, var(--accent), #9a6cff);
    color: #fff;
    box-shadow: 0 8px 20px rgba(124, 87, 255, 0.14);
  }

  .tab:hover:not(.active) {
    background: rgba(124, 87, 255, 0.05);
  }

  /* Form 组件样式 */
  .form {
    margin-top: 6px;
  }

  .field {
    margin-bottom: 16px;
  }

  label {
    display: block;
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 6px;
    font-weight: 500;
  }

  input[type='text'],
  input[type='password'],
  input[type='email'] {
    width: 100%;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid #e7ecf6;
    background: #fbfcff;
    font-size: 14px;
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    box-shadow: 0 8px 24px rgba(124, 87, 255, 0.06);
    border-color: rgba(124, 87, 255, 0.22);
    background: #fff;
  }

  .row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .helper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 13px;
  }

  .small {
    font-size: 12px;
    color: var(--muted);
  }

  /* DemoInfo 组件样式 */
  .example {
    background: #f9fbff;
    padding: 16px;
    border-radius: var(--radius-sm);
    border: 1px solid #f1f6ff;
    color: var(--muted);
    font-size: 13px;
    margin-top: 16px;
  }

  /* Modal 组件样式 */
  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(6, 10, 18, 0.36);
    z-index: 50;
    backdrop-filter: blur(4px);
    padding: 20px;
  }

  .modal-panel {
    background: #fff;
    padding: 24px;
    border-radius: var(--radius);
    max-width: 720px;
    width: 90%;
    max-height: 85vh;
    box-shadow: 0 16px 48px rgba(8, 12, 40, 0.2);
    animation: modalSlideIn 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  .modal-panel.small {
    max-width: 420px;
  }

  /* 忘记密码弹窗特定样式 */
  .modal-panel:not(.terms-modal) {
    max-width: 480px;
  }

  /* 条款协议模态框特定样式 */
  .terms-modal {
    max-width: 800px;
    width: 95%;
  }

  .terms-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 12px;
    margin-top: 8px;
    color: var(--muted);
    line-height: 1.6;
    max-height: 60vh;
  }

  .terms-content::-webkit-scrollbar {
    width: 8px;
  }

  .terms-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .terms-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  .terms-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  .modal-footer {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: center;
  }

  .modal-footer .btn {
    min-width: 160px;
  }

  .modal-panel .field:last-child {
    margin-bottom: 0;
  }

  .modal .btn {
    min-width: 100px;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .modal h3 {
    margin: 0;
    font-size: 18px;
    color: #1f2937;
  }

  .modal-close {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--muted);
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .modal-close:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1f2937;
  }

  /* Checkbox 组件样式 */
  .checkbox {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .checkbox input {
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }

  .checkbox label {
    margin: 0;
    line-height: 1.4;
  }

  /* 工具类 */
  .muted {
    color: var(--muted);
  }
  .text-center {
    text-align: center;
  }

  /* Footer 组件样式 */
  .footer {
    margin-top: 24px;
    text-align: center;
    color: #98a0b4;
    font-size: 13px;
  }

  /* 动画效果 */
  .pulse {
    animation: pulse 2.8s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  }

  /* 响应式设计 */
  @media (max-width: 960px) {
    .auth-wrapper {
      grid-template-columns: 1fr;
      padding: 12px;
      gap: 20px;
    }

    .card {
      padding: 20px;
    }

    .logo-wrap {
      flex-direction: column;
      text-align: center;
    }

    .auth-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .links {
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {
    .row {
      flex-direction: column;
    }

    .helper {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  /* 无障碍支持 */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* 焦点样式 */
  button:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>
