import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, studyContent, onStartWriting }) => {
  const [stats, setStats] = useState({
    totalModules: 0,
    completionRate: 85,
    studyDays: 7,
    badges: 12
  });

  useEffect(() => {
    const totalModules = (studyContent.basicTraining?.length || 0) + 
                        (studyContent.readingTraining?.length || 0) + 
                        (studyContent.writingTraining?.length || 0);
    setStats(prev => ({ ...prev, totalModules }));
  }, [studyContent]);

  return (
    <div className="dashboard">
      {/* 欢迎区域 */}
      <div className="welcome-section">
        <h2>欢迎回来，{user.nickname || user.username}！</h2>
        <p>继续您的语文学习之旅</p>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalModules}</h3>
            <p>可用模块</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{stats.completionRate}%</h3>
            <p>完成率</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <h3>{stats.studyDays}</h3>
            <p>连续学习天数</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>{stats.badges}</h3>
            <p>获得徽章</p>
          </div>
        </div>
      </div>

      {/* 课程预约区域 */}
      <div className="course-booking-section">
        <div className="section-header">
          <h3 className="section-title">📅 课程预约</h3>
          <p className="section-subtitle">即将开始的课程</p>
        </div>
        
        <div className="booking-cards">
          <div className="booking-card upcoming">
            <div className="booking-header">
              <div className="booking-status">
                <span className="status-dot active"></span>
                <span className="status-text">即将开始</span>
              </div>
              <div className="booking-time">
                <span className="time-date">2025年8月15日</span>
                <span className="time-period">18:00-19:00</span>
              </div>
            </div>
            
            <div className="booking-content">
              <h4 className="course-title">小学五年级阅读方法课</h4>
              <div className="course-details">
                <div className="detail-item">
                  <span className="detail-icon">👩‍🏫</span>
                  <span className="detail-text">李老师</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <span className="detail-text">1对1辅导</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📖</span>
                  <span className="detail-text">阅读理解专项</span>
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
                <span>进入课堂</span>
              </button>
            </div>
          </div>

          <div className="booking-card scheduled">
            <div className="booking-header">
              <div className="booking-status">
                <span className="status-dot scheduled"></span>
                <span className="status-text">已预约</span>
              </div>
              <div className="booking-time">
                <span className="time-date">2025年8月18日</span>
                <span className="time-period">19:30-20:30</span>
              </div>
            </div>
            
            <div className="booking-content">
              <h4 className="course-title">初中古诗文解析课</h4>
              <div className="course-details">
                <div className="detail-item">
                  <span className="detail-icon">👨‍🏫</span>
                  <span className="detail-text">王老师</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <span className="detail-text">小班教学</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🏛️</span>
                  <span className="detail-text">古诗文鉴赏</span>
                </div>
              </div>
            </div>
            
            <div className="booking-actions">
              <button className="btn-secondary booking-btn" type="button">
                <span className="btn-icon">⏰</span>
                <span>设置提醒</span>
              </button>
              <button className="btn-outline booking-btn" type="button">
                <span className="btn-icon">✏️</span>
                <span>修改预约</span>
              </button>
            </div>
          </div>
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

      {/* 快速开始区域 */}
      <div className="quick-access">
        <h3>快速开始</h3>
        <div className="module-grid">
          {studyContent.basicTraining?.slice(0, 3).map(module => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              onStartWriting={onStartWriting} 
            />
          ))}
          {studyContent.readingTraining?.slice(0, 2).map(module => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              onStartWriting={onStartWriting} 
            />
          ))}
          {studyContent.writingTraining?.slice(0, 1).map(module => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              onStartWriting={onStartWriting} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 模块卡片组件
const ModuleCard = ({ module, onStartWriting }) => {
  const handleModuleClick = () => {
    if (module.category === 'writing' || module.type === 'writing' || 
        module.title.includes('写作') || module.title.includes('作文')) {
      onStartWriting(module);
    } else {
      console.log('开始学习模块:', module.id);
      alert(`即将开始学习：${module.title}`);
    }
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      1: '初级',
      2: '中级', 
      3: '高级',
      4: '专家',
      5: '大师'
    };
    return labels[difficulty] || '中级';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      1: '#4CAF50',
      2: '#2196F3',
      3: '#FF9800',
      4: '#F44336',
      5: '#9C27B0'
    };
    return colors[difficulty] || '#2196F3';
  };

  return (
    <div className="module-card" onClick={handleModuleClick}>
      <div className="module-icon">{module.icon}</div>
      <div className="module-content">
        <h3>{module.title}</h3>
        <p>{module.description}</p>
        <div className="module-meta">
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(module.difficulty) }}
          >
            {getDifficultyLabel(module.difficulty)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
