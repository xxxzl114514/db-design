# 近海渔船航行及港口调度系统 - 后端API

## 项目简介

这是近海渔船航行及港口调度系统的后端API服务，提供完整的船舶管理、锚地调度、航次追踪和数据分析功能。

## 技术栈

- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **MySQL** - 数据库
- **mysql2** - MySQL驱动
- **Helmet** - 安全中间件
- **CORS** - 跨域支持
- **Morgan** - 日志中间件
- **express-rate-limit** - 请求限制

## 项目结构

```
backend/
├── app.js                 # 主应用文件
├── package.json           # 项目依赖配置
├── .env                   # 环境变量配置
├── config/
│   └── database.js        # 数据库连接配置
├── models/
│   ├── Vessel.js          # 船舶数据模型
│   ├── Anchorage.js       # 锚地数据模型
│   └── Trip.js            # 航次数据模型
└── routes/
    ├── vessels.js         # 船舶相关API路由
    ├── anchorages.js      # 锚地相关API路由
    ├── trips.js           # 航次相关API路由
    └── dashboard.js       # 仪表板API路由
```

## 安装和运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=vessel_system
DB_CHARSET=utf8mb4

# 服务器配置
PORT=3001
NODE_ENV=development

# API配置
API_PREFIX=/api/v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. 启动服务

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API端点

### 基础端点
- `GET /health` - 健康检查
- `GET /api` - API信息

### 船舶管理 (`/api/v1/vessels`)
- `GET /vessels` - 获取所有船舶
- `GET /vessels/:id` - 获取指定船舶
- `GET /vessels/mmsi/:mmsi` - 根据MMSI获取船舶
- `GET /vessels/type/:typeName` - 根据类型获取船舶
- `GET /vessels/:id/trips` - 获取船舶航次
- `GET /vessels/search/:keyword` - 搜索船舶
- `GET /vessels/stats/overview` - 获取船舶统计

### 锚地管理 (`/api/v1/anchorages`)
- `GET /anchorages` - 获取所有锚地
- `GET /anchorages/:id` - 获取指定锚地
- `GET /anchorages/type/:anchorageType` - 根据类型获取锚地
- `GET /anchorages/zone/:areaZone` - 根据区域获取锚地
- `GET /anchorages/stats/scheduling` - 获取调度统计
- `GET /anchorages/:id/activity` - 获取锚地活动
- `GET /anchorages/:id/peaktimes` - 获取高峰使用时间
- `GET /anchorages/search/:keyword` - 搜索锚地
- `GET /anchorages/stats/zones` - 获取区域统计

### 航次管理 (`/api/v1/trips`)
- `GET /trips` - 获取所有航次
- `GET /trips/:id` - 获取指定航次
- `GET /trips/vessel/:vesselId` - 根据船舶获取航次
- `GET /trips/daterange/:startDate/:endDate` - 根据日期范围获取航次
- `GET /trips/anchorage/:anchorageId` - 根据锚地获取航次
- `GET /trips/stats/overview` - 获取航次统计
- `GET /trips/stats/daily` - 获取每日统计
- `GET /trips/routes/popular` - 获取热门航线
- `GET /trips/current/active` - 获取当前活跃航次
- `GET /trips/long/duration` - 获取长时间航次
- `GET /trips/search/:keyword` - 搜索航次

### 仪表板 (`/api/v1/dashboard`)
- `GET /dashboard/overview` - 获取总览信息
- `GET /dashboard/realtime` - 获取实时状态
- `GET /dashboard/trends` - 获取趋势分析
- `GET /dashboard/alerts` - 获取警报信息

## 数据库视图

系统使用以下数据库视图来提供复杂查询：

1. **trip_details_view** - 航次详情视图
2. **port_scheduling_stats** - 港口调度统计视图

## 安全特性

- Helmet.js - 设置安全相关的HTTP头
- CORS - 配置跨域访问
- 请求频率限制 - 防止API滥用
- 输入验证 - 防止SQL注入
- 错误处理 - 统一的错误响应格式

### 🔒 SQL注入防护（已修复）

本系统已全面修复SQL注入漏洞，具体修复内容如下：

#### 修复的模型文件

**1. Vessel.js (`models/Vessel.js`)**
- `searchVessels()` - 修复关键词搜索注入
  ```javascript
  // 修复前（危险）
  WHERE v.vessel_name LIKE '${searchTerm}'
  
  // 修复后（安全）
  WHERE v.vessel_name LIKE ?
  // 参数: [searchTerm, searchTerm, searchTerm]
  ```

**2. Trip.js (`models/Trip.js`)**
- `findByVessel()` - 修复船舶ID注入
- `findByDateRange()` - 修复日期范围注入
- `findByAnchorage()` - 修复锚地ID注入
- `getLongTrips()` - 修复时长阈值注入
- `findByDepartureDate()` - 修复出发日期注入
- `findByArrivalDate()` - 修复到达日期注入
- `searchTrips()` - 修复多字段搜索注入
- `getDailyTripStatsByDateRange()` - 修复日期统计注入

**3. Anchorage.js (`models/Anchorage.js`)**
- `getAnchorageMonthlyTrends()` - 修复月度趋势查询注入
- `getAnchorageVesselTraffic()` - 修复交通查询注入
- `getCurrentAnchoredVessels()` - 修复当前船只查询注入
- `getAnchorageTrafficSummary()` - 修复统计摘要注入
- `getAnchorageComprehensiveInfo()` - 修复综合信息查询注入

#### 安全修复技术要点

1. **参数化查询实现**
   ```javascript
   // 所有用户输入通过占位符传递
   const sql = "SELECT * FROM vessels WHERE name LIKE ?";
   const result = await db.query(sql, [searchTerm]);
   ```

2. **输入验证和清理**
   ```javascript
   // 数字参数验证
   const numDays = Math.max(1, Math.min(365, Math.floor(Number(days) || 30)));
   
   // 字符串参数处理
   const searchTerm = `%${String(keyword)}%`;
   ```

3. **复杂查询安全处理**
   ```javascript
   // 多条件查询
   let conditions = [];
   let params = [];
   
   if (startDate) {
     conditions.push("DATE(trip_start) >= ?");
     params.push(startDate);
   }
   
   const sql = `SELECT * FROM trips WHERE ${conditions.join(' AND ')}`;
   return await db.query(sql, params);
   ```

#### 安全验证

- ✅ 所有模型文件通过语法检查
- ✅ 参数化查询正确实现
- ✅ 业务逻辑完整保留
- ✅ 错误处理机制完善

#### 持续安全措施

1. **代码审查流程**
   - 定期安全代码审查
   - 自动化安全扫描
   - 依赖项漏洞检查

2. **监控和告警**
   - 数据库查询日志监控
   - 异常访问模式检测
   - 安全事件告警机制

3. **最佳实践遵循**
   - 最小权限原则
   - 输入验证和输出编码
   - 安全的会话管理

## 响应格式

所有API响应都遵循统一的JSON格式：

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

错误响应：
```json
{
  "success": false,
  "error": "错误详情",
  "message": "操作失败",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 开发说明

### 添加新的API端点

1. 在相应的模型文件中添加数据查询方法
2. 在路由文件中定义新的路由处理函数
3. 添加适当的错误处理和输入验证

### 数据库查询优化

- 使用索引提高查询性能
- 合理使用JOIN避免N+1问题
- 实现分页减少数据传输量

## 部署

### 生产环境部署

1. 设置环境变量 `NODE_ENV=production`
2. 配置生产数据库
3. 使用PM2或类似进程管理器
4. 配置反向代理（Nginx）
5. 设置SSL证书

### Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 监控和日志

- 使用Morgan记录HTTP请求日志
- 数据库查询错误日志
- 建议集成监控工具如PM2 Monitoring

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 许可证

MIT License