@echo off
echo ========================================
echo AI语文学习助手 - 完整启动脚本
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

REM 切换到后端目录并安装依赖
echo.
echo 📦 安装后端依赖...
cd /d "%~dp0backend"
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo ✅ 后端依赖安装完成

REM 启动后端服务（后台运行）
echo.
echo 🚀 启动后端服务...
start "AI助手后端" cmd /k "python app.py"

REM 等待后端启动
echo ⏳ 等待后端服务启动（3秒）...
timeout /t 3 /nobreak >nul

REM 回到根目录启动前端
cd /d "%~dp0"
echo.
echo 🌐 启动前端服务器...
echo 📡 后端API: http://localhost:5000
echo 🌍 前端页面: http://localhost:8080
echo.
echo 💡 修复说明:
echo ✅ AI助手初始化延迟已修复
echo ✅ 按钮事件绑定已优化
echo ✅ 直接使用内置HTML避免加载失败
echo.
echo 📋 使用说明:
echo 1. 浏览器会自动打开前端页面
echo 2. 点击"写作训练"进入写作模块
echo 3. AI助手应该可以正常点击使用
echo 4. 如需停止服务，关闭命令行窗口即可
echo.

REM 自动打开浏览器
start http://localhost:8080

REM 启动前端服务器
python -m http.server 8080
