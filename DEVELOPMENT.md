# 🚀 AI语文学习助手 - 开发指南

## 🔄 实时更新机制

### 当前部署状态
- **GitHub仓库**：https://github.com/zxl1236/ai
- **部署平台**：Netlify
- **网站地址**：https://idyllic-valkyrie-2eaadb.netlify.app
- **部署状态**：[![Netlify Status](https://api.netlify.com/api/v1/badges/166a8f5e-0c39-481a-b90a-8dd0724ebf00/deploy-status)](https://app.netlify.com/projects/idyllic-valkyrie-2eaadb/deploys)

### 📊 更新方式

#### 方式1：自动部署（推荐）
**配置步骤：**
1. 在Netlify中连接GitHub仓库
2. 每次推送代码到main分支，自动触发部署
3. 2-3分钟内网站自动更新

#### 方式2：手动部署
**当前使用方式：**
1. 修改代码
2. 拖拽项目文件夹到Netlify Drop
3. 立即更新

## 🛠 开发环境搭建

### 本地开发
```bash
# 克隆项目
git clone https://github.com/zxl1236/ai.git
cd ai

# 安装依赖（可选）
npm install

# 启动本地服务器
npm start
# 或者
npx serve . -l 3000
# 或者
python -m http.server 8000
```

### 开发工具推荐
- **编辑器**：VS Code
- **浏览器**：Chrome（支持开发者工具）
- **Git客户端**：GitHub Desktop（可视化操作）

## 🔧 开发工作流

### 日常开发流程
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支（可选）
git checkout -b feature/new-feature

# 3. 开发和测试
npm start  # 启动本地服务器

# 4. 提交更改
git add .
git commit -m "feat: 添加新功能描述"

# 5. 推送代码
git push origin main  # 自动触发部署

# 6. 验证部署
# 访问网站确认更新生效
```

### 提交信息规范
```bash
# 功能添加
git commit -m "feat: 添加写作模块新功能"

# 问题修复
git commit -m "fix: 修复侧边栏显示问题"

# 样式更新
git commit -m "style: 优化按钮样式"

# 文档更新
git commit -m "docs: 更新开发文档"

# 重构代码
git commit -m "refactor: 重构写作模块结构"
```

## 📂 项目结构

```
AI语文/
├── index.html                 # 主入口页面
├── package.json              # 项目配置
├── netlify.toml              # Netlify部署配置
├── manifest.json             # PWA应用配置
│
├── src/                      # 源代码目录
│   ├── components/          # 可复用组件
│   ├── data/               # 数据文件
│   │   ├── config.js       # 全局配置
│   │   ├── questions.js    # 题目数据
│   │   └── writing-prompts.js  # 写作题库
│   ├── pages/              # 页面模块
│   │   ├── Home/           # 首页
│   │   ├── Study/          # 学习中心
│   │   └── ModernReading/  # 现代文阅读
│   ├── styles/             # 样式文件
│   ├── scripts/            # 工具脚本
│   └── writing-module/     # 写作训练模块
│       ├── writing.html    # 写作页面
│       ├── writing.css     # 写作样式
│       └── writing.js      # 写作逻辑
│
├── assets/                  # 静态资源
└── docs/                   # 文档目录
```

## 🎯 功能模块说明

### 写作训练模块
- **位置**：`src/writing-module/`
- **功能**：全命题、半命题、话题、材料作文训练
- **主要文件**：
  - `writing.html` - 页面结构
  - `writing.css` - 样式设计
  - `writing.js` - 交互逻辑
  - `src/data/writing-prompts.js` - 题库数据

### 数据管理
- **配置文件**：`src/data/config.js`
- **题目数据**：`src/data/questions.js`
- **写作题库**：`src/data/writing-prompts.js`

## 🧪 测试指南

### 本地测试
```bash
# 启动本地服务器
npm start

# 测试项目
1. 访问 http://localhost:3000
2. 测试各个模块功能
3. 检查响应式设计（F12 切换设备）
4. 验证数据保存功能
```

### 线上测试
```bash
# 推送后测试
1. git push origin main
2. 等待2-3分钟自动部署
3. 访问线上地址测试
4. 检查部署状态徽章
```

## 🚀 部署配置

### Netlify自动部署配置
1. **登录Netlify** → app.netlify.com
2. **进入项目** → idyllic-valkyrie-2eaadb
3. **Site settings** → Build & deploy
4. **Link repository** → 连接GitHub仓库
5. **配置构建**：
   ```
   Build command: (留空)
   Publish directory: .
   Branch: main
   ```

### 环境变量（如需要）
```
NODE_VERSION=18
ENVIRONMENT=production
```

## 🐛 常见问题

### 部署失败
- 检查netlify.toml配置
- 验证文件路径正确性
- 查看Netlify部署日志

### 本地服务器问题
- 确保端口3000未被占用
- 检查防火墙设置
- 尝试不同的端口号

### Git推送问题
- 检查远程仓库地址
- 验证GitHub访问权限
- 确认分支名称正确

## 📞 技术支持

如果您在开发过程中遇到问题：
1. 查看本文档的常见问题部分
2. 检查浏览器控制台错误信息
3. 查看Netlify部署日志
4. 在GitHub仓库创建Issue

## 🔗 相关链接

- **GitHub仓库**：https://github.com/zxl1236/ai
- **线上网站**：https://idyllic-valkyrie-2eaadb.netlify.app
- **Netlify控制台**：https://app.netlify.com/projects/idyllic-valkyrie-2eaadb
- **部署状态**：查看README中的状态徽章