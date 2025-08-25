# 用户切换组件 (UserSwitcher)

## 功能描述

这个组件允许用户在不退出系统的情况下快速切换不同的用户角色，特别适用于管理员需要测试不同用户权限的场景。

## 主要特性

- **快速切换用户**: 无需重新登录，直接切换到其他用户
- **角色管理**: 支持学生、教师、管理员三种角色
- **状态保持**: 切换后自动获取新用户的学习内容和权限
- **响应式设计**: 适配不同屏幕尺寸

## 使用方法

### 1. 导入组件

```jsx
import UserSwitcher from './components/user/UserSwitcher/UserSwitcher';
```

### 2. 在组件中使用

```jsx
<UserSwitcher 
  currentUser={user}
  onSwitchUser={handleSwitchUser}
  onLogout={handleLogout}
/>
```

### 3. 处理用户切换

```jsx
const handleSwitchUser = (newUser) => {
  // 切换到新用户
  setUser(newUser);
  // 重置相关状态
  setStudyContent({});
  setActiveSection('home');
  // 获取新用户的学习内容
  fetchUserStudyContent(newUser.username);
};
```

## 可切换的用户

| 用户名 | 密码 | 角色 | 描述 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 系统管理 |
| teacher01 | 123456 | 教师 | 陪练教师 |
| student01 | 123456 | 学生 | 学生用户 |

## 样式定制

组件使用CSS模块化设计，主要样式类：

- `.user-switcher`: 主容器
- `.user-switcher-trigger`: 触发按钮
- `.user-switcher-dropdown`: 下拉菜单
- `.user-option`: 用户选项
- `.switch-btn`: 切换按钮

## 注意事项

1. 切换用户后，所有本地状态会被重置
2. 需要确保后端API支持用户切换功能
3. 建议在生产环境中添加适当的权限验证
4. 用户切换功能主要用于开发和测试环境

## 响应式支持

- 桌面端: 完整功能展示
- 平板端: 适配中等屏幕
- 移动端: 优化触摸体验
