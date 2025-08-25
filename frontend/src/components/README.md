# 组件目录结构说明

## 📁 实际目录结构

```
src/components/
├── ai/                       # AI 相关组件
│   ├── AITutor/             # AI智能陪练组件
│   │   ├── AITutor.js       # 主组件文件
│   │   ├── AITutor.css      # 样式文件
│   │   └── index.js         # 导出文件
│   ├── OllamaChatDialog/    # Ollama聊天对话框
│   ├── AIWritingAssistant/  # AI写作助手
│   └── smart-ai-assistant/  # 智能AI助手
├── reading/                  # 阅读相关组件
│   ├── ModernReading/       # 现代文阅读界面
│   ├── SimpleAnnotationTool/ # 简单标注工具
│   ├── EnhancedAnnotationTool/ # 增强标注工具
│   └── AdvancedReadingTraining/ # 高级阅读训练
├── writing/                  # 写作相关组件
│   ├── WritingInterface/    # 写作界面
│   ├── EnhancedWritingInterface/ # 增强写作界面
│   └── writing/             # 写作功能
├── study/                    # 学习相关组件
│   ├── StudyPage/           # 学习页面
│   ├── ModuleList/          # 模块列表
│   └── UserProgress/        # 用户进度
├── user/                     # 用户相关组件
│   ├── Login/               # 登录组件
│   ├── ProfilePage/         # 个人资料页面
│   ├── UserProfile/         # 用户资料
│   └── Dashboard/           # 仪表板
├── layout/                   # 布局组件
│   ├── BottomNavigation/    # 底部导航
│   └── HomePage/            # 首页
└── common/                   # 通用组件
    └── config/              # 配置文件
```

## 🎯 重构原则

1. **按功能分组** - 相关组件放在同一目录
2. **组件独立** - 每个组件有自己的目录和文件
3. **命名规范** - 使用 PascalCase 命名
4. **文件组织** - 组件目录包含 index.js、Component.js、Component.css

## 📋 当前组件详细说明

### 🤖 AI 组件 (ai/)
- **`AITutor/`** - AI智能陪练组件
  - 功能：提供圣博六步法训练、AI智能问答、真人陪练等模式
  - 文件：`AITutor.js`、`AITutor.css`、`index.js`
  - 使用：通过底部导航"陪练"选项访问

- **`OllamaChatDialog/`** - AI 聊天对话框
  - 功能：基于Ollama的AI对话功能
  - 状态：已重构完成

- **`AIWritingAssistant/`** - AI 写作助手
  - 功能：AI辅助写作功能
  - 状态：已重构完成

- **`smart-ai-assistant/`** - 智能 AI 助手
  - 功能：通用AI助手功能
  - 状态：已重构完成

### 📖 阅读组件 (reading/)
- **`ModernReading/`** - 现代文阅读界面
  - 功能：现代文阅读训练和标注
  - 状态：已重构完成

- **`SimpleAnnotationTool/`** - 简单标注工具
  - 功能：基础文本标注功能
  - 状态：已重构完成

- **`EnhancedAnnotationTool/`** - 增强标注工具
  - 功能：高级文本标注和分析
  - 状态：已重构完成

- **`AdvancedReadingTraining/`** - 高级阅读训练
  - 功能：进阶阅读训练功能
  - 状态：已重构完成

### ✍️ 写作组件 (writing/)
- **`WritingInterface/`** - 写作界面
  - 功能：主要写作功能界面
  - 状态：已重构完成

- **`EnhancedWritingInterface/`** - 增强写作界面
  - 功能：增强版写作功能
  - 状态：已重构完成

- **`writing/`** - 写作功能
  - 功能：写作相关工具和功能
  - 状态：已重构完成

### 📚 学习组件 (study/)
- **`StudyPage/`** - 学习页面
  - 功能：主要学习界面
  - 状态：已重构完成

- **`ModuleList/`** - 模块列表
  - 功能：学习模块展示和选择
  - 状态：已重构完成

- **`UserProgress/`** - 用户进度
  - 功能：学习进度跟踪和统计
  - 状态：已重构完成

### 👤 用户组件 (user/)
- **`Login/`** - 登录组件
  - 功能：用户登录和认证
  - 状态：已重构完成

- **`ProfilePage/`** - 个人资料页面
  - 功能：用户资料管理和设置
  - 状态：已重构完成

- **`UserProfile/`** - 用户资料
  - 功能：用户信息展示和编辑
  - 状态：已重构完成

- **`Dashboard/`** - 仪表板
  - 功能：用户数据概览
  - 状态：已重构完成

### 🏗️ 布局组件 (layout/)
- **`BottomNavigation/`** - 底部导航
  - 功能：应用底部导航栏
  - 包含：首页、学习、陪练、统计、我的
  - 状态：已重构完成

- **`HomePage/`** - 首页
  - 功能：应用主页面
  - 状态：已重构完成

### 🔧 通用组件 (common/)
- **`config/`** - 配置文件
  - 功能：应用配置和常量
  - 状态：已重构完成

## 🚀 重构状态

### ✅ 已完成重构的组件
- 所有主要组件已完成重构
- 目录结构已按功能分组
- 组件独立性已建立

### 🔄 当前工作重点
- 优化组件间通信
- 提升组件复用性
- 完善错误处理机制

## 📝 组件命名规范

- **组件名**：PascalCase (如 `AITutor`)
- **文件名**：PascalCase (如 `AITutor.js`)
- **目录名**：PascalCase (如 `AITutor/`)
- **CSS 类名**：kebab-case (如 `ai-tutor`)
- **导出文件**：`index.js` 用于统一导出

## 🎨 组件设计原则

1. **单一职责** - 每个组件只负责一个功能
2. **可复用性** - 组件应该可以在不同场景下复用
3. **可维护性** - 代码结构清晰，易于维护
4. **性能优化** - 合理使用React优化技术

## 📱 响应式设计

- 所有组件都支持移动端和桌面端
- 使用CSS Grid和Flexbox进行布局
- 支持触摸和鼠标交互
- 适配不同屏幕尺寸

## 🧪 测试建议

- 每个组件都应该有对应的测试文件
- 测试覆盖组件的主要功能和边界情况
- 使用React Testing Library进行组件测试
- 确保组件在不同环境下的兼容性
