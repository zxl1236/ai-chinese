import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../../common/ConfirmDialog';
import './CourseManagement.css';

const CourseManagement = ({ user, onUpdate }) => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState({ students: [], teachers: [] });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    teacher_id: '',
    student_id: '',
    from_date: '',
    to_date: ''
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState(null);

  // 表单状态
  const [formData, setFormData] = useState({
    student_id: '',
    teacher_id: '',
    course_title: '',
    course_type: '1对1辅导',
    subject: '阅读理解',
    scheduled_time: '',
    duration_minutes: 60,
    description: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchUsers();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/admin/course-bookings?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookings(data.bookings || []);
        }
      }
    } catch (error) {
      console.error('获取课程预约失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // 获取学生
      const studentsResponse = await fetch('/api/admin/users?user_type=student');
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        if (studentsData.success) {
          setUsers(prev => ({ ...prev, students: studentsData.users || [] }));
        }
      }

      // 获取教师
      const teachersResponse = await fetch('/api/admin/users?user_type=teacher');
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        if (teachersData.success) {
          setUsers(prev => ({ ...prev, teachers: teachersData.users || [] }));
        }
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/course-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('课程预约创建成功！');
          setShowCreateForm(false);
          resetForm();
          fetchBookings();
          onUpdate && onUpdate();
        } else {
          alert(`创建失败: ${data.error}`);
        }
      } else {
        alert('创建失败，请检查网络连接');
      }
    } catch (error) {
      console.error('创建课程预约失败:', error);
      alert('创建失败，请稍后重试');
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/course-bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('课程预约更新成功！');
          setEditingBooking(null);
          resetForm();
          fetchBookings();
          onUpdate && onUpdate();
        } else {
          alert(`更新失败: ${data.error}`);
        }
      } else {
        alert('更新失败，请检查网络连接');
      }
    } catch (error) {
      console.error('更新课程预约失败:', error);
      alert('更新失败，请稍后重试');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    setDeletingBookingId(bookingId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBooking = async () => {
    try {
      const response = await fetch(`/api/admin/course-bookings/${deletingBookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('课程预约删除成功！');
          fetchBookings();
          onUpdate && onUpdate();
        } else {
          alert(`删除失败: ${data.error}`);
        }
      } else {
        alert('删除失败，请检查网络连接');
      }
    } catch (error) {
      console.error('删除课程预约失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setShowDeleteDialog(false);
      setDeletingBookingId(null);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      student_id: booking.user_id,
      teacher_id: booking.teacher_id,
      course_title: booking.course_title,
      course_type: booking.course_type || '1对1辅导',
      subject: booking.subject || '阅读理解',
      scheduled_time: booking.scheduled_time.slice(0, 16), // 转换为datetime-local格式
      duration_minutes: booking.duration_minutes || 60,
      description: booking.description || ''
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      teacher_id: '',
      course_title: '',
      course_type: '1对1辅导',
      subject: '阅读理解',
      scheduled_time: '',
      duration_minutes: 60,
      description: ''
    });
    setEditingBooking(null);
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
    return `status-badge ${status}`;
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

  const getUserName = (userId, userType) => {
    const userList = userType === 'student' ? users.students : users.teachers;
    const user = userList.find(u => u.id === userId);
    return user ? (user.nickname || user.username) : '未知用户';
  };

  return (
    <div className="course-management">
      <div className="management-header">
        <h2>📅 课程管理</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowCreateForm(true);
            resetForm();
          }}
        >
          ➕ 安排新课程
        </button>
      </div>

      {/* 筛选器 */}
      <div className="filters-section">
        <h3>🔍 筛选条件</h3>
        <div className="filters-grid">
          <div className="filter-item">
            <label>状态:</label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">全部状态</option>
              <option value="scheduled">已预约</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>

          <div className="filter-item">
            <label>教师:</label>
            <select 
              value={filters.teacher_id} 
              onChange={(e) => setFilters(prev => ({ ...prev, teacher_id: e.target.value }))}
            >
              <option value="">全部教师</option>
              {users.teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nickname || teacher.username}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>学生:</label>
            <select 
              value={filters.student_id} 
              onChange={(e) => setFilters(prev => ({ ...prev, student_id: e.target.value }))}
            >
              <option value="">全部学生</option>
              {users.students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.nickname || student.username}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>开始日期:</label>
            <input 
              type="date" 
              value={filters.from_date}
              onChange={(e) => setFilters(prev => ({ ...prev, from_date: e.target.value }))}
            />
          </div>

          <div className="filter-item">
            <label>结束日期:</label>
            <input 
              type="date" 
              value={filters.to_date}
              onChange={(e) => setFilters(prev => ({ ...prev, to_date: e.target.value }))}
            />
          </div>

          <div className="filter-item">
            <button 
              className="btn-secondary"
              onClick={() => setFilters({
                status: '',
                teacher_id: '',
                student_id: '',
                from_date: '',
                to_date: ''
              })}
            >
              🔄 重置筛选
            </button>
          </div>
        </div>
      </div>

      {/* 创建/编辑表单 */}
      {showCreateForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingBooking ? '✏️ 编辑课程' : '➕ 安排新课程'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingBooking ? handleUpdateBooking : handleCreateBooking}>
              <div className="form-grid">
                <div className="form-group">
                  <label>学生 *</label>
                  <select 
                    required
                    value={formData.student_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                  >
                    <option value="">选择学生</option>
                    {users.students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.nickname || student.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>教师 *</label>
                  <select 
                    required
                    value={formData.teacher_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, teacher_id: e.target.value }))}
                  >
                    <option value="">选择教师</option>
                    {users.teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.nickname || teacher.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>课程标题 *</label>
                  <input 
                    type="text"
                    required
                    value={formData.course_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, course_title: e.target.value }))}
                    placeholder="输入课程标题"
                  />
                </div>

                <div className="form-group">
                  <label>课程类型</label>
                  <select 
                    value={formData.course_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, course_type: e.target.value }))}
                  >
                    <option value="1对1辅导">1对1辅导</option>
                    <option value="小组课程">小组课程</option>
                    <option value="专项训练">专项训练</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>学科</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  >
                    <option value="阅读理解">阅读理解</option>
                    <option value="写作表达">写作表达</option>
                    <option value="文言文">文言文</option>
                    <option value="语音交流">语音交流</option>
                    <option value="字词基础">字词基础</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>上课时间 *</label>
                  <input 
                    type="datetime-local"
                    required
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>课程时长 (分钟)</label>
                  <input 
                    type="number"
                    min="30"
                    max="180"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label>课程描述</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入课程描述"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingBooking ? '💾 保存修改' : '✅ 创建课程'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 课程列表 */}
      <div className="bookings-section">
        <h3>📋 课程列表 ({bookings.length})</h3>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>加载中...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h4 className="booking-title">{booking.course_title}</h4>
                  <span className={getStatusClass(booking.status)}>
                    {getStatusText(booking.status)}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="detail-label">👨‍🎓 学生:</span>
                    <span className="detail-value">
                      {getUserName(booking.user_id, 'student')}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">👨‍🏫 教师:</span>
                    <span className="detail-value">
                      {getUserName(booking.teacher_id, 'teacher')}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">📚 学科:</span>
                    <span className="detail-value">{booking.subject || '未指定'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">🕐 时间:</span>
                    <span className="detail-value">
                      {formatDateTime(booking.scheduled_time)}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">⏱️ 时长:</span>
                    <span className="detail-value">{booking.duration_minutes}分钟</span>
                  </div>
                  
                  {booking.description && (
                    <div className="detail-item">
                      <span className="detail-label">📝 描述:</span>
                      <span className="detail-value">{booking.description}</span>
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(booking)}
                  >
                    ✏️ 编辑
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteBooking(booking.id)}
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>暂无课程预约数据</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setShowCreateForm(true);
                resetForm();
              }}
            >
              ➕ 安排第一个课程
            </button>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="删除课程预约"
        message="确定要删除这个课程预约吗？此操作不可撤销。"
        onConfirm={confirmDeleteBooking}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeletingBookingId(null);
        }}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
};

export default CourseManagement;
