# 🚀 AI语文学习助手 - 线上部署指南

## 📋 部署方案概览

### 🎯 推荐方案：Vercel + Railway (免费)
- **前端**: Vercel (React应用)
- **后端**: Railway (Flask API)
- **数据库**: Railway PostgreSQL
- **AI服务**: 在线API (DeepSeek, Qwen等)

### 💰 成本预估
- **Vercel**: 免费 (每月100GB带宽)
- **Railway**: 免费 (每月$5额度)
- **域名**: 可选 (约$10/年)
- **总计**: 基本免费，可选域名约$10/年

## 🛠️ 部署步骤

### 第一步：准备代码

#### 1.1 修改后端配置
```python
# backend/app.py 顶部添加
import os
from dotenv import load_dotenv

load_dotenv()

# 数据库配置
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///chinese_learning.db')
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# 生产环境配置
if os.getenv('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
    app.config['ENV'] = 'production'
```

#### 1.2 创建环境变量文件
```bash
# backend/.env (本地开发用)
DATABASE_URL=sqlite:///chinese_learning.db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
```

### 第二步：部署后端到Railway

#### 2.1 注册Railway账号
1. 访问 https://railway.app
2. 使用GitHub账号登录
3. 创建新项目

#### 2.2 连接GitHub仓库
1. 在Railway中点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择您的AI语文项目仓库
4. 设置部署目录为 `backend`

#### 2.3 配置环境变量
在Railway项目设置中添加：
```
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
```

#### 2.4 添加PostgreSQL数据库
1. 在Railway项目中点击 "New"
2. 选择 "Database" → "PostgreSQL"
3. 复制数据库连接URL
4. 在环境变量中设置 `DATABASE_URL`

#### 2.5 部署
Railway会自动检测到 `Procfile` 并部署

### 第三步：部署前端到Vercel

#### 3.1 注册Vercel账号
1. 访问 https://vercel.com
2. 使用GitHub账号登录

#### 3.2 导入项目
1. 点击 "New Project"
2. 选择您的GitHub仓库
3. 设置框架为 "Create React App"
4. 设置根目录为 `frontend`

#### 3.3 配置环境变量
在Vercel项目设置中添加：
```
REACT_APP_API_URL=https://your-railway-app.railway.app
```

#### 3.4 修改前端API配置
```javascript
// frontend/src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  base: API_BASE_URL,
  health: `${API_BASE_URL}/api/health`,
  modules: `${API_BASE_URL}/api/modules`,
  // ... 其他端点
};
```

#### 3.5 部署
Vercel会自动构建和部署您的React应用

### 第四步：配置AI服务

#### 4.1 获取API密钥
1. **DeepSeek**: https://platform.deepseek.com
2. **Qwen**: https://dashscope.console.aliyun.com
3. **Ollama**: 本地部署或使用云服务

#### 4.2 配置环境变量
在Railway后端项目中添加：
```
DEEPSEEK_API_KEY=your-deepseek-key
QWEN_API_KEY=your-qwen-key
OLLAMA_BASE_URL=https://your-ollama-instance.com
```

### 第五步：域名配置 (可选)

#### 5.1 购买域名
推荐：阿里云、腾讯云、GoDaddy

#### 5.2 配置DNS
- **前端**: 添加CNAME记录指向Vercel
- **后端**: 添加CNAME记录指向Railway

#### 5.3 配置SSL
Vercel和Railway都自动提供SSL证书

## 🔧 部署后配置

### 1. 数据库初始化
```bash
# 在Railway控制台执行
flask shell
>>> from app import db
>>> db.create_all()
>>> exit()
```

### 2. 添加初始数据
```python
# 在Railway控制台执行
flask shell
>>> from app import db, StudyModule
>>> 
>>> # 添加示例模块
>>> module = StudyModule(
...     module_id='basic-001',
...     title='基础训练',
...     description='语文基础知识训练',
...     category='basic',
...     difficulty=1
... )
>>> db.session.add(module)
>>> db.session.commit()
```

### 3. 测试API
```bash
# 测试健康检查
curl https://your-railway-app.railway.app/api/health

# 测试模块列表
curl https://your-railway-app.railway.app/api/modules
```

## 📊 监控和维护

### 1. 日志监控
- **Vercel**: 在项目仪表板查看
- **Railway**: 在项目日志中查看

### 2. 性能监控
- 使用Vercel Analytics (免费)
- 使用Railway Metrics

### 3. 备份策略
- 数据库自动备份 (Railway提供)
- 代码版本控制 (GitHub)

## 🚨 常见问题

### Q1: 前端无法连接后端
**解决方案**:
1. 检查CORS配置
2. 确认API URL正确
3. 检查环境变量

### Q2: 数据库连接失败
**解决方案**:
1. 检查DATABASE_URL格式
2. 确认PostgreSQL服务正常
3. 检查网络连接

### Q3: AI服务不工作
**解决方案**:
1. 检查API密钥配置
2. 确认API服务可用
3. 检查请求限制

### Q4: 部署失败
**解决方案**:
1. 检查构建日志
2. 确认依赖配置正确
3. 检查代码语法错误

## 📈 扩展建议

### 1. 性能优化
- 启用CDN
- 使用Redis缓存
- 图片压缩

### 2. 功能增强
- 用户认证系统
- 支付集成
- 数据分析

### 3. 安全加固
- API限流
- 输入验证
- 安全头部

## 🎉 部署完成

部署完成后，您的AI语文学习助手将可以通过以下地址访问：

- **前端**: https://your-app.vercel.app
- **后端API**: https://your-app.railway.app
- **管理界面**: https://your-app.railway.app/admin

### 分享给用户
1. 创建使用说明文档
2. 制作演示视频
3. 在社交媒体分享
4. 收集用户反馈

---

**部署时间**: 约30-60分钟
**维护成本**: 基本免费
**用户容量**: 支持数千并发用户
**扩展性**: 可根据需求升级
