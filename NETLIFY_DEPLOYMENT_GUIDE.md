# AI语文学习助手 - Netlify 部署指南

## 📋 部署准备清单

### ✅ 已完成配置
- [x] 配置了 `netlify.toml` 文件
- [x] 设置了前端独立运行模式
- [x] 更新了 API 配置以支持前端独立运行
- [x] 配置了构建环境变量

### 🚀 部署步骤

#### 方法一：通过 Git 连接（推荐）

1. **准备 Git 仓库**
   ```bash
   # 如果还没有 Git 仓库，初始化一个
   git init
   git add .
   git commit -m "准备部署到 Netlify"
   
   # 推送到 GitHub/GitLab
   git remote add origin <你的仓库地址>
   git push -u origin main
   ```

2. **在 Netlify 上创建新站点**
   - 访问 [Netlify](https://app.netlify.com/)
   - 点击 "New site from Git"
   - 选择你的 Git 提供商（GitHub/GitLab/Bitbucket）
   - 选择你的仓库

3. **配置构建设置**
   Netlify 会自动读取 `netlify.toml` 文件，但请确认以下设置：
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`
   - **Node.js version**: `18`

4. **环境变量设置**
   在 Netlify 站点设置中添加环境变量：
   - `NODE_OPTIONS`: `--openssl-legacy-provider`
   - `CI`: `false`
   - `REACT_APP_FRONTEND_ONLY`: `true`

5. **部署**
   - 点击 "Deploy site"
   - 等待构建完成

#### 方法二：手动上传（适用于测试）

1. **本地构建**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **上传构建文件**
   - 在 Netlify 控制台选择 "Deploy manually"
   - 拖拽 `frontend/build` 文件夹到上传区域

## 🔧 构建配置说明

### netlify.toml 文件解释
```toml
[build]
  # 指定构建产物目录
  publish = "frontend/build"
  # 构建命令
  command = "cd frontend && npm install && npm run build"

[build.environment]
  # Node.js 版本
  NODE_VERSION = "18"
  # 解决 OpenSSL 兼容性问题
  NODE_OPTIONS = "--openssl-legacy-provider"
  # 禁用 CI 严格模式
  CI = "false"
  # 启用前端独立运行模式
  REACT_APP_FRONTEND_ONLY = "true"

# 支持 React Router 的 SPA 路由
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🎯 前端独立运行模式

当前配置使前端可以独立运行，不依赖后端服务：

### 特性
- ✅ 所有 API 调用都会返回模拟数据
- ✅ 用户界面完全可用
- ✅ 可以展示应用的完整功能
- ✅ 适合演示和测试

### 配置文件
- `frontend/public/config.js`: 设置了 `FRONTEND_ONLY_MODE: true`
- `frontend/src/config/api.js`: 支持前端独立运行模式的 API 处理

## 🔍 部署后验证

部署完成后，访问你的 Netlify 网址，确认：

1. **页面加载正常** - 主页应该能正常显示
2. **路由工作** - 尝试访问不同页面，URL 应该正确更新
3. **控制台检查** - 打开浏览器开发者工具，应该看到"前端独立运行模式"的日志
4. **功能测试** - 尝试使用各种功能，应该都能正常响应（使用模拟数据）

## 🚨 常见问题

### 构建失败
- **Node.js 版本问题**: 确保使用 Node.js 18
- **内存不足**: 在环境变量中设置 `NODE_OPTIONS=--max-old-space-size=4096`
- **依赖问题**: 删除 `node_modules` 和 `package-lock.json`，重新安装

### 页面 404 错误
- 检查 `netlify.toml` 中的重定向规则
- 确保 `publish` 目录设置正确

### API 调用失败
- 这是正常的，因为当前是前端独立运行模式
- 检查浏览器控制台，应该看到"前端独立运行模式"的日志

## 🔄 后续集成后端

当需要连接后端时：

1. **部署后端服务**（如 Heroku、Railway 等）
2. **更新配置文件**:
   ```javascript
   // frontend/public/config.js
   window.REACT_APP_CONFIG = {
     PRODUCTION_API_URL: 'https://your-backend-url.herokuapp.com',
     FRONTEND_ONLY_MODE: false // 禁用前端独立运行模式
   };
   ```
3. **重新部署前端**

## 📞 获取帮助

如果遇到问题：
1. 检查 Netlify 的构建日志
2. 查看浏览器开发者工具的控制台
3. 参考 [Netlify 文档](https://docs.netlify.com/)

---

🎉 **恭喜！你的 AI语文学习助手 前端应用现在已经准备好部署到 Netlify 了！**
