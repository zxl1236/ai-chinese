@echo off
chcp 65001 >nul
title AI语文学习助手 - 统一启动脚本

echo.
echo ========================================
echo    🚀 AI语文学习助手 - 统一启动脚本
echo ========================================
echo.

echo 📋 系统组件检查...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装或未添加到PATH
    echo 请先安装Python 3.8+
    pause
    exit /b 1
)
echo ✅ Python已安装

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装或未添加到PATH
    echo 请先安装Node.js 16+
    pause
    exit /b 1
)
echo ✅ Node.js已安装

echo.
echo 🔧 开始启动系统...
echo.

REM 启动后端服务
echo 📡 启动后端API服务...
cd backend
start "AI语文学习助手-后端" cmd /k "echo 正在启动后端服务... && python app_refactored.py"
timeout /t 3 /nobreak >nul

REM 启动前端服务
echo 🌐 启动前端界面...
cd ..\frontend
start "AI语文学习助手-前端" cmd /k "echo 正在启动前端服务... && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ✅ 系统启动完成！
echo.
echo 📝 访问地址:
echo    - 前端界面: http://localhost:3000
echo    - 后端API: http://localhost:5000
echo    - API健康检查: http://localhost:5000/api/health
echo.
echo 🔑 测试账号:
echo    - 管理员: admin / admin123
echo    - 老师: teacher1 / teacher123
echo    - 学生: student1 / student123
echo.
echo 💡 系统特性:
echo    - 重构后的模块化后端架构
echo    - 响应式前端界面
echo    - 课程管理系统
echo    - AI写作助手
echo.
echo ⏳ 请等待服务完全启动...
echo.
pause
