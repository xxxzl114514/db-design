#!/bin/bash

# 近海渔船航行及港口调度系统 - 一键启动脚本
# 用于Linux/Mac环境下启动前端和后端服务

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查端口占用并终止进程
terminate_port_process() {
    local port=$1
    
    # 检测操作系统
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        # Windows系统
        # 使用PowerShell查找占用端口的进程ID
        local pid=$(powershell -Command "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { \$_.OwningProcess }")
        
        if [ ! -z "$pid" ] && [ "$pid" != "0" ]; then
            log_warn "端口 $port 被进程 $pid 占用，正在终止..."
            
            # 尝试多种方法终止进程
            taskkill /PID $pid /F > /dev/null 2>&1
            if [ $? -ne 0 ]; then
                log_warn "普通方法失败，尝试使用管理员权限终止..."
                powershell -Command "Start-Process cmd -ArgumentList '/c taskkill /PID $pid /F' -Verb RunAs -WindowStyle Hidden" > /dev/null 2>&1
                sleep 1
            fi
            
            # 使用wmic强制终止
            wmic process where "ProcessId=$pid" delete > /dev/null 2>&1
            
            # 等待进程完全退出
            sleep 2
            
            # 检查端口是否仍然被占用
            local new_pid=$(powershell -Command "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { \$_.OwningProcess }")
            if [ ! -z "$new_pid" ] && [ "$new_pid" != "0" ]; then
                log_warn "端口 $port 仍被占用，使用更强力方法..."
                # 使用PowerShell强制终止进程树
                powershell -Command "Stop-Process -Id $new_pid -Force -ErrorAction SilentlyContinue" > /dev/null 2>&1
                sleep 1
            fi
            
            # 最终检查
            local final_pid=$(powershell -Command "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { \$_.OwningProcess }")
            if [ -z "$final_pid" ] || [ "$final_pid" == "0" ]; then
                log_info "端口 $port 已成功释放"
            else
                log_error "无法释放端口 $port，请手动终止进程 $final_pid"
            fi
        else
            log_info "端口 $port 未被占用"
        fi
    else
        # Linux/Mac系统
        local pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            log_warn "端口 $port 被进程 $pid 占用，正在终止..."
            kill -9 $pid
            if [ $? -eq 0 ]; then
                log_info "端口 $port 的进程已终止"
                # 等待进程完全退出
                sleep 2
            fi
            
            # 检查端口是否仍然被占用
            local new_pid=$(lsof -ti:$port)
            if [ ! -z "$new_pid" ]; then
                log_warn "端口 $port 仍被占用，再次尝试终止..."
                kill -9 $new_pid
                sleep 1
            fi
        else
            log_info "端口 $port 未被占用"
        fi
    fi
    
    # 额外等待确保端口完全释放
    sleep 1
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 主函数
main() {
    log_info "正在启动近海渔船航行及港口调度系统..."

    # 检查必要命令
    if ! command_exists npm; then
        log_error "npm 未安装或未在PATH中，无法启动项目"
        exit 1
    fi

    if ! command_exists node; then
        log_error "node 未安装或未在PATH中，无法启动项目"
        exit 1
    fi

    # 终止占用端口的进程
    log_info "检查端口占用情况..."
    terminate_port_process 3001  # 后端端口
    terminate_port_process 3000  # 前端端口
    terminate_port_process 5173  # Vite默认端口

    # 获取脚本所在目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    # 启动后端服务
    log_info "正在启动后端服务..."
    cd "$SCRIPT_DIR/backend" || { log_error "无法进入 backend 目录"; exit 1; }
    
    # 安装依赖
    log_info "正在安装后端依赖..."
    npm install || { log_error "后端依赖安装失败"; exit 1; }

    # 检查端口是否仍然被占用
    check_port_still_occupied() {
        local port=$1
        local pid=$(powershell -Command "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { \$_.OwningProcess }")
        if [ ! -z "$pid" ] && [ "$pid" != "0" ]; then
            return 1  # 端口仍被占用
        else
            return 0  # 端口可用
        fi
    }
    
    # 设置后端和前端端口
    BACKEND_PORT=3001
    FRONTEND_PORT=3000
    
    # 检查后端端口是否可用，如果不可用则使用备用端口
    if ! check_port_still_occupied $BACKEND_PORT; then
        log_warn "端口 $BACKEND_PORT 仍被占用，使用备用端口 8001"
        BACKEND_PORT=8001
        # 修改后端配置文件中的端口
        if [ -f "$SCRIPT_DIR/backend/.env" ]; then
            sed -i "s/PORT=3001/PORT=$BACKEND_PORT/" "$SCRIPT_DIR/backend/.env"
        fi
    fi
    
    # 检查前端端口是否可用，如果不可用则使用备用端口
    if ! check_port_still_occupied $FRONTEND_PORT; then
        log_warn "端口 $FRONTEND_PORT 仍被占用，使用备用端口 8000"
        FRONTEND_PORT=8000
    fi
    
    # 在后台启动后端服务
    log_info "启动后端服务，使用端口 $BACKEND_PORT..."
    cd "$SCRIPT_DIR/backend" || { log_error "无法进入 backend 目录"; exit 1; }
    PORT=$BACKEND_PORT node app.js &
    BACKEND_PID=$!
    log_info "后端服务已启动，进程ID: $BACKEND_PID"
    
    # 等待后端服务启动
    log_info "等待后端服务启动..."
    sleep 3

    # 启动前端服务
    log_info "正在启动前端服务..."
    cd "$SCRIPT_DIR/frontend" || { log_error "无法进入 frontend 目录"; exit 1; }
    
    # 安装依赖
    log_info "正在安装前端依赖..."
    npm install || { log_error "前端依赖安装失败"; exit 1; }
    
    # 在后台启动前端服务，指定端口
    npm run dev -- --port $FRONTEND_PORT &
    FRONTEND_PID=$!
    log_info "前端服务已启动，进程ID: $FRONTEND_PID"

    log_success "系统已启动完成！"
    log_info "前端访问地址: http://localhost:$FRONTEND_PORT"
    log_info "后端API地址: http://localhost:$BACKEND_PORT"
    log_info "API文档: http://localhost:$BACKEND_PORT/api"
    log_info "健康检查: http://localhost:$BACKEND_PORT/health"
    
    # 等待所有后台进程完成（实际上这些进程会一直运行）
    wait $BACKEND_PID $FRONTEND_PID
}

# 捕获中断信号
trap 'log_info "正在停止服务..."; kill $(jobs -p) 2>/dev/null; exit 0' INT TERM

# 运行主函数
main