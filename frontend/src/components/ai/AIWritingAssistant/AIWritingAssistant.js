import React, { useState } from 'react';
import './AIWritingAssistant.css';

/**
 * AI写作助手组件
 * 集成到现有的写作界面中，提供AI辅助写作功能
 */
function AIWritingAssistant({ essay, title, onInsertText, onReplaceText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inspiration');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [selectedModel, setSelectedModel] = useState('online'); // 默认选择在线模型

  // AI功能配置
  const aiConfig = {
    baseUrl: 'http://localhost:5000/api',
    modelOptions: [
      { id: 'online', name: '在线模型', description: '快速响应，质量优秀', model: 'qwen-turbo', provider: 'qwen' },
      { id: 'local', name: '本地模型', description: '离线可用，隐私保护', model: 'qwen2.5:0.5b', provider: 'ollama' }
    ]
  };

  // 调用AI API的通用函数
  const callAI = async (endpoint, requestData) => {
    setIsLoading(true);
    setAiResponse(''); // 清空之前的响应
    try {
      const currentModel = aiConfig.modelOptions.find(m => m.id === selectedModel);
      console.log(`调用AI接口: ${endpoint}`, requestData);
      
      const response = await fetch(`${aiConfig.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestData,
          model: currentModel?.model || 'qwen-turbo',
          provider: currentModel?.provider || 'qwen'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}:`, errorText);
        throw new Error(`服务器错误 (${response.status}): 请检查网络连接`);
      }

      const data = await response.json();
      console.log('AI响应:', data);
      
      if (data.success) {
        setAiResponse(data.response);
        return data.response;
      } else {
        throw new Error(data.error || 'AI服务返回错误');
      }
    } catch (error) {
      console.error('AI调用失败:', error);
      const errorMessage = error.message || 'AI助手暂时不可用，请稍后重试。';
      setAiResponse(`❌ ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 获取写作灵感
  const getInspiration = async () => {
    const currentTopic = title?.trim() || '我的理想';
    console.log('获取写作灵感，题目:', currentTopic);
    await callAI('get-inspiration', {
      topic: currentTopic
    });
  };

  // 分析题目
  const analyzeTitle = async () => {
    const currentTopic = title?.trim() || '我的理想';
    console.log('分析题目，题目:', currentTopic);
    await callAI('analyze-topic', {
      topic: currentTopic
    });
  };

  // 优化建议
  const getOptimization = async () => {
    if (!essay.trim()) {
      setAiResponse('请先写一些内容，然后AI助手可以为您提供优化建议。');
      return;
    }

    const currentTitle = title?.trim() || '无标题';
    console.log('优化建议，标题:', currentTitle, '内容长度:', essay.length);
    await callAI('improve-writing', {
      content: essay,
      title: currentTitle
    });
  };

  // 续写建议
  const getContinuation = async () => {
    if (!essay.trim()) {
      setAiResponse('请先写一些内容，然后AI助手可以为您提供续写建议。');
      return;
    }

    console.log('续写建议，内容长度:', essay.length);
    await callAI('continue-writing', {
      content: essay
    });
  };

  // 功能标签页
  const tabs = [
    {
      id: 'inspiration',
      name: '💡 写作灵感',
      action: getInspiration,
      description: '获取写作思路和角度'
    },
    {
      id: 'analysis',
      name: '🔍 题目分析',
      action: analyzeTitle,
      description: '深入分析写作要求'
    },
    {
      id: 'optimization',
      name: '✨ 优化建议',
      action: getOptimization,
      description: '改进文章质量'
    },
    {
      id: 'continuation',
      name: '➡️ 续写建议',
      action: getContinuation,
      description: '获取续写思路'
    }
  ];

  if (!isOpen) {
    return (
      <button 
        className="ai-assistant-trigger"
        onClick={() => setIsOpen(true)}
        title="AI写作助手"
      >
        🤖 AI助手
      </button>
    );
  }

  return (
    <div className="ai-assistant-panel">
      <div className="ai-assistant-header">
        <h3>🤖 AI写作助手</h3>
        <button 
          className="close-btn"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      </div>

      <div className="ai-assistant-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.description}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="ai-assistant-content">
        <div className="ai-actions">
          <button 
            className="ai-action-btn"
            onClick={tabs.find(tab => tab.id === activeTab)?.action}
            disabled={isLoading}
          >
            {isLoading ? '🔄 思考中...' : `获取${tabs.find(tab => tab.id === activeTab)?.name}`}
          </button>
        </div>

        <div className="ai-response">
          {isLoading ? (
            <div className="loading-animation">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>AI助手正在思考...</p>
            </div>
          ) : aiResponse ? (
            <div className="response-content">
              <pre>{aiResponse}</pre>
              <div className="response-actions">
                <button 
                  className="action-btn"
                  onClick={() => onInsertText(aiResponse)}
                  title="插入到文章末尾"
                >
                  📝 插入文章
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigator.clipboard.writeText(aiResponse)}
                  title="复制到剪贴板"
                >
                  📋 复制
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-response">
              <p>选择一个功能，AI助手将为您提供帮助</p>
            </div>
          )}
        </div>
      </div>

      <div className="ai-assistant-footer">
        <div className="model-selector">
          <label htmlFor="model-select">AI模型选择：</label>
          <select 
            id="model-select"
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
          >
            {aiConfig.modelOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name} - {option.description}
              </option>
            ))}
          </select>
        </div>
        <div className="ai-status">
          <span className="status-dot"></span>
          <span className="status-text">AI助手已就绪</span>
        </div>
        <div className="ai-tips">
          <small>💡 提示：AI建议仅供参考，请结合自己的思考</small>
        </div>
      </div>
    </div>
  );
}

export default AIWritingAssistant;

