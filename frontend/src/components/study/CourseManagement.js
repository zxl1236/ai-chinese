import React, { useState, useEffect } from 'react';
import './CourseManagement.css';

const CourseManagement = ({ user, userType = 'teacher' }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, [user, userType]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/online-courses?user_id=${user.id}&user_type=${userType}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses);
        }
      }
    } catch (error) {
      console.error('获取课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCourse = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/online-courses/${courseId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 更新课程状态
          setCourses(prevCourses => 
            prevCourses.map(course => 
              course.id === courseId 
                ? { ...course, status: 'active' }
                : course
            )
          );
          
          // 跳转到训练界面
          handleCourseStart(data);
        }
      }
    } catch (error) {
      console.error('启动课程失败:', error);
    }
  };

  const handleCourseStart = (courseData) => {
    const { training_module, training_content_id } = courseData;
    
    // 根据训练模块类型跳转到相应的训练界面
    switch (training_module) {
      case 'reading':
        // 跳转到阅读训练界面
        window.location.href = `/reading-training/${training_content_id}`;
        break;
      case 'writing':
        // 跳转到写作训练界面
        window.location.href = `/writing-training/${training_content_id}`;
        break;
      case 'ai-tutor':
        // 跳转到AI辅导界面
        window.location.href = `/ai-tutor/${training_content_id}`;
        break;
      default:
        // 默认跳转到AI辅导界面
        window.location.href = `/ai-tutor`;
    }
  };

  const endCourse = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/online-courses/${courseId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 更新课程状态
          setCourses(prevCourses => 
            prevCourses.map(course => 
              course.id === courseId 
                ? { ...course, status: 'completed' }
                : course
            )
          );
        }
      }
    } catch (error) {
      console.error('结束课程失败:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3498db';
      case 'active': return '#e74c3c';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return '已预约';
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const formatDateTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCourses = courses.filter(course => {
    if (filterStatus === 'all') return true;
    return course.status === filterStatus;
  });

  const getActionButton = (course) => {
    switch (course.status) {
      case 'scheduled':
        return (
          <button 
            className="action-btn start-btn"
            onClick={() => startCourse(course.id)}
          >
            开始课程
          </button>
        );
      case 'active':
        return (
          <button 
            className="action-btn end-btn"
            onClick={() => endCourse(course.id)}
          >
            结束课程
          </button>
        );
      case 'completed':
        return (
          <button 
            className="action-btn view-btn"
            onClick={() => setSelectedCourse(course)}
          >
            查看详情
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="course-management-loading">
        <div className="loading-spinner"></div>
        <p>加载课程中...</p>
      </div>
    );
  }

  return (
    <div className="course-management">
      <div className="management-header">
        <h2>课程管理</h2>
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">全部状态</option>
            <option value="scheduled">已预约</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>

      <div className="courses-list">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <div className="no-courses-icon">📚</div>
            <p>暂无课程安排</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <div className="course-title">{course.course_title}</div>
                <div 
                  className="course-status"
                  style={{ backgroundColor: getStatusColor(course.status) }}
                >
                  {getStatusText(course.status)}
                </div>
              </div>
              
              <div className="course-info">
                <div className="info-row">
                  <span className="info-label">学生:</span>
                  <span className="info-value">{course.student_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">时间:</span>
                  <span className="info-value">{formatDateTime(course.scheduled_time)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">时长:</span>
                  <span className="info-value">{course.duration_minutes}分钟</span>
                </div>
                <div className="info-row">
                  <span className="info-label">训练模块:</span>
                  <span className="info-value">{course.training_module || '未指定'}</span>
                </div>
              </div>
              
              <div className="course-actions">
                {getActionButton(course)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 课程详情模态框 */}
      {showCourseModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>课程详情</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCourseModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">课程标题:</span>
                <span className="detail-value">{selectedCourse.course_title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">学生:</span>
                <span className="detail-value">{selectedCourse.student_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">预约时间:</span>
                <span className="detail-value">{formatDateTime(selectedCourse.scheduled_time)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">课程时长:</span>
                <span className="detail-value">{selectedCourse.duration_minutes}分钟</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">训练模块:</span>
                <span className="detail-value">{selectedCourse.training_module || '未指定'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">状态:</span>
                <span 
                  className="detail-value status-badge"
                  style={{ backgroundColor: getStatusColor(selectedCourse.status) }}
                >
                  {getStatusText(selectedCourse.status)}
                </span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-btn secondary"
                onClick={() => setShowCourseModal(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
