# AI语文学习助手

[![Netlify Status](https://api.netlify.com/api/v1/badges/166a8f5e-0c39-481a-b90a-8dd0724ebf00/deploy-status)](https://app.netlify.com/projects/idyllic-valkyrie-2eaadb/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/ai-chinese-learning)

一个智能化的语文学习平台，提供个性化学习方案和全面的语文能力训练。

## 🚀 在线体验

🌐 **网站地址：** [https://idyllic-valkyrie-2eaadb.netlify.app](https://idyllic-valkyrie-2eaadb.netlify.app)

### 📱 支持的设备
- 💻 **桌面浏览器** - Chrome, Firefox, Safari, Edge
- 📱 **移动设备** - iOS Safari, Android Chrome
- 📋 **平板设备** - iPad, Android平板

### ⚡ 性能指标
- 🚀 **加载速度** - 全球CDN加速
- 📦 **压缩优化** - 资源文件自动压缩
- 🔒 **安全部署** - HTTPS安全连接
- 🌍 **全球可访问** - 无地域限制

## 🌟 项目特色

- **🤖 AI智能推荐**：基于学习数据的个性化推荐系统
- **📊 能力分析**：全方位的学习能力评估和可视化展示
- **🎯 模块化设计**：清晰的代码结构，便于维护和扩展
- **📱 响应式设计**：完美适配移动端和桌面端
- **⚡ 高性能**：优化的加载速度和流畅的用户体验

## 🏗️ 项目结构

```
AI语文/
├── src/                    # 源代码目录
│   ├── components/         # 可复用组件
│   │   ├── Header/         # 头部组件
│   │   ├── Navigation/     # 导航组件
│   │   ├── Cards/          # 卡片组件
│   │   └── QuestionCard/   # 题目卡片组件
│   ├── pages/              # 页面组件
│   │   ├── Home/           # 首页
│   │   ├── Study/          # 学习中心
│   │   └── ModernReading/  # 现代文阅读
│   ├── styles/             # 样式文件
│   │   ├── base/           # 基础样式
│   │   ├── components/     # 组件样式
│   │   └── pages/          # 页面样式
│   ├── scripts/            # JavaScript文件
│   │   ├── utils/          # 工具函数
│   │   ├── components/     # 组件逻辑
│   │   └── pages/          # 页面逻辑
│   ├── data/               # 数据文件
│   └── main.js             # 主应用入口
├── assets/                 # 静态资源
├── dist/                   # 构建输出目录
├── docs/                   # 项目文档
├── index.html              # 主入口文件
└── README.md               # 项目说明
```

## 🚀 快速开始

### 环境要求

- 现代浏览器（支持ES6+）
- Web服务器（开发时可使用Live Server等）

### 安装和运行

1. **克隆项目**
   ```bash
   git clone [项目地址]
   cd AI语文
   ```

2. **启动开发服务器**
   ```bash
   # 使用Live Server或其他静态服务器
   # 访问 index-new.html
   ```

3. **开始开发**
   - 修改 `src/` 目录下的源代码
   - 样式文件位于 `src/styles/`
   - 组件文件位于 `src/components/` 和 `src/pages/`

## 📦 核心模块

### 🏠 首页模块
- **AI智能推荐**：基于用户学习数据的个性化推荐
- **学习概览**：今日完成度、连续学习天数、能力提升统计
- **快捷功能**：每日任务、错题复习、作业管理、AI陪练
- **能力分析**：多维度能力评估和提升建议

### 📚 学习中心模块
- **基础能力训练**：字词、语法、修辞、古文基础
- **阅读理解训练**：现代文、记叙文、说明文、议论文等
- **写作表达训练**：各类文体的写作练习和指导

### 📖 现代文阅读模块
- **题目练习**：多篇文章配套练习题
- **文章解析**：深度解读和难点注释
- **训练记录**：学习进度和能力成长追踪
- **题库管理**：教师端题目管理功能

## 🎨 设计系统

### 色彩规范
- **主色调**：#1a237e（深蓝）
- **辅助色**：#667eea（浅蓝）
- **成功色**：#4caf50（绿色）
- **警告色**：#ff9800（橙色）
- **错误色**：#f44336（红色）

### 组件库
- **Header**：页面头部组件，支持返回按钮
- **Navigation**：底部导航组件，支持徽章显示
- **Cards**：各种卡片组件，支持悬停效果
- **QuestionCard**：题目卡片，支持单选、简答等类型

## 🔧 开发指南

### 添加新页面

1. 在 `src/pages/` 下创建新目录
2. 创建页面组件类
3. 在 `src/main.js` 中注册页面
4. 添加对应的样式文件

### 添加新组件

1. 在 `src/components/` 下创建组件目录
2. 创建组件类和样式文件
3. 在需要的地方引入和使用

### 样式开发

- 使用CSS变量定义颜色、间距等
- 遵循BEM命名规范
- 优先使用工具类
- 确保响应式设计

## 📱 响应式设计

- **移动端**：< 768px
- **平板端**：768px - 1024px  
- **桌面端**：> 1024px

## 🔒 数据存储

使用localStorage进行本地数据存储：
- 用户配置信息
- 学习进度数据
- 题目历史记录
- 错题收集

## 🚀 性能优化

- **懒加载**：组件按需加载
- **缓存策略**：合理使用浏览器缓存
- **代码分割**：将代码拆分为多个模块
- **图片优化**：使用适当的图片格式和尺寸

## 🧪 测试

### 手动测试清单
- [ ] 页面切换功能
- [ ] 组件交互效果
- [ ] 响应式布局
- [ ] 数据存储功能
- [ ] 错误处理机制

## 📈 后续规划

### 短期目标
- [ ] 完善题库数据
- [ ] 添加更多题型支持
- [ ] 优化移动端体验
- [ ] 增加离线功能

### 长期目标
- [ ] 接入后端API
- [ ] 添加用户系统
- [ ] 实现AI智能推荐算法
- [ ] 支持多人协作学习

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 开发团队

- **项目负责人**：[姓名]
- **前端开发**：[姓名]
- **UI设计**：[姓名]
- **产品经理**：[姓名]

## 📞 联系我们

- **邮箱**：[邮箱地址]
- **微信群**：[二维码]
- **问题反馈**：[GitHub Issues链接]

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！