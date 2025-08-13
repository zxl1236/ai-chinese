@echo off
echo ========================================
echo AI语文学习助手 - 后端服务启动脚本
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python环境检查通过

REM 检查pip是否可用
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到pip
    pause
    exit /b 1
)

echo ✅ pip工具检查通过

REM 安装依赖
echo.
echo 📦 正在安装Python依赖包...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 启动服务
echo.
echo 🚀 启动后端服务...
echo 📡 服务将运行在: http://localhost:5000
echo 🔗 前端可以通过此地址访问API
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

python app.py