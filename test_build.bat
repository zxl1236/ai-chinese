@echo off
echo 测试前端构建...
echo.

echo 1. 进入前端目录...
cd frontend

echo 2. 安装依赖...
call npm install

echo 3. 设置环境变量...
set NODE_OPTIONS=--openssl-legacy-provider
set CI=false
set REACT_APP_FRONTEND_ONLY=true

echo 4. 开始构建...
call npm run build

echo.
if exist "build" (
    echo ✅ 构建成功！构建文件位于 frontend/build 目录
    echo 📁 构建文件大小：
    dir build /s /-c | find "个文件"
) else (
    echo ❌ 构建失败！请检查错误信息
)

echo.
echo 💡 提示：如果构建成功，您可以：
echo    1. 将整个项目推送到 Git 仓库
echo    2. 在 Netlify 上连接该仓库进行自动部署
echo    3. 或者手动上传 frontend/build 文件夹到 Netlify

pause
