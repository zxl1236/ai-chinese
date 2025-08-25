import React from 'react';
import './ModuleList.css';

const ModuleList = ({ title, modules, user, onStartWriting }) => {
  const isWritingSection = title.includes('写作');
  
  const startFreeWriting = () => {
    onStartWriting({
      id: 'free-writing',
      title: '记叙文·初中',
      category: 'writing',
      requirements: [
        '写作要求：',
        '写一篇关于自己理想的记叙文',
        '内容真实，情感真挚',
        '结构完整，语言流畅',
        '不少于600字'
      ],
      timeLimit: '建议用时：45分钟'
    });
  };

  return (
    <div className="module-list">
      <div className="section-header">
        <h2>{title}</h2>
        <p>选择一个模块开始学习</p>
        {isWritingSection && (
          <button 
            className="quick-write-btn"
            onClick={startFreeWriting}
          >
            ✍️ 开始自由写作
          </button>
        )}
      </div>
      
      {modules.length > 0 ? (
        <div className="module-grid">
          {modules.map(module => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              user={user} 
              onStartWriting={onStartWriting} 
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>暂无可用模块</h3>
          <p>请联系老师为您分配学习内容</p>
        </div>
      )}
    </div>
  );
};

const ModuleCard = ({ module, user, onStartWriting }) => {
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

export default ModuleList;
