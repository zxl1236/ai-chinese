import React, { useState, useEffect } from 'react';
import UserSwitcher from '../../user/UserSwitcher/UserSwitcher';
import './HomePage.css';

const HomePage = ({ user, onModuleClick, onSwitchUser, onLogout }) => {
  const [studyStats, setStudyStats] = useState({
    totalStudyTime: 0,
    completedExercises: 0,
    currentStreak: 0
  });

  const mainModules = [
    {
      id: 'vocabulary-basics',
      icon: '📝',
      title: '字词基础',
      description: '汉字词汇基础知识',
      difficulty: '基础',
      progress: 60
    },
    {
      id: 'modern-reading',
      icon: '📖',
      title: '现代文阅读',
      description: '现代文阅读理解训练',
      difficulty: '中级',
      progress: 45
    },
    {
      id: 'classical-reading',
      icon: '🏛️',
      title: '文言文阅读',
      description: '古文文言文阅读分析',
      difficulty: '高级',
      progress: 20
    },
    {
      id: 'writing',
      icon: '✍️',
      title: '写作表达',
      description: '各类文体写作训练',
      difficulty: '中级',
      progress: 35
    }
  ];

  const upcomingClasses = [
    {
      id: 1,
      title: '小学五年级阅读方法课',
      teacher: '李老师',
      date: '2025年8月18日',
      time: '18:00-19:00',
      type: '1对1辅导',
      subject: '阅读理解专项',
      status: 'upcoming'
    },
    {
      id: 2,
      title: '初中古诗文解析课',
      teacher: '王老师',
      date: '2025年8月20日',
      time: '19:30-20:30',
      type: '小班教学',
      subject: '古诗文鉴赏',
      status: 'scheduled'
    }
  ];

  useEffect(() => {
    // 模拟获取学习统计数据
    setStudyStats({
      totalStudyTime: 125,
      completedExercises: 48,
      currentStreak: 7
    });
  }, []);

  const handleModuleClick = (moduleId) => {
    if (onModuleClick) {
      onModuleClick(moduleId);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '基础': return '#4CAF50';
      case '中级': return '#FF9800';
      case '高级': return '#F44336';
      default: return '#2196F3';
    }
  };

  return (
    <div className="home-page">
      {/* 欢迎区域 */}
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-header">
            <div>
              <h2>📚 学习中心</h2>
              <p>欢迎回来，{user?.username}！继续你的学习之旅</p>
            </div>
            <UserSwitcher 
              currentUser={user}
              onSwitchUser={onSwitchUser}
              onLogout={onLogout}
            />
          </div>
        </div>
        <div className="study-stats">
          <div className="stat-item">
            <span className="stat-number">{studyStats.totalStudyTime}</span>
            <span className="stat-label">分钟</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{studyStats.completedExercises}</span>
            <span className="stat-label">练习</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{studyStats.currentStreak}</span>
            <span className="stat-label">连续天</span>
          </div>
        </div>
      </div>

      {/* 主要学习模块 */}
      <div className="main-modules-section">
        <h3 className="section-title">🎯 学习模块</h3>
        <div className="modules-grid">
          {mainModules.map(module => (
            <div 
              key={module.id} 
              className="main-module-card"
              onClick={() => handleModuleClick(module.id)}
            >
              <div className="module-header">
                <div className="module-icon">{module.icon}</div>
                <div className="module-difficulty">
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(module.difficulty) }}
                  >
                    {module.difficulty}
                  </span>
                </div>
              </div>
              <div className="module-content">
                <h4 className="module-title">{module.title}</h4>
                <p className="module-description">{module.description}</p>
                <div className="module-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">进度: {module.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 课程预约区域 */}
      <div className="course-booking-section">
        <h3 className="section-title">📅 课程预约</h3>
        <div className="booking-cards">
          {upcomingClasses.map(classItem => (
            <div key={classItem.id} className={`booking-card ${classItem.status}`}>
              <div className="booking-header">
                <div className="booking-status">
                  <span className={`status-dot ${classItem.status}`}></span>
                  <span className="status-text">
                    {classItem.status === 'upcoming' ? '即将开始' : '已预约'}
                  </span>
                </div>
                <div className="booking-time">
                  <span className="time-date">{classItem.date}</span>
                  <span className="time-period">{classItem.time}</span>
                </div>
              </div>
              
              <div className="booking-content">
                <h4 className="course-title">{classItem.title}</h4>
                <div className="course-details">
                  <div className="detail-item">
                    <span className="detail-icon">👩‍🏫</span>
                    <span className="detail-text">{classItem.teacher}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👥</span>
                    <span className="detail-text">{classItem.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📖</span>
                    <span className="detail-text">{classItem.subject}</span>
                  </div>
                </div>
              </div>
              
              <div className="booking-actions">
                <button className="btn-secondary booking-btn" type="button">
                  <span className="btn-icon">💬</span>
                  <span>课前准备</span>
                </button>
                <button className="btn-primary booking-btn" type="button">
                  <span className="btn-icon">🎯</span>
                  <span>{classItem.status === 'upcoming' ? '进入课堂' : '查看详情'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="booking-actions-bar">
          <button className="btn-primary add-booking-btn" type="button">
            <span className="btn-icon">➕</span>
            <span>预约新课程</span>
          </button>
          <button className="btn-outline view-all-btn" type="button">
            <span className="btn-icon">📋</span>
            <span>查看全部课程</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
