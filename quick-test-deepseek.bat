@echo off
echo 🧠 DeepSeek模型快速测试
echo ========================

echo 📡 正在检查Ollama服务...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ollama服务运行正常
) else (
    echo ❌ Ollama服务未运行，请先启动Ollama
    pause
    exit /b 1
)

echo.
echo 🔍 检查已安装的模型...
curl -s http://localhost:11434/api/tags

echo.
echo 🚀 启动测试页面...
start test-deepseek.html

echo.
echo 📋 测试步骤：
echo 1. 点击"测试连接"确认连接
echo 2. 点击"测试基础对话"验证DeepSeek响应
echo 3. 如果DeepSeek太慢，点击"测试替代模型"查看轻量选项
echo 4. 根据结果决定是否需要安装更轻量的模型

pause
