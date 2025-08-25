# 🚀 Netlify 部署指南

## 📋 部署前检查清单

### ✅ 必需文件
- [x] `netlify.toml` - Netlify 配置文件
- [x] `frontend/package.json` - 前端依赖配置
- [x] `frontend/craco.config.js` - Craco 配置文件
- [x] `frontend/src/` - 前端源代码
- [x] `frontend/public/` - 静态资源

### 🔧 关键配置说明

#### 1. 构建命令修复
**问题**: 原始构建命令使用了 Windows 语法 `SET NODE_OPTIONS=...`
**解决方案**: 使用 Linux 兼容语法 `NODE_OPTIONS=...`

```toml
# ✅ 正确的构建命令
command = "cd frontend && npm install && NODE_OPTIONS=--openssl-legacy-provider npm run build"

# ❌ 错误的构建命令 (Windows 语法)
command = "cd frontend && SET NODE_OPTIONS=--openssl-legacy-provider && craco build"
```

#### 2. 环境变量设置
```toml
[build.environment]
  NODE_VERSION = "18"
  NODE_OPTIONS = "--openssl-legacy-provider"
```

#### 3. 发布目录
```toml
[build]
  publish = "frontend/build"
```

## 🚀 部署步骤

### 方法 1: Netlify Dashboard (推荐)

1. **登录 [Netlify Dashboard](https://app.netlify.com/)**
2. **选择你的项目**
3. **进入 "Site settings" → "Build & deploy"**
4. **更新构建设置**:
   - Build command: `cd frontend && npm install && NODE_OPTIONS=--openssl-legacy-provider npm run build`
   - Publish directory: `frontend/build`
   - Node version: `18`
5. **点击 "Trigger deploy"**

### 方法 2: Netlify CLI

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod
```

## 🔍 常见问题解决

### 问题 1: 构建命令失败
**错误**: `SET NODE_OPTIONS=--openssl-legacy-provider && craco build`
**原因**: Windows 语法在 Linux 环境中不适用
**解决**: 使用 `NODE_OPTIONS=--openssl-legacy-provider npm run build`

### 问题 2: Craco 未找到
**错误**: `craco: command not found`
**原因**: 直接调用 craco 而不是通过 npm script
**解决**: 使用 `npm run build` 而不是 `craco build`

### 问题 3: 依赖安装失败
**错误**: `npm install` 失败
**解决**: 确保 `package.json` 和 `package-lock.json` 已提交

### 问题 4: 构建目录不存在
**错误**: `publish directory does not exist`
**解决**: 确保构建命令正确生成 `frontend/build` 目录

## 📁 项目结构

```
AI语文/
├── netlify.toml          # Netlify 配置
├── deploy-netlify.bat    # Windows 部署脚本
├── frontend/
│   ├── package.json      # 前端依赖
│   ├── craco.config.js   # Craco 配置
│   ├── src/              # 源代码
│   ├── public/           # 静态资源
│   └── build/            # 构建输出 (部署后生成)
└── NETLIFY_DEPLOYMENT_GUIDE.md
```

## 🎯 验证部署

1. **检查构建日志**: 确保没有错误
2. **验证路由**: 测试 React Router 是否工作
3. **检查 API**: 确认 API 重定向配置正确
4. **性能测试**: 检查加载速度和缓存

## 🔄 更新部署

每次推送代码到 GitHub 后，Netlify 将自动：
1. 检测代码变更
2. 运行构建命令
3. 部署新版本
4. 更新网站

## 📞 技术支持

如果遇到问题：
1. 检查 Netlify 构建日志
2. 验证配置文件语法
3. 确认所有必需文件已提交
4. 参考本指南的常见问题部分

---

**最后更新**: 2024年12月 - 修复构建命令语法问题
