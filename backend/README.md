# AI语文学习助手 - 后端服务

## 📖 项目简介

这是AI语文学习助手的后端代理服务，用于解决前端跨域访问Ollama API的问题，提供统一的AI写作辅助功能。

## 🚀 快速开始

### 1. 环境要求

- Python 3.7+
- pip包管理器
- Ollama服务（运行DeepSeek模型）

### 2. 安装依赖

```bash
# 进入后端目录
cd backend

# 安装Python依赖
pip install -r requirements.txt
```

### 3. 启动服务

#### Windows用户
```bash
# 双击运行启动脚本
start.bat

# 或者手动启动
python app.py
```

#### Linux/Mac用户
```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

### 4. 验证服务

访问 http://localhost:5000/api/health 查看服务状态

## 📡 API接口

### 健康检查
- **URL**: `/api/health`
- **方法**: GET
- **描述**: 检查服务运行状态

### 获取模型列表
- **URL**: `/api/models`
- **方法**: GET
- **描述**: 获取可用的AI模型

### 题目分析
- **URL**: `/api/analyze-topic`
- **方法**: POST
- **参数**: `{"topic": "作文题目"}`
- **描述**: 分析作文题目，提供写作指导

### 获取写作灵感
- **URL**: `/api/get-inspiration`
- **方法**: POST
- **参数**: `{"topic": "作文题目"}`
- **描述**: 提供多角度写作思路

### 文章优化建议
- **URL**: `/api/improve-writing`
- **方法**: POST
- **参数**: `{"content": "文章内容"}`
- **描述**: 分析文章并提供改进建议

### 续写建议
- **URL**: `/api/continue-writing`
- **方法**: POST
- **参数**: `{"content": "文章内容"}`
- **描述**: 基于现有内容提供续写指导

## 🔧 配置说明

### 默认配置
- **服务端口**: 5000
- **Ollama地址**: http://localhost:11434
- **默认模型**: deepseek-r1:1.5b

### 修改配置
编辑 `app.py` 文件中的配置变量：

```python
OLLAMA_BASE_URL = "http://localhost:11434"  # Ollama服务地址
DEFAULT_MODEL = "deepseek-r1:1.5b"          # 默认AI模型
```

## 🐛 常见问题

### Q: 服务启动失败
**A**: 检查以下几点：
1. Python版本是否为3.7+
2. 依赖是否正确安装
3. 端口5000是否被占用

### Q: AI功能无响应
**A**: 确保：
1. Ollama服务正在运行
2. DeepSeek模型已加载
3. 网络连接正常

### Q: 跨域错误
**A**: 
1. 确保后端服务正在运行
2. 检查前端API地址配置
3. 确认CORS设置正确

## 🔍 调试模式

启用调试模式查看详细日志：

```python
# 在app.py中设置
app.run(debug=True)
```

## 📝 日志记录

服务运行时会输出详细日志，包括：
- API请求记录
- AI响应状态
- 错误信息

## 🛡️ 安全注意事项

1. **生产环境**：关闭debug模式
2. **访问控制**：根据需要配置CORS策略
3. **资源限制**：设置合理的请求超时和大小限制

## 🤝 技术支持

如遇问题，请检查：
1. 控制台错误信息
2. 网络连接状态
3. Ollama服务状态
4. 模型加载情况