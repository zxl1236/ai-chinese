import React, { useState, useEffect } from 'react';
import Login from './components/user/Login/Login';
import StudyPage from './components/study/StudyPage/StudyPage';
import HomePage from './components/layout/HomePage/HomePage';
import BottomNavigation from './components/layout/BottomNavigation/BottomNavigation';
import CourseSystem from './components/course/CourseSystem/CourseSystem';
import TeacherTeachingConsole from './components/teacher/TeacherTeachingConsole';
import AdminDashboard from './components/admin/AdminDashboard/AdminDashboard';
import ModernReading from './components/reading/ModernReading/ModernReading';
import WritingInterface from './components/writing/WritingInterface/WritingInterface';
import './App.css';
import './styles/variables.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [studyContent, setStudyContent] = useState({});
  const [selectedModule, setSelectedModule] = useState(null);

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
    setLoading(false);
  }, []);

  const fetchUserStudyContent = async (username) => {
    // 检查是否为演示模式
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    if (isDemoMode) {
      // 演示模式使用模拟数据
      const mockStudyContent = {
        total_study_time: 120,
        completed_lessons: 15,
        current_level: 3,
        achievements: ['阅读达人', '写作新星'],
        recent_activities: [
          { type: 'reading', title: '现代文阅读练习', date: '2024-01-20' },
          { type: 'writing', title: '议论文写作', date: '2024-01-19' }
        ]
      };
      setStudyContent(mockStudyContent);
      return;
    }

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
    setUser(null);
    setStudyContent({});
    setActiveSection('home');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('studyContent');
    localStorage.removeItem('activeSection');
    console.log('用户已成功退出登录');
  };

  const handleSwitchUser = (newUser) => {
    setUser(newUser);
    setStudyContent({});
    setActiveSection('home');
    setSelectedModule(null);
    fetchUserStudyContent(newUser.username);
    console.log(`已切换到用户: ${newUser.username} (${newUser.user_type})`);
  };

  const handleModuleSelect = (moduleId) => {
    console.log('选择模块:', moduleId);
    setSelectedModule(moduleId);
    // 根据模块类型设置不同的activeSection
    if (moduleId.includes('reading') || moduleId.includes('现代文') || moduleId.includes('记叙文') || moduleId.includes('说明文') || moduleId.includes('议论文') || moduleId.includes('诗') || 
        moduleId === 'modern-text' || moduleId === 'narrative-text' || moduleId === 'novel' || moduleId === 'argumentative' || 
        moduleId === 'expository' || moduleId === 'poetry' || moduleId === 'prose' || moduleId === 'classical-prose' || moduleId === 'non-continuous') {
      setActiveSection('reading');
    } else if (moduleId.includes('writing') || moduleId.includes('写作') || moduleId.includes('作文') || 
               moduleId === 'proposition-writing' || moduleId === 'semi-proposition' || moduleId === 'ai-writing-assistant') {
      setActiveSection('writing');
    } else {
      setActiveSection('module-detail');
    }
  };

  const handleBackToStudy = () => {
    setSelectedModule(null);
    setActiveSection('study');
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
    switch (activeSection) {
      case 'home':
        return (
          <HomePage 
            user={user}
            onSwitchUser={handleSwitchUser}
            onLogout={handleLogout}
          />
        );
      case 'study':
        return (
          <StudyPage 
            user={user}
            studyContent={studyContent}
            onModuleSelect={handleModuleSelect}
          />
        );
      case 'reading':
        return (
          <ModernReading 
            user={user}
            onBack={handleBackToStudy}
            selectedModule={selectedModule}
          />
        );
      case 'writing':
        return (
          <WritingInterface 
            user={user}
            onBack={handleBackToStudy}
            module={selectedModule}
          />
        );
      case 'module-detail':
        return (
          <div className="module-detail-page">
            <div className="module-detail-header">
              <button className="back-btn" onClick={handleBackToStudy}>
                ← 返回学习中心
              </button>
              <h2>📚 {selectedModule}</h2>
            </div>
            <div className="module-detail-content">
              <p>该模块功能正在开发中...</p>
              <p>模块ID: {selectedModule}</p>
            </div>
          </div>
        );
      case 'courses':
        return (
          <CourseSystem 
            user={user} 
            onSwitchUser={handleSwitchUser}
            onLogout={handleLogout}
          />
        );
      case 'teaching':
        return (
          <TeacherTeachingConsole 
            teacherId={user.id}
            user={user}
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            user={user}
            onLogout={handleLogout}
          />
        );
      case 'profile':
        return (
          <div className="profile-page">
            <div className="profile-header">
              <h2>👤 个人中心</h2>
              <p>管理您的个人信息和设置</p>
            </div>
            <div className="profile-content">
              <div className="user-info">
                <h3>用户信息</h3>
                <p><strong>姓名:</strong> {user.nickname || user.full_name}</p>
                <p><strong>用户名:</strong> {user.username}</p>
                <p><strong>角色:</strong> {user.user_type === 'student' ? '学生' : user.user_type === 'teacher' ? '教师' : '管理员'}</p>
              </div>
              <div className="profile-actions">
                <button className="action-btn" onClick={handleSwitchUser}>
                  切换用户
                </button>
                <button className="action-btn logout" onClick={handleLogout}>
                  退出登录
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <HomePage 
            user={user}
            onSwitchUser={handleSwitchUser}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="app">
      <main className="app-main app-content app-with-bottom-nav">
        {renderContent()}
      </main>
      <BottomNavigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userType={user.user_type}
      />
    </div>
  );
}

export default App;
