@echo off
title AI语文助手自动部署

echo 🚀 AI语文助手自动部署脚本
echo ==================================
echo.

REM 检查Python环境
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python环境检查通过

REM 检查pip
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip未安装
    pause
    exit /b 1
)

echo ✅ pip检查通过

REM 安装后端依赖
echo.
echo 📦 安装后端依赖...
cd backend
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo ✅ 后端依赖安装完成

REM 检查环境变量
echo.
echo 🔑 检查API密钥配置...
if not defined QWEN_API_KEY if not defined DEEPSEEK_API_KEY (
    echo ⚠️  警告: 未检测到API密钥，将使用默认模型
    echo 💡 建议配置API密钥以获得更好的体验：
    echo    set QWEN_API_KEY=your_key
    echo    set DEEPSEEK_API_KEY=your_key
    echo.
) else (
    echo ✅ API密钥配置检查完成
)

REM 启动后端服务（后台运行）
echo 🚀 启动后端服务...
start "AI助手后端" cmd /k "python app.py"

REM 等待后端启动
echo ⏳ 等待后端服务启动...
timeout /t 3 /nobreak >nul

REM 回到项目根目录
cd ..

REM 检查后端健康状态
echo 🔍 检查后端服务状态...
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  后端服务可能未完全启动，但继续启动前端...
) else (
    echo ✅ 后端服务健康检查通过
)

echo.
echo 🌐 启动前端服务...
echo 📖 访问地址: http://localhost:8080
echo 📱 写作模块: http://localhost:8080/src/writing-module/writing.html
echo.
echo 💡 使用说明:
echo 1. 点击"写作训练"进入写作模块
echo 2. 选择题目开始写作  
echo 3. 点击右下角AI助手按钮使用AI功能
echo.
echo 🛑 停止服务: 按 Ctrl+C 或关闭此窗口
echo ==================================
echo.

REM 自动打开浏览器
start http://localhost:8080

REM 启动前端服务
python -m http.server 8080
