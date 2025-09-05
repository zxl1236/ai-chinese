# 部署指南

## 问题诊断

你遇到的"网络错误"问题是因为：

1. **前端已部署在 Netlify**：https://ai-chinese.netlify.app
2. **后端尚未部署**：目前只有本地后端服务器
3. **前端无法访问后端API**：生产环境下前端找不到后端服务

## 解决方案

### 步骤1：部署后端到 Heroku

1. 安装 Heroku CLI：https://devcenter.heroku.com/articles/heroku-cli

2. 在 backend 目录下执行：
```bash
cd backend
heroku login
heroku create your-app-name-backend
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a your-app-name-backend
git push heroku main
```

3. 设置环境变量：
```bash
heroku config:set FLASK_ENV=production
heroku config:set DATABASE_URL=sqlite:///chinese_learning.db
```

### 步骤2：配置前端API地址

部署后端成功后，你会得到一个类似这样的地址：
`https://your-app-name-backend.herokuapp.com`

然后修改 `frontend/public/config.js` 文件：

```javascript
window.REACT_APP_CONFIG = {
  // 本地开发环境
  DEVELOPMENT_API_URL: 'http://localhost:5000',
  
  // 生产环境 - 替换为你的实际后端地址
  PRODUCTION_API_URL: 'https://your-app-name-backend.herokuapp.com',
  
  // 当前环境判断
  IS_PRODUCTION: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
};
```

### 步骤3：重新部署前端

修改配置后，提交代码到 GitHub，Netlify 会自动重新部署。

### 步骤4：测试

访问 https://ai-chinese.netlify.app，尝试登录，应该不会再出现网络错误。

## 替代部署方案

如果不想使用 Heroku，可以考虑：

1. **Railway**：https://railway.app
2. **Render**：https://render.com  
3. **PythonAnywhere**：https://www.pythonanywhere.com
4. **自己的 VPS 服务器**

## 测试用户

- 管理员：admin / admin123
- 教师：teacher1 / teacher123
- 学生：student1 / student123

## 注意事项

1. 确保后端数据库持久化（Heroku 免费版数据库会重置）
2. 配置生产环境的安全设置
3. 监控后端服务状态
4. 如需要，配置自定义域名

## 当前修改的文件

1. `frontend/public/config.js` - 新增运行时配置
2. `frontend/src/config/api.js` - 支持运行时配置
3. `frontend/public/index.html` - 加载配置文件
4. `backend/app_unified.py` - 修复CORS配置
5. `netlify.toml` - 注释掉错误的重定向配置
