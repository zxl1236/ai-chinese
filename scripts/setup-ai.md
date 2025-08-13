# 🤖 AI写作助手本地部署指南

## 🚀 快速开始

### 方案一：Ollama本地部署（推荐）

#### 1. 安装Ollama
```bash
# Windows
# 访问 https://ollama.com/download 下载安装包

# 或使用命令行（需要管理员权限）
winget install Ollama.Ollama
```

#### 2. 安装中文优化模型
```bash
# 安装Qwen2.5-7B（推荐，中文表现优秀）
ollama pull qwen2.5:7b

# 或安装更小的模型（资源有限时）
ollama pull qwen2.5:3b

# 或安装专门的写作模型
ollama pull llama3.1:8b
```

#### 3. 启动服务
```bash
# 启动Ollama服务（默认端口11434）
ollama serve

# 测试服务
ollama run qwen2.5:7b "你好，请介绍一下自己"
```

#### 4. 配置网站
在写作模块中，AI助手会自动连接到 `http://localhost:11434`

### 方案二：使用免费API服务

#### 1. 通义千问（阿里云）
1. 访问 [https://dashscope.aliyun.com](https://dashscope.aliyun.com)
2. 注册并获取API Key
3. 在AI助手设置中输入API Key

#### 2. 智谱AI GLM-4
1. 访问 [https://open.bigmodel.cn](https://open.bigmodel.cn)
2. 注册并获取API Key  
3. 在AI助手设置中选择智谱AI并输入API Key

#### 3. 百度文心一言
1. 访问 [https://cloud.baidu.com/product/wenxinworkshop](https://cloud.baidu.com/product/wenxinworkshop)
2. 获取API Key和Secret Key
3. 配置到AI助手中

## ⚙️ 配置说明

### 本地模型配置
```javascript
// 在浏览器控制台中运行
aiWritingAssistant.configureAI('local', null, 'qwen2.5:7b');
```

### API服务配置
```javascript
// 配置通义千问
aiWritingAssistant.configureAI('qianwen', 'your-api-key');

// 配置智谱AI
aiWritingAssistant.configureAI('zhipu', 'your-api-key');
```

## 🔧 性能优化

### 硬件要求
- **最低配置**：8GB RAM，使用3B参数模型
- **推荐配置**：16GB RAM，使用7B参数模型
- **高性能配置**：32GB RAM + GPU，使用更大模型

### 模型选择建议
```bash
# 资源有限（8GB RAM）
ollama pull qwen2.5:3b

# 平衡性能（16GB RAM）
ollama pull qwen2.5:7b

# 高性能需求（32GB+ RAM）
ollama pull qwen2.5:14b
```

## 🛠️ 故障排除

### 常见问题

#### 1. Ollama服务无法启动
```bash
# 检查端口是否被占用
netstat -an | findstr 11434

# 重启Ollama服务
ollama serve
```

#### 2. 模型下载失败
```bash
# 检查网络连接
ping ollama.com

# 使用代理下载（如果需要）
set HTTP_PROXY=http://your-proxy:port
set HTTPS_PROXY=http://your-proxy:port
ollama pull qwen2.5:7b
```

#### 3. API调用失败
- 检查API Key是否正确
- 确认API额度是否充足
- 验证网络连接是否正常

#### 4. 响应速度慢
- 降低模型参数量（7b → 3b）
- 关闭其他占用内存的程序
- 考虑使用GPU加速

### 日志查看
```bash
# Windows
%USERPROFILE%\.ollama\logs\server.log

# 查看实时日志
ollama logs
```

## 📊 功能测试

### 测试AI服务连接
```javascript
// 在浏览器控制台运行
aiWritingAssistant.checkServiceAvailability().then(result => {
    console.log('AI服务状态:', result ? '正常' : '异常');
});
```

### 测试题目分析功能
```javascript
// 测试题目分析
aiWritingAssistant.analyzeTopicQuality('变形记').then(result => {
    console.log('分析结果:', result);
});
```

### 测试角度生成功能
```javascript
// 测试角度生成
aiWritingAssistant.generateWritingAngles('我的梦想').then(result => {
    console.log('角度结果:', result);
});
```

## 🔒 隐私和安全

### 本地模型优势
- ✅ 完全离线运行，数据不上传
- ✅ 无需担心隐私泄露
- ✅ 不依赖网络连接
- ✅ 完全免费使用

### API服务注意事项
- ⚠️ 数据会发送到第三方服务器
- ⚠️ 需要遵守服务商的使用条款
- ⚠️ 可能产生费用（超出免费额度）
- ⚠️ 依赖网络连接稳定性

## 📈 性能基准测试

### 响应时间对比
| 服务类型 | 平均响应时间 | 成本 | 隐私性 |
|---------|-------------|------|--------|
| 本地3B模型 | 3-5秒 | 免费 | 最高 |
| 本地7B模型 | 5-8秒 | 免费 | 最高 |
| 通义千问API | 1-3秒 | 付费 | 中等 |
| 智谱AI API | 2-4秒 | 付费 | 中等 |

### 质量评估
| 功能 | 本地7B | 通义千问 | 智谱AI |
|------|--------|----------|--------|
| 题目分析 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 角度生成 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 大纲创建 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🔄 更新和维护

### 更新模型
```bash
# 查看已安装的模型
ollama list

# 更新模型到最新版本
ollama pull qwen2.5:7b

# 删除不需要的模型
ollama rm old-model:version
```

### 清理缓存
```bash
# 清理Ollama缓存
ollama prune

# 重置配置
rm -rf %USERPROFILE%\.ollama
```

## 🆘 技术支持

如果遇到问题：
1. 查看本文档的故障排除部分
2. 检查Ollama官方文档：https://ollama.com/docs
3. 在项目GitHub仓库提交Issue
4. 加入技术交流群获取帮助

## 🔗 相关链接

- **Ollama官网**：https://ollama.com
- **模型库**：https://ollama.com/library
- **通义千问**：https://dashscope.aliyun.com
- **智谱AI**：https://open.bigmodel.cn
- **项目文档**：../DEVELOPMENT.md