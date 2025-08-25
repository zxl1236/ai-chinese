import React, { useState, useEffect } from 'react';
import CourseCalendar from './CourseCalendar';
import CourseManagement from './CourseManagement';
import CourseAnnotation from './CourseAnnotation';
import './OnlineCourseInterface.css';

const OnlineCourseInterface = ({ user, userType = 'student' }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentCourse, setCurrentCourse] = useState(null);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);

  const tabs = [
    { id: 'calendar', label: '课程日历', icon: '📅' },
    { id: 'management', label: '课程管理', icon: '⚙️' },
    { id: 'annotation', label: '标注批注', icon: '📝' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // 如果切换到标注标签，显示标注面板
    if (tabId === 'annotation') {
      setShowAnnotationPanel(true);
    } else {
      setShowAnnotationPanel(false);
    }
  };

  const handleCourseSelect = (course) => {
    setCurrentCourse(course);
    setActiveTab('annotation');
    setShowAnnotationPanel(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <CourseCalendar 
            user={user} 
            userType={userType}
            onCourseSelect={handleCourseSelect}
          />
        );
      case 'management':
        return (
          <CourseManagement 
            user={user} 
            userType={userType}
            onCourseSelect={handleCourseSelect}
          />
        );
      case 'annotation':
        return currentCourse ? (
          <CourseAnnotation 
            courseId={currentCourse.id}
            userId={user.id}
            userType={userType}
          />
        ) : (
          <div className="no-course-selected">
            <div className="no-course-icon">📚</div>
            <h3>请先选择课程</h3>
            <p>从课程日历或课程管理中选择一个课程来查看标注</p>
            <button 
              className="select-course-btn"
              onClick={() => setActiveTab('calendar')}
            >
              查看课程日历
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="online-course-interface">
      <div className="interface-header">
        <h2>在线课程系统</h2>
        <div className="user-info">
          <span className="user-role">
            {userType === 'teacher' ? '👨‍🏫 陪练老师' : '👨‍🎓 学生'}
          </span>
          <span className="user-name">{user.nickname || user.username}</span>
        </div>
      </div>

      <div className="interface-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="interface-content">
        {renderTabContent()}
      </div>

      {/* 标注面板 - 浮动显示 */}
      {showAnnotationPanel && currentCourse && (
        <div className="annotation-panel">
          <div className="panel-header">
            <h4>课程标注 - {currentCourse.course_title}</h4>
            <button 
              className="close-panel-btn"
              onClick={() => setShowAnnotationPanel(false)}
            >
              ×
            </button>
          </div>
          <div className="panel-content">
            <CourseAnnotation 
              courseId={currentCourse.id}
              userId={user.id}
              userType={userType}
            />
          </div>
        </div>
      )}

      {/* 快速操作按钮 */}
      <div className="quick-actions">
        {userType === 'teacher' && (
          <button 
            className="quick-action-btn start-course-btn"
            onClick={() => setActiveTab('management')}
          >
            🚀 开始课程
          </button>
        )}
        <button 
          className="quick-action-btn view-calendar-btn"
          onClick={() => setActiveTab('calendar')}
        >
          📅 查看日历
        </button>
        {currentCourse && (
          <button 
            className="quick-action-btn annotation-btn"
            onClick={() => setActiveTab('annotation')}
          >
            📝 课程标注
          </button>
        )}
      </div>
    </div>
  );
};

export default OnlineCourseInterface;
