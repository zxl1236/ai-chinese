@echo off
chcp 65001 >nul
title AI语文学习助手 - 快速启动

echo.
echo ========================================
echo    AI语文学习助手 - 快速启动脚本
echo ========================================
echo.

echo [1/4] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装或未添加到PATH
    echo 请先安装Python 3.8+并添加到系统PATH
    pause
    exit /b 1
)
echo ✅ Python环境正常

echo.
echo [2/4] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装或未添加到PATH
    echo 请先安装Node.js 16+并添加到系统PATH
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

echo.
echo [3/4] 启动后端服务...
cd backend
echo 正在安装Python依赖...
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo ⚠️  依赖安装失败，尝试继续启动...
)

echo 启动Flask后端服务...
start "后端服务" cmd /k "python app_refactored.py"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] 启动前端服务...
cd ../frontend
echo 正在安装Node.js依赖...
npm install >nul 2>&1
if errorlevel 1 (
    echo ⚠️  依赖安装失败，尝试继续启动...
)

echo 启动React前端服务...
start "前端服务" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo           启动完成！
echo ========================================
echo.
echo 🌐 前端地址: http://localhost:3000
echo 🔧 后端地址: http://localhost:5000
echo 📊 管理界面: http://localhost:5000
echo.
echo 💡 提示:
echo    - 如果AI助手显示"未连接"，请配置API密钥
echo    - 或者安装Ollama使用本地AI模型
echo    - 详细配置请查看 backend/api_keys_example.txt
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:3000
start http://localhost:5000

echo.
echo 服务已启动，按任意键退出此脚本...
pause >nul
