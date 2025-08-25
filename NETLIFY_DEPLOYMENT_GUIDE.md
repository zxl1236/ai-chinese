# 🚀 Netlify 部署指南

## 📋 问题说明

由于项目重构，原有的Netlify配置被删除，导致部署失败。本指南将帮助你重新配置Netlify部署。

## 🔧 重新配置步骤

### 1. 本地构建测试

首先在本地测试构建是否正常：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2. 检查构建结果

构建成功后，应该生成 `frontend/build/` 目录，包含：
- `index.html` - 主页面
- `static/` - 静态资源
- 其他构建文件

### 3. Netlify重新配置

#### 方法一：通过Netlify Dashboard

1. 登录 [Netlify Dashboard](https://app.netlify.com/)
2. 选择你的项目
3. 进入 "Site settings" → "Build & deploy"
4. 更新以下设置：
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/build`
   - **Node version**: `18`

#### 方法二：通过GitHub集成

1. 在Netlify Dashboard中重新连接GitHub仓库
2. 选择 `main` 分支
3. 设置构建命令：`cd frontend && npm run build`
4. 设置发布目录：`frontend/build`

### 4. 环境变量配置

在Netlify Dashboard中添加环境变量：

```
NODE_VERSION=18
REACT_APP_API_URL=https://your-backend-domain.com
```

### 5. 重定向规则

确保以下重定向规则已配置（通过 `netlify.toml` 或Dashboard）：

```
/*    /index.html   200
/api/*    https://your-backend-domain.com/api/:splat    200
```

## 🚨 常见问题解决

### 问题1：构建失败
- 检查Node.js版本是否为18+
- 确保所有依赖已安装
- 查看构建日志中的错误信息

### 问题2：页面404错误
- 检查重定向规则是否正确
- 确保 `/*` 重定向到 `/index.html`
- 验证发布目录设置

### 问题3：API请求失败
- 检查后端API地址是否正确
- 确认CORS配置
- 验证重定向规则

## 📁 文件结构

```
项目根目录/
├── netlify.toml          # Netlify配置文件
├── deploy-netlify.bat    # 部署脚本
├── frontend/             # 前端代码
│   ├── build/           # 构建输出（部署时使用）
│   ├── src/             # 源代码
│   └── package.json     # 依赖配置
└── backend/              # 后端代码
```

## 🔄 自动部署

配置完成后，每次推送到 `main` 分支，Netlify将自动：
1. 拉取最新代码
2. 安装依赖
3. 构建前端
4. 部署到CDN

## 📞 技术支持

如果仍有问题，请：
1. 检查Netlify构建日志
2. 验证本地构建是否成功
3. 确认配置文件语法正确
4. 联系Netlify支持团队

## ✅ 部署检查清单

- [ ] 本地构建成功
- [ ] Netlify配置更新
- [ ] 构建命令设置正确
- [ ] 发布目录设置正确
- [ ] 重定向规则配置
- [ ] 环境变量设置
- [ ] 自动部署测试
