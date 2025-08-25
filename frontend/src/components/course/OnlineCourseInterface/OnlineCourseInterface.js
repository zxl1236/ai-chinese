import React, { useState, useEffect } from 'react';
import CourseAnnotation from '../CourseAnnotation/CourseAnnotation';
import './OnlineCourseInterface.css';

const OnlineCourseInterface = ({ course, user, onCourseAction }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [courseStatus, setCourseStatus] = useState(course?.status || 'scheduled');
  const [activeTab, setActiveTab] = useState('annotation');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 格式化时间
  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 获取课程状态显示
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'scheduled': return { text: '即将开始', color: '#2196F3', icon: '⏰' };
      case 'active': return { text: '进行中', color: '#4CAF50', icon: '🎯' };
      case 'completed': return { text: '已完成', color: '#9E9E9E', icon: '✅' };
      case 'cancelled': return { text: '已取消', color: '#F44336', icon: '❌' };
      default: return { text: '未知', color: '#666', icon: '❓' };
    }
  };

  // 获取课程类型显示
  const getCourseTypeDisplay = (type) => {
    switch (type) {
      case 'reading': return { text: '阅读训练', icon: '📖', color: '#2196F3' };
      case 'writing': return { text: '写作训练', icon: '✍️', color: '#4CAF50' };
      case 'ai_tutoring': return { text: 'AI辅导', icon: '🤖', color: '#9C27B0' };
      default: return { text: '其他', icon: '📚', color: '#666' };
    }
  };

  // 处理课程操作
  const handleCourseAction = (action) => {
    if (onCourseAction) {
      onCourseAction(action, course);
    }
    
    switch (action) {
      case 'start':
        setCourseStatus('active');
        break;
      case 'complete':
        setCourseStatus('completed');
        break;
      case 'pause':
        // 暂停课程逻辑
        break;
      case 'resume':
        // 恢复课程逻辑
        break;
      default:
        break;
    }
  };

  // 快速操作按钮
  const renderQuickActions = () => {
    const actions = [];
    
    if (courseStatus === 'scheduled' && user.role === 'teacher') {
      actions.push(
        <button
          key="start"
          className="quick-action-btn start-btn"
          onClick={() => handleCourseAction('start')}
        >
          🚀 启动课程
        </button>
      );
    }
    
    if (courseStatus === 'active') {
      if (user.role === 'teacher') {
        actions.push(
          <button
            key="pause"
            className="quick-action-btn pause-btn"
            onClick={() => handleCourseAction('pause')}
          >
            ⏸️ 暂停
          </button>
        );
        actions.push(
          <button
            key="complete"
            className="quick-action-btn complete-btn"
            onClick={() => handleCourseAction('complete')}
          >
            ✅ 完成课程
          </button>
        );
      }
      
      actions.push(
        <button
          key="record"
          className="quick-action-btn record-btn"
          onClick={() => handleCourseAction('record')}
        >
          📹 录制
        </button>
      );
    }
    
    if (courseStatus === 'paused') {
      actions.push(
        <button
          key="resume"
          className="quick-action-btn resume-btn"
          onClick={() => handleCourseAction('resume')}
        >
          ▶️ 恢复
        </button>
      );
    }
    
    return actions;
  };

  // 标注变化处理
  const handleAnnotationChange = (annotation) => {
    console.log('标注变化:', annotation);
    // 这里可以添加实时同步逻辑
  };

  if (!course) {
    return (
      <div className="online-course-interface no-course">
        <div className="no-course-content">
          <div className="no-course-icon">📚</div>
          <h3>未选择课程</h3>
          <p>请从课程列表中选择一门课程开始在线教学</p>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(courseStatus);
  const typeDisplay = getCourseTypeDisplay(course.course_type);

  return (
    <div className="online-course-interface">
      {/* 界面头部 */}
      <div className="interface-header">
        <div className="header-left">
          <div className="course-info">
            <div className="course-type-badge" style={{ backgroundColor: typeDisplay.color }}>
              <span className="type-icon">{typeDisplay.icon}</span>
              <span className="type-text">{typeDisplay.text}</span>
            </div>
            <div className="course-title">
              <h2>{course.title}</h2>
              <p>{course.description}</p>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="course-status">
            <div 
              className="status-badge"
              style={{ backgroundColor: statusDisplay.color }}
            >
              <span className="status-icon">{statusDisplay.icon}</span>
              <span className="status-text">{statusDisplay.text}</span>
            </div>
          </div>
          
          <div className="time-display">
            <div className="current-time">
              <span className="time-label">当前时间</span>
              <span className="time-value">{formatTime(currentTime)}</span>
            </div>
            {course.scheduled_time && (
              <div className="course-time">
                <span className="time-label">课程时间</span>
                <span className="time-value">{course.scheduled_time}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="interface-tabs">
        <button
          className={`tab-btn ${activeTab === 'annotation' ? 'active' : ''}`}
          onClick={() => setActiveTab('annotation')}
        >
          📝 实时标注
        </button>
        <button
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📖 课程内容
        </button>
        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 实时聊天
        </button>
        <button
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          📁 文件共享
        </button>
      </div>

      {/* 主要内容区域 */}
      <div className="interface-content">
        {activeTab === 'annotation' && (
          <CourseAnnotation
            courseId={course.id}
            user={user}
            onAnnotationChange={handleAnnotationChange}
          />
        )}
        
        {activeTab === 'content' && (
          <div className="content-tab">
            <div className="content-header">
              <h3>📖 课程内容</h3>
              <p>这里是课程的具体内容，包括教材、课件等</p>
            </div>
            <div className="content-placeholder">
              <div className="placeholder-icon">📚</div>
              <h4>课程内容区域</h4>
              <p>这里将显示课程的具体内容，如教材、课件、视频等</p>
            </div>
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="chat-tab">
            <div className="chat-header">
              <h3>💬 实时聊天</h3>
              <p>师生实时交流，讨论课程内容</p>
            </div>
            <div className="chat-placeholder">
              <div className="placeholder-icon">💬</div>
              <h4>聊天功能</h4>
              <p>这里将实现师生实时聊天功能</p>
            </div>
          </div>
        )}
        
        {activeTab === 'files' && (
          <div className="files-tab">
            <div className="files-header">
              <h3>📁 文件共享</h3>
              <p>上传和共享课程相关文件</p>
            </div>
            <div className="files-placeholder">
              <div className="placeholder-icon">📁</div>
              <h4>文件管理</h4>
              <p>这里将实现文件上传、下载、共享等功能</p>
            </div>
          </div>
        )}
      </div>

      {/* 快速操作面板 */}
      <div className="quick-actions-panel">
        <button
          className="toggle-actions-btn"
          onClick={() => setShowQuickActions(!showQuickActions)}
        >
          {showQuickActions ? '收起' : '快速操作'}
        </button>
        
        {showQuickActions && (
          <div className="quick-actions-content">
            <div className="actions-header">
              <h4>⚡ 快速操作</h4>
            </div>
            <div className="actions-grid">
              {renderQuickActions()}
            </div>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="interface-footer">
        <div className="footer-left">
          <span className="user-info">
            👤 {user.full_name} ({user.role === 'teacher' ? '老师' : user.role === 'student' ? '学生' : '管理员'})
          </span>
        </div>
        
        <div className="footer-center">
          <span className="course-progress">
            📊 课程进度: {courseStatus === 'completed' ? '100%' : courseStatus === 'active' ? '进行中' : '0%'}
          </span>
        </div>
        
        <div className="footer-right">
          <span className="connection-status">
            🟢 连接正常
          </span>
        </div>
      </div>
    </div>
  );
};

export default OnlineCourseInterface;
