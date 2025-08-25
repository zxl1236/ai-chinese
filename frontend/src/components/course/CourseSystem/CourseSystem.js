import React, { useState, useEffect } from 'react';
import CourseCalendar from '../CourseCalendar/CourseCalendar';
import CourseManagement from '../CourseManagement/CourseManagement';
import CourseAnnotation from '../CourseAnnotation/CourseAnnotation';
import OnlineCourseInterface from '../OnlineCourseInterface/OnlineCourseInterface';
import './CourseSystem.css';

const CourseSystem = ({ user, onSwitchUser, onLogout }) => {
  const [activeView, setActiveView] = useState('calendar');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // 模拟课程数据
  const mockCourses = [
    {
      id: 1,
      title: '小学五年级阅读方法课',
      description: '阅读理解专项训练，提高学生的阅读分析能力',
      course_type: 'reading',
      difficulty_level: 'intermediate',
      scheduled_date: '2025-08-30',
      scheduled_time: '18:00',
      duration_minutes: 60,
      status: 'scheduled',
      student_name: '张小明',
      teacher_name: '李老师',
      notes: '重点讲解段落大意和中心思想'
    },
    {
      id: 2,
      title: '初中古诗文解析课',
      description: '古诗文鉴赏与理解，培养文学素养',
      course_type: 'writing',
      difficulty_level: 'advanced',
      scheduled_date: '2025-01-22',
      scheduled_time: '19:30',
      duration_minutes: 90,
      status: 'active',
      student_name: '王小红',
      teacher_name: '王老师',
      notes: '讲解《春望》等经典古诗'
    },
    {
      id: 3,
      title: 'AI写作辅导课',
      description: '利用AI工具提升写作效率和质量',
      course_type: 'ai_tutoring',
      difficulty_level: 'intermediate',
      scheduled_date: '2025-01-25',
      scheduled_time: '20:00',
      duration_minutes: 60,
      status: 'scheduled',
      student_name: '刘小华',
      teacher_name: '陈老师',
      notes: '介绍AI写作工具的使用方法'
    }
  ];

  useEffect(() => {
    // 直接设置课程数据，不显示加载动画
    setCourses(mockCourses);
    setLoading(false);
  }, []);

  // 处理课程点击
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setActiveView('online');
  };

  // 处理日期选择
  const handleDateSelect = (date) => {
    console.log('选择日期:', date);
    // 这里可以添加日期相关的逻辑
  };

  // 处理课程操作
  const handleCourseAction = (action, course) => {
    console.log('课程操作:', action, course);
    
    switch (action) {
      case 'start':
        // 启动课程，跳转到在线界面
        setSelectedCourse(course);
        setActiveView('online');
        break;
      case 'edit':
        // 编辑课程
        break;
      case 'delete':
        // 删除课程
        setCourses(courses.filter(c => c.id !== course.id));
        break;
      default:
        break;
    }
  };

  // 渲染视图内容
  const renderViewContent = () => {
    switch (activeView) {
      case 'calendar':
        return (
          <CourseCalendar
            courses={courses}
            onCourseClick={handleCourseClick}
            onDateSelect={handleDateSelect}
          />
        );
      
      case 'management':
        return (
          <CourseManagement
            user={user}
            onCourseAction={handleCourseAction}
          />
        );
      
      case 'online':
        return (
          <OnlineCourseInterface
            course={selectedCourse}
            user={user}
            onCourseAction={handleCourseAction}
          />
        );
      
      default:
        return (
          <CourseCalendar
            courses={courses}
            onCourseClick={handleCourseClick}
            onDateSelect={handleDateSelect}
          />
        );
    }
  };

  // 获取视图标题
  const getViewTitle = () => {
    switch (activeView) {
      case 'calendar': return '📅 课程日历';
      case 'management': return '📚 课程管理';
      case 'online': return '🎯 在线课程';
      default: return '📅 课程日历';
    }
  };

  // 获取视图描述
  const getViewDescription = () => {
    switch (activeView) {
      case 'calendar': return '查看课程安排和时间表';
      case 'management': return '管理课程预约和安排';
      case 'online': return '进行在线教学和实时标注';
      default: return '查看课程安排和时间表';
    }
  };

  if (loading) {
    return (
      <div className="course-system loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  return (
    <div className="course-system">
      {/* 系统头部 */}
      <div className="system-header">
        <div className="header-content">
          <div className="header-left">
            <h1>{getViewTitle()}</h1>
            <p>{getViewDescription()}</p>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span className="user-role">
                {user.role === 'admin' ? '👨‍💼 管理员' :
                 user.role === 'teacher' ? '👩‍🏫 老师' : '👨‍🎓 学生'}
              </span>
              <span className="user-name">{user.full_name}</span>
            </div>
            
            <div className="header-actions">
              <button
                className="action-btn"
                onClick={() => setActiveView('calendar')}
                title="课程日历"
              >
                📅
              </button>
              <button
                className="action-btn"
                onClick={() => setActiveView('management')}
                title="课程管理"
              >
                📚
              </button>
              {selectedCourse && (
                <button
                  className="action-btn"
                  onClick={() => setActiveView('online')}
                  title="在线课程"
                >
                  🎯
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="system-navigation">
        <button
          className={`nav-tab ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveView('calendar')}
        >
          📅 课程日历
        </button>
        <button
          className={`nav-tab ${activeView === 'management' ? 'active' : ''}`}
          onClick={() => setActiveView('management')}
        >
          📚 课程管理
        </button>
        {selectedCourse && (
          <button
            className={`nav-tab ${activeView === 'online' ? 'active' : ''}`}
            onClick={() => setActiveView('online')}
          >
            🎯 在线课程
          </button>
        )}
      </div>

      {/* 主要内容区域 */}
      <div className="system-content">
        {renderViewContent()}
      </div>

      {/* 快速操作面板 */}
      <div className="quick-panel">
        <div className="panel-header">
          <h4>⚡ 快速操作</h4>
        </div>
        
        <div className="panel-actions">
          <button
            className="quick-btn"
            onClick={() => setActiveView('calendar')}
            title="查看日历"
          >
            📅
          </button>
          
          <button
            className="quick-btn"
            onClick={() => setActiveView('management')}
            title="管理课程"
          >
            📚
          </button>
          
          {selectedCourse && (
            <button
              className="quick-btn"
              onClick={() => setActiveView('online')}
              title="进入课堂"
            >
              🎯
            </button>
          )}
          
          <button
            className="quick-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="回到顶部"
          >
            ⬆️
          </button>
        </div>
      </div>

      {/* 系统状态栏 */}
      <div className="system-footer">
        <div className="footer-left">
          <span className="system-status">
            🟢 系统运行正常
          </span>
        </div>
        
        <div className="footer-center">
          <span className="course-count">
            📊 共 {courses.length} 门课程
          </span>
        </div>
        
        <div className="footer-right">
          <span className="current-view">
            {activeView === 'calendar' ? '📅 日历视图' :
             activeView === 'management' ? '📚 管理视图' :
             activeView === 'online' ? '🎯 在线视图' : '📅 日历视图'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseSystem;
