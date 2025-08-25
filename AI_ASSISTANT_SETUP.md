# 🤖 AI助手配置指南

## 🚨 问题描述

AI助手显示"未连接"状态，无法正常使用。这是因为系统正在尝试连接到本地Ollama服务（端口11434），但该服务未启动。

## 🔍 问题分析

**错误信息**: `Failed to load resource: :11434/api/tags:1 net::ERR_CONNECTION_REFUSED`

**原因**: 
1. Ollama本地AI服务未启动
2. 端口11434上没有运行任何服务
3. 前端硬编码连接到本地Ollama

## 🛠️ 解决方案

### 方案1: 使用在线API（推荐，简单快速）

#### 1.1 获取API密钥

**DeepSeek API**:
1. 访问 https://platform.deepseek.com/
2. 注册账号并登录
3. 在控制台获取API密钥

**阿里云Qwen API**:
1. 访问 https://dashscope.aliyun.com/
2. 注册账号并登录
3. 在控制台获取API密钥

#### 1.2 配置环境变量

**Windows PowerShell**:
```powershell
$env:DEEPSEEK_API_KEY = "your_deepseek_api_key_here"
$env:QWEN_API_KEY = "your_qwen_api_key_here"
```

**Windows CMD**:
```cmd
set DEEPSEEK_API_KEY=your_deepseek_api_key_here
set QWEN_API_KEY=your_qwen_api_key_here
```

#### 1.3 重启后端服务

```bash
cd backend
python app_refactored.py
```

#### 1.4 测试AI助手

1. 刷新前端页面
2. 点击AI助手
3. 选择"在线API"模型
4. 开始对话

### 方案2: 使用本地Ollama（推荐，隐私保护）

#### 2.1 安装Ollama

1. 访问 https://ollama.ai/
2. 下载适合你系统的安装包
3. 运行安装程序

#### 2.2 启动Ollama服务

```bash
# 启动Ollama服务
ollama serve
```

#### 2.3 下载AI模型

```bash
# 下载快速模型（推荐新手）
ollama pull qwen2.5:0.5b

# 下载平衡模型
ollama pull llama3.2:1b

# 下载高质量模型
ollama pull deepseek-coder:6.7b
```

#### 2.4 测试连接

```bash
# 测试Ollama是否正常运行
curl http://localhost:11434/api/tags
```

#### 2.5 使用AI助手

1. 刷新前端页面
2. 点击AI助手
3. 选择本地模型
4. 开始对话

### 方案3: 混合模式（最佳体验）

系统现在支持自动切换：
- 优先尝试本地Ollama
- 如果失败，自动切换到在线API
- 用户可以手动切换模式

## 🔧 配置检查清单

### 在线API配置
- [ ] 获取DeepSeek API密钥
- [ ] 获取Qwen API密钥
- [ ] 设置环境变量
- [ ] 重启后端服务
- [ ] 测试API连接

### 本地Ollama配置
- [ ] 安装Ollama
- [ ] 启动Ollama服务
- [ ] 下载AI模型
- [ ] 测试端口11434
- [ ] 验证模型可用性

## 📱 前端界面说明

### 模型选择器
- **本地模型 (Ollama)**: 使用本地AI模型
- **在线API**: 使用云端AI服务

### 连接状态
- 🟢 **已连接**: Ollama服务正常运行
- 🟡 **连接错误**: Ollama服务异常
- 🔴 **未连接**: 使用在线API

### 切换按钮
- 💻 **本地**: 切换到本地Ollama
- 🌐 **在线**: 切换到在线API

## 🚀 快速启动

### 使用启动脚本
```bash
# Windows
双击 start_ai_assistant.bat

# 或手动启动
cd backend && python app_refactored.py
cd frontend && npm start
```

### 访问地址
- **前端**: http://localhost:3000
- **后端**: http://localhost:5000
- **管理**: http://localhost:5000

## 🐛 常见问题

### Q1: 仍然显示"未连接"
**解决方案**:
1. 检查后端服务是否启动
2. 确认API密钥配置正确
3. 查看浏览器控制台错误信息

### Q2: 在线API调用失败
**解决方案**:
1. 检查网络连接
2. 确认API密钥有效
3. 检查API服务状态

### Q3: 本地模型响应慢
**解决方案**:
1. 使用更小的模型（如qwen2.5:0.5b）
2. 检查电脑性能
3. 关闭其他占用资源的程序

### Q4: 端口被占用
**解决方案**:
1. 检查端口11434是否被其他程序占用
2. 修改Ollama配置使用其他端口
3. 重启Ollama服务

## 📞 技术支持

如果遇到问题，请：

1. 查看浏览器控制台错误信息
2. 检查后端服务日志
3. 确认所有依赖已安装
4. 参考本文档的配置步骤

---

*最后更新: 2024年12月*
*配置状态: ✅ 已优化*
