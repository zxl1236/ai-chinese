@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 AI语文学习助手 - 本地启动脚本
echo ========================================
echo.

echo 📋 检查Python环境...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python未安装或未添加到PATH
    echo 请先安装Python 3.8+
    pause
    exit /b 1
)

echo.
echo 📦 检查依赖安装...
cd backend
pip show python-dotenv >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  正在安装python-dotenv...
    pip install python-dotenv==1.0.0
)

echo.
echo 🔧 检查环境变量文件...
if not exist ".env" (
    echo ⚠️  创建.env文件...
    echo DATABASE_URL=sqlite:///chinese_learning.db > .env
    echo SECRET_KEY=your-secret-key-here >> .env
    echo FLASK_ENV=development >> .env
    echo.
    echo 📝 请根据需要编辑backend/.env文件，添加AI服务API密钥
)

echo.
echo 🚀 启动后端服务...
echo 📝 管理界面: http://localhost:5000
echo 🔗 API接口: http://localhost:5000/api/health
echo.
echo 按 Ctrl+C 停止服务
echo.

python app.py

echo.
echo ✅ 后端服务已停止
pause
