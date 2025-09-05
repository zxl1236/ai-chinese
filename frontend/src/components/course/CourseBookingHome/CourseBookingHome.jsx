import React, { useState, useEffect } from 'react';
import './CourseBookingHome.css';

const CourseBookingHome = ({ user, onSwitchUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('课程预约由管理员统一安排，学生端仅可查看课程信息。');

  useEffect(() => {
    if (user && user.id) {
      fetchUpcomingBookings();
      fetchRecentBookings();
    }
  }, [user]);

  const fetchUpcomingBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/${user.id}/bookings?status=scheduled`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 只显示未来7天的预约
          const now = new Date();
          const upcoming = data.bookings.filter(booking => {
            const bookingDate = new Date(booking.scheduled_time);
            const diffTime = bookingDate.getTime() - now.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= 7;
          });
          setUpcomingBookings(upcoming.slice(0, 3)); // 只显示3个
        }
      }
    } catch (error) {
      console.error('获取即将到来的预约失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await fetch(`/api/student/${user.id}/bookings?status=completed`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentBookings(data.bookings.slice(0, 5)); // 只显示5个
        }
      }
    } catch (error) {
      console.error('获取最近预约失败:', error);
    }
  };

  const handleBookingUpdate = () => {
    fetchUpcomingBookings();
    fetchRecentBookings();
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
    const classMap = {
      'scheduled': 'status-scheduled',
      'active': 'status-active',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return classMap[status] || '';
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="course-booking-home">
      {/* 头部导航 */}
      <div className="home-header">
        <div className="header-content">
          <h1 className="home-title">📚 课程预约中心</h1>
          <p className="home-subtitle">管理您的学习计划，预约专业教师指导</p>
        </div>
        
        <div className="header-actions">
          <button
            className="btn-primary quick-booking-btn"
            onClick={() => setActiveTab('booking')}
          >
            <span className="btn-icon">➕</span>
            <span>快速预约</span>
          </button>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          <span>概览</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'booking' ? 'active' : ''}`}
          onClick={() => setActiveTab('booking')}
        >
          <span className="tab-icon">📅</span>
          <span>预约管理</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📝</span>
          <span>学习记录</span>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* 统计卡片 */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-number">{upcomingBookings.length}</div>
                  <div className="stat-label">即将开始的课程</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-number">{recentBookings.length}</div>
                  <div className="stat-label">已完成课程</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-number">85%</div>
                  <div className="stat-label">学习完成率</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-number">4.8</div>
                  <div className="stat-label">平均评分</div>
                </div>
              </div>
            </div>

            {/* 即将开始的课程 */}
            <div className="section">
              <div className="section-header">
                <h3 className="section-title">🚀 即将开始的课程</h3>
                <button
                  className="btn-outline view-all-btn"
                  onClick={() => setActiveTab('booking')}
                >
                  查看全部
                </button>
              </div>
              
              {loading ? (
                <div className="loading">加载中...</div>
              ) : upcomingBookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p className="empty-text">暂无即将开始的课程</p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab('booking')}
                  >
                    立即预约
                  </button>
                </div>
              ) : (
                <div className="upcoming-courses">
                  {upcomingBookings.map(booking => {
                    const { date, time } = formatDateTime(booking.scheduled_time);
                    return (
                      <div key={booking.id} className="course-card upcoming">
                        <div className="course-header">
                          <div className="course-status">
                            <span className={`status-dot ${getStatusClass(booking.status)}`}></span>
                            <span className="status-text">{getStatusText(booking.status)}</span>
                          </div>
                          <div className="course-time">
                            <span className="time-date">{date}</span>
                            <span className="time-period">{time}</span>
                          </div>
                        </div>
                        
                        <div className="course-content">
                          <h4 className="course-title">{booking.course_title}</h4>
                          <div className="course-details">
                            <div className="detail-item">
                              <span className="detail-icon">👩‍🏫</span>
                              <span className="detail-text">{booking.teacher_name}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">👥</span>
                              <span className="detail-text">{booking.course_type}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">📖</span>
                              <span className="detail-text">{booking.subject}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">⏱️</span>
                              <span className="detail-text">{booking.duration_minutes}分钟</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="course-actions">
                          <button className="btn-secondary">
                            <span className="btn-icon">💬</span>
                            <span>课前准备</span>
                          </button>
                          <button className="btn-primary">
                            <span className="btn-icon">🎯</span>
                            <span>进入课堂</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 最近完成的课程 */}
            <div className="section">
              <div className="section-header">
                <h3 className="section-title">📝 最近完成的课程</h3>
                <button
                  className="btn-outline view-all-btn"
                  onClick={() => setActiveTab('history')}
                >
                  查看全部
                </button>
              </div>
              
              {recentBookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <p className="empty-text">暂无完成的课程记录</p>
                </div>
              ) : (
                <div className="recent-courses">
                  {recentBookings.map(booking => {
                    const { date, time } = formatDateTime(booking.scheduled_time);
                    return (
                      <div key={booking.id} className="course-card completed">
                        <div className="course-header">
                          <div className="course-status">
                            <span className={`status-dot ${getStatusClass(booking.status)}`}></span>
                            <span className="status-text">{getStatusText(booking.status)}</span>
                          </div>
                          <div className="course-time">
                            <span className="time-date">{date}</span>
                            <span className="time-period">{time}</span>
                          </div>
                        </div>
                        
                        <div className="course-content">
                          <h4 className="course-title">{booking.course_title}</h4>
                          <div className="course-details">
                            <div className="detail-item">
                              <span className="detail-icon">👩‍🏫</span>
                              <span className="detail-text">{booking.teacher_name}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">👥</span>
                              <span className="detail-text">{booking.course_type}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">📖</span>
                              <span className="detail-text">{booking.subject}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="course-actions">
                          <button className="btn-outline">
                            <span className="btn-icon">📝</span>
                            <span>查看记录</span>
                          </button>
                          <button className="btn-outline">
                            <span className="btn-icon">⭐</span>
                            <span>评价课程</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

                        {activeTab === 'booking' && (
                  <div className="info-message">
                    <h3>课程预约说明</h3>
                    <p>{message}</p>
                    <div className="contact-info">
                      <p>如需预约课程，请联系管理员：</p>
                      <ul>
                        <li>📧 邮箱：admin@example.com</li>
                        <li>📱 电话：400-123-4567</li>
                        <li>💬 微信：AI语文助手</li>
                      </ul>
                    </div>
                  </div>
                )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="section">
              <div className="section-header">
                <h3 className="section-title">📚 学习记录</h3>
                <p className="section-subtitle">查看您的完整学习历程</p>
              </div>
              
              <div className="history-content">
                <div className="history-filters">
                  <div className="filter-group">
                    <label className="filter-label">时间范围:</label>
                    <select className="filter-select">
                      <option value="all">全部时间</option>
                      <option value="week">最近一周</option>
                      <option value="month">最近一月</option>
                      <option value="quarter">最近三月</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">课程类型:</label>
                    <select className="filter-select">
                      <option value="all">全部类型</option>
                      <option value="reading">阅读理解</option>
                      <option value="writing">写作训练</option>
                      <option value="basic">基础训练</option>
                    </select>
                  </div>
                </div>
                
                <div className="history-list">
                  {recentBookings.map(booking => {
                    const { date, time } = formatDateTime(booking.scheduled_time);
                    return (
                      <div key={booking.id} className="history-item">
                        <div className="history-date">
                          <div className="date-main">{date}</div>
                          <div className="date-time">{time}</div>
                        </div>
                        
                        <div className="history-content">
                          <h4 className="history-title">{booking.course_title}</h4>
                          <div className="history-details">
                            <span className="teacher-name">{booking.teacher_name}</span>
                            <span className="course-type">{booking.course_type}</span>
                            <span className="subject">{booking.subject}</span>
                          </div>
                        </div>
                        
                        <div className="history-status">
                          <span className={`status-badge ${getStatusClass(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseBookingHome;
