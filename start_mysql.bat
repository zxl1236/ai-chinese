@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 AI语文学习助手 - MySQL版本启动
echo ========================================

echo.
echo 📋 检查MySQL配置...

REM 检查.env文件是否存在
if not exist "backend\.env" (
    echo ❌ 未找到.env文件
    echo 💡 正在创建默认配置...
    
    echo # AI语文学习助手 - 环境变量配置 > backend\.env
    echo. >> backend\.env
    echo # ======================================== >> backend\.env
    echo # 数据库配置 >> backend\.env
    echo # ======================================== >> backend\.env
    echo # 本地开发使用SQLite (默认) >> backend\.env
    echo DATABASE_URL=sqlite:///chinese_learning.db >> backend\.env
    echo. >> backend\.env
    echo # MySQL配置 (需要先安装MySQL) >> backend\.env
    echo # DATABASE_URL=mysql+pymysql://root:password@localhost:3306/chinese_learning?charset=utf8mb4 >> backend\.env
    echo. >> backend\.env
    echo # ======================================== >> backend\.env
    echo # Flask配置 >> backend\.env
    echo # ======================================== >> backend\.env
    echo SECRET_KEY=your-secret-key-change-in-production >> backend\.env
    echo FLASK_ENV=development >> backend\.env
    
    echo ✅ 已创建默认.env配置文件
)

echo.
echo 🔧 选择数据库类型：
echo 1. SQLite (推荐新手，无需安装数据库)
echo 2. MySQL (需要先安装MySQL)
echo.
set /p choice="请选择 (1/2): "

if "%choice%"=="1" (
    echo.
    echo 🗄️ 使用SQLite数据库...
    echo DATABASE_URL=sqlite:///chinese_learning.db > backend\.env.temp
    echo SECRET_KEY=your-secret-key-change-in-production >> backend\.env.temp
    echo FLASK_ENV=development >> backend\.env.temp
    move /y backend\.env.temp backend\.env >nul
    
    echo ✅ SQLite配置完成
    goto start_app
)

if "%choice%"=="2" (
    echo.
    echo 🗄️ 使用MySQL数据库...
    echo.
    echo 📝 请确保已安装MySQL并创建数据库：
    echo 1. 安装MySQL 8.0+
    echo 2. 创建数据库：CREATE DATABASE chinese_learning CHARACTER SET utf8mb4;
    echo 3. 确保用户有足够权限
    echo.
    set /p mysql_user="MySQL用户名 (默认: root): "
    if "%mysql_user%"=="" set mysql_user=root
    
    set /p mysql_pass="MySQL密码: "
    if "%mysql_pass%"=="" (
        echo ❌ 密码不能为空
        pause
        exit /b 1
    )
    
    echo DATABASE_URL=mysql+pymysql://%mysql_user%:%mysql_pass%@localhost:3306/chinese_learning?charset=utf8mb4 > backend\.env.temp
    echo SECRET_KEY=your-secret-key-change-in-production >> backend\.env.temp
    echo FLASK_ENV=development >> backend\.env.temp
    move /y backend\.env.temp backend\.env >nul
    
    echo ✅ MySQL配置完成
    goto start_app
)

echo ❌ 无效选择
pause
exit /b 1

:start_app
echo.
echo 🚀 启动应用...

REM 检查Python依赖
echo 📦 检查Python依赖...
cd backend
python -c "import flask, flask_sqlalchemy, flask_cors, pymysql" 2>nul
if errorlevel 1 (
    echo ❌ 缺少必要的Python依赖
    echo 💡 正在安装依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo ✅ 依赖检查完成

REM 初始化数据库
echo.
echo 🗄️ 初始化数据库...
python mysql_setup.py
if errorlevel 1 (
    echo ❌ 数据库初始化失败
    echo 💡 请检查数据库配置
    pause
    exit /b 1
)

echo ✅ 数据库初始化完成

REM 启动Flask应用
echo.
echo 🌐 启动Web服务...
echo 📝 管理界面: http://localhost:5000
echo 🔗 API接口: http://localhost:5000/api/reading-articles
echo.
echo 💡 按 Ctrl+C 停止服务
echo.

python app.py

pause
