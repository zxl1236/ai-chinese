# 🎓 AI语文学习助手

基于 React + Python Flask 的智能语文学习平台，提供个性化学习体验和AI辅助功能。

## 🚀 快速开始

### 环境要求
- **Node.js** 16+ 
- **Python** 3.8+
- **Ollama** (可选，用于本地AI模型)

### 一键启动
```bash
# Windows
双击 start.bat

# 或手动启动
cd backend && python app_refactored.py
cd frontend && npm start
```

### 访问地址
- **前端学习界面**: http://localhost:3000
- **后端API**: http://localhost:5000
- **API健康检查**: http://localhost:5000/api/health

### 系统测试
```bash
python test_system.py
```

## 📁 项目结构

```
AI语文/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # React组件
│   │   │   ├── ai/         # AI相关组件
│   │   │   ├── reading/    # 阅读训练组件
│   │   │   ├── writing/    # 写作训练组件
│   │   │   ├── study/      # 学习中心组件
│   │   │   └── user/       # 用户相关组件
│   │   ├── styles/         # 样式文件
│   │   └── App.js          # 主应用
│   ├── public/             # 静态资源
│   └── package.json        # 前端依赖
├── backend/                 # Python Flask后端
│   ├── app_refactored.py  # 重构后的主应用
│   ├── config.py           # 配置文件
│   ├── extensions.py       # Flask扩展
│   ├── services/           # 服务层
│   ├── routes/             # 路由层
│   ├── models.py           # 数据模型
│   ├── requirements.txt    # Python依赖
│   └── templates/          # 后端模板
└── README.md               # 项目说明
```

## 🎯 核心功能

### 📚 学习模块
- **基础训练**: 字词、语法、文言文基础
- **阅读理解**: 现代文、记叙文、议论文等
- **写作表达**: 命题作文、半命题作文、AI写作助手

### 🤖 AI助手
- **智能写作**: 题目分析、写作建议、内容续写
- **阅读辅助**: 文本解析、重点标注、理解检测
- **个性化学习**: 根据学习进度推荐内容

### 👤 用户系统
- **学习记录**: 进度跟踪、成绩统计
- **个性化**: 学习偏好、难度调整
- **社交功能**: 学习分享、互动交流

## 🛠️ 技术栈

### 前端
- **React** 18 - 用户界面框架
- **CSS3** - 样式设计
- **Fetch API** - 后端通信

### 后端
- **Flask** - Web框架
- **SQLite** - 数据库
- **SQLAlchemy** - ORM
- **Flask-CORS** - 跨域支持

### AI服务
- **Ollama** - 本地AI模型
- **DeepSeek** - 在线AI服务
- **Qwen** - 阿里云AI服务

## 📦 安装部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd AI语文
```

### 2. 安装依赖
```bash
# 后端依赖
cd backend
pip install -r requirements.txt

# 前端依赖
cd ../frontend
npm install
```

### 3. 配置环境
```bash
# 复制API密钥示例
cp backend/api_keys_example.txt backend/api_keys.txt
# 编辑 api_keys.txt 添加你的API密钥
```

### 4. 启动服务
```bash
# 使用启动脚本
./start.bat

# 或手动启动
cd backend && python app.py
cd frontend && npm start
```

## 🔧 开发指南

### 前端开发
```bash
cd frontend
npm start          # 启动开发服务器
npm run build      # 构建生产版本
npm test           # 运行测试
```

### 后端开发
```bash
cd backend
python app.py      # 启动开发服务器
python -m pytest   # 运行测试
```

### 数据库管理
```bash
cd backend
python
>>> from app import db
>>> db.create_all()  # 创建数据库表
```

## 📊 API接口

### 学习内容
- `GET /api/study-modules` - 获取学习模块
- `GET /api/module/{id}/content` - 获取模块内容

### AI服务
- `POST /api/analyze-topic` - 分析写作题目
- `POST /api/get-inspiration` - 获取写作灵感
- `POST /api/continue-writing` - 续写内容

### 用户管理
- `POST /api/login` - 用户登录
- `POST /api/logout` - 用户退出
- `GET /api/user/{username}/study-content` - 获取用户学习内容

## 🎨 界面预览

### 学习中心
- 模块化学习内容
- 进度跟踪显示
- 个性化推荐

### 写作训练
- 智能写作助手
- 实时AI反馈
- 多题型支持

### 阅读训练
- 现代文阅读
- 文言文解析
- 阅读理解练习

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: [your-email@example.com]

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！