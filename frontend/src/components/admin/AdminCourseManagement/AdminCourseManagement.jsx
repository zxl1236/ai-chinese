import React, { useState, useEffect } from 'react';
import './AdminCourseManagement.css';

const AdminCourseManagement = ({ user }) => {
  console.log('AdminCourseManagement component rendered with user:', user);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeBookings: 0,
    completedCourses: 0,
    revenue: 0
  });
  const [courseBookings, setCourseBookings] = useState([]);
  const [users, setUsers] = useState({ students: [], teachers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    console.log('AdminCourseManagement useEffect triggered');
    fetchDashboardData();
    fetchCourseBookings();
    fetchUsers();
  }, []);

  // 模拟数据获取
  const fetchDashboardData = async () => {
    // 模拟API调用
    setTimeout(() => {
      setDashboardData({
        totalCourses: 25,
        totalStudents: 48,
        totalTeachers: 12,
        activeBookings: 8,
        completedCourses: 156,
        revenue: 15600
      });
    }, 500);
  };

  const fetchCourseBookings = async () => {
    // 模拟API调用
    setTimeout(() => {
      setCourseBookings([
        {
          id: 1,
          student: { nickname: '张小明', username: 'zhangxiaoming' },
          teacher: { nickname: '李老师', username: 'lilaoshi' },
          course_title: '语文写作基础',
          scheduled_time: '2025-01-27T10:00:00',
          duration: 60,
          status: 'scheduled'
        },
        {
          id: 2,
          student: { nickname: '王小红', username: 'wangxiaohong' },
          teacher: { nickname: '陈老师', username: 'chenlaoshi' },
          course_title: '阅读理解训练',
          scheduled_time: '2025-01-27T14:00:00',
          duration: 90,
          status: 'active'
        }
      ]);
    }, 800);
  };

  const fetchUsers = async () => {
    // 模拟API调用
    setTimeout(() => {
      setUsers({
        students: [
          { id: 1, nickname: '张小明', username: 'zhangxiaoming', status: 'active', joinDate: '2024-09-01' },
          { id: 2, nickname: '王小红', username: 'wangxiaohong', status: 'active', joinDate: '2024-09-15' },
          { id: 3, nickname: '刘小华', username: 'liuxiaohua', status: 'inactive', joinDate: '2024-08-20' }
        ],
        teachers: [
          { id: 1, nickname: '李老师', username: 'lilaoshi', status: 'active', joinDate: '2024-07-01', subjects: ['语文', '写作'] },
          { id: 2, nickname: '陈老师', username: 'chenlaoshi', status: 'active', joinDate: '2024-07-15', subjects: ['阅读', '理解'] },
          { id: 3, nickname: '赵老师', username: 'zhaolaoshi', status: 'active', joinDate: '2024-08-01', subjects: ['古诗词', '文学'] }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  // 仪表板视图
  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-number">{dashboardData.totalCourses}</div>
            <div className="stat-label">总课程数</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-info">
            <div className="stat-number">{dashboardData.totalStudents}</div>
            <div className="stat-label">学生总数</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <div className="stat-number">{dashboardData.totalTeachers}</div>
            <div className="stat-label">教师总数</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-number">¥{dashboardData.revenue}</div>
            <div className="stat-label">总收入</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-section">
          <h3>📊 课程统计</h3>
          <div className="chart-grid">
            <div className="chart-item">
              <div className="chart-number">{dashboardData.activeBookings}</div>
              <div className="chart-label">进行中</div>
            </div>
            <div className="chart-item">
              <div className="chart-number">{dashboardData.completedCourses}</div>
              <div className="chart-label">已完成</div>
            </div>
          </div>
        </div>
        
        <div className="recent-bookings">
          <h3>📅 最近预约记录</h3>
          <div className="recent-list">
            {courseBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="recent-item">
                <div className="recent-title">{booking.course_title}</div>
                <div className="recent-info">
                  <span>{booking.student?.nickname} - {booking.teacher?.nickname}</span>
                  <span className="recent-time">{new Date(booking.scheduled_time).toLocaleString()}</span>
                </div>
                <span className={`recent-status status-${booking.status}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 用户管理视图
  const renderUserManagement = () => (
    <div className="user-management-content">
      <div className="section-header">
        <h2>👥 用户管理</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateUserModal(true)}>
            <span className="icon">+</span>
            添加用户
          </button>
          <button className="btn-outline">
            <span className="icon">📊</span>
            导出数据
          </button>
        </div>
      </div>

      <div className="user-tabs">
        <button className={`user-tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
          学生管理 ({users.students.length})
        </button>
        <button className={`user-tab ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
          教师管理 ({users.teachers.length})
        </button>
      </div>

      {activeTab === 'students' && (
        <div className="user-list-section">
          <div className="user-filters">
            <input type="text" placeholder="搜索学生..." className="search-input" />
            <select className="filter-select">
              <option value="">所有状态</option>
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
            </select>
          </div>
          
          <div className="user-grid">
            {users.students.map((student) => (
              <div key={student.id} className="user-card">
                <div className="user-avatar">👨‍🎓</div>
                <div className="user-info">
                  <div className="user-name">{student.nickname}</div>
                  <div className="user-username">@{student.username}</div>
                  <div className="user-date">加入时间: {student.joinDate}</div>
                </div>
                <div className="user-status">
                  <span className={`status-badge ${student.status}`}>
                    {student.status === 'active' ? '活跃' : '非活跃'}
                  </span>
                </div>
                <div className="user-actions">
                  <button className="btn-small">编辑</button>
                  <button className="btn-small danger">删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="user-list-section">
          <div className="user-filters">
            <input type="text" placeholder="搜索教师..." className="search-input" />
            <select className="filter-select">
              <option value="">所有状态</option>
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
            </select>
          </div>
          
          <div className="user-grid">
            {users.teachers.map((teacher) => (
              <div key={teacher.id} className="user-card">
                <div className="user-avatar">👨‍🏫</div>
                <div className="user-info">
                  <div className="user-name">{teacher.nickname}</div>
                  <div className="user-username">@{teacher.username}</div>
                  <div className="user-subjects">科目: {teacher.subjects.join(', ')}</div>
                  <div className="user-date">加入时间: {teacher.joinDate}</div>
                </div>
                <div className="user-status">
                  <span className={`status-badge ${teacher.status}`}>
                    {teacher.status === 'active' ? '活跃' : '非活跃'}
                  </span>
                </div>
                <div className="user-actions">
                  <button className="btn-small">编辑</button>
                  <button className="btn-small danger">删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 课程安排视图
  const renderCourseBooking = () => (
    <div className="course-booking-content">
      <div className="section-header">
        <h2>📅 课程安排</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateBookingModal(true)}>
            <span className="icon">+</span>
            新建预约
          </button>
          <button className="btn-outline">
            <span className="icon">📊</span>
            批量导入
          </button>
        </div>
      </div>

      <div className="booking-filters">
        <div className="filter-row">
          <input type="text" placeholder="搜索课程..." className="search-input" />
          <select className="filter-select">
            <option value="">所有状态</option>
            <option value="scheduled">已预约</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
          <input type="date" className="date-input" />
          <button className="btn-outline">筛选</button>
        </div>
      </div>

      <div className="bookings-list">
        {courseBookings.map((booking) => (
          <div key={booking.id} className={`booking-card ${booking.status}`}>
            <div className="booking-header">
              <div className="booking-info">
                <h3>{booking.course_title}</h3>
                <div className="booking-subject">课程类型: 一对一</div>
                <div className="booking-description">课程描述</div>
              </div>
              <div className="booking-status">
                <span className={`status-dot status-${booking.status}`}></span>
                <span className="status-text">{getStatusText(booking.status)}</span>
              </div>
            </div>

            <div className="booking-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">👨‍🎓 学生:</span>
                  <span className="detail-value">{booking.student?.nickname}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">👨‍🏫 教师:</span>
                  <span className="detail-value">{booking.teacher?.nickname}</span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">🕐 时间:</span>
                  <span className="detail-value">{new Date(booking.scheduled_time).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">⏱️ 时长:</span>
                  <span className="detail-value">{booking.duration}分钟</span>
                </div>
              </div>
            </div>

            <div className="booking-actions">
              <button className="btn-outline">✏️ 编辑</button>
              <button className="btn-outline">❌ 删除</button>
              <button className="btn-outline">📋 详情</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 权限管理视图
  const renderPermissionManagement = () => (
    <div className="permission-content">
      <div className="section-header">
        <h2>🔐 权限管理</h2>
        <button className="btn-primary">
          <span className="icon">+</span>
          新建角色
        </button>
      </div>

      <div className="permission-grid">
        <div className="permission-section">
          <h3>👥 用户角色</h3>
          <div className="role-list">
            <div className="role-item">
              <div className="role-info">
                <div className="role-name">系统管理员</div>
                <div className="role-description">拥有所有系统权限</div>
              </div>
              <div className="role-actions">
                <button className="btn-small">编辑</button>
                <button className="btn-small">权限</button>
              </div>
            </div>
            <div className="role-item">
              <div className="role-info">
                <div className="role-name">教师</div>
                <div className="role-description">管理自己的课程和学生</div>
              </div>
              <div className="role-actions">
                <button className="btn-small">编辑</button>
                <button className="btn-small">权限</button>
              </div>
            </div>
            <div className="role-item">
              <div className="role-info">
                <div className="role-name">学生</div>
                <div className="role-description">查看课程和进度</div>
              </div>
              <div className="role-actions">
                <button className="btn-small">编辑</button>
                <button className="btn-small">权限</button>
              </div>
            </div>
          </div>
        </div>

        <div className="permission-section">
          <h3>🔑 权限设置</h3>
          <div className="permission-list">
            <div className="permission-item">
              <div className="permission-name">用户管理</div>
              <div className="permission-checkboxes">
                <label><input type="checkbox" defaultChecked /> 查看</label>
                <label><input type="checkbox" defaultChecked /> 创建</label>
                <label><input type="checkbox" defaultChecked /> 编辑</label>
                <label><input type="checkbox" defaultChecked /> 删除</label>
              </div>
            </div>
            <div className="permission-item">
              <div className="permission-name">课程管理</div>
              <div className="permission-checkboxes">
                <label><input type="checkbox" defaultChecked /> 查看</label>
                <label><input type="checkbox" defaultChecked /> 创建</label>
                <label><input type="checkbox" defaultChecked /> 编辑</label>
                <label><input type="checkbox" defaultChecked /> 删除</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 系统设置视图
  const renderSystemSettings = () => (
    <div className="settings-content">
      <div className="section-header">
        <h2>⚙️ 系统设置</h2>
        <button className="btn-primary">保存设置</button>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h3>🏫 基本设置</h3>
          <div className="setting-item">
            <label>系统名称</label>
            <input type="text" defaultValue="AI语文学习助手" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>系统版本</label>
            <input type="text" defaultValue="2.0.0" className="setting-input" disabled />
          </div>
          <div className="setting-item">
            <label>时区设置</label>
            <select className="setting-select">
              <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
              <option value="UTC">协调世界时 (UTC)</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>📧 通知设置</h3>
          <div className="setting-item">
            <label>邮件通知</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>短信通知</label>
            <input type="checkbox" />
          </div>
          <div className="setting-item">
            <label>系统内通知</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>

        <div className="settings-section">
          <h3>🔒 安全设置</h3>
          <div className="setting-item">
            <label>密码最小长度</label>
            <input type="number" defaultValue="8" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>登录失败锁定</label>
            <input type="number" defaultValue="5" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>会话超时(分钟)</label>
            <input type="number" defaultValue="30" className="setting-input" />
          </div>
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

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">加载管理员数据中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <div className="error-text">错误: {error}</div>
          <button className="btn-primary" onClick={() => window.location.reload()}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* 顶部导航栏 */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title-section">
            <div className="admin-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="admin-title">管理员后台</h1>
              <p className="admin-subtitle">系统管理、用户管理、课程安排、权限控制</p>
            </div>
          </div>
          <div className="admin-header-actions">
            <button className="admin-action-btn">
              <span className="icon">👤</span>
              {user?.nickname || '管理员'}
            </button>
            <button className="admin-action-btn">
              <span className="icon">🔔</span>
              通知
            </button>
            <button className="admin-action-btn">
              <span className="icon">❓</span>
              帮助
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="admin-main-content">
        {/* 导航标签 */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="icon">📊</span>
            仪表板
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="icon">👥</span>
            用户管理
          </button>
          <button 
            className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="icon">📅</span>
            课程安排
          </button>
          <button 
            className={`admin-tab ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            <span className="icon">🔐</span>
            权限管理
          </button>
          <button 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="icon">⚙️</span>
            系统设置
          </button>
        </div>

        {/* 内容区域 */}
        <div className="tab-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'bookings' && renderCourseBooking()}
          {activeTab === 'permissions' && renderPermissionManagement()}
          {activeTab === 'settings' && renderSystemSettings()}
        </div>
      </div>

      {/* 模态框 */}
      {showCreateUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>添加新用户</h3>
              <button onClick={() => setShowCreateUserModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>用户创建功能开发中...</p>
            </div>
          </div>
        </div>
      )}

      {showCreateBookingModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>新建课程预约</h3>
              <button onClick={() => setShowCreateBookingModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>课程预约创建功能开发中...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagement;
