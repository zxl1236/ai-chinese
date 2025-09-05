import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// 导入子组件
import CourseManagement from '../CourseManagement/CourseManagement';
import ContentManagement from '../ContentManagement/ContentManagement';
import UserManagement from '../UserManagement/UserManagement';
import SystemSettings from '../SystemSettings/SystemSettings';

const AdminDashboard = ({ user, onSwitchUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    bookings: { total: 0, scheduled: 0, active: 0, completed: 0, cancelled: 0 },
    users: { students: 0, teachers: 0 },
    content: { modules: 0, articles: 0 }
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.user_type === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取管理员仪表板数据
      const dashboardResponse = await fetch('/api/admin/dashboard');
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.success) {
          setDashboardStats({
            bookings: dashboardData.dashboard.bookings,
            users: dashboardData.dashboard.users,
            content: { modules: 0, articles: 0 } // 稍后获取
          });
          setRecentBookings(dashboardData.dashboard.recent_bookings || []);
        }
      }

      // 获取内容统计数据
      const contentResponse = await fetch('/api/study-modules');
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setDashboardStats(prev => ({
          ...prev,
          content: {
            modules: contentData.allModules?.length || 0,
            articles: 0 // 稍后获取
          }
        }));
      }

    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderDashboard = () => (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.bookings.total}</div>
            <div className="stat-label">总课程数</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.users.students + dashboardStats.users.teachers}</div>
            <div className="stat-label">总用户数</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.content.modules}</div>
            <div className="stat-label">学习模块</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.bookings.completed}</div>
            <div className="stat-label">已完成课程</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>📊 课程状态统计</h3>
          <div className="status-grid">
            <div className="status-item scheduled">
              <span className="status-label">已预约</span>
              <span className="status-count">{dashboardStats.bookings.scheduled}</span>
            </div>
            <div className="status-item active">
              <span className="status-label">进行中</span>
              <span className="status-count">{dashboardStats.bookings.active}</span>
            </div>
            <div className="status-item completed">
              <span className="status-label">已完成</span>
              <span className="status-count">{dashboardStats.bookings.completed}</span>
            </div>
            <div className="status-item cancelled">
              <span className="status-label">已取消</span>
              <span className="status-count">{dashboardStats.bookings.cancelled}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>👥 用户统计</h3>
          <div className="user-stats">
            <div className="user-stat">
              <span className="user-type">学生</span>
              <span className="user-count">{dashboardStats.users.students}</span>
            </div>
            <div className="user-stat">
              <span className="user-type">教师</span>
              <span className="user-count">{dashboardStats.users.teachers}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-bookings">
        <h3>🕒 最近课程安排</h3>
        {recentBookings.length > 0 ? (
          <div className="bookings-list">
            {recentBookings.map((booking, index) => (
              <div key={index} className="booking-item">
                <div className="booking-info">
                  <div className="booking-title">{booking.course_title}</div>
                  <div className="booking-details">
                    <span>👨‍🎓 {booking.student_name}</span>
                    <span>👨‍🏫 {booking.teacher_name}</span>
                    <span>🕐 {booking.scheduled_time}</span>
                  </div>
                </div>
                <div className={`booking-status ${booking.status}`}>
                  {getStatusText(booking.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">暂无最近课程安排</p>
        )}
      </div>

      <div className="quick-actions">
        <h3>🚀 快速操作</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => handleTabChange('course-management')}
          >
            ➕ 安排新课程
          </button>
          <button 
            className="action-btn"
            onClick={() => handleTabChange('content-management')}
          >
            📝 管理学习内容
          </button>
          <button 
            className="action-btn"
            onClick={() => handleTabChange('user-management')}
          >
            👥 管理用户
          </button>
        </div>
      </div>
    </div>
  );

  const getStatusText = (status) => {
    const statusMap = {
      'scheduled': '已预约',
      'active': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'course-management':
        return <CourseManagement user={user} onUpdate={fetchDashboardData} />;
      case 'content-management':
        return <ContentManagement user={user} onUpdate={fetchDashboardData} />;
      case 'user-management':
        return <UserManagement user={user} onUpdate={fetchDashboardData} />;
      case 'system-settings':
        return <SystemSettings user={user} />;
      default:
        return renderDashboard();
    }
  };

  if (!user || user.user_type !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>🚫 访问被拒绝</h2>
        <p>您没有管理员权限，无法访问此页面。</p>
        <button onClick={() => onSwitchUser('admin')} className="btn-primary">
          切换到管理员账号
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <h1>🎓 AI语文学习助手 - 管理后台</h1>
          <div className="user-info">
            <span>欢迎，{user.nickname || user.username}</span>
            <button onClick={onLogout} className="logout-btn">退出登录</button>
          </div>
        </div>
      </div>

      <div className="admin-navigation">
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            📊 仪表板
          </button>
          <button
            className={`nav-tab ${activeTab === 'course-management' ? 'active' : ''}`}
            onClick={() => handleTabChange('course-management')}
          >
            📅 课程管理
          </button>
          <button
            className={`nav-tab ${activeTab === 'content-management' ? 'active' : ''}`}
            onClick={() => handleTabChange('content-management')}
          >
            📚 内容管理
          </button>
          <button
            className={`nav-tab ${activeTab === 'user-management' ? 'active' : ''}`}
            onClick={() => handleTabChange('user-management')}
          >
            👥 用户管理
          </button>
          <button
            className={`nav-tab ${activeTab === 'system-settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('system-settings')}
          >
            ⚙️ 系统设置
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>加载中...</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
