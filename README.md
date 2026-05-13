# 近海渔船航行及港口调度系统

Offshore Fishing Vessel Navigation and Port Scheduling System

## 项目简介

基于 MySQL + Node.js + Vue 3 的数据库课设项目，实现对近海渔船、锚地、航次的综合管理。提供驾驶舱仪表盘、多维度搜索、数据可视化等功能。

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite + TailwindCSS + Chart.js |
| 后端 | Node.js + Express 4 |
| 数据库 | MySQL 8 |
| 数据处理 | Python + pandas |

## 快速开始

### 前置依赖
- Node.js 18+
- MySQL 8
- Python 3 (数据导入可选)

### 1. 数据库初始化
```sql
source code/data_pre/database_schema.sql;
```

### 2. 导入数据（可选）
```bash
cd code/data_pre
pip install -r requirements.txt
python import.py
```

### 3. 启动后端
```bash
cd code/backend
npm install
cp .env.example .env   # 修改数据库配置
npm run dev
```

### 4. 启动前端
```bash
cd code/frontend
npm install
cp .env.example .env
npm run dev
```

服务启动后，浏览器访问 `http://localhost:5173`。

## 项目结构
```
code/
├── backend/          # Express REST API
├── frontend/         # Vue 3 前端
└── data_pre/         # 数据预处理脚本
```

## API 文档

后端提供 RESTful API，所有接口位于 `/api/v1/`，涵盖船舶、锚地、航次、驾驶舱数据等模块。

## 数据库设计

6 张表（满足 3NF）、2 个视图、触发器，支持船舶、锚地、航次、停靠等业务数据的完整管理。
