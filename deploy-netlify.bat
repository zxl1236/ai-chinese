@echo off
echo 🚀 开始部署到 Netlify...
echo.

echo 📦 检查依赖...
if not exist "frontend\node_modules" (
    echo 安装前端依赖...
    cd frontend
    call npm install
    cd ..
) else (
    echo 前端依赖已存在
)

echo.
echo 🔨 构建前端应用...
cd frontend
set NODE_OPTIONS=--openssl-legacy-provider
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ 构建失败！
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ 构建完成！
echo 📁 构建文件位于: frontend\build
echo.
echo 💡 提示：
echo    1. 确保已连接 Netlify CLI
echo    2. 运行: netlify deploy --prod
echo    3. 或使用 Netlify Dashboard 手动部署
echo.
pause
