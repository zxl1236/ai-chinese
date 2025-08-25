import React, { useState } from 'react';
import './ProfilePage.css';

const ProfilePage = ({ user, onLogout }) => {
  const [showSettings, setShowSettings] = useState(false);

  const userStats = {
    totalStudyDays: 45,
    totalStudyTime: 2580, // 分钟
    completedExercises: 156,
    currentLevel: '中级学者',
    nextLevelProgress: 68,
    achievements: [
      { id: 1, name: '初学者', icon: '🌱', description: '完成第一次练习', unlocked: true },
      { id: 2, name: '坚持者', icon: '🔥', description: '连续学习7天', unlocked: true },
      { id: 3, name: '阅读达人', icon: '📚', description: '完成50篇阅读理解', unlocked: true },
      { id: 4, name: '写作高手', icon: '✍️', description: '完成20篇作文练习', unlocked: false },
      { id: 5, name: '学习之星', icon: '⭐', description: '单日学习超过2小时', unlocked: false },
    ]
  };

  const recentActivities = [
    { date: '2025-01-18', activity: '完成现代文阅读练习', score: 85 },
    { date: '2025-01-17', activity: '完成古诗词鉴赏', score: 92 },
    { date: '2025-01-16', activity: '完成写作练习：记叙文', score: 78 },
    { date: '2025-01-15', activity: '完成字词基础训练', score: 90 }
  ];

  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      onLogout();
    }
  };

  return (
    <div className="profile-page">
      {/* 用户信息卡片 */}
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-text">{user?.username?.charAt(0)?.toUpperCase()}</span>
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.username}</h2>
          <p className="profile-role">
            {user?.user_type === 'student' ? '学生' : 
             user?.user_type === 'teacher' ? '教师' : '管理员'}
          </p>
          <p className="profile-level">{userStats.currentLevel}</p>
        </div>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </div>

      {/* 等级进度 */}
      <div className="level-progress-card">
        <div className="level-info">
          <span className="level-current">{userStats.currentLevel}</span>
          <span className="level-next">高级学者</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${userStats.nextLevelProgress}%` }}
          ></div>
        </div>
        <p className="progress-text">距离下一级别还需 {100 - userStats.nextLevelProgress}% 经验</p>
      </div>

      {/* 学习统计 */}
      <div className="stats-section">
        <h3 className="section-title">📊 学习统计</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <span className="stat-number">{userStats.totalStudyDays}</span>
              <span className="stat-label">学习天数</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <span className="stat-number">{formatStudyTime(userStats.totalStudyTime)}</span>
              <span className="stat-label">总学习时长</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-number">{userStats.completedExercises}</span>
              <span className="stat-label">完成练习</span>
            </div>
          </div>
        </div>
      </div>

      {/* 成就徽章 */}
      <div className="achievements-section">
        <h3 className="section-title">🏆 成就徽章</h3>
        <div className="achievements-grid">
          {userStats.achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <h4 className="achievement-name">{achievement.name}</h4>
                <p className="achievement-desc">{achievement.description}</p>
              </div>
              {achievement.unlocked && <div className="achievement-badge">✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="activities-section">
        <h3 className="section-title">📈 最近活动</h3>
        <div className="activities-list">
          {recentActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-date">{activity.date}</div>
              <div className="activity-content">
                <span className="activity-text">{activity.activity}</span>
                <span className={`activity-score ${activity.score >= 85 ? 'excellent' : activity.score >= 70 ? 'good' : 'normal'}`}>
                  {activity.score}分
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 设置菜单 */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>设置</h3>
              <button 
                className="close-btn"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>
            <div className="settings-items">
              <button className="settings-item">
                <span className="settings-icon">🔔</span>
                <span>通知设置</span>
              </button>
              <button className="settings-item">
                <span className="settings-icon">🎨</span>
                <span>主题设置</span>
              </button>
              <button className="settings-item">
                <span className="settings-icon">🌐</span>
                <span>语言设置</span>
              </button>
              <button className="settings-item">
                <span className="settings-icon">🔒</span>
                <span>隐私设置</span>
              </button>
              <button className="settings-item">
                <span className="settings-icon">❓</span>
                <span>帮助与反馈</span>
              </button>
              <button className="settings-item danger" onClick={handleLogout}>
                <span className="settings-icon">🚪</span>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
