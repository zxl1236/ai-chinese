@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🔍 AI语文学习助手 - 部署状态检查
echo ========================================
echo.

echo 📋 检查Python环境...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python未安装或未添加到PATH
    goto :end
) else (
    echo ✅ Python环境正常
)

echo.
echo 📦 检查关键依赖...
cd backend
pip show python-dotenv >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ python-dotenv未安装
    echo 运行: pip install python-dotenv==1.0.0
) else (
    echo ✅ python-dotenv已安装
)

pip show Flask >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Flask未安装
    echo 运行: pip install -r requirements.txt
) else (
    echo ✅ Flask已安装
)

echo.
echo 🔧 检查配置文件...
if exist ".env" (
    echo ✅ .env文件存在
) else (
    echo ⚠️  .env文件不存在
    echo 建议复制 env_example.txt 为 .env
)

echo.
echo 📁 检查必要文件...
if exist "app.py" (
    echo ✅ app.py存在
) else (
    echo ❌ app.py不存在
)

if exist "requirements.txt" (
    echo ✅ requirements.txt存在
) else (
    echo ❌ requirements.txt不存在
)

if exist "Procfile" (
    echo ✅ Procfile存在 (Railway部署)
) else (
    echo ⚠️  Procfile不存在 (仅影响云部署)
)

echo.
echo 🌐 检查网络连接...
ping -n 1 127.0.0.1 >nul
if %errorlevel% neq 0 (
    echo ❌ 本地网络连接异常
) else (
    echo ✅ 本地网络正常
)

echo.
echo 🚀 检查服务状态...
timeout /t 2 >nul
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  后端服务未运行
    echo 启动命令: cd backend && python app.py
) else (
    echo ✅ 后端服务运行正常
)

echo.
echo ========================================
echo 📊 部署检查完成
echo ========================================
echo.
echo 💡 下一步操作建议:
echo 1. 如果所有检查都通过，可以开始使用
echo 2. 如果有❌错误，请先解决问题
echo 3. 如果有⚠️警告，建议处理但不影响基本使用
echo.
echo 📖 详细部署指南请查看: DEPLOYMENT_GUIDE_CN.md
echo.

:end
pause
