# 近海渔船航行及港口调度系统

## 项目概述

这是一个近海渔船航行及港口调度系统，包含前端和后端服务。

## 技术栈

- **前端**: Vue 3, TypeScript, Vite, TailwindCSS
- **后端**: Node.js, Express, MySQL
- **数据库**: MySQL

## 快速启动

### 方法一：使用Shell脚本（Linux/Mac推荐）

1. 确保已安装 Node.js 和 npm
2. 使脚本具有执行权限：
   ```bash
   chmod +x ./start_project.sh
   ```
3. 运行启动脚本：
   ```bash
   ./start_project.sh
   ```

### 方法二：手动启动

1. **启动后端服务**:
   ```bash
   cd backend
   npm install
   node app.js
   ```

2. **启动前端服务**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```


## 访问地址

- **前端**: http://localhost:3000
- **后端API**: http://localhost:3001
- **健康检查**: http://localhost:3001/health

## API文档

### 基础信息

- **基础URL**: `http://localhost:3001/api/v1`
- **响应格式**: JSON
- **认证方式**: 暂无（开发环境）

### 主要端点

#### 船舶管理 (`/vessels`)
- `GET /vessels` - 获取船舶列表（支持分页）
- `GET /vessels/:id` - 获取船舶详情
- `GET /vessels/search` - 搜索船舶
- `GET /vessels/types` - 获取船舶类型列表
- `GET /vessels/stats` - 获取船舶统计信息
- `GET /vessels/positions` - 获取所有船舶位置信息

#### 锚地管理 (`/anchorages`)
- `GET /anchorages` - 获取锚地列表
- `GET /anchorages/:id` - 获取锚地详情
- `GET /anchorages/search` - 搜索锚地
- `GET /anchorages/types` - 获取锚地类型
- `GET /anchorages/zones` - 获取区域列表
- `GET /anchorages/:id/traffic` - 获取锚地交通流量
- `GET /anchorages/:id/current` - 获取当前停留船舶
- `GET /anchorages/:id/stats` - 获取锚地统计信息

#### 航次管理 (`/trips`)
- `GET /trips` - 获取航次列表
- `GET /trips/:id` - 获取航次详情
- `GET /trips/search` - 搜索航次
- `GET /trips/vessel/:vesselId` - 获取船舶航次
- `GET /trips/recent/active` - 获取活跃航次
- `GET /trips/stats` - 获取航次统计
- `GET /trips/daily-stats` - 获取每日航次统计

#### 仪表板 (`/dashboard`)
- `GET /dashboard/overview` - 获取系统概览
- `GET /dashboard/trip-trends` - 获取航次趋势数据

### 响应格式

成功响应：
```json
{
  "success": true,
  "data": {},
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

错误响应：
```json
{
  "success": false,
  "error": "错误信息",
  "message": "用户友好的错误描述"
}
```

## 系统功能

- 船舶管理
- 锚地管理
- 航次管理
- 统计分析
- 高级搜索

## 前端设计

前端界面参考了时光胶囊项目的现代化设计风格，具有以下特点：

- **现代化UI设计**: 采用渐变色彩、卡片式布局和流畅动画
- **响应式布局**: 适配不同屏幕尺寸，支持移动端访问
- **直观的数据展示**: 统计卡片、图表和列表清晰展示系统数据
- **用户友好交互**: 悬停效果、过渡动画和微交互提升用户体验
- **统一的设计语言**: 全局样式变量确保视觉一致性

### 主要页面

1. **仪表板**: 系统概览、统计信息和快速入口
2. **船舶管理**: 船舶列表、搜索筛选和详细信息
3. **锚地管理**: 锚地状态、容量监控和使用情况
4. **航次管理**: 航次记录、状态跟踪和路线规划
5. **统计分析**: 数据图表、趋势分析和报告生成
6. **高级搜索**: 多条件搜索和结果筛选

## 项目结构

```
code/
├── backend/          # 后端服务
│   ├── app.js        # 应用入口文件
│   ├── config/       # 配置文件
│   ├── models/       # 数据模型
│   ├── routes/       # API路由
│   ├── utils/        # 工具函数
│   └── scripts/      # 数据库脚本
├── frontend/         # 前端服务
│   ├── src/
│   │   ├── components/  # Vue组件
│   │   ├── views/       # 页面视图
│   │   ├── services/    # API服务
│   │   ├── stores/      # 状态管理
│   │   ├── router/      # 路由配置
│   │   ├── types/       # TypeScript类型
│   │   └── utils/       # 工具函数
│   ├── public/          # 静态资源
│   └── dist/            # 构建输出
└── data_pre/         # 数据预处理脚本和数据库导入工具
```

## 前端架构

### 组件层次结构

```
App.vue
└── MainLayout.vue
    ├── Header.vue
    ├── Sidebar.vue
    └── Router View
        ├── DashboardView.vue
        ├── VesselsView.vue
        ├── AnchoragesView.vue
        ├── TripsView.vue
        └── SearchView.vue
```

### 核心组件

#### 通用组件 (`/components`)
- **Card.vue**: 通用卡片组件
- **DataTable.vue**: 数据表格组件
- **EnhancedDataTable.vue**: 增强表格组件
- **Chart.vue**: 图表组件
- **EnhancedChart.vue**: 增强图表组件
- **SearchBar.vue**: 搜索栏组件
- **DateRangeSelector.vue**: 日期范围选择器
- **StatusIndicator.vue**: 状态指示器

#### 页面组件 (`/views`)
- **DashboardView.vue**: 仪表板页面
- **VesselsView.vue**: 船舶管理页面
- **VesselDetailView.vue**: 船舶详情页面
- **AnchoragesView.vue**: 锚地管理页面
- **AnchorageDetailView.vue**: 锚地详情页面
- **TripsView.vue**: 航次管理页面
- **TripDetailView.vue**: 航次详情页面
- **SearchView.vue**: 搜索页面

### 状态管理

使用Pinia进行状态管理：

```typescript
// stores/counter.ts
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  actions: {
    increment() {
      this.count++
    }
  }
})
```

### API服务层

统一的API服务封装：

```typescript
// services/api.ts
export const apiService = {
  vessels: {
    getAll: (limit?: number, offset?: number) => axios.get('/vessels'),
    getById: (id: string) => axios.get(`/vessels/${id}`),
    search: (query: string) => axios.get('/vessels/search', { params: { q: query } })
  },
  // ... 其他API
}
```

### 路由配置

```typescript
// router/index.ts
const routes = [
  { path: '/', component: DashboardView },
  { path: '/vessels', component: VesselsView },
  { path: '/vessels/:id', component: VesselDetailView },
  // ... 其他路由
]
```

## 开发指南

### 前端开发

1. **启动开发服务器**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **构建生产版本**:
   ```bash
   npm run build
   ```

3. **代码检查**:
   ```bash
   npm run lint
   ```

4. **格式化代码**:
   ```bash
   npm run format
   ```

5. **运行测试**:
   ```bash
   npm run test
   ```

### 后端开发

1. **启动开发服务器**:
   ```bash
   cd backend
   npm run dev
   ```

2. **启动生产服务器**:
   ```bash
   npm start
   ```

3. **运行测试**:
   ```bash
   npm test
   ```

### 代码规范

- **前端**: 使用ESLint + Prettier进行代码格式化
- **后端**: 遵循RESTful API设计规范
- **数据库**: 使用统一的命名规范（snake_case）
- **提交**: 使用语义化提交信息

## 数据库设计

### 数据库架构

系统采用符合第三范式(3NF)的关系型数据库设计，包含以下核心表：

#### 核心表结构

1. **vessels** - 船舶基本信息表
   - `vessel_id`: 船舶唯一标识符（主键）
   - `mmsi`: 海事移动业务识别码（唯一）
   - `vessel_name`: 船舶名称
   - `vessel_type`: 船舶类型

2. **anchorages** - 锚地/港口位置信息表
   - `anchorage_id`: 锚地ID（主键）
   - `anchorage_name`: 锚地名称
   - `anchorage_type`: 锚地类型（港口/码头区/停泊区/锚地等）
   - `area_zone`: 区域（南区/西区/北区等）
   - `zone_number`: 区域编号

3. **trips** - 航次基本信息表
   - `trip_id`: 航次唯一标识符（主键）
   - `vessel_id`: 关联船舶ID（外键）
   - `trip_start`: 航次开始时间
   - `trip_end`: 航次结束时间

4. **visits** - 访问记录表
   - `visit_id`: 访问记录ID（主键）
   - `trip_id`: 关联航次ID（外键）
   - `anchorage_id`: 关联锚地ID（外键）
   - `arrival_time`: 到达时间
   - `departure_time`: 离开时间

5. **vessel_types** - 船舶类型表
   - `type_id`: 类型ID（主键）
   - `type_name`: 类型名称
   - `category`: 类型分类

6. **port_scheduling_stats** - 港口调度统计视图
   - 预计算的统计数据视图

#### 关系设计

```
vessels (1) ←→ (N) trips ←→ (N) visits ←→ (1) anchorages
   ↓                                 ↑
vessel_types                    port_scheduling_stats
```

#### 索引优化

- 主键索引：所有表的主键字段
- 外键索引：所有外键字段
- 查询索引：常用查询字段（vessel_type, anchorage_type, area_zone等）
- 时间索引：时间字段（trip_start, trip_end, arrival_time等）

#### 数据约束

- 外键约束确保数据完整性
- 检查约束：航次结束时间必须晚于开始时间
- 唯一约束：MMSI号码唯一性
- 非空约束：关键字段不能为空

## 数据预处理

数据预处理目录 (`data_pre/`) 包含以下文件和功能：

- **database_schema.sql**: 数据库表结构定义，包含船舶、锚地、航次和访问记录等表
- **dataset.csv**: 原始数据文件，包含船舶航行数据
- **import.py**: Python数据导入脚本，用于将CSV数据导入MySQL数据库
- **requirements.txt**: Python依赖包列表
- **.env**: 环境配置文件（如存在）

### 数据导入流程

1. 确保MySQL数据库已安装并运行
2. 安装Python依赖：
   ```bash
   cd data_pre
   pip install -r requirements.txt
   ```
3. 配置数据库连接信息（在import.py中或通过环境变量）
4. 执行数据导入：
   ```bash
   python import.py
   ```

## 环境配置

### 后端环境变量

在 `backend/.env` 文件中配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fishing_vessel_db
DB_USER=root
DB_PASSWORD=your_password

# 服务器配置
PORT=3001
NODE_ENV=development

# 安全配置
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
```

### 前端环境变量

在 `frontend/.env` 文件中配置：

```env
# API配置
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_APP_TITLE=近海渔船航行及港口调度系统
```

## 依赖项

### 系统要求
- **Node.js**: v20.19.0 或更高版本（前端）
- **Node.js**: v18.0.0 或更高版本（后端）
- **npm**: 最新版本
- **MySQL**: v8.0 或更高版本
- **Git**: 最新版本

### 后端依赖
```json
{
  "express": "^4.18.2",      // Web框架
  "mysql2": "^3.6.0",        // MySQL数据库驱动
  "cors": "^2.8.5",          // 跨域支持
  "dotenv": "^16.3.1",       // 环境变量管理
  "express-rate-limit": "^6.10.0", // 请求限流
  "helmet": "^7.0.0",        // 安全中间件
  "morgan": "^1.10.0",       // 日志记录
  "joi": "^17.9.2",          // 数据验证
  "moment": "^2.29.4"        // 时间处理
}
```

### 前端依赖
```json
{
  "vue": "^3.5.25",          // Vue框架
  "vue-router": "^4.6.3",    // 路由管理
  "pinia": "^3.0.4",         // 状态管理
  "axios": "^1.13.2",        // HTTP客户端
  "chart.js": "^4.5.1",      // 图表库
  "recharts": "^3.5.1",      // React图表库（Vue兼容）
  "tailwindcss": "^4.1.17",  // CSS框架
  "typescript": "~5.9.0"     // TypeScript支持
}
```

## 部署指南

### 开发环境部署

1. **克隆项目**:
   ```bash
   git clone <repository-url>
   cd db_design/code
   ```

2. **数据库设置**:
   ```bash
   # 创建数据库
   mysql -u root -p
   CREATE DATABASE fishing_vessel_db;
   
   # 导入数据库结构
   mysql -u root -p fishing_vessel_db < data_pre/database_schema.sql
   
   # 导入数据（可选）
   cd data_pre
   pip install -r requirements.txt
   python import.py
   ```

3. **启动服务**:
   ```bash
   # 使用启动脚本（推荐）
   ./start_project.sh
   
   # 或手动启动
   cd backend && npm install && npm run dev &
   cd frontend && npm install && npm run dev
   ```

### 生产环境部署

1. **构建前端**:
   ```bash
   cd frontend
   npm run build
   ```

2. **配置反向代理**（Nginx示例）:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **使用PM2管理后端进程**:
   ```bash
   npm install -g pm2
   cd backend
   pm2 start app.js --name "fishing-vessel-api"
   pm2 startup
   pm2 save
   ```

4. **配置SSL证书**（生产环境推荐）:
   ```bash
   # 使用Let's Encrypt
   certbot --nginx -d your-domain.com
   ```

### Docker部署

创建 `Dockerfile`:

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "app.js"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

使用 `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: fishing_vessel_db
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

## 故障排除

1. **端口占用**: 脚本会自动终止占用3000和3001端口的进程
2. **依赖问题**: 确保网络连接正常，以便下载依赖项
3. **权限问题**: 在Windows上运行脚本时可能需要管理员权限

## 安全性

### SQL注入防护

本系统已全面修复SQL注入漏洞，采用以下安全措施：

#### 🔒 已修复的漏洞

**后端模型文件安全修复**:
- `Vessel.js`: 修复`searchVessels`方法的SQL注入漏洞
- `Trip.js`: 修复8个方法的SQL注入漏洞，包括：
  - `findByVessel`
  - `findByDateRange` 
  - `findByAnchorage`
  - `getLongTrips`
  - `findByDepartureDate`
  - `findByArrivalDate`
  - `searchTrips`
  - `getDailyTripStatsByDateRange`
- `Anchorage.js`: 修复5个方法的SQL注入漏洞，包括：
  - `getAnchorageMonthlyTrends`
  - `getAnchorageVesselTraffic`
  - `getCurrentAnchoredVessels`
  - `getAnchorageTrafficSummary`
  - `getAnchorageComprehensiveInfo`

#### 🛡️ 安全措施

1. **参数化查询**: 所有用户输入通过`?`占位符传递，防止SQL注入
2. **输入验证**: 对数字参数进行严格验证和边界检查
3. **错误处理**: 完善的错误处理机制，避免信息泄露
4. **代码审查**: 定期安全代码审查和漏洞扫描

#### 🔧 安全最佳实践

- 使用预处理语句而非字符串拼接
- 对所有用户输入进行验证和清理
- 实施最小权限原则
- 定期更新依赖项和安全补丁
- 启用数据库查询日志监控

### 其他安全建议

1. **环境变量管理**: 敏感配置信息使用环境变量存储
2. **CORS配置**: 根据生产环境需求配置跨域策略
3. **访问控制**: 实施适当的身份认证和授权机制
4. **HTTPS**: 生产环境启用HTTPS加密传输
5. **日志监控**: 建立安全事件日志和监控告警

## 性能优化

### 前端优化

1. **代码分割**:
   - 路由级别的懒加载
   - 组件按需导入
   - 第三方库分离

2. **资源优化**:
   - 图片压缩和懒加载
   - CSS/JS文件压缩
   - 静态资源CDN加速

3. **缓存策略**:
   - HTTP缓存头设置
   - 本地存储缓存
   - Service Worker缓存

### 后端优化

1. **数据库优化**:
   - 索引优化
   - 查询语句优化
   - 连接池配置

2. **API优化**:
   - 响应数据压缩
   - 分页查询
   - 缓存热点数据

3. **服务器优化**:
   - 启用Gzip压缩
   - 负载均衡
   - 集群部署

### 监控指标

#### 前端监控
- **性能指标**: FCP、LCP、FID、CLS
- **用户体验**: 页面加载时间、交互响应时间
- **错误监控**: JavaScript错误、API请求失败

#### 后端监控
- **系统指标**: CPU、内存、磁盘使用率
- **应用指标**: 响应时间、吞吐量、错误率
- **数据库指标**: 查询时间、连接数、慢查询

## 监控和日志

### 日志管理

1. **前端日志**:
   ```javascript
   // 错误日志收集
   window.addEventListener('error', (event) => {
     console.error('Error:', event.error);
     // 发送到日志服务
   });
   ```

2. **后端日志**:
   ```javascript
   // 使用Morgan记录HTTP请求
   app.use(morgan('combined'));
   
   // 自定义日志
   const logger = require('./utils/logger');
   logger.info('Application started');
   ```

### 性能监控

1. **APM工具集成**:
   - New Relic
   - DataDog
   - 应用性能监控

2. **自定义监控**:
   ```javascript
   // 响应时间监控
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       console.log(`${req.method} ${req.path} - ${duration}ms`);
     });
     next();
   });
   ```

## 故障排除

### 常见问题

1. **端口占用**:
   ```bash
   # 查找占用端口的进程
   netstat -ano | findstr :3000
   # 终止进程
   taskkill /PID <PID> /F
   ```

2. **数据库连接失败**:
   - 检查MySQL服务是否启动
   - 验证数据库配置信息
   - 确认网络连接

3. **依赖安装失败**:
   ```bash
   # 清除npm缓存
   npm cache clean --force
   # 删除node_modules重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **前端构建失败**:
   - 检查TypeScript类型错误
   - 验证ESLint规则
   - 确认环境变量配置

### 调试技巧

1. **后端调试**:
   ```javascript
   // 启用调试模式
   DEBUG=* npm run dev
   
   // 使用VS Code调试
   // 在launch.json中配置Node.js调试
   ```

2. **前端调试**:
   - 使用Vue DevTools
   - 浏览器开发者工具
   - Network面板监控API请求

## 贡献指南

### 开发流程

1. **创建功能分支**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **提交代码**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **推送分支**:
   ```bash
   git push origin feature/new-feature
   ```

4. **创建Pull Request**

### 提交规范

使用语义化提交信息：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 代码审查

1. **代码质量检查**:
   - ESLint检查通过
   - 单元测试覆盖率
   - 性能影响评估

2. **安全审查**:
   - SQL注入检查
   - XSS防护验证
   - 敏感信息检查

## 版本历史

- **v1.0.0** - 初始版本发布
  - 基础CRUD功能
  - 用户界面实现
  - 数据库设计

- **v1.1.0** - 安全更新
  - SQL注入漏洞修复
  - 输入验证加强
  - 错误处理改进

- **v1.2.0** - 功能增强
  - 性能优化
  - 用户体验改进
  - API文档完善

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- **项目维护**: 数据库设计课程项目组
- **问题反馈**: 通过GitHub Issues提交
- **技术支持**: 发送邮件至项目维护团队

## 致谢

感谢所有为本项目做出贡献的开发者和用户。

---

**注意**: 本项目仅用于教学目的，请在生产环境使用前进行充分的安全评估和测试。