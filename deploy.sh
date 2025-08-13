#!/bin/bash

# AI语文助手自动部署脚本

echo "🚀 AI语文助手自动部署脚本"
echo "=================================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装，请先安装Python3"
    exit 1
fi

echo "✅ Python3环境检查通过"

# 检查pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3未安装"
    exit 1
fi

echo "✅ pip3检查通过"

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi

echo "✅ 后端依赖安装完成"

# 检查环境变量
echo "🔑 检查API密钥配置..."
if [ -z "$QWEN_API_KEY" ] && [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "⚠️  警告: 未检测到API密钥，将使用默认模型"
    echo "💡 建议配置API密钥以获得更好的体验："
    echo "   export QWEN_API_KEY='your_key'"
    echo "   export DEEPSEEK_API_KEY='your_key'"
else
    echo "✅ API密钥配置检查完成"
fi

# 启动后端服务
echo "🚀 启动后端服务..."
python3 app.py &
BACKEND_PID=$!

echo "📡 后端服务已启动 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ 后端服务健康检查通过"
else
    echo "❌ 后端服务启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 回到项目根目录
cd ..

# 启动前端服务
echo "🌐 启动前端服务..."
echo "📖 访问地址: http://localhost:8080"
echo "📱 写作模块: http://localhost:8080/src/writing-module/writing.html"
echo ""
echo "💡 使用说明:"
echo "1. 点击'写作训练'进入写作模块"
echo "2. 选择题目开始写作"
echo "3. 点击右下角AI助手按钮使用AI功能"
echo ""
echo "🛑 停止服务: 按 Ctrl+C"
echo "=================================="

# 启动前端服务
python3 -m http.server 8080

# 脚本结束时清理后端进程
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID 2>/dev/null; exit 0" INT TERM
