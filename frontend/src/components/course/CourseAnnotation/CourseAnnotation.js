import React, { useState, useEffect, useRef } from 'react';
import './CourseAnnotation.css';

const CourseAnnotation = ({ courseId, user, onAnnotationChange }) => {
  const [annotations, setAnnotations] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationForm, setAnnotationForm] = useState({
    type: 'highlight',
    text: '',
    color: '#FFD700'
  });
  const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const textRef = useRef(null);
  const annotationPanelRef = useRef(null);

  // 模拟标注数据
  const mockAnnotations = [
    {
      id: 1,
      type: 'highlight',
      text: '阅读理解专项训练',
      annotation: '重点内容，需要学生重点掌握',
      color: '#FFD700',
      user_name: '李老师',
      user_role: 'teacher',
      created_at: '2025-01-20 18:00:00',
      start_position: 15,
      end_position: 25
    },
    {
      id: 2,
      type: 'note',
      text: '提高学生的阅读分析能力',
      annotation: '这是本节课的核心目标，通过多种练习方式实现',
      color: '#87CEEB',
      user_name: '李老师',
      user_role: 'teacher',
      created_at: '2025-01-20 18:05:00',
      start_position: 30,
      end_position: 45
    },
    {
      id: 3,
      type: 'comment',
      text: '段落大意和中心思想',
      annotation: '学生需要学会如何快速抓住文章的主要观点',
      color: '#98FB98',
      user_name: '李老师',
      user_role: 'teacher',
      created_at: '2025-01-20 18:10:00',
      start_position: 60,
      end_position: 75
    }
  ];

  useEffect(() => {
    // 模拟加载标注数据
    setAnnotations(mockAnnotations);
  }, [courseId]);

  // 处理文本选择
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(selection.toString());
      setFormPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowAnnotationForm(true);
    }
  };

  // 处理标注表单提交
  const handleAnnotationSubmit = (e) => {
    e.preventDefault();
    
    if (!annotationForm.text.trim()) return;
    
    const newAnnotation = {
      id: Date.now(),
      type: annotationForm.type,
      text: selectedText,
      annotation: annotationForm.text,
      color: annotationForm.color,
      user_name: user.full_name,
      user_role: user.role,
      created_at: new Date().toLocaleString(),
      start_position: 0, // 这里应该计算实际位置
      end_position: selectedText.length
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setShowAnnotationForm(false);
    setSelectedText('');
    setAnnotationForm({
      type: 'highlight',
      text: '',
      color: '#FFD700'
    });
    
    if (onAnnotationChange) {
      onAnnotationChange(newAnnotation);
    }
  };

  // 处理标注编辑
  const handleEditAnnotation = (annotation) => {
    setEditingAnnotation(annotation);
    setAnnotationForm({
      type: annotation.type,
      text: annotation.annotation,
      color: annotation.color
    });
    setShowAnnotationForm(true);
  };

  // 处理标注更新
  const handleAnnotationUpdate = (e) => {
    e.preventDefault();
    
    if (!annotationForm.text.trim()) return;
    
    const updatedAnnotations = annotations.map(ann => 
      ann.id === editingAnnotation.id 
        ? { ...ann, annotation: annotationForm.text, color: annotationForm.color }
        : ann
    );
    
    setAnnotations(updatedAnnotations);
    setShowAnnotationForm(false);
    setEditingAnnotation(null);
    setAnnotationForm({
      type: 'highlight',
      text: '',
      color: '#FFD700'
    });
  };

  // 处理标注删除
  const handleDeleteAnnotation = (annotationId) => {
    if (window.confirm('确定要删除这个标注吗？')) {
      setAnnotations(annotations.filter(ann => ann.id !== annotationId));
    }
  };

  // 过滤标注
  const filteredAnnotations = annotations.filter(annotation => {
    const matchesType = filterType === 'all' || annotation.type === filterType;
    const matchesKeyword = annotation.text.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          annotation.annotation.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesType && matchesKeyword;
  });

  // 获取标注类型显示文本
  const getAnnotationTypeText = (type) => {
    switch (type) {
      case 'highlight': return '高亮';
      case 'note': return '笔记';
      case 'comment': return '评论';
      case 'question': return '问题';
      default: return '其他';
    }
  };

  // 获取标注类型图标
  const getAnnotationTypeIcon = (type) => {
    switch (type) {
      case 'highlight': return '🟡';
      case 'note': return '📝';
      case 'comment': return '💬';
      case 'question': return '❓';
      default: return '📌';
    }
  };

  // 颜色选项
  const colorOptions = [
    '#FFD700', '#87CEEB', '#98FB98', '#FFB6C1', '#DDA0DD', '#F0E68C'
  ];

  return (
    <div className="course-annotation">
      {/* 标注控制面板 */}
      <div className="annotation-controls" ref={annotationPanelRef}>
        <div className="control-header">
          <h3>📝 课程标注</h3>
          <div className="control-actions">
            <button
              className="control-btn"
              onClick={() => setShowAnnotationForm(true)}
              title="添加标注"
            >
              ➕ 添加标注
            </button>
          </div>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>类型筛选:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">全部类型</option>
              <option value="highlight">高亮</option>
              <option value="note">笔记</option>
              <option value="comment">评论</option>
              <option value="question">问题</option>
            </select>
          </div>
          
          <div className="search-group">
            <input
              type="text"
              placeholder="搜索标注内容..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
        
        <div className="annotation-stats">
          <span>共 {filteredAnnotations.length} 个标注</span>
        </div>
      </div>

      {/* 标注列表 */}
      <div className="annotation-list">
        {filteredAnnotations.length === 0 ? (
          <div className="empty-annotations">
            <div className="empty-icon">📝</div>
            <h4>暂无标注</h4>
            <p>选择文本并添加标注，或点击"添加标注"按钮</p>
          </div>
        ) : (
          filteredAnnotations.map(annotation => (
            <div key={annotation.id} className="annotation-item">
              <div className="annotation-header">
                <div className="annotation-type">
                  <span className="type-icon">
                    {getAnnotationTypeIcon(annotation.type)}
                  </span>
                  <span className="type-text">
                    {getAnnotationTypeText(annotation.type)}
                  </span>
                </div>
                
                <div className="annotation-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditAnnotation(annotation)}
                    title="编辑标注"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteAnnotation(annotation.id)}
                    title="删除标注"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="annotation-content">
                <div className="annotated-text">
                  <span className="text-label">标注文本:</span>
                  <span 
                    className="text-content"
                    style={{ backgroundColor: annotation.color + '40' }}
                  >
                    {annotation.text}
                  </span>
                </div>
                
                <div className="annotation-text">
                  <span className="text-label">标注内容:</span>
                  <span className="text-content">{annotation.annotation}</span>
                </div>
                
                <div className="annotation-meta">
                  <span className="meta-item">
                    <span className="meta-label">👤</span>
                    <span className="meta-value">{annotation.user_name}</span>
                  </span>
                  <span className="meta-item">
                    <span className="meta-label">⏰</span>
                    <span className="meta-value">{annotation.created_at}</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 标注表单 */}
      {showAnnotationForm && (
        <div className="annotation-form-overlay">
          <div 
            className="annotation-form"
            style={{
              left: formPosition.x,
              top: formPosition.y
            }}
          >
            <div className="form-header">
              <h4>{editingAnnotation ? '编辑标注' : '添加标注'}</h4>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAnnotationForm(false);
                  setEditingAnnotation(null);
                  setSelectedText('');
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={editingAnnotation ? handleAnnotationUpdate : handleAnnotationSubmit}>
              <div className="form-group">
                <label>标注类型:</label>
                <select
                  value={annotationForm.type}
                  onChange={(e) => setAnnotationForm({...annotationForm, type: e.target.value})}
                  className="form-select"
                >
                  <option value="highlight">高亮</option>
                  <option value="note">笔记</option>
                  <option value="comment">评论</option>
                  <option value="question">问题</option>
                </select>
              </div>
              
              {selectedText && (
                <div className="form-group">
                  <label>选中文本:</label>
                  <div className="selected-text">{selectedText}</div>
                </div>
              )}
              
              <div className="form-group">
                <label>标注内容:</label>
                <textarea
                  value={annotationForm.text}
                  onChange={(e) => setAnnotationForm({...annotationForm, text: e.target.value})}
                  placeholder="请输入标注内容..."
                  className="form-textarea"
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>颜色选择:</label>
                <div className="color-options">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${annotationForm.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setAnnotationForm({...annotationForm, color})}
                    />
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowAnnotationForm(false);
                    setEditingAnnotation(null);
                    setSelectedText('');
                  }}
                >
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  {editingAnnotation ? '保存修改' : '添加标注'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 文本内容区域 */}
      <div className="text-content-area">
        <div className="content-header">
          <h4>📖 课程内容</h4>
          <p>选择文本并右键添加标注，或使用上方的"添加标注"按钮</p>
        </div>
        
        <div 
          className="text-content"
          ref={textRef}
          onMouseUp={handleTextSelection}
          onSelect={handleTextSelection}
        >
          <p>
            阅读理解专项训练，提高学生的阅读分析能力。通过系统的训练，
            学生能够掌握阅读技巧，理解文章结构，抓住重点内容。
          </p>
          <p>
            本节课重点讲解段落大意和中心思想的提取方法。学生需要学会
            如何快速抓住文章的主要观点，理解作者的写作意图。
          </p>
          <p>
            训练内容包括：文章结构分析、关键词提取、段落大意概括、
            中心思想归纳等。通过这些练习，提升学生的阅读理解水平。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseAnnotation;
