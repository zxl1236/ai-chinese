import React, { useState, useEffect } from 'react';
import './CourseCalendar.css';

const CourseCalendar = ({ user, userType = 'student' }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month

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

  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());
    
    const dates = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getCoursesForDate = (date) => {
    return courses.filter(course => {
      const courseDate = new Date(course.scheduled_time);
      return courseDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    
    return (
      <div className="calendar-week">
        <div className="calendar-header">
          {weekDates.map((date, index) => (
            <div key={index} className="calendar-day-header">
              <div className="day-name">
                {['日', '一', '二', '三', '四', '五', '六'][index]}
              </div>
              <div className={`day-date ${date.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="calendar-body">
          {weekDates.map((date, index) => (
            <div key={index} className="calendar-day">
              {getCoursesForDate(date).map((course, courseIndex) => (
                <div 
                  key={courseIndex} 
                  className="course-item"
                  style={{ borderLeftColor: getStatusColor(course.status) }}
                >
                  <div className="course-time">{formatTime(course.scheduled_time)}</div>
                  <div className="course-title">{course.course_title}</div>
                  <div className="course-participant">
                    {userType === 'student' ? course.teacher_name : course.student_name}
                  </div>
                  <div className="course-status" style={{ color: getStatusColor(course.status) }}>
                    {getStatusText(course.status)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(selectedDate);
    
    return (
      <div className="calendar-month">
        <div className="calendar-header">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div key={index} className="calendar-day-header">
              {day}
            </div>
          ))}
        </div>
        
        <div className="calendar-body">
          {monthDates.map((date, index) => (
            <div 
              key={index} 
              className={`calendar-day ${date.getMonth() !== selectedDate.getMonth() ? 'other-month' : ''}`}
            >
              <div className="day-number">{date.getDate()}</div>
              {getCoursesForDate(date).map((course, courseIndex) => (
                <div 
                  key={courseIndex} 
                  className="course-item month-course"
                  style={{ borderLeftColor: getStatusColor(course.status) }}
                >
                  <div className="course-title">{course.course_title}</div>
                  <div className="course-time">{formatTime(course.scheduled_time)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="course-calendar-loading">
        <div className="loading-spinner"></div>
        <p>加载课程中...</p>
      </div>
    );
  }

  return (
    <div className="course-calendar">
      <div className="calendar-controls">
        <div className="calendar-navigation">
          <button onClick={() => navigateDate(-1)} className="nav-btn">
            ←
          </button>
          <h2 className="current-date">
            {viewMode === 'week' 
              ? `${selectedDate.getFullYear()}年 第${Math.ceil((selectedDate.getDate() + new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay()) / 7)}周`
              : `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`
            }
          </h2>
          <button onClick={() => navigateDate(1)} className="nav-btn">
            →
          </button>
        </div>
        
        <div className="view-mode-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            周视图
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            月视图
          </button>
        </div>
      </div>

      <div className="calendar-container">
        {viewMode === 'week' ? renderWeekView() : renderMonthView()}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3498db' }}></span>
          <span>已预约</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#e74c3c' }}></span>
          <span>进行中</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#27ae60' }}></span>
          <span>已完成</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#95a5a6' }}></span>
          <span>已取消</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCalendar;
