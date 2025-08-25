# AI聊天功能设置指南

## 🚀 快速启动

### 1. 启动后端服务
```bash
# 方法1: 使用批处理脚本 (Windows)
start_backend.bat

# 方法2: 手动启动
cd backend
python app_refactored.py
```

### 2. 启动前端服务
```bash
cd frontend
npm start
```

## 🔧 配置说明

### 后端配置
- **服务地址**: http://localhost:5000
- **AI聊天API**: http://localhost:5000/api/ai/chat
- **健康检查**: http://localhost:5000/api/ai/health

### 环境变量配置
在 `backend/` 目录下创建 `.env` 文件：

```env
# AI服务配置
DEEPSEEK_API_KEY=your-deepseek-api-key
DASHSCOPE_API_KEY=your-qwen-api-key

# Flask配置
SECRET_KEY=your-secret-key
FLASK_ENV=development
```

## 🧪 测试API

### 使用测试脚本
```bash
python test_ai_api.py
```

### 手动测试
```bash
# 健康检查
curl http://localhost:5000/api/ai/health

# 聊天测试
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好", "model": "deepseek1.8", "provider": "deepseek"}'
```

## 🔍 故障排除

### 常见问题

1. **"Failed to fetch" 错误**
   - 确保后端服务已启动 (http://localhost:5000)
   - 检查防火墙设置
   - 验证端口5000未被占用

2. **Ollama连接失败**
   - 确保Ollama服务正在运行
   - 检查端口11434是否可访问
   - 验证模型名称是否正确

3. **API密钥错误**
   - 检查 `.env` 文件中的API密钥
   - 确保密钥有效且未过期
   - 验证API服务配额

### 日志查看
后端服务启动时会显示详细日志，包括：
- 服务启动状态
- 数据库连接状态
- API端点注册信息
- 错误和异常信息

## 📱 前端使用

### 功能特性
- 🤖 本地Ollama模型支持
- 🌐 在线API模型支持
- 🔄 自动故障转移
- 💬 流式响应显示
- 📱 响应式界面设计

### 模型切换
- 本地模型: 使用Ollama服务
- 在线API: 使用DeepSeek/Qwen服务
- 自动切换: 本地失败时自动使用在线API

## 🆘 获取帮助

如果遇到问题：
1. 检查后端服务日志
2. 验证网络连接
3. 确认依赖包已安装
4. 查看错误信息详情

## 📋 系统要求

- Python 3.8+
- Node.js 16+
- Ollama (本地模型)
- 稳定的网络连接
