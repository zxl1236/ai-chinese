import React, { useState, useRef, useEffect } from 'react';
import './SimpleAnnotationTool.css';

const SimpleAnnotationTool = ({ 
  article, 
  questions = [], 
  onAnnotationChange, 
  mode = 'reading'
}) => {
  const [isActive, setIsActive] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [selectedTool, setSelectedTool] = useState('highlight');
  const [showToolbar, setShowToolbar] = useState(false);
  
  const contentRef = useRef(null);

  // 标记工具配置 - 简化版本
  const tools = {
    highlight: { name: '高亮标记', icon: '✏️', cursor: 'text', desc: '标记重点内容' },
    circle: { name: '圈词', icon: '⭕', cursor: 'crosshair', desc: '圈出重点词语' }
  };

  // 激活圈点模式
  const toggleAnnotationMode = () => {
    setIsActive(!isActive);
    setShowToolbar(!isActive);
    if (!isActive) {
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
    
    // 根据选择的工具执行相应操作
    switch (selectedTool) {
      case 'highlight':
        createAnnotation(range, selectedText);
        break;
      case 'circle':
        createCircleAnnotation(range, selectedText);
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
      text: text,
      timestamp: new Date(),
      range: {
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        startContainer: range.startContainer,
        endContainer: range.endContainer
      }
    };

    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);
    
    // 应用样式
    applyAnnotationStyle(range, annotation);
    
    // 清除选择
    window.getSelection().removeAllRanges();
    
    // 通知父组件
    if (onAnnotationChange) {
      onAnnotationChange(newAnnotations);
    }
  };

  // 创建圈词标记
  const createCircleAnnotation = (range, text) => {
    const annotation = {
      id: Date.now(),
      type: 'circle',
      text: text,
      timestamp: new Date(),
      range: {
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        startContainer: range.startContainer,
        endContainer: range.endContainer
      }
    };

    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);
    
    // 应用圈词样式
    applyCircleStyle(range, annotation);
    
    window.getSelection().removeAllRanges();
    
    if (onAnnotationChange) {
      onAnnotationChange(newAnnotations);
    }
  };

  // 应用标记样式
  const applyAnnotationStyle = (range, annotation) => {
    const span = document.createElement('span');
    span.className = `annotation-${annotation.type}`;
    span.setAttribute('data-annotation-id', annotation.id);
    
    try {
      range.surroundContents(span);
    } catch (e) {
      // 如果无法直接包围，使用insertNode
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
  };

  // 应用圈词样式
  const applyCircleStyle = (range, annotation) => {
    const span = document.createElement('span');
    span.className = 'annotation-circle';
    span.setAttribute('data-annotation-id', annotation.id);
    
    try {
      range.surroundContents(span);
    } catch (e) {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
  };





  // 清除所有标记
  const clearAllAnnotations = () => {
    if (contentRef.current) {
      // 移除所有标记元素
      const annotationElements = contentRef.current.querySelectorAll(
        '.annotation-highlight, .annotation-underline, .annotation-circle, .annotation-note'
      );
      
      annotationElements.forEach(element => {
        const parent = element.parentNode;
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      });
      
      // 合并相邻的文本节点
      contentRef.current.normalize();
    }
    
    setAnnotations([]);
    
    if (onAnnotationChange) {
      onAnnotationChange([]);
    }
  };

  // 导出标记数据
  const exportAnnotations = () => {
    const data = {
      annotations: annotations,
      timestamp: new Date(),
      article: article?.title || '未命名文章'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 监听文本选择
  useEffect(() => {
    const handleSelection = () => {
      if (isActive) {
        setTimeout(handleTextSelection, 10);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, [isActive, selectedTool]);



  return (
    <div className="simple-annotation-tool">
      {/* 控制按钮 */}
      <div className="annotation-controls">
        <button 
          className={`annotation-toggle ${isActive ? 'active' : ''}`}
          onClick={toggleAnnotationMode}
        >
          📝 {isActive ? '退出圈点' : '圈点读题'}
        </button>
        
        {isActive && (
          <div className="annotation-actions">
            <button onClick={clearAllAnnotations} className="clear-btn">
              🧹 清除标记
            </button>
            <button onClick={exportAnnotations} className="export-btn">
              💾 导出标记
            </button>
          </div>
        )}
      </div>

      {/* 简化工具栏 */}
      {showToolbar && (
        <div className="annotation-toolbar compact">
          <div className="tool-buttons-compact">
            {Object.entries(tools).map(([key, tool]) => (
              <button
                key={key}
                className={`tool-btn-compact ${selectedTool === key ? 'active' : ''}`}
                onClick={() => setSelectedTool(key)}
                title={tool.desc}
              >
                {tool.icon} {tool.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 文章内容 */}
      <div 
        ref={contentRef}
        className={`article-content ${isActive ? 'annotation-mode' : ''}`}
        style={{ cursor: isActive ? tools[selectedTool]?.cursor : 'default' }}
      >
        {article?.content ? (
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          <div className="placeholder">
            请选择文章开始圈点读题
          </div>
        )}
      </div>

      {/* 统计信息 */}
      {isActive && annotations.length > 0 && (
        <div className="annotation-stats">
          <span>📊 标记统计：{annotations.length} 个标记</span>
        </div>
      )}
    </div>
  );
};

export default SimpleAnnotationTool;
