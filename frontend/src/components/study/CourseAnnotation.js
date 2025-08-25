import React, { useState, useEffect, useRef } from 'react';
import './CourseAnnotation.css';

const CourseAnnotation = ({ courseId, userId, userType = 'teacher' }) => {
  const [annotations, setAnnotations] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationType, setAnnotationType] = useState('highlight');
  const [annotationContent, setAnnotationContent] = useState('');
  const [annotationColor, setAnnotationColor] = useState('#FFD700');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const annotationFormRef = useRef(null);
  const textSelectionRef = useRef(null);

  useEffect(() => {
    fetchAnnotations();
    setupTextSelection();
  }, [courseId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (annotationFormRef.current && !annotationFormRef.current.contains(event.target)) {
        setShowAnnotationForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const setupTextSelection = () => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      setSelectedText(selectedText);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      if (rect.width > 0 && rect.height > 0) {
        setShowAnnotationForm(true);
        // 定位标注表单
        if (annotationFormRef.current) {
          annotationFormRef.current.style.top = `${rect.bottom + window.scrollY + 10}px`;
          annotationFormRef.current.style.left = `${rect.left + window.scrollX}px`;
        }
      }
    }
  };

  const fetchAnnotations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/online-courses/${courseId}/annotations`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnnotations(data.annotations);
        }
      }
    } catch (error) {
      console.error('获取标注失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAnnotation = async () => {
    if (!annotationContent.trim()) {
      alert('请输入标注内容');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/online-courses/${courseId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          type: annotationType,
          content: annotationContent,
          position: selectedText,
          color: annotationColor,
          is_public: isPublic
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 重新获取标注列表
          await fetchAnnotations();
          
          // 重置表单
          setAnnotationContent('');
          setSelectedText('');
          setShowAnnotationForm(false);
          
          // 清除文本选择
          window.getSelection().removeAllRanges();
        }
      }
    } catch (error) {
      console.error('创建标注失败:', error);
    }
  };

  const getAnnotationIcon = (type) => {
    switch (type) {
      case 'highlight': return '🟡';
      case 'note': return '📝';
      case 'comment': return '💬';
      case 'question': return '❓';
      default: return '📌';
    }
  };

  const getAnnotationTypeText = (type) => {
    switch (type) {
      case 'highlight': return '高亮';
      case 'note': return '笔记';
      case 'comment': return '评论';
      case 'question': return '问题';
      default: return '标注';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAnnotationFormSubmit = (e) => {
    e.preventDefault();
    createAnnotation();
  };

  if (loading) {
    return (
      <div className="annotation-loading">
        <div className="loading-spinner"></div>
        <p>加载标注中...</p>
      </div>
    );
  }

  return (
    <div className="course-annotation">
      <div className="annotation-header">
        <h3>课程标注与批注</h3>
        <div className="annotation-stats">
          <span className="stat-item">
            <span className="stat-icon">📝</span>
            <span className="stat-text">{annotations.length} 条标注</span>
          </span>
        </div>
      </div>

      {/* 标注表单 */}
      {showAnnotationForm && (
        <div 
          ref={annotationFormRef}
          className="annotation-form-overlay"
        >
          <form onSubmit={handleAnnotationFormSubmit} className="annotation-form">
            <div className="form-header">
              <h4>添加标注</h4>
              <button 
                type="button"
                className="close-form-btn"
                onClick={() => setShowAnnotationForm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="form-body">
              <div className="form-group">
                <label>标注类型:</label>
                <select 
                  value={annotationType} 
                  onChange={(e) => setAnnotationType(e.target.value)}
                  className="annotation-type-select"
                >
                  <option value="highlight">高亮</option>
                  <option value="note">笔记</option>
                  <option value="comment">评论</option>
                  <option value="question">问题</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>标注内容:</label>
                <textarea
                  value={annotationContent}
                  onChange={(e) => setAnnotationContent(e.target.value)}
                  placeholder="请输入标注内容..."
                  className="annotation-content-input"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>标注颜色:</label>
                <div className="color-picker">
                  {['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'].map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${annotationColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setAnnotationColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span>对课程参与者可见</span>
                </label>
              </div>
            </div>
            
            <div className="form-footer">
              <button type="button" className="cancel-btn" onClick={() => setShowAnnotationForm(false)}>
                取消
              </button>
              <button type="submit" className="submit-btn">
                添加标注
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 标注列表 */}
      <div className="annotations-list">
        {annotations.length === 0 ? (
          <div className="no-annotations">
            <div className="no-annotations-icon">📝</div>
            <p>暂无标注</p>
            <p className="annotation-tip">选择文本内容即可添加标注</p>
          </div>
        ) : (
          annotations.map(annotation => (
            <div key={annotation.id} className="annotation-item">
              <div className="annotation-header-row">
                <div className="annotation-type">
                  <span className="type-icon">{getAnnotationIcon(annotation.type)}</span>
                  <span className="type-text">{getAnnotationTypeText(annotation.type)}</span>
                </div>
                <div className="annotation-meta">
                  <span className="annotation-user">{annotation.user_name}</span>
                  <span className="annotation-time">{formatTimestamp(annotation.timestamp)}</span>
                </div>
              </div>
              
              <div className="annotation-content">
                <div className="selected-text">
                  <span className="text-label">选中文本:</span>
                  <span className="text-content">"{annotation.position}"</span>
                </div>
                <div className="annotation-text">
                  <span className="text-label">标注内容:</span>
                  <span className="text-content">{annotation.content}</span>
                </div>
              </div>
              
              <div className="annotation-footer">
                <div className="annotation-visibility">
                  {annotation.is_public ? (
                    <span className="visibility-badge public">公开</span>
                  ) : (
                    <span className="visibility-badge private">私有</span>
                  )}
                </div>
                <div className="annotation-color-indicator" style={{ backgroundColor: annotation.color }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 使用说明 */}
      <div className="annotation-instructions">
        <h4>使用说明</h4>
        <div className="instruction-steps">
          <div className="instruction-step">
            <span className="step-number">1</span>
            <span className="step-text">选择要标注的文本内容</span>
          </div>
          <div className="instruction-step">
            <span className="step-number">2</span>
            <span className="step-text">选择标注类型（高亮、笔记、评论、问题）</span>
          </div>
          <div className="instruction-step">
            <span className="step-number">3</span>
            <span className="step-text">输入标注内容并选择颜色</span>
          </div>
          <div className="instruction-step">
            <span className="step-number">4</span>
            <span className="step-text">设置是否对课程参与者可见</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAnnotation;
