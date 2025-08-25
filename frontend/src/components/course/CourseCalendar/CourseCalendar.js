import React, { useState, useEffect } from 'react';
import './CourseCalendar.css';

const CourseCalendar = ({ courses = [], onCourseClick, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month'); // 'month' 或 'week'
  const [selectedDate, setSelectedDate] = useState(null);

  // 获取当前月份的第一天和最后一天
  const getMonthRange = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  // 获取当前周的日期范围
  const getWeekRange = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
    return { monday, sunday };
  };

  // 生成日历网格
  const generateCalendarGrid = () => {
    if (viewType === 'month') {
      return generateMonthGrid();
    } else {
      return generateWeekGrid();
    }
  };

  // 生成月视图网格
  const generateMonthGrid = () => {
    const { firstDay, lastDay } = getMonthRange(currentDate);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const grid = [];
    let currentRow = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      
      // 获取当天的课程
      const dayCourses = courses.filter(course => {
        const courseDate = new Date(course.scheduled_date);
        return courseDate.toDateString() === date.toDateString();
      });
      
      currentRow.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        courses: dayCourses
      });
      
      if (currentRow.length === 7) {
        grid.push(currentRow);
        currentRow = [];
      }
    }
    
    return grid;
  };

  // 生成周视图网格
  const generateWeekGrid = () => {
    const { monday, sunday } = getWeekRange(currentDate);
    const grid = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      
      // 获取当天的课程
      const dayCourses = courses.filter(course => {
        const courseDate = new Date(course.scheduled_date);
        return courseDate.toDateString() === date.toDateString();
      });
      
      grid.push({
        date,
        isToday,
        isSelected,
        courses: dayCourses
      });
    }
    
    return [grid]; // 周视图只有一行
  };

  // 导航到上个月/周
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  // 导航到下个月/周
  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // 回到今天
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // 处理日期点击
  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // 处理课程点击
  const handleCourseClick = (course, event) => {
    event.stopPropagation();
    if (onCourseClick) {
      onCourseClick(course);
    }
  };

  // 获取课程状态颜色
  const getCourseStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#2196F3';
      case 'active': return '#4CAF50';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#2196F3';
    }
  };

  // 获取课程类型图标
  const getCourseTypeIcon = (type) => {
    switch (type) {
      case 'reading': return '📖';
      case 'writing': return '✍️';
      case 'ai_tutoring': return '🤖';
      default: return '📚';
    }
  };

  const calendarGrid = generateCalendarGrid();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="course-calendar">
      {/* 日历头部 */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button className="nav-btn" onClick={navigatePrevious}>
            <span>‹</span>
          </button>
          <h2 className="calendar-title">
            {viewType === 'month' 
              ? `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]}`
              : `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]} 第${Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7)}周`
            }
          </h2>
          <button className="nav-btn" onClick={navigateNext}>
            <span>›</span>
          </button>
        </div>
        
        <div className="calendar-controls">
          <button className="today-btn" onClick={goToToday}>
            今天
          </button>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewType === 'month' ? 'active' : ''}`}
              onClick={() => setViewType('month')}
            >
              月视图
            </button>
            <button 
              className={`toggle-btn ${viewType === 'week' ? 'active' : ''}`}
              onClick={() => setViewType('week')}
            >
              周视图
            </button>
          </div>
        </div>
      </div>

      {/* 日历网格 */}
      <div className="calendar-grid">
        {/* 星期标题 */}
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="calendar-days">
          {calendarGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="calendar-row">
              {row.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
                  onClick={() => handleDateClick(day.date)}
                >
                  <div className="day-number">{day.date.getDate()}</div>
                  
                  {/* 课程列表 */}
                  <div className="day-courses">
                    {day.courses.slice(0, viewType === 'month' ? 2 : 5).map((course, courseIndex) => (
                      <div
                        key={courseIndex}
                        className="course-item"
                        style={{ borderLeftColor: getCourseStatusColor(course.status) }}
                        onClick={(e) => handleCourseClick(course, e)}
                        title={`${course.title} - ${course.scheduled_time}`}
                      >
                        <span className="course-icon">
                          {getCourseTypeIcon(course.course_type)}
                        </span>
                        <span className="course-title">
                          {course.title.length > 8 ? course.title.substring(0, 8) + '...' : course.title}
                        </span>
                        <span className="course-time">{course.scheduled_time}</span>
                      </div>
                    ))}
                    
                    {day.courses.length > (viewType === 'month' ? 2 : 5) && (
                      <div className="more-courses">
                        +{day.courses.length - (viewType === 'month' ? 2 : 5)} 更多
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color scheduled"></span>
          <span>已预约</span>
        </div>
        <div className="legend-item">
          <span className="legend-color active"></span>
          <span>进行中</span>
        </div>
        <div className="legend-item">
          <span className="legend-color completed"></span>
          <span>已完成</span>
        </div>
        <div className="legend-item">
          <span className="legend-color cancelled"></span>
          <span>已取消</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCalendar;
