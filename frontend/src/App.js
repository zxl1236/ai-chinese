import React, { useState, useEffect } from 'react';
import Login from './components/user/Login';
import WritingInterface from './components/writing/WritingInterface';
import UserProgress from './components/study/UserProgress';
import AITutor from './components/ai/AITutor';
import StudyPage from './components/study/StudyPage';
import HomePage from './components/layout/HomePage';
import ProfilePage from './components/user/ProfilePage';
import BottomNavigation from './components/layout/BottomNavigation';
import ModernReading from './components/reading/ModernReading';
import UserSwitcher from './components/user/UserSwitcher/UserSwitcher';
import CourseSystem from './components/course/CourseSystem/CourseSystem';
import './App.css';
import './styles/variables.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentWritingModule, setCurrentWritingModule] = useState(null);
  const [currentReadingModule, setCurrentReadingModule] = useState(null);
  const [studyContent, setStudyContent] = useState({});


  // 检查本地存储的用户信息
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        fetchUserStudyContent(userData.username);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    // 直接设置loading为false，取消加载动画
    setLoading(false);
  }, []);

  const fetchUserStudyContent = async (username) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${username}/study-content`);
      if (response.ok) {
        const data = await response.json();
        setStudyContent(data);
      }
    } catch (error) {
      console.error('获取学习内容失败:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    fetchUserStudyContent(userData.username);
  };

  const handleLogout = () => {
    // 重置所有用户相关状态
    setUser(null);
    setStudyContent({});
    setActiveSection('home');
    setCurrentWritingModule(null);
    setCurrentReadingModule(null);
    
    // 清除所有本地存储
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('studyContent');
    localStorage.removeItem('activeSection');
    localStorage.removeItem('writingProgress');
    
    // 可以添加一个退出登录的提示
    console.log('用户已成功退出登录');
  };

  const handleSwitchUser = (newUser) => {
    // 切换到新用户
    setUser(newUser);
    setStudyContent({});
    setActiveSection('home');
    setCurrentWritingModule(null);
    setCurrentReadingModule(null);
    
    // 获取新用户的学习内容
    fetchUserStudyContent(newUser.username);
    
    console.log(`已切换到用户: ${newUser.username} (${newUser.user_type})`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // 如果正在写作模式，显示集成AI助手的写作界面
    if (currentWritingModule) {
      return (
        <WritingInterface 
          module={currentWritingModule} 
          user={user} 
          onBack={() => setCurrentWritingModule(null)}
        />
      );
    }

    // 如果正在阅读模式，显示现代文阅读界面
    if (currentReadingModule) {
      return (
        <ModernReading 
          user={user} 
          onBack={() => setCurrentReadingModule(null)}
        />
      );
    }

    switch (activeSection) {
      case 'home':
        return <HomePage 
          user={user} 
          onModuleClick={(moduleId) => {
            // 根据模块ID跳转到对应的学习页面
            if (moduleId.includes('writing')) {
              setActiveSection('study');
            } else if (moduleId === 'modern-reading' || moduleId.includes('modern')) {
              // 直接启动现代文阅读模块
              setCurrentReadingModule('modern-reading');
            } else if (moduleId.includes('reading') || moduleId.includes('classical')) {
              setActiveSection('study');
            } else {
              setActiveSection('study');
            }
          }}
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
        />;
      case 'study':
        return <StudyPage 
          user={user} 
          onModuleSelect={(moduleId) => {
            // 根据模块ID跳转到对应的学习页面
            if (moduleId.includes('writing')) {
              setCurrentWritingModule(moduleId);
            } else if (moduleId === 'modern-text' || moduleId.includes('modern')) {
              // 启动现代文阅读模块
              setCurrentReadingModule('modern-reading');
            } else if (moduleId.includes('reading') || moduleId.includes('classical')) {
              // 可以添加其他特定的阅读页面
              console.log('启动阅读模块:', moduleId);
            }
          }} 
          onBack={() => setActiveSection('home')}
        />;
      case 'tutor':
        return <AITutor user={user} onBack={() => setActiveSection('home')} />;
      case 'progress':
        return <UserProgress user={user} />;
      case 'profile':
        return <ProfilePage user={user} onLogout={handleLogout} />;
      case 'courses':
        return <CourseSystem 
          user={user} 
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
        />;
      default:
        return <HomePage user={user} onModuleClick={(moduleId) => {
          setActiveSection('study');
        }} />;
    }
  };

  return (
    <div className="app">
      {/* 简化的头部，只在特定页面显示 */}
      {(activeSection === 'study' || currentWritingModule || currentReadingModule) && (
        <header className="app-header">
          <div className="header-left">
            <h1>📚 AI语文学习助手</h1>
            <span className="user-role">
              {user.user_type === 'student' ? '学生版' : 
               user.user_type === 'teacher' ? '教师版' : '管理员版'}
            </span>
          </div>
          <div className="header-right">
            <UserSwitcher 
              currentUser={user}
              onSwitchUser={handleSwitchUser}
              onLogout={handleLogout}
            />
          </div>
        </header>
      )}

      <main className="app-main app-content app-with-bottom-nav">
        {renderContent()}
      </main>

      {/* 底部导航 */}
      <BottomNavigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userType={user.user_type}
      />
    </div>
  );
}

// 移除内联组件定义，这些已经在单独的组件文件中定义了

export default App;
