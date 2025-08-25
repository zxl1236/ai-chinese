import React, { useState, useEffect } from 'react';
import './CourseManagement.css';

const CourseManagement = ({ user, onCourseAction }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 模拟课程数据
  const mockCourses = [
    {
      id: 1,
      title: '小学五年级阅读方法课',
      description: '阅读理解专项训练，提高学生的阅读分析能力',
      course_type: 'reading',
      difficulty_level: 'intermediate',
      scheduled_date: '2025-01-20',
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
    // 模拟API调用
    setLoading(true);
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  // 过滤课程
  const filteredCourses = courses.filter(course => {
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchesKeyword = course.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          course.student_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          course.teacher_name.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesStatus && matchesKeyword;
  });

  // 获取状态显示文本
  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return '已预约';
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
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

  // 获取难度等级显示
  const getDifficultyText = (level) => {
    switch (level) {
      case 'beginner': return '基础';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return '未知';
    }
  };

  // 处理课程操作
  const handleCourseAction = (action, course) => {
    if (onCourseAction) {
      onCourseAction(action, course);
    }
    
    switch (action) {
      case 'start':
        // 启动课程逻辑
        console.log('启动课程:', course.id);
        break;
      case 'edit':
        setEditingCourse(course);
        setShowCreateForm(true);
        break;
      case 'delete':
        if (window.confirm(`确定要删除课程"${course.title}"吗？`)) {
          setCourses(courses.filter(c => c.id !== course.id));
        }
        break;
      case 'cancel':
        if (window.confirm(`确定要取消课程"${course.title}"吗？`)) {
          const updatedCourses = courses.map(c => 
            c.id === course.id ? { ...c, status: 'cancelled' } : c
          );
          setCourses(updatedCourses);
        }
        break;
      default:
        break;
    }
  };

  // 渲染操作按钮
  const renderActionButtons = (course) => {
    const buttons = [];
    
    if (course.status === 'scheduled') {
      if (user.role === 'teacher') {
        buttons.push(
          <button
            key="start"
            className="action-btn start-btn"
            onClick={() => handleCourseAction('start', course)}
          >
            🚀 启动课程
          </button>
        );
      }
      buttons.push(
        <button
          key="edit"
          className="action-btn edit-btn"
          onClick={() => handleCourseAction('edit', course)}
        >
          ✏️ 编辑
        </button>
      );
      buttons.push(
        <button
          key="cancel"
          className="action-btn cancel-btn"
          onClick={() => handleCourseAction('cancel', course)}
        >
          ❌ 取消
        </button>
      );
    } else if (course.status === 'active') {
      if (user.role === 'teacher') {
        buttons.push(
          <button
            key="complete"
            className="action-btn complete-btn"
            onClick={() => handleCourseAction('complete', course)}
          >
            ✅ 完成课程
          </button>
        );
      }
    }
    
    if (user.role === 'admin' || user.role === 'teacher') {
      buttons.push(
        <button
          key="delete"
          className="action-btn delete-btn"
          onClick={() => handleCourseAction('delete', course)}
        >
          🗑️ 删除
        </button>
      );
    }
    
    return buttons;
  };

  if (loading) {
    return (
      <div className="course-management loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  return (
    <div className="course-management">
      {/* 头部控制区域 */}
      <div className="management-header">
        <div className="header-left">
          <h2>📚 课程管理</h2>
          <p>管理线下转线上课程安排</p>
        </div>
        
        <div className="header-right">
          <button
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ 新建课程
          </button>
        </div>
      </div>

      {/* 筛选和搜索区域 */}
      <div className="filter-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label>状态筛选:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">全部状态</option>
              <option value="scheduled">已预约</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          
          <div className="search-group">
            <input
              type="text"
              placeholder="搜索课程标题、描述、学生或老师..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
        
        <div className="filter-stats">
          <span>共找到 {filteredCourses.length} 门课程</span>
        </div>
      </div>

      {/* 课程列表 */}
      <div className="course-list">
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>暂无课程</h3>
            <p>点击"新建课程"开始创建您的第一门课程</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <div className="course-type">
                  <span className="type-icon">
                    {getCourseTypeIcon(course.course_type)}
                  </span>
                  <span className="type-text">
                    {course.course_type === 'reading' ? '阅读训练' :
                     course.course_type === 'writing' ? '写作训练' :
                     course.course_type === 'ai_tutoring' ? 'AI辅导' : '其他'}
                  </span>
                </div>
                
                <div className="course-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(course.status) }}
                  >
                    {getStatusText(course.status)}
                  </span>
                </div>
              </div>
              
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                
                <div className="course-details">
                  <div className="detail-item">
                    <span className="detail-label">📅 日期:</span>
                    <span className="detail-value">{course.scheduled_date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">⏰ 时间:</span>
                    <span className="detail-value">{course.scheduled_time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">⏱️ 时长:</span>
                    <span className="detail-value">{course.duration_minutes}分钟</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📊 难度:</span>
                    <span className="detail-value">{getDifficultyText(course.difficulty_level)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">👨‍🎓 学生:</span>
                    <span className="detail-value">{course.student_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">👩‍🏫 老师:</span>
                    <span className="detail-value">{course.teacher_name}</span>
                  </div>
                </div>
                
                {course.notes && (
                  <div className="course-notes">
                    <span className="notes-label">📝 备注:</span>
                    <span className="notes-content">{course.notes}</span>
                  </div>
                )}
              </div>
              
              <div className="course-actions">
                {renderActionButtons(course)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建/编辑课程表单 */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCourse ? '编辑课程' : '新建课程'}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCourse(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>课程表单将在这里实现...</p>
              <p>包含课程信息、时间安排、学生选择等功能</p>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCourse(null);
                }}
              >
                取消
              </button>
              <button className="btn-primary">
                {editingCourse ? '保存修改' : '创建课程'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
