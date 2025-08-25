import React, { useState, useEffect, useCallback } from 'react';
import './StudyPage.css';
import OllamaChatDialog from '../../ai/OllamaChatDialog';

function StudyPage({ user, onModuleSelect, onBack }) {
  const [studyContent, setStudyContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChatDialog, setShowChatDialog] = useState(false);

  const loadStudyContent = useCallback(async () => {
    try {
      // 尝试从API获取学习内容
      const response = await fetch('http://localhost:5000/api/study-modules');
      if (response.ok) {
        const data = await response.json();
        if (data.modules && data.modules.length > 0) {
          // 将API返回的模块按分类组织
          const organizedContent = organizeModules(data.modules);
          setStudyContent(organizedContent);
        } else {
          setStudyContent(getDefaultContent());
        }
      } else {
        setStudyContent(getDefaultContent());
      }
    } catch (error) {
      console.info('API服务未启动，使用默认内容');
      const defaultContent = getDefaultContent();
      console.log('默认内容:', defaultContent);
      setStudyContent(defaultContent);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStudyContent();
  }, [loadStudyContent]);

  // 将API返回的模块按分类组织
  const organizeModules = (modules) => {
    const moduleMap = {
      // 基础能力训练
      'word-foundation': { category: 'basic', icon: '📝', description: '巩固汉字词汇基础知识' },
      'grammar-rules': { category: 'basic', icon: '🎵', description: '标准普通话语音训练' },
      'grammar-foundation': { category: 'basic', icon: '🎨', description: '学习基本修辞方法' },
      'classical-foundation': { category: 'basic', icon: '🏛️', description: '文言文基础知识学习' },
      
      // 阅读理解训练
      'modern-text': { category: 'reading', icon: '📄', description: '现代文阅读理解训练' },
      'narrative-text': { category: 'reading', icon: '📖', description: '记叙文阅读与分析' },
      'novel': { category: 'reading', icon: '📚', description: '小说作品阅读鉴赏' },
      'argumentative': { category: 'reading', icon: '💭', description: '议论文阅读理解' },
      'expository': { category: 'reading', icon: '📊', description: '说明文阅读训练' },
      'poetry': { category: 'reading', icon: '✒️', description: '诗歌鉴赏与理解' },
      'prose': { category: 'reading', icon: '📜', description: '词作欣赏与分析' },
      'classical-prose': { category: 'reading', icon: '🏮', description: '文言文阅读训练' },
      'non-continuous': { category: 'reading', icon: '📊', description: '图表数据文本理解' },
      
      // 写作表达训练
      'proposition-writing': { category: 'writing', icon: '📝', description: '全命题作文写作训练' },
      'semi-proposition': { category: 'writing', icon: '✏️', description: '半命题作文写作指导' },
      'ai-writing-assistant': { category: 'writing', icon: '🤖', description: '智能写作辅导与建议' }
    };

    const organized = {
      basicTraining: [],
      readingTraining: [],
      writingTraining: []
    };

    modules.forEach(module => {
      const moduleInfo = moduleMap[module.id];
      if (moduleInfo) {
        const moduleData = {
          id: module.id,
          title: module.title,
          icon: moduleInfo.icon,
          description: moduleInfo.description
        };

        switch (moduleInfo.category) {
          case 'basic':
            organized.basicTraining.push(moduleData);
            break;
          case 'reading':
            organized.readingTraining.push(moduleData);
            break;
          case 'writing':
            organized.writingTraining.push(moduleData);
            break;
        }
      }
    });

    return organized;
  };

  const getDefaultContent = () => {
    return {
      basicTraining: [
        { id: 'word-foundation', title: '字词基础', icon: '📝', description: '巩固汉字词汇基础知识' },
        { id: 'grammar-rules', title: '语音规范', icon: '🎵', description: '标准普通话语音训练' },
        { id: 'grammar-foundation', title: '修辞基础', icon: '🎨', description: '学习基本修辞方法' },
        { id: 'classical-foundation', title: '古文基础', icon: '🏛️', description: '文言文基础知识学习' }
      ],
      readingTraining: [
        { id: 'modern-text', title: '现代文', icon: '📄', description: '现代文阅读理解训练' },
        { id: 'narrative-text', title: '记叙文', icon: '📖', description: '记叙文阅读与分析' },
        { id: 'novel', title: '小说', icon: '📚', description: '小说作品阅读鉴赏' },
        { id: 'argumentative', title: '议论文', icon: '💭', description: '议论文阅读理解' },
        { id: 'expository', title: '说明文', icon: '📊', description: '说明文阅读训练' },
        { id: 'poetry', title: '诗', icon: '✒️', description: '诗歌鉴赏与理解' },
        { id: 'prose', title: '词', icon: '📜', description: '词作欣赏与分析' },
        { id: 'classical-prose', title: '文言文', icon: '🏮', description: '文言文阅读训练' },
        { id: 'non-continuous', title: '非连续性文本阅读', icon: '📊', description: '图表数据文本理解' }
      ],
      writingTraining: [
        { id: 'proposition-writing', title: '全命题作文', icon: '📝', description: '全命题作文写作训练' },
        { id: 'semi-proposition', title: '半命题作文', icon: '✏️', description: '半命题作文写作指导' },
        { id: 'ai-writing-assistant', title: 'AI写作助手', icon: '🤖', description: '智能写作辅导与建议' }
      ]
    };
  };

  const handleModuleClick = (moduleId) => {
    if (onModuleSelect) {
      onModuleSelect(moduleId);
    }
  };

  const renderModuleCard = (module) => {
    console.log('渲染模块卡片:', module);
    return (
      <div 
        key={module.id}
        className="study-module-card"
        onClick={() => handleModuleClick(module.id)}
      >
        <div className="module-icon">{module.icon}</div>
        <div className="module-content">
          <h4 className="module-title">{module.title}</h4>
          <p className="module-description">{module.description}</p>
        </div>
        <div className="module-arrow">→</div>
      </div>
    );
  };

  const renderTrainingSection = (title, description, modules, sectionClass) => {
    console.log(`渲染${title}部分:`, modules);
    
    if (!modules || modules.length === 0) {
      return (
        <div className={`training-section ${sectionClass}`}>
          <div className="section-header">
            <h3>{title}</h3>
            <p>{description}</p>

          </div>
          <div className="modules-grid">
            <div className="no-modules">暂无内容</div>
          </div>
        </div>
      );
    }

    return (
      <div className={`training-section ${sectionClass}`}>
        <div className="section-header">
          <h3>{title}</h3>
          <p>{description}</p>

        </div>
        <div className="modules-grid">
          {modules.map(module => renderModuleCard(module))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="study-page-loading">
        <div className="loading-spinner"></div>
        <p>正在加载学习内容...</p>
      </div>
    );
  }

  console.log('当前studyContent:', studyContent);
  console.log('是否有mainModules:', studyContent?.mainModules);

  return (
    <div className="study-page">
      <div className="study-welcome">
        <div className="welcome-header">
          <div className="welcome-text">
            <h2>📚 学习中心</h2>
            <p>选择你想要学习的模块，开始你的学习之旅</p>
          </div>
          <button 
            className="ai-chat-trigger"
            onClick={() => setShowChatDialog(true)}
            title="打开AI对话助手"
          >
            🤖 AI助手
          </button>
        </div>
      </div>

      <div className="study-content">
        {/* 使用分类模块布局显示16个细分模块 */}
        <div className="study-sections">
          {renderTrainingSection(
            '🎯 基础能力训练', 
            '打好语文基础，提升核心能力', 
            studyContent?.basicTraining,
            'basic-training'
          )}
          
          {renderTrainingSection(
            '📚 阅读理解训练', 
            '提升阅读理解能力，掌握各类文体', 
            studyContent?.readingTraining,
            'reading-training'
          )}
          
          {renderTrainingSection(
            '✍️ 写作表达训练', 
            '提高写作水平，表达思想情感', 
            studyContent?.writingTraining,
            'writing-training'
          )}
        </div>
      </div>

      {/* AI对话框 */}
      <OllamaChatDialog 
        isOpen={showChatDialog}
        onClose={() => setShowChatDialog(false)}
      />
    </div>
  );
}

export default StudyPage;
