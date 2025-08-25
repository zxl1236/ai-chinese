import React, { useState } from 'react';
import './UserProgress.css';

const UserProgress = ({ user }) => {
  const stats = {
    weeklyHours: 2.5,
    completedExercises: 15,
    accuracy: 89,
    studyDays: 7
  };

  const abilities = [
    { name: '阅读理解', icon: '📖', score: 85, level: 'excellent' },
    { name: '写作表达', icon: '📝', score: 72, level: 'good' },
    { name: '古诗文', icon: '🏛️', score: 58, level: 'needs-improvement' },
    { name: '修辞运用', icon: '🎭', score: 76, level: 'good' }
  ];

  const trends = [
    { title: '本周学习时长', current: 6, total: 10, unit: '小时' },
    { title: '错题复习完成度', current: 15, total: 20, unit: '题' },
    { title: '作业完成率', current: 18, total: 20, unit: '份' }
  ];

  const [suggestions] = useState([
    {
      icon: '📚',
      title: '加强古诗文学习',
      desc: '建议每天安排15分钟进行古诗文练习'
    },
    {
      icon: '✍️',
      title: '提升写作技巧',
      desc: '多练习议论文写作，注重逻辑性和论证力'
    },
    {
      icon: '📈',
      title: '保持学习节奏',
      desc: '当前学习状态良好，继续保持每日学习习惯'
    }
  ]);

  const getLevelLabel = (level) => {
    const labels = {
      'excellent': '优秀',
      'good': '良好',
      'needs-improvement': '待提升'
    };
    return labels[level] || '良好';
  };

  const getLevelColor = (level) => {
    const colors = {
      'excellent': '#4CAF50',
      'good': '#2196F3',
      'needs-improvement': '#FF9800'
    };
    return colors[level] || '#2196F3';
  };

  return (
    <div className="user-progress">
      <div className="section-header">
        <h2>学习进度</h2>
        <p>查看您的学习统计和成就</p>
      </div>

      {/* 学习概览统计 */}
      <div className="learning-stats">
        <div className="section-title">📈 学习统计</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{stats.weeklyHours}</div>
              <div className="stat-label">小时</div>
              <div className="stat-desc">本周训练时长</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completedExercises}</div>
              <div className="stat-label">次</div>
              <div className="stat-desc">完成训练次数</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-number">{stats.accuracy}</div>
              <div className="stat-label">分</div>
              <div className="stat-desc">平均训练得分</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.studyDays}</div>
              <div className="stat-label">天</div>
              <div className="stat-desc">连续训练天数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 详细数据分析 */}
      <div className="detailed-stats">
        <div className="section-title">📊 详细分析</div>
        
        {/* 能力分析 */}
        <div className="ability-analysis">
          <h3>能力分析</h3>
          <div className="ability-chart">
            {abilities.map((ability, index) => (
              <div key={index} className={`ability-item ${ability.level}`}>
                <div className="ability-info">
                  <span className="ability-icon">{ability.icon}</span>
                  <span className="ability-name">{ability.name}</span>
                  <span className="ability-level-text">{getLevelLabel(ability.level)}</span>
                </div>
                <div className="ability-bar">
                  <div 
                    className="ability-fill" 
                    style={{ 
                      width: `${ability.score}%`,
                      backgroundColor: getLevelColor(ability.level)
                    }}
                  ></div>
                </div>
                <div className="ability-score-text">{ability.score}分</div>
              </div>
            ))}
          </div>
        </div>

        {/* 学习趋势 */}
        <div className="trend-analysis">
          <h3>学习趋势</h3>
          <div className="trend-chart">
            {trends.map((trend, index) => (
              <div key={index} className="trend-item">
                <div className="trend-title">{trend.title}</div>
                <div className="trend-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(trend.current / trend.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {trend.current}/{trend.total} {trend.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 学习建议 */}
        <div className="learning-suggestions">
          <h3>💡 学习建议</h3>
          <div className="suggestion-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <div className="suggestion-icon">{suggestion.icon}</div>
                <div className="suggestion-content">
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-desc">{suggestion.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 获得成就 */}
      <div className="achievements-section">
        <h3>🏆 获得成就</h3>
        <div className="achievement-grid">
          <div className="achievement-badge earned">🏆 学习达人</div>
          <div className="achievement-badge earned">📚 阅读小能手</div>
          <div className="achievement-badge earned">✍️ 作文高手</div>
          <div className="achievement-badge earned">🔥 连续学习7天</div>
          <div className="achievement-badge locked">🎯 完美准确率</div>
          <div className="achievement-badge locked">⭐ 超级学霸</div>
        </div>
      </div>
    </div>
  );
};

export default UserProgress;
