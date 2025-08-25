import React, { useState, useEffect, useCallback } from 'react';
import './EnhancedWritingInterface.css';

const EnhancedWritingInterface = ({ module, user, onBack }) => {
  const [currentCategory, setCurrentCategory] = useState('全命题作文');
  const [currentSubCategory, setCurrentSubCategory] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [content, setContent] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [aiAssistantVisible, setAiAssistantVisible] = useState(false);

  // 分类配置
  const categoryConfig = {
    '全命题作文': {
      title: '📋 全命题作文训练',
      subcategories: ['成长体验类', '情感感悟类', '生活写实类']
    },
    '半命题作文': {
      title: '📝 半命题作文训练',
      subcategories: ['前置空白类', '后置空白类', '中间空白类']
    },
    '话题作文': {
      title: '💭 话题作文训练',
      subcategories: ['情感话题', '成长话题', '生活话题']
    },
    '材料作文': {
      title: '📄 材料作文训练',
      subcategories: ['寓言故事类', '名言警句类', '时事热点类']
    },
    '应用文': {
      title: '📧 应用文训练',
      subcategories: []
    }
  };

  // 题目数据 (简化版本，实际应用中会从服务器获取)
  const topicsData = {
    '全命题作文': {
      '成长体验类': [
        {
          id: 1,
          title: '那一刻，我长大了',
          requirements: ['写一篇记叙文', '记录自己成长的某个瞬间', '不少于600字'],
          timeLimit: '45分钟'
        },
        {
          id: 2,
          title: '我的青春色彩',
          requirements: ['以"青春"为主题', '可以写记叙文或散文', '不少于600字'],
          timeLimit: '45分钟'
        }
      ],
      '情感感悟类': [
        {
          id: 3,
          title: '感谢有你',
          requirements: ['写一篇记叙文', '表达对某人的感谢之情', '不少于600字'],
          timeLimit: '45分钟'
        }
      ],
      '生活写实类': [
        {
          id: 4,
          title: '平凡中的不平凡',
          requirements: ['记录生活中的小事', '发现平凡中的美好', '不少于600字'],
          timeLimit: '45分钟'
        }
      ]
    },
    '半命题作文': {
      '前置空白类': [
        {
          id: 5,
          title: '_____的滋味',
          requirements: ['补充完整题目', '写一篇记叙文', '不少于600字'],
          timeLimit: '45分钟'
        }
      ],
      '后置空白类': [
        {
          id: 6,
          title: '我眼中的_____',
          requirements: ['补充完整题目', '可以写记叙文或议论文', '不少于600字'],
          timeLimit: '45分钟'
        }
      ]
    }
  };

  // 加载草稿
  useEffect(() => {
    const savedDrafts = localStorage.getItem('writing-drafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (error) {
        console.error('加载草稿失败:', error);
      }
    }
  }, []);

  // 定义保存草稿函数
  const saveDraft = useCallback(() => {
    if (!currentTopic || !content.trim()) return;

    const draft = {
      id: `${currentTopic.id}-${Date.now()}`,
      topicId: currentTopic.id,
      topicTitle: currentTopic.title,
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: currentCategory,
      subCategory: currentSubCategory
    };

    const newDrafts = [...drafts.filter(d => d.topicId !== currentTopic.id), draft];
    setDrafts(newDrafts);
    localStorage.setItem('writing-drafts', JSON.stringify(newDrafts));
  }, [content, currentTopic, currentCategory, currentSubCategory, drafts]);

  // 自动保存
  useEffect(() => {
    if (content.trim() && currentTopic) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, currentTopic, saveDraft]);

  // 统计字数
  useEffect(() => {
    setWordCount(content.replace(/\s/g, '').length);
  }, [content]);

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    setCurrentSubCategory(null);
    setCurrentTopic(null);
    setContent('');
  };

  const handleSubCategoryClick = (subCategory) => {
    setCurrentSubCategory(subCategory);
    setCurrentTopic(null);
    setContent('');
  };

  const handleTopicSelect = (topic) => {
    setCurrentTopic(topic);
    // 检查是否有该题目的草稿
    const existingDraft = drafts.find(d => d.topicId === topic.id);
    if (existingDraft) {
      setContent(existingDraft.content);
    } else {
      setContent('');
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('请先输入作文内容');
      return;
    }

    if (wordCount < 200) {
      alert('作文内容太短，请继续完善');
      return;
    }

    // 这里可以添加提交逻辑
    alert(`作文《${currentTopic.title}》已提交！\n字数：${wordCount}字`);
  };

  const clearDrafts = () => {
    if (window.confirm('确定要清除所有草稿吗？此操作不可恢复。')) {
      setDrafts([]);
      localStorage.removeItem('writing-drafts');
    }
  };

  const loadDraft = (draft) => {
    const topic = Object.values(topicsData)
      .flatMap(category => Object.values(category))
      .flatMap(subcategory => subcategory)
      .find(t => t.id === draft.topicId);
    
    if (topic) {
      setCurrentCategory(draft.category);
      setCurrentSubCategory(draft.subCategory);
      setCurrentTopic(topic);
      setContent(draft.content);
    }
  };

  const currentTopics = currentSubCategory && topicsData[currentCategory] && topicsData[currentCategory][currentSubCategory] 
    ? topicsData[currentCategory][currentSubCategory] 
    : [];

  return (
    <div className="enhanced-writing-interface">
      {/* 返回按钮 */}
      <button className="back-button" onClick={onBack}>
        ← 返回
      </button>

      <div className="writing-layout">
        {/* 侧边栏切换按钮 */}
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? '☰' : '✕'}
        </button>

        {/* 左侧题目选择区域 */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'active'}`}>
          <div className="sidebar-header">
            <h2>{categoryConfig[currentCategory].title}</h2>
            
            {/* 分类选择器 */}
            <div className="category-selector">
              <select 
                value={currentCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="category-select"
              >
                {Object.keys(categoryConfig).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 子分类标签 */}
            <div className="difficulty-tabs">
              {categoryConfig[currentCategory].subcategories.map(subCategory => (
                <button
                  key={subCategory}
                  className={`tab ${currentSubCategory === subCategory ? 'active' : ''}`}
                  onClick={() => handleSubCategoryClick(subCategory)}
                >
                  {subCategory}
                </button>
              ))}
            </div>
          </div>

          {/* 题目列表 */}
          <div className="topics-list">
            {currentTopics.map(topic => (
              <div
                key={topic.id}
                className={`topic-item ${currentTopic?.id === topic.id ? 'active' : ''}`}
                onClick={() => handleTopicSelect(topic)}
              >
                <div className="topic-title">{topic.title}</div>
                <div className="topic-info">
                  <span className="time-limit">⏱️ {topic.timeLimit}</span>
                  <span className="word-count">📝 {topic.requirements[topic.requirements.length - 1]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 草稿管理 */}
          <div className="drafts-section">
            <div className="drafts-header">
              <h3>📝 我的草稿 ({drafts.length})</h3>
              <div className="drafts-controls">
                <button onClick={clearDrafts} className="clear-drafts">🗑️</button>
              </div>
            </div>
            <div className="drafts-list">
              {drafts.slice(0, 5).map(draft => (
                <div
                  key={draft.id}
                  className="draft-item"
                  onClick={() => loadDraft(draft)}
                >
                  <div className="draft-title">{draft.topicTitle}</div>
                  <div className="draft-info">
                    <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                    <span>{draft.content.replace(/\s/g, '').length}字</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧写作区域 */}
        <div className="writing-area">
          {currentTopic ? (
            <>
              {/* 题目信息 */}
              <div className="topic-header">
                <h1 className="topic-title">{currentTopic.title}</h1>
                <div className="topic-requirements">
                  <h4>写作要求：</h4>
                  <ul>
                    {currentTopic.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                  <div className="time-info">
                    <span>{currentTopic.timeLimit}</span>
                  </div>
                </div>
              </div>

              {/* 写作工具栏 */}
              <div className="writing-toolbar">
                <div className="toolbar-left">
                  <span className="word-counter">字数：{wordCount}</span>
                  <span className="auto-save-indicator">自动保存中...</span>
                </div>
                <div className="toolbar-right">
                  <button 
                    className="ai-assistant-btn"
                    onClick={() => setAiAssistantVisible(!aiAssistantVisible)}
                  >
                    🤖 AI助手
                  </button>
                  <button className="submit-btn" onClick={handleSubmit}>
                    提交作文
                  </button>
                </div>
              </div>

              {/* 写作编辑器 */}
              <div className="editor-container">
                <textarea
                  className="writing-editor"
                  placeholder="在这里开始写作..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="no-topic-selected">
              <div className="no-topic-icon">📝</div>
              <h3>请选择一个作文题目</h3>
              <p>从左侧列表中选择您想要练习的作文题目</p>
            </div>
          )}
        </div>

        {/* AI助手面板 */}
        {aiAssistantVisible && (
          <div className="ai-assistant-panel">
            <div className="ai-header">
              <h3>🤖 AI写作助手</h3>
              <button 
                className="close-ai"
                onClick={() => setAiAssistantVisible(false)}
              >
                ✕
              </button>
            </div>
            <div className="ai-content">
              <div className="ai-suggestions">
                <h4>写作建议：</h4>
                <ul>
                  <li>开头要引人入胜，可以用设问、引用等方式</li>
                  <li>中间部分要层次清晰，每段一个要点</li>
                  <li>结尾要点题升华，呼应开头</li>
                  <li>注意段落之间的过渡和衔接</li>
                </ul>
              </div>
              <div className="ai-chat">
                <div className="chat-messages">
                  <div className="ai-message">
                    有什么写作问题可以问我哦！比如如何开头、如何构思等。
                  </div>
                </div>
                <div className="chat-input">
                  <input 
                    type="text" 
                    placeholder="输入您的问题..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        // 这里可以添加AI对话功能
                        alert('AI对话功能开发中...');
                      }
                    }}
                  />
                  <button>发送</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedWritingInterface;
