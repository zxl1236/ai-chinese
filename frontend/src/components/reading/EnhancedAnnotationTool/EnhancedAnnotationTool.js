import React, { useState, useRef, useEffect } from 'react';
import './EnhancedAnnotationTool.css';

const EnhancedAnnotationTool = ({ 
  article, 
  questions = [], 
  onAnnotationChange, 
  mode = 'reading' // 'reading' | 'answering' | 'reviewing'
}) => {
  const [isActive, setIsActive] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [selectedTool, setSelectedTool] = useState('highlight');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [showToolbar, setShowToolbar] = useState(false);
  const [notes, setNotes] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [notePosition, setNotePosition] = useState({ x: 0, y: 0 });
  const [currentNote, setCurrentNote] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [analysisMode, setAnalysisMode] = useState('structure');
  
  const contentRef = useRef(null);
  const noteModalRef = useRef(null);

  // 标记工具配置
  const tools = {
    highlight: { name: '高亮标记', icon: '🖍️', cursor: 'text' },
    underline: { name: '下划线', icon: '📝', cursor: 'text' },
    bracket: { name: '圈词', icon: '⭕', cursor: 'crosshair' },
    arrow: { name: '箭头指向', icon: '➡️', cursor: 'crosshair' },
    note: { name: '添加笔记', icon: '📝', cursor: 'text' },
    connection: { name: '连线关联', icon: '🔗', cursor: 'crosshair' }
  };

  // 颜色配置
  const colors = {
    yellow: { name: '重点内容', color: '#ffeb3b', bg: 'rgba(255, 235, 59, 0.3)' },
    green: { name: '关键词', color: '#4caf50', bg: 'rgba(76, 175, 80, 0.3)' },
    blue: { name: '结构词', color: '#2196f3', bg: 'rgba(33, 150, 243, 0.3)' },
    red: { name: '问题相关', color: '#f44336', bg: 'rgba(244, 67, 54, 0.3)' },
    purple: { name: '情感表达', color: '#9c27b0', bg: 'rgba(156, 39, 176, 0.3)' },
    orange: { name: '修辞手法', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.3)' }
  };

  // 分析模式配置
  const analysisModes = {
    structure: { name: '结构分析', icon: '🏗️', focus: '段落层次、逻辑关系' },
    theme: { name: '主题分析', icon: '🎯', focus: '中心思想、主要观点' },
    language: { name: '语言分析', icon: '📖', focus: '修辞手法、表达技巧' },
    emotion: { name: '情感分析', icon: '💝', focus: '情感色彩、作者态度' },
    question: { name: '答题定位', icon: '❓', focus: '题目相关内容定位' }
  };

  // 激活圈点模式
  const toggleAnnotationMode = () => {
    setIsActive(!isActive);
    setShowToolbar(!isActive);
    if (!isActive) {
      // 进入标记模式时清除之前的选择
      window.getSelection().removeAllRanges();
    }
  };

  // 处理文本选择
  const handleTextSelection = () => {
    if (!isActive) return;

    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (selectedText.length === 0) return;

    setSelectedText(selectedText);
    
    // 根据选择的工具执行相应操作
    switch (selectedTool) {
      case 'highlight':
      case 'underline':
        createAnnotation(range, selectedText);
        break;
      case 'note':
        showNoteDialog(range, selectedText);
        break;
      case 'bracket':
        createBracketAnnotation(range, selectedText);
        break;
      default:
        createAnnotation(range, selectedText);
    }
  };

  // 创建标记
  const createAnnotation = (range, text) => {
    const annotation = {
      id: Date.now(),
      type: selectedTool,
      color: selectedColor,
      text: text,
      range: {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      },
      timestamp: new Date(),
      analysisMode: analysisMode,
      position: getSelectionPosition(range)
    };

    // 包装选中的文本
    const span = document.createElement('span');
    span.className = `annotation annotation-${selectedTool} annotation-${selectedColor}`;
    span.setAttribute('data-annotation-id', annotation.id);
    span.setAttribute('data-analysis-mode', analysisMode);
    span.setAttribute('title', `${analysisModes[analysisMode].name}: ${text}`);
    
    try {
      range.surroundContents(span);
      setAnnotations(prev => [...prev, annotation]);
      onAnnotationChange && onAnnotationChange([...annotations, annotation]);
    } catch (error) {
      console.warn('无法包装选中内容，可能包含复杂的HTML结构');
    }

    // 清除选择
    window.getSelection().removeAllRanges();
  };

  // 创建圈词标记
  const createBracketAnnotation = (range, text) => {
    const span = document.createElement('span');
    span.className = `annotation annotation-bracket annotation-${selectedColor}`;
    span.setAttribute('data-annotation-id', Date.now());
    span.style.border = `2px solid ${colors[selectedColor].color}`;
    span.style.borderRadius = '4px';
    span.style.padding = '2px';
    
    try {
      range.surroundContents(span);
    } catch (error) {
      console.warn('无法创建圈词标记');
    }

    window.getSelection().removeAllRanges();
  };

  // 显示笔记对话框
  const showNoteDialog = (range, text) => {
    const rect = range.getBoundingClientRect();
    setNotePosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 10
    });
    setSelectedText(text);
    setShowNoteModal(true);
  };

  // 获取选择位置
  const getSelectionPosition = (range) => {
    const rect = range.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    };
  };

  // 保存笔记
  const saveNote = () => {
    if (!currentNote.trim()) return;

    const note = {
      id: Date.now(),
      text: selectedText,
      content: currentNote,
      position: notePosition,
      timestamp: new Date(),
      analysisMode: analysisMode
    };

    setNotes(prev => [...prev, note]);
    setShowNoteModal(false);
    setCurrentNote('');
  };

  // 删除标记
  const removeAnnotation = (annotationId) => {
    const element = document.querySelector(`[data-annotation-id="${annotationId}"]`);
    if (element) {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
    
    setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
  };

  // 清除所有标记
  const clearAllAnnotations = () => {
    const annotatedElements = contentRef.current?.querySelectorAll('.annotation');
    annotatedElements?.forEach(element => {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    });
    
    setAnnotations([]);
    setNotes([]);
    onAnnotationChange && onAnnotationChange([]);
  };

  // 智能标记建议
  const getSmartAnnotationSuggestions = () => {
    if (!article?.content) return [];

    const suggestions = [];
    
    // 根据分析模式提供不同的建议
    switch (analysisMode) {
      case 'structure':
        suggestions.push(
          { text: '首先、其次、最后', type: '结构词', color: 'blue' },
          { text: '总之、因此、所以', type: '总结词', color: 'blue' },
          { text: '但是、然而、不过', type: '转折词', color: 'blue' }
        );
        break;
      case 'theme':
        suggestions.push(
          { text: '中心句、主旨句', type: '主题相关', color: 'yellow' },
          { text: '关键词', type: '核心内容', color: 'green' }
        );
        break;
      case 'language':
        suggestions.push(
          { text: '比喻、拟人、排比', type: '修辞手法', color: 'orange' },
          { text: '描写、叙述、议论', type: '表达方式', color: 'orange' }
        );
        break;
      case 'emotion':
        suggestions.push(
          { text: '喜怒哀乐相关词', type: '情感词', color: 'purple' },
          { text: '语气词、感叹词', type: '情感表达', color: 'purple' }
        );
        break;
      case 'question':
        questions.forEach((q, index) => {
          suggestions.push({
            text: `题目${index + 1}相关内容`,
            type: '答题定位',
            color: 'red'
          });
        });
        break;
    }

    return suggestions;
  };

  // 自动标记功能
  const autoAnnotate = (suggestionType) => {
    if (!contentRef.current) return;

    const content = contentRef.current.textContent;
    let patterns = [];

    switch (suggestionType) {
      case '结构词':
        patterns = ['首先', '其次', '然后', '最后', '总之', '因此', '所以', '但是', '然而', '不过'];
        break;
      case '修辞手法':
        patterns = ['像', '如同', '仿佛', '好似', '比作', '犹如'];
        break;
      case '情感词':
        patterns = ['喜悦', '愤怒', '悲伤', '激动', '感动', '失望', '兴奋', '痛苦'];
        break;
    }

    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      if (matches) {
        // 这里可以添加自动高亮的逻辑
        console.log(`找到${suggestionType}: ${matches.join(', ')}`);
      }
    });
  };

  // 导出标记数据
  const exportAnnotations = () => {
    const exportData = {
      article: article?.title || '未知文章',
      timestamp: new Date().toISOString(),
      annotations: annotations,
      notes: notes,
      analysisMode: analysisMode
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article?.title || 'article'}_annotations.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // 监听鼠标抬起事件
  useEffect(() => {
    const handleMouseUp = () => {
      if (isActive) {
        setTimeout(handleTextSelection, 10);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isActive, selectedTool, selectedColor, analysisMode]);

  return (
    <div className="enhanced-annotation-tool">
      {/* 激活按钮 */}
      <div className="annotation-trigger">
        <button 
          className={`annotation-toggle ${isActive ? 'active' : ''}`}
          onClick={toggleAnnotationMode}
          title={isActive ? '关闭圈点模式' : '开启圈点模式'}
        >
          <span className="toggle-icon">👁️</span>
          <span className="toggle-text">
            {isActive ? '标记模式开启' : '圈点读题'}
          </span>
          <span className="toggle-action">
            {isActive ? '点击关闭' : '点击启动'}
          </span>
        </button>
      </div>

      {/* 工具栏 */}
      {showToolbar && (
        <div className="annotation-toolbar">
          <div className="toolbar-section">
            <h4>📝 标记工具</h4>
            <div className="tool-buttons">
              {Object.entries(tools).map(([key, tool]) => (
                <button
                  key={key}
                  className={`tool-btn ${selectedTool === key ? 'active' : ''}`}
                  onClick={() => setSelectedTool(key)}
                  title={tool.name}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <span className="tool-name">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-section">
            <h4>🎨 标记颜色</h4>
            <div className="color-buttons">
              {Object.entries(colors).map(([key, color]) => (
                <button
                  key={key}
                  className={`color-btn ${selectedColor === key ? 'active' : ''}`}
                  onClick={() => setSelectedColor(key)}
                  style={{ backgroundColor: color.bg, borderColor: color.color }}
                  title={color.name}
                >
                  <span className="color-dot" style={{ backgroundColor: color.color }}></span>
                  <span className="color-name">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-section">
            <h4>🔍 分析模式</h4>
            <div className="analysis-modes">
              {Object.entries(analysisModes).map(([key, mode]) => (
                <button
                  key={key}
                  className={`analysis-btn ${analysisMode === key ? 'active' : ''}`}
                  onClick={() => setAnalysisMode(key)}
                  title={mode.focus}
                >
                  <span className="mode-icon">{mode.icon}</span>
                  <span className="mode-name">{mode.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-section">
            <h4>🤖 智能辅助</h4>
            <div className="smart-tools">
              {getSmartAnnotationSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => autoAnnotate(suggestion.type)}
                  title={`自动标记${suggestion.text}`}
                >
                  标记{suggestion.type}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-section">
            <h4>⚙️ 工具操作</h4>
            <div className="action-buttons">
              <button className="action-btn" onClick={clearAllAnnotations}>
                🗑️ 清除标记
              </button>
              <button className="action-btn" onClick={exportAnnotations}>
                💾 导出标记
              </button>
              <button className="action-btn" onClick={() => setShowToolbar(false)}>
                📁 收起工具栏
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文章内容区域 */}
      <div 
        ref={contentRef}
        className={`article-content ${isActive ? 'annotation-active' : ''}`}
        style={{ cursor: isActive ? tools[selectedTool]?.cursor : 'auto' }}
      >
        {article?.content?.split('\n').map((paragraph, index) => (
          <p key={index} className="paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      {/* 笔记模态框 */}
      {showNoteModal && (
        <div 
          className="note-modal"
          style={{ 
            left: notePosition.x, 
            top: notePosition.y,
            position: 'absolute',
            zIndex: 1000
          }}
          ref={noteModalRef}
        >
          <div className="note-content">
            <div className="note-header">
              <h5>📝 添加笔记</h5>
              <button 
                className="close-btn"
                onClick={() => setShowNoteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="note-body">
              <div className="selected-text">
                选中内容："{selectedText}"
              </div>
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="在此输入你的想法、理解或疑问..."
                rows={4}
                autoFocus
              />
              <div className="note-actions">
                <button className="save-btn" onClick={saveNote}>
                  保存笔记
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowNoteModal(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 笔记列表 */}
      {notes.length > 0 && (
        <div className="notes-sidebar">
          <h4>📚 我的笔记</h4>
          <div className="notes-list">
            {notes.map(note => (
              <div key={note.id} className="note-item">
                <div className="note-text">"{note.text}"</div>
                <div className="note-content">{note.content}</div>
                <div className="note-meta">
                  <span className="note-mode">{analysisModes[note.analysisMode]?.name}</span>
                  <span className="note-time">
                    {note.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 统计面板 */}
      {annotations.length > 0 && (
        <div className="annotation-stats">
          <h4>📊 标记统计</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{annotations.length}</span>
              <span className="stat-label">总标记</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{notes.length}</span>
              <span className="stat-label">笔记数</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {Object.keys(annotations.reduce((acc, ann) => {
                  acc[ann.color] = true;
                  return acc;
                }, {})).length}
              </span>
              <span className="stat-label">颜色类型</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAnnotationTool;
