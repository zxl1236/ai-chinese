@echo off
echo ========================================
echo 开始部署到Netlify...
echo ========================================

echo.
echo 1. 进入前端目录...
cd frontend

echo.
echo 2. 安装依赖...
call npm install

echo.
echo 3. 构建生产版本...
call npm run build

echo.
echo 4. 检查构建结果...
if exist "build" (
    echo ✅ 构建成功！构建目录: frontend/build
    echo.
    echo 5. 准备部署...
    echo 请将以下目录上传到Netlify:
    echo   - 构建目录: frontend/build
    echo   - 配置文件: netlify.toml (根目录)
    echo.
    echo 或者使用Netlify CLI:
    echo   netlify deploy --prod --dir=frontend/build
) else (
    echo ❌ 构建失败！请检查错误信息
)

echo.
echo ========================================
echo 部署准备完成！
echo ========================================
pause
