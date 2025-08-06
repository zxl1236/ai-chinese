# 🚀 AI语文学习助手 - 部署指南

## 项目简介
AI语文学习助手是一个基于Web的中文写作训练系统，包含全命题作文、半命题作文、话题作文、材料作文等多种训练模式。

## 🌟 功能特点
- 📝 多种写作题型训练
- 💡 智能写作指导
- 📊 写作进度跟踪
- 💾 草稿自动保存
- 📱 响应式设计，支持移动端
- 🎨 现代化UI界面

## 📂 项目结构
```
AI语文/
├── index.html                 # 主页面
├── src/                      # 源代码目录
│   ├── components/          # 组件
│   ├── data/               # 数据文件
│   ├── pages/              # 页面模块
│   ├── styles/             # 样式文件
│   └── writing-module/     # 写作模块
├── assets/                 # 静态资源
└── docs/                   # 文档
```

## 🚀 快速部署

### 方案一：GitHub Pages（推荐）
1. **创建GitHub仓库**
   ```bash
   # 初始化Git仓库
   git init
   git add .
   git commit -m "Initial commit: AI语文学习助手"
   
   # 添加远程仓库
   git remote add origin https://github.com/yourusername/ai-chinese-learning.git
   git branch -M main
   git push -u origin main
   ```

2. **启用GitHub Pages**
   - 进入GitHub仓库 → Settings → Pages
   - Source选择 "GitHub Actions"
   - 系统会自动部署，访问地址：`https://yourusername.github.io/ai-chinese-learning`

### 方案二：Netlify
1. 将项目文件夹拖拽到 [Netlify Deploy](https://app.netlify.com/drop)
2. 自动生成访问链接，支持自定义域名

### 方案三：Vercel
1. 在 [Vercel](https://vercel.com) 导入GitHub项目
2. 自动构建和部署
3. 提供全球CDN加速

## 🔧 本地开发
```bash
# 启动本地服务器
npx serve .
# 或使用Python
python -m http.server 8000
# 或使用Node.js
npx http-server
```

## 📱 浏览器支持
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器

## 🛠 技术栈
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: CSS Grid, Flexbox, CSS Variables
- **存储**: LocalStorage
- **构建**: 无需构建工具，纯静态页面

## 📄 许可证
本项目采用 MIT 许可证

## 👥 贡献
欢迎提交Issue和Pull Request来改进项目！

## 📞 联系方式
如有问题，请创建GitHub Issue或联系开发者。