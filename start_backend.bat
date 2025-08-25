@echo off
chcp 65001 >nul
title AI语文学习助手 - 后端服务启动

echo.
echo ========================================
echo    🚀 AI语文学习助手 - 后端服务启动
echo ========================================
echo.

echo 📋 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装或未添加到PATH
    echo 请先安装Python 3.8+
    pause
    exit /b 1
)
echo ✅ Python环境正常

echo.
echo 📦 检查依赖包...
cd backend
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  依赖包安装可能有问题，但继续启动...
)

echo.
echo 🔧 启动后端API服务...
echo 📡 服务地址: http://localhost:5000
echo 🔗 API健康检查: http://localhost:5000/api/ai/health
echo.

python app_refactored.py

echo.
echo ❌ 后端服务已停止
pause
