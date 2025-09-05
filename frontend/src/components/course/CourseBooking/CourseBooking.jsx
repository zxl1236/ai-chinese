import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../../common/ConfirmDialog';
import './CourseBooking.css';

const CourseBooking = ({ user, onBookingUpdate }) => {
  const [bookings, setBookings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  // 预约表单状态
  const [bookingForm, setBookingForm] = useState({
    course_title: '',
    course_type: '1对1辅导',
    subject: '',
    scheduled_time: '',
    duration_minutes: 60,
    description: ''
  });

  useEffect(() => {
    if (user && user.id) {
      fetchBookings();
      fetchTeachers();
    }
  }, [user, filterStatus, filterDate]);

  useEffect(() => {
    if (selectedTeacher && selectedDate) {
      fetchTeacherSchedule();
    }
  }, [selectedTeacher, selectedDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = `/api/student/${user.id}/bookings`;
      const params = new URLSearchParams();
      
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (filterDate) {
        params.append('date_from', filterDate);
        params.append('date_to', filterDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookings(data.bookings || []);
        }
      }
    } catch (error) {
      console.error('获取预约失败:', error);
      showNotification('获取预约失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/student/teachers');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTeachers(data.teachers || []);
        }
      }
    } catch (error) {
      console.error('获取教师列表失败:', error);
    }
  };

  const fetchTeacherSchedule = async () => {
    if (!selectedTeacher || !selectedDate) return;
    
    try {
      const response = await fetch(
        `/api/student/teacher/${selectedTeacher}/schedule?date=${selectedDate}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableSlots(data.available_slots || []);
        }
      }
    } catch (error) {
      console.error('获取教师时间表失败:', error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedTeacher || !selectedDate || !bookingForm.scheduled_time) {
      showNotification('请填写完整的预约信息', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // 组合日期和时间
      const scheduledDateTime = `${selectedDate}T${bookingForm.scheduled_time}:00`;
      
      const response = await fetch(`/api/student/${user.id}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: selectedTeacher,
          course_title: bookingForm.course_title,
          course_type: bookingForm.course_type,
          subject: bookingForm.subject,
          scheduled_time: scheduledDateTime,
          duration_minutes: bookingForm.duration_minutes,
          description: bookingForm.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification('预约创建成功', 'success');
          setShowCreateModal(false);
          resetForm();
          fetchBookings();
          if (onBookingUpdate) {
            onBookingUpdate();
          }
        }
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || '预约创建失败', 'error');
      }
    } catch (error) {
      console.error('创建预约失败:', error);
      showNotification('预约创建失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (bookingId, updates) => {
    try {
      const response = await fetch(`/api/student/booking/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification('预约更新成功', 'success');
          fetchBookings();
          if (onBookingUpdate) {
            onBookingUpdate();
          }
        }
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || '预约更新失败', 'error');
      }
    } catch (error) {
      console.error('更新预约失败:', error);
      showNotification('预约更新失败', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancellingBookingId(bookingId);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    try {
      const response = await fetch(`/api/student/booking/${cancellingBookingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification('预约已取消', 'success');
          fetchBookings();
          if (onBookingUpdate) {
            onBookingUpdate();
          }
        }
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || '取消预约失败', 'error');
      }
    } catch (error) {
      console.error('取消预约失败:', error);
      showNotification('取消预约失败', 'error');
    } finally {
      setShowCancelDialog(false);
      setCancellingBookingId(null);
    }
  };

  const resetForm = () => {
    setBookingForm({
      course_title: '',
      course_type: '1对1辅导',
      subject: '',
      scheduled_time: '',
      duration_minutes: 60,
      description: ''
    });
    setSelectedTeacher(null);
    setSelectedDate('');
    setAvailableSlots([]);
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

  const showNotification = (message, type = 'info') => {
    // 这里可以集成通知系统
    console.log(`${type}: ${message}`);
    alert(message);
  };

  return (
    <div className="course-booking">
      <div className="booking-header">
        <h2 className="booking-title">📅 课程预约管理</h2>
        <div className="booking-actions">
          <button
            className="btn-primary create-booking-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="btn-icon">➕</span>
            <span>新建预约</span>
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="booking-filters">
        <div className="filter-group">
          <label className="filter-label">状态筛选:</label>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">全部状态</option>
            <option value="scheduled">已预约</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">日期筛选:</label>
          <input
            type="date"
            className="filter-date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* 预约列表 */}
      <div className="booking-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p className="empty-text">暂无预约记录</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              立即预约
            </button>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className={`booking-card ${getStatusClass(booking.status)}`}>
              <div className="booking-header">
                <div className="booking-status">
                  <span className={`status-dot ${getStatusClass(booking.status)}`}></span>
                  <span className="status-text">{getStatusText(booking.status)}</span>
                </div>
                <div className="booking-time">
                  <span className="time-date">
                    {new Date(booking.scheduled_time).toLocaleDateString()}
                  </span>
                  <span className="time-period">
                    {new Date(booking.scheduled_time).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="booking-content">
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
                
                {booking.description && (
                  <div className="booking-description">
                    <p>{booking.description}</p>
                  </div>
                )}
              </div>
              
              <div className="booking-actions">
                {booking.status === 'scheduled' && (
                  <>
                    <button
                      className="btn-secondary"
                      onClick={() => handleUpdateBooking(booking.id, { status: 'active' })}
                    >
                      <span className="btn-icon">🎯</span>
                      <span>开始课程</span>
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <span className="btn-icon">❌</span>
                      <span>取消预约</span>
                    </button>
                  </>
                )}
                
                {booking.status === 'active' && (
                  <button
                    className="btn-primary"
                    onClick={() => handleUpdateBooking(booking.id, { status: 'completed' })}
                  >
                    <span className="btn-icon">✅</span>
                    <span>完成课程</span>
                  </button>
                )}
                
                {booking.status === 'completed' && (
                  <button className="btn-outline">
                    <span className="btn-icon">📝</span>
                    <span>查看记录</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建预约模态框 */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">创建新预约</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form className="booking-form" onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label className="form-label">选择教师 *</label>
                <select
                  className="form-select"
                  value={selectedTeacher || ''}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  required
                >
                  <option value="">请选择教师</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nickname} - {teacher.specialties?.join(', ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">选择日期 *</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">选择时间 *</label>
                <select
                  className="form-select"
                  value={bookingForm.scheduled_time}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    scheduled_time: e.target.value
                  })}
                  required
                >
                  <option value="">请选择时间段</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot.split('-')[0]}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">课程标题 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={bookingForm.course_title}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    course_title: e.target.value
                  })}
                  placeholder="请输入课程标题"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">课程类型</label>
                <select
                  className="form-select"
                  value={bookingForm.course_type}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    course_type: e.target.value
                  })}
                >
                  <option value="1对1辅导">1对1辅导</option>
                  <option value="小班教学">小班教学</option>
                  <option value="专项训练">专项训练</option>
                  <option value="作业辅导">作业辅导</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">学科 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={bookingForm.subject}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    subject: e.target.value
                  })}
                  placeholder="如：阅读理解、写作训练等"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">课程时长</label>
                <select
                  className="form-select"
                  value={bookingForm.duration_minutes}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    duration_minutes: parseInt(e.target.value)
                  })}
                >
                  <option value={30}>30分钟</option>
                  <option value={60}>60分钟</option>
                  <option value={90}>90分钟</option>
                  <option value={120}>120分钟</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">课程描述</label>
                <textarea
                  className="form-textarea"
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    description: e.target.value
                  })}
                  placeholder="请描述您的学习需求或目标"
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? '创建中...' : '创建预约'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 取消预约确认对话框 */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="取消预约"
        message="确定要取消这个预约吗？"
        onConfirm={confirmCancelBooking}
        onCancel={() => {
          setShowCancelDialog(false);
          setCancellingBookingId(null);
        }}
        confirmText="取消预约"
        cancelText="保持预约"
        type="warning"
      />
    </div>
  );
};

export default CourseBooking;
