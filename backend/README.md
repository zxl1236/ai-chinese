# AI语文学习助手 - 后台管理系统

基于 Flask + SQLite 的轻量级后台管理系统，用于管理 AI语文学习助手的学习内容。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python app_refactored.py
```

服务将在 http://localhost:5000 启动

### 3. 访问管理界面

- **管理面板**: http://localhost:5000
- **API接口**: http://localhost:5000/api/study-content

## 📋 功能特性

### 🎯 核心功能

- ✅ **模块管理**: 创建、编辑、删除学习模块
- ✅ **内容管理**: 为每个模块添加具体的学习内容
- ✅ **分类支持**: 基础训练、阅读理解、写作表达三大类别
- ✅ **难度分级**: 1-5星难度等级系统
- ✅ **状态控制**: 启用/禁用模块和内容
- ✅ **API接口**: RESTful API供前端调用

### 📊 管理界面

- **仪表板**: 系统概览和快速操作
- **模块管理**: 学习模块的CRUD操作
- **内容管理**: 学习内容的详细管理
- **实时预览**: 可直接预览前端效果

## 🔗 API接口

### 获取学习内容

```http
GET /api/study-content
```

返回所有活跃的学习模块，按类别分组：

```json
{
  "basicTraining": [...],
  "readingTraining": [...], 
  "writingTraining": [...]
}
```

### 获取模块详细内容

```http
GET /api/module/{module_id}/content
```

返回指定模块的所有学习内容。

## 📝 数据结构

### 学习模块 (StudyModule)

- `module_id`: 模块唯一标识符
- `title`: 模块标题
- `description`: 模块描述
- `icon`: 模块图标 (Emoji)
- `category`: 模块类别 (basic/reading/writing)
- `difficulty`: 难度等级 (1-5)
- `is_active`: 是否启用

### 学习内容 (StudyContent)

- `module_id`: 所属模块ID
- `content_type`: 内容类型 (text/image/video/exercise)
- `title`: 内容标题
- `content`: 具体内容
- `order_index`: 显示顺序
- `is_active`: 是否启用

## 🎨 内容类型说明

### 📝 文本内容
直接输入文字内容，支持多段落格式。

### 🖼️ 图片内容
输入图片URL或图片描述。

### 🎥 视频内容  
输入视频URL或嵌入代码。

### 🎯 练习内容
使用JSON格式定义练习题结构：

```json
{
  "type": "multiple_choice",
  "question": "题目内容",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "answer": "B",
  "explanation": "答案解释"
}
```

## 🔧 配置说明

- **数据库**: SQLite (自动创建在 `chinese_learning.db`)
- **端口**: 5000 (可在 app.py 中修改)
- **调试模式**: 默认开启 (生产环境请关闭)

## 📱 前端对接

前端通过以下方式对接后台API：

```javascript
// 获取学习内容
const response = await fetch('http://localhost:5000/api/study-content');
const content = await response.json();

// 获取模块详细内容
const moduleContent = await fetch(`http://localhost:5000/api/module/${moduleId}/content`);
const details = await moduleContent.json();
```

## 🎯 使用流程

1. **创建模块**: 在"模块管理"中添加新的学习模块
2. **添加内容**: 为每个模块添加具体的学习内容
3. **调整顺序**: 通过"显示顺序"控制内容展示顺序
4. **状态管理**: 启用/禁用模块和内容
5. **前端同步**: 前端会自动获取最新的内容

## 🛠️ 技术栈

- **后端框架**: Flask
- **数据库**: SQLite + SQLAlchemy
- **前端**: HTML + CSS + Jinja2模板
- **跨域支持**: Flask-CORS

## 📦 部署建议

生产环境部署时建议：

1. 关闭调试模式
2. 使用 WSGI 服务器 (如 Gunicorn)
3. 配置 Nginx 反向代理
4. 设置环境变量管理敏感配置
5. 定期备份 SQLite 数据库文件