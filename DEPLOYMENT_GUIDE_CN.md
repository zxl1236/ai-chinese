# 🚀 AI语文学习助手 - 完整部署指南

## 📋 部署方案概览

### 🎯 方案一：本地开发环境（推荐新手）
- **优点**: 简单快速，适合学习和测试
- **适用**: 个人使用、演示、开发调试
- **成本**: 免费

### 🎯 方案二：云平台部署（推荐生产）
- **前端**: Vercel (免费)
- **后端**: Railway (免费额度)
- **数据库**: Railway PostgreSQL
- **适用**: 正式发布、多人使用
- **成本**: 基本免费

---

## 🛠️ 方案一：本地开发环境部署

### 第一步：环境准备

#### 1.1 检查Python环境
```bash
python --version  # 确保Python 3.8+
pip --version     # 确保pip可用
```

#### 1.2 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

#### 1.3 配置环境变量
创建 `backend/.env` 文件：
```env
# 数据库配置
DATABASE_URL=sqlite:///chinese_learning.db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# AI服务配置（可选）
DEEPSEEK_API_KEY=your-deepseek-key
DASHSCOPE_API_KEY=your-qwen-key
```

### 第二步：启动后端服务

#### 2.1 启动Flask应用
```bash
cd backend
python app.py
```

#### 2.2 验证服务状态
访问以下地址确认服务正常：
- **管理界面**: http://localhost:5000
- **API健康检查**: http://localhost:5000/api/health
- **学习模块API**: http://localhost:5000/api/study-modules

### 第三步：启动前端服务

#### 3.1 安装前端依赖
```bash
cd frontend
npm install
```

#### 3.2 启动React应用
```bash
npm start
```

#### 3.3 访问前端应用
打开浏览器访问：http://localhost:3000

### 第四步：配置AI服务（可选）

#### 4.1 获取API密钥
- **DeepSeek**: https://platform.deepseek.com
- **Qwen**: https://dashscope.console.aliyun.com

#### 4.2 更新环境变量
在 `backend/.env` 中添加：
```env
DEEPSEEK_API_KEY=your-deepseek-key
DASHSCOPE_API_KEY=your-qwen-key
```

---

## ☁️ 方案二：云平台部署

### 第一步：准备代码仓库

#### 1.1 确保代码已提交到GitHub
```bash
git add .
git commit -m "准备部署"
git push origin main
```

#### 1.2 检查部署文件
确保以下文件存在：
- `backend/Procfile` - Railway部署配置
- `backend/runtime.txt` - Python版本
- `backend/requirements.txt` - 依赖列表

### 第二步：部署后端到Railway

#### 2.1 注册Railway账号
1. 访问 https://railway.app
2. 使用GitHub账号登录
3. 创建新项目

#### 2.2 连接GitHub仓库
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择您的AI语文项目仓库
4. 设置部署目录为 `backend`

#### 2.3 配置环境变量
在Railway项目设置中添加：
```env
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
DEEPSEEK_API_KEY=your-deepseek-key
DASHSCOPE_API_KEY=your-qwen-key
```

#### 2.4 添加PostgreSQL数据库
1. 在Railway项目中点击 "New"
2. 选择 "Database" → "PostgreSQL"
3. 复制数据库连接URL
4. 在环境变量中设置 `DATABASE_URL`

#### 2.5 部署验证
Railway会自动部署，部署完成后：
- 复制生成的域名（如：https://your-app.railway.app）
- 测试API：https://your-app.railway.app/api/health

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
```env
REACT_APP_API_URL=https://your-railway-app.railway.app
```

#### 3.4 部署验证
Vercel会自动构建和部署，完成后：
- 访问前端应用：https://your-app.vercel.app
- 测试功能是否正常

---

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
>>> from app import db, StudyModule, User
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

### 3. 测试API功能
```bash
# 测试健康检查
curl https://your-railway-app.railway.app/api/health

# 测试模块列表
curl https://your-railway-app.railway.app/api/study-modules

# 测试用户登录
curl -X POST https://your-railway-app.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

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

---

## 🚨 常见问题解决

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

---

## 🎉 部署完成

### 本地部署完成
- **后端API**: http://localhost:5000
- **前端应用**: http://localhost:3000
- **管理界面**: http://localhost:5000

### 云平台部署完成
- **前端**: https://your-app.vercel.app
- **后端API**: https://your-app.railway.app
- **管理界面**: https://your-app.railway.app

### 分享给用户
1. 创建使用说明文档
2. 制作演示视频
3. 在社交媒体分享
4. 收集用户反馈

---

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

---

**部署时间**: 本地部署约10分钟，云平台部署约30-60分钟
**维护成本**: 本地免费，云平台基本免费
**用户容量**: 本地适合个人使用，云平台支持数千并发用户
**扩展性**: 可根据需求升级
