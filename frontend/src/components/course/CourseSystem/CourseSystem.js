import React, { useState, useEffect } from 'react';
import CourseCalendar from '../CourseCalendar/CourseCalendar';
import CourseManagement from '../CourseManagement/CourseManagement';
import CourseAnnotation from '../CourseAnnotation/CourseAnnotation';
import OnlineCourseInterface from '../OnlineCourseInterface/OnlineCourseInterface';
import TeacherDataSync from '../../teacher/TeacherDataSync';
import AdminCourseManagement from '../../admin/AdminCourseManagement/AdminCourseManagement';
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

  // 根据用户类型设置默认视图
  useEffect(() => {
    if (user && user.user_type === 'admin') {
      setActiveView('admin');
    }
  }, [user]);

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
    console.log('renderViewContent called, user:', user);
    console.log('user.user_type:', user?.user_type);
    
    // 管理员视图
    if (user && user.user_type === 'admin') {
      console.log('Rendering AdminCourseManagement component');
      return <AdminCourseManagement user={user} />;
    }

    console.log('Not admin, rendering other views, activeView:', activeView);
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
      
      case 'sync':
        // 只有教师用户才能看到数据同步视图
        if (user.user_type === 'teacher') {
          return <TeacherDataSync teacherId={user.id || user.username} />;
        }
        return (
          <CourseCalendar
            courses={courses}
            onCourseClick={handleCourseClick}
            onDateSelect={handleDateSelect}
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
    if (user && user.user_type === 'admin') {
      return '👨‍💼 管理员课程管理';
    }
    
    switch (activeView) {
      case 'calendar': return '📅 课程日历';
      case 'management': return '📚 课程管理';
      case 'online': return '🎯 在线课程';
      case 'sync': return '🔄 数据同步';
      default: return '📅 课程日历';
    }
  };

  // 获取视图描述
  const getViewDescription = () => {
    if (user && user.user_type === 'admin') {
      return '统一安排学生和老师的课程预约，管理用户和课程数据';
    }
    
    switch (activeView) {
      case 'calendar': return '查看课程安排和时间表';
      case 'management': return '管理课程预约和安排';
      case 'online': return '进行在线教学和实时标注';
      case 'sync': return '同步课程数据和学生进度';
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

  // 管理员模式：只显示AdminCourseManagement组件，不显示普通界面
  if (user && user.user_type === 'admin') {
    return (
      <div className="course-system admin-mode">
        {renderViewContent()}
      </div>
    );
  }

  // 普通用户模式：显示完整的课程系统界面
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
              {user.user_type === 'teacher' && (
                <button
                  className="action-btn"
                  onClick={() => setActiveView('sync')}
                  title="数据同步"
                >
                  🔄
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="system-content">
        {renderViewContent()}
      </div>

      {/* 回到顶部按钮 */}
      <button
        className="scroll-to-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="回到顶部"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3)';
        }}
      >
        ⬆️
      </button>

      {/* 系统状态栏 */}
      <div className="system-footer">
        <div className="footer-left">
          <span className="system-status">
            🟢 系统运行正常
          </span>
        </div>
        
        <div className="footer-center">
          {user && user.user_type === 'admin' ? (
            <span className="admin-status">
              👨‍💼 管理员模式 - 课程预约管理
            </span>
          ) : (
            <span className="course-count">
              📊 共 {courses.length} 门课程
            </span>
          )}
        </div>
        
        <div className="footer-right">
          <span className="current-view">
            {user && user.user_type === 'admin' ? '👨‍💼 管理员视图' :
             activeView === 'calendar' ? '📅 日历视图' :
             activeView === 'management' ? '📚 管理视图' :
             activeView === 'online' ? '🎯 在线视图' :
             activeView === 'sync' ? '🔄 同步视图' : '📅 日历视图'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseSystem;
