
import React, { useState, useEffect } from 'react';
import './TeacherCourseManagement.css';

const TeacherCourseManagement = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchTeacherCourses();
    }
  }, [user]);

  const fetchTeacherCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/${user.id}/course-bookings`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.bookings || []);
      } else {
        setMessage('获取课程信息失败');
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const startClass = async (bookingId) => {
    try {
      const response = await fetch(`/api/teacher/course-booking/${bookingId}/start-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`课程已开始！${data.meeting_info.action}`);
        fetchTeacherCourses(); // 刷新课程列表
      } else {
        const errorData = await response.json();
        setMessage(`开始课程失败: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
    }
  };

  const endClass = async (bookingId, feedback) => {
    try {
      const response = await fetch(`/api/teacher/course-booking/${bookingId}/end-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: user.id,
          feedback: feedback
        })
      });

      if (response.ok) {
        setMessage('课程已结束，反馈已保存');
        fetchTeacherCourses(); // 刷新课程列表
      } else {
        const errorData = await response.json();
        setMessage(`结束课程失败: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
    }
  };

  const exportFeedback = async (bookingId, format = 'json') => {
    try {
      const response = await fetch(`/api/teacher/course-booking/${bookingId}/export-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: user.id,
          format: format
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`课程反馈导出成功！格式: ${format.toUpperCase()}`);
        
        // 这里可以添加下载逻辑
        console.log('Feedback Report:', data.report);
      } else {
        const errorData = await response.json();
        setMessage(`导出失败: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'scheduled': '已预约',
      'active': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'scheduled': 'status-scheduled',
      'active': 'status-active',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'upcoming') {
      return course.status === 'scheduled';
    } else if (activeTab === 'active') {
      return course.status === 'active';
    } else if (activeTab === 'completed') {
      return course.status === 'completed';
    }
    return true;
  });

  return (
    <div className="teacher-course-management">
      <div className="management-header">
        <h1>课程管理</h1>
        <p>管理您的课程安排和教学反馈</p>
      </div>

      {message && (
        <div className="message-banner">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="close-btn">×</button>
        </div>
      )}

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <span className="tab-icon">📅</span>
          即将开始
        </button>
        <button
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="tab-icon">🎯</span>
          进行中
        </button>
        <button
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <span className="tab-icon">✅</span>
          已完成
        </button>
      </div>

      <div className="tab-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>暂无课程</h3>
            <p>当前没有{activeTab === 'upcoming' ? '即将开始' : activeTab === 'active' ? '进行中' : '已完成'}的课程</p>
          </div>
        ) : (
          <div className="course-list">
            {filteredCourses.map(course => (
              <div key={course.id} className={`course-card ${course.status}`}>
                <div className="course-header">
                  <div className="course-info">
                    <h3>{course.course_title}</h3>
                    <p className="course-subject">{course.subject}</p>
                    <p className="course-description">{course.description}</p>
                  </div>
                  <div className="course-status">
                    <span className={`status-dot ${getStatusClass(course.status)}`}></span>
                    <span className="status-text">{getStatusText(course.status)}</span>
                  </div>
                </div>

                <div className="course-details">
                  <div className="detail-item">
                    <span className="detail-label">学生：</span>
                    <span className="detail-value">{course.student?.nickname || '未知'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">课程类型：</span>
                    <span className="detail-value">{course.course_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">上课时间：</span>
                    <span className="detail-value">{formatDateTime(course.scheduled_time)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">时长：</span>
                    <span className="detail-value">{course.duration_minutes}分钟</span>
                  </div>
                </div>

                <div className="course-actions">
                  {course.status === 'scheduled' && (
                    <button
                      className="btn-primary"
                      onClick={() => startClass(course.id)}
                    >
                      🎯 开始上课
                    </button>
                  )}
                  
                  {course.status === 'active' && (
                    <button
                      className="btn-secondary"
                      onClick={() => endClass(course.id, {
                        content_summary: '课程内容总结',
                        key_points: '重点内容',
                        homework_assigned: '布置的作业'
                      })}
                    >
                      ✅ 结束课程
                    </button>
                  )}
                  
                  {course.status === 'completed' && (
                    <div className="completed-actions">
                      <button
                        className="btn-outline"
                        onClick={() => exportFeedback(course.id, 'json')}
                      >
                        📊 导出反馈 (JSON)
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => exportFeedback(course.id, 'pdf')}
                      >
                        📄 导出反馈 (PDF)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseManagement;
