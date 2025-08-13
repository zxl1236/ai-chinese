@echo off
title AI语文助手 - 在线API配置
echo.
echo 🚀 AI语文助手 - 在线API配置向导
echo ============================================
echo.
echo 📋 支持的在线AI服务:
echo   1. DeepSeek (推荐) - 响应快，中文优秀
echo   2. 阿里Qwen - 速度最快，免费额度高
echo.
echo 💡 配置API密钥后，AI响应速度将显著提升！
echo.

:menu
echo 请选择要配置的API:
echo [1] 配置DeepSeek API
echo [2] 配置阿里Qwen API  
echo [3] 查看当前配置
echo [4] 启动服务
echo [0] 退出
echo.
set /p choice="请输入选项 (0-4): "

if "%choice%"=="1" goto deepseek
if "%choice%"=="2" goto qwen
if "%choice%"=="3" goto status
if "%choice%"=="4" goto start
if "%choice%"=="0" goto end
goto menu

:deepseek
echo.
echo 🔑 配置DeepSeek API密钥
echo ----------------------
echo 1. 访问 https://platform.deepseek.com/
echo 2. 注册账号并创建API密钥
echo 3. 复制您的API密钥
echo.
set /p deepseek_key="请输入DeepSeek API密钥: "
if not "%deepseek_key%"=="" (
    set DEEPSEEK_API_KEY=%deepseek_key%
    echo ✅ DeepSeek API密钥已设置
) else (
    echo ❌ API密钥不能为空
)
echo.
goto menu

:qwen
echo.
echo 🔑 配置阿里Qwen API密钥
echo ---------------------
echo 1. 访问 https://dashscope.aliyun.com/
echo 2. 注册账号并创建API密钥
echo 3. 复制您的API密钥
echo.
set /p qwen_key="请输入Qwen API密钥: "
if not "%qwen_key%"=="" (
    set QWEN_API_KEY=%qwen_key%
    echo ✅ Qwen API密钥已设置
) else (
    echo ❌ API密钥不能为空
)
echo.
goto menu

:status
echo.
echo 📊 当前API配置状态
echo ------------------
if defined DEEPSEEK_API_KEY (
    echo DeepSeek: ✅ 已配置
) else (
    echo DeepSeek: ❌ 未配置
)
if defined QWEN_API_KEY (
    echo Qwen:     ✅ 已配置
) else (
    echo Qwen:     ❌ 未配置
)
echo.
goto menu

:start
echo.
echo 🚀 启动AI语文助手服务...
echo.
cd backend
python app.py
goto end

:end
echo.
echo 👋 感谢使用AI语文助手！
pause
