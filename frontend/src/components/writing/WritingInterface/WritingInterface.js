import React, { useState, useEffect, useCallback } from 'react';
import './WritingInterface.css';
import AIWritingAssistant from '../../ai/AIWritingAssistant';

function WritingInterface({ module, user, onBack }) {
  const [essay, setEssay] = useState('');
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaved, setIsSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [showTopicList, setShowTopicList] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // 计算字数
  useEffect(() => {
    const count = essay.replace(/\s/g, '').length;
    setWordCount(count);
    setIsSaved(false);
  }, [essay]);

  const handleSave = useCallback(async () => {
    try {
      const saveData = {
        userId: user?.id || 1,
        moduleId: module?.id || 'free-writing',
        title: title?.trim() || '无标题',
        content: essay?.trim() || '',
        wordCount: wordCount
      };
      
      console.log('保存文章数据:', saveData);
      
      const response = await fetch('http://localhost:5000/api/save-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('保存成功:', result);
        setIsSaved(true);
        setLastSaved(new Date().toLocaleTimeString());
      } else {
        const errorData = await response.json();
        console.error('保存失败:', errorData);
      }
    } catch (error) {
      console.error('保存错误:', error);
    }
  }, [user?.id, module?.id, title, essay, wordCount]);

  // 自动保存功能
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (!isSaved && (essay.trim() || title.trim())) {
        handleSave();
      }
    }, 5000); // 5秒后自动保存

    return () => clearTimeout(autoSave);
  }, [essay, title, isSaved, handleSave]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  const handleEssayChange = (e) => {
    setEssay(e.target.value);
  };

  const formatText = (type) => {
    const textarea = document.querySelector('.writing-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = essay.substring(start, end);
    
    if (!selectedText) return;

    let formattedText = '';
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      default:
        return;
    }

    const newText = essay.substring(0, start) + formattedText + essay.substring(end);
    setEssay(newText);
  };

  const insertTemplate = () => {
    const template = `    每个人都有自己的理想，我的理想是...

    首先，我选择这个理想的原因是...

    其次，为了实现这个理想，我需要...

    最后，我相信通过努力，我一定能够...

    总之，理想是人生的指路明灯，我会朝着自己的理想不断前进。`;
    
    setEssay(template);
  };

  // AI助手回调函数
  const handleInsertText = (text) => {
    setEssay(prev => prev + '\n\n' + text);
  };

  const handleReplaceText = (text) => {
    setEssay(text);
  };

  // 写作题目列表
  const writingTopics = [
    {
      id: 1,
      title: "我的理想",
      category: "记叙文",
      grade: "初中",
      requirements: [
        "写作要求：",
        "写一篇关于自己理想的记叙文",
        "内容真实，情感真挚",
        "结构完整，语言流畅",
        "不少于600字"
      ],
      timeLimit: "建议用时：45分钟"
    },
    {
      id: 2,
      title: "难忘的一天",
      category: "记叙文",
      grade: "初中",
      requirements: [
        "写作要求：",
        "记叙一天中最难忘的经历",
        "详细描述事件经过",
        "表达真实感受",
        "不少于500字"
      ],
      timeLimit: "建议用时：40分钟"
    },
    {
      id: 3,
      title: "春天的故事",
      category: "写景作文",
      grade: "初中",
      requirements: [
        "写作要求：",
        "描写春天的景色或发生在春天的故事",
        "运用修辞手法",
        "情景交融",
        "不少于600字"
      ],
      timeLimit: "建议用时：45分钟"
    },
    {
      id: 4,
      title: "我的家乡",
      category: "写景作文",
      grade: "初中",
      requirements: [
        "写作要求：",
        "介绍家乡的特色和变化",
        "表达对家乡的情感",
        "条理清晰，语言优美",
        "不少于600字"
      ],
      timeLimit: "建议用时：45分钟"
    },
    {
      id: 5,
      title: "成长的烦恼",
      category: "议论文",
      grade: "初中",
      requirements: [
        "写作要求：",
        "阐述成长过程中遇到的困惑",
        "分析原因，提出解决方案",
        "观点明确，论证有力",
        "不少于700字"
      ],
      timeLimit: "建议用时：50分钟"
    },
    {
      id: 6,
      title: "我最敬佩的人",
      category: "写人作文",
      grade: "初中",
      requirements: [
        "写作要求：",
        "选择一个敬佩的人物进行描写",
        "通过具体事例表现人物品质",
        "语言生动，情感真挚",
        "不少于600字"
      ],
      timeLimit: "建议用时：45分钟"
    }
  ];

  // 处理题目选择
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setShowTopicList(false);
    setTitle(''); // 清空标题让用户重新输入
    setEssay(''); // 清空内容
  };

  const currentPrompt = selectedTopic || module || writingTopics[0];

  return (
    <div className="writing-interface">
      <div className="writing-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← 返回
          </button>
          <div className="prompt-info">
            <h2>{currentPrompt.title}</h2>
            <span className="time-limit">{currentPrompt.timeLimit}</span>
          </div>
        </div>
        <div className="header-right">
          <div className="word-counter">
            字数: {wordCount}
            {!isSaved && <span className="unsaved-indicator">未保存</span>}
            {lastSaved && <span className="save-time">上次保存: {lastSaved}</span>}
          </div>
          <button className="save-btn" onClick={handleSave} disabled={isSaved}>
            💾 保存
          </button>
        </div>
      </div>

      <div className="writing-content">
        {showTopicList && (
          <div className="writing-sidebar">
            <div className="topic-panel">
              <div className="panel-header">
                <h3>📝 选择写作题目</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowTopicList(false)}
                >
                  ×
                </button>
              </div>
              <div className="topic-list">
                {writingTopics.map(topic => (
                  <div 
                    key={topic.id} 
                    className={`topic-item ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
                    onClick={() => handleTopicSelect(topic)}
                  >
                    <div className="topic-title">{topic.title}</div>
                    <div className="topic-meta">
                      <span className="topic-category">{topic.category}</span>
                      <span className="topic-grade">{topic.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="writing-editor">
          {!showTopicList && selectedTopic && (
            <div className="topic-requirements-header">
              <div className="topic-info-compact">
                <h3>{selectedTopic.title}</h3>
                <div className="topic-meta">
                  <span className="topic-category">{selectedTopic.category}</span>
                  <span className="topic-grade">{selectedTopic.grade}</span>
                  <span className="time-limit">{selectedTopic.timeLimit}</span>
                </div>
              </div>
              <div className="requirements-content">
                {selectedTopic.requirements?.map((req, index) => (
                  <p key={index}>{req}</p>
                ))}
              </div>
              <button 
                className="change-topic-btn"
                onClick={() => setShowTopicList(true)}
              >
                📝 更换题目
              </button>
            </div>
          )}
          
          <div className="editor-toolbar">
            <input
              type="text"
              className="title-input"
              placeholder="请输入文章标题..."
              value={title}
              onChange={handleTitleChange}
            />
            <div className="format-buttons">
              <button 
                className="format-btn"
                onClick={() => formatText('bold')}
                title="加粗"
              >
                <strong>B</strong>
              </button>
              <button 
                className="format-btn"
                onClick={() => formatText('italic')}
                title="斜体"
              >
                <em>I</em>
              </button>
              <button 
                className="format-btn"
                onClick={() => formatText('underline')}
                title="下划线"
              >
                <u>U</u>
              </button>
            </div>
          </div>

          <div className="editor-main">
            <textarea
              className="writing-textarea"
              placeholder="开始你的写作..."
              value={essay}
              onChange={handleEssayChange}
            />
          </div>

          <div className="editor-footer">
            <div className="progress-indicator">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${Math.min(wordCount / 600 * 100, 100)}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {wordCount >= 600 ? '✅ 已达到要求字数' : `还需 ${600 - wordCount} 字`}
              </span>
            </div>
            <div className="action-buttons">
              <button className="draft-btn">💾 保存草稿</button>
              <button className="submit-btn" disabled={wordCount < 600}>
                📤 提交作文
              </button>
            </div>
          </div>
        </div>
      </div>

      {!showTopicList && (
        <button 
          className="show-topics-btn"
          onClick={() => setShowTopicList(true)}
        >
          📝 显示题目列表
        </button>
      )}

      {/* AI写作助手 */}
      <AIWritingAssistant
        essay={essay}
        title={title}
        onInsertText={handleInsertText}
        onReplaceText={handleReplaceText}
      />
    </div>
  );
}

export default WritingInterface;
