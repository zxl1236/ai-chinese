import React, { useState, useEffect, useRef } from 'react';
import './TeacherTeachingConsole.css';

const TeacherTeachingConsole = ({ teacherId }) => {
  const [todayCourses, setTodayCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('waiting'); // waiting, active, completed
  const [studentProgress, setStudentProgress] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  const socketRef = useRef(null);
  const sessionTimerRef = useRef(null);

  useEffect(() => {
    fetchTodayCourses();
    establishConnection();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [teacherId]);

  const fetchTodayCourses = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/teacher/${teacherId}/courses?date=${today}`);
      if (response.ok) {
        const data = await response.json();
        setTodayCourses(data.courses || []);
      }
    } catch (error) {
      console.error('获取今日课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const establishConnection = () => {
    // 建立WebSocket连接用于实时同步
    try {
      socketRef.current = new WebSocket(`ws://localhost:8000/ws/teacher/${teacherId}`);
      
      socketRef.current.onopen = () => {
        setIsConnected(true);
        console.log('陪练端连接成功');
      };
      
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleStudentUpdate(data);
      };
      
      socketRef.current.onclose = () => {
        setIsConnected(false);
        console.log('陪练端连接断开');
      };
      
      socketRef.current.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('建立连接失败:', error);
      setIsConnected(false);
    }
  };

  const handleStudentUpdate = (data) => {
    switch (data.type) {
      case 'student_progress':
        setStudentProgress(prev => ({
          ...prev,
          [data.student_id]: data.progress
        }));
        break;
      case 'student_ready':
        // 学生准备就绪
        showNotification('学生已准备就绪', 'success');
        break;
      case 'task_completed':
        // 学生完成任务
        showNotification(`学生完成任务: ${data.task_name}`, 'success');
        break;
      case 'student_message':
        // 学生发送消息
        showNotification(`学生消息: ${data.message}`, 'info');
        break;
    }
  };

  const startCourse = (course) => {
    setCurrentCourse(course);
    setSessionStatus('active');
    setSessionNotes('');
    
    // 开始计时
    sessionTimerRef.current = setInterval(() => {
      // 更新课程时长
    }, 60000); // 每分钟更新一次
    
    // 通知学生课程开始
    notifyStudent(course.student_id, 'course_started');
    
    // 更新课程状态
    updateCourseStatus(course.id, 'active');
    
    showNotification('课程已开始', 'success');
  };

  const endCourse = async () => {
    setSessionStatus('completed');
    
    // 停止计时
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    
    // 保存课程记录
    await saveCourseRecord();
    
    // 通知学生课程结束
    notifyStudent(currentCourse.student_id, 'course_completed');
    
    // 更新课程状态
    await updateCourseStatus(currentCourse.id, 'completed');
    
    setCurrentCourse(null);
    showNotification('课程已结束', 'success');
  };

  const pauseCourse = () => {
    setSessionStatus('paused');
    showNotification('课程已暂停', 'warning');
  };

  const resumeCourse = () => {
    setSessionStatus('active');
    showNotification('课程已恢复', 'success');
  };

  const notifyStudent = (studentId, message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'teacher_notification',
        student_id: studentId,
        message: message
      }));
    }
  };

  const updateCourseStatus = async (courseId, status) => {
    try {
      const response = await fetch(`/api/teacher/course/${courseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('更新课程状态失败');
      }
    } catch (error) {
      console.error('更新课程状态失败:', error);
    }
  };

  const saveCourseRecord = async () => {
    try {
      const response = await fetch('/api/teacher/course-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: currentCourse.id,
          teacher_id: teacherId,
          student_id: currentCourse.student_id,
          status: 'completed',
          session_notes: sessionNotes,
          feedback: {
            key_points: '本节课重点讲解了...',
            homework: '请完成以下作业...',
            student_performance: '学生表现良好，需要加强...'
          }
        })
      });
      
      if (response.ok) {
        console.log('课程记录保存成功');
      } else {
        throw new Error('保存课程记录失败');
      }
    } catch (error) {
      console.error('保存课程记录失败:', error);
      showNotification('保存课程记录失败', 'error');
    }
  };

  const openTool = (toolName) => {
    setActiveTool(toolName);
    showNotification(`${toolName}已打开`, 'info');
  };

  const closeTool = () => {
    setActiveTool(null);
  };

  const showNotification = (message, type = 'info') => {
    // 简单的通知显示
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return '已安排';
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#2196F3';
      case 'active': return '#4CAF50';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="teacher-teaching-console">
      {/* 头部信息 */}
      <div className="console-header">
        <div className="header-left">
          <h2>👨‍🏫 陪练教学控制台</h2>
          <p>管理课程会话和监控学生学习状态</p>
        </div>
        <div className="header-right">
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 已连接' : '🔴 连接中...'}
            </span>
          </div>
          <div className="current-time">
            {new Date().toLocaleTimeString('zh-CN')}
          </div>
        </div>
      </div>

      {/* 今日课程列表 */}
      <div className="today-courses">
        <div className="section-header">
          <h3>📅 今日课程安排</h3>
          <button onClick={fetchTodayCourses} className="refresh-btn">
            🔄 刷新
          </button>
        </div>
        
        {loading ? (
          <div className="loading-spinner">加载中...</div>
        ) : todayCourses.length === 0 ? (
          <div className="no-courses">
            <p>🎉 今日暂无课程安排，可以休息一下！</p>
          </div>
        ) : (
          <div className="courses-list">
            {todayCourses.map(course => (
              <div key={course.id} className={`course-item ${course.status}`}>
                <div className="course-time">
                  <div className="time-display">{course.scheduled_time}</div>
                  <div className="duration">{course.duration_minutes}分钟</div>
                </div>
                
                <div className="course-info">
                  <h4>{course.title}</h4>
                  <p className="student-name">👤 学生: {course.student_name}</p>
                  <p className="course-type">📚 类型: {course.course_type}</p>
                  <p className="course-level">⭐ 难度: {course.level || '初级'}</p>
                </div>
                
                <div className="course-actions">
                  {course.status === 'scheduled' && (
                    <button 
                      onClick={() => startCourse(course)}
                      className="btn btn-primary"
                    >
                      🚀 开始上课
                    </button>
                  )}
                  {course.status === 'active' && (
                    <span className="status-badge active">进行中</span>
                  )}
                  {course.status === 'completed' && (
                    <span className="status-badge completed">已完成</span>
                  )}
                  {course.status === 'cancelled' && (
                    <span className="status-badge cancelled">已取消</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 当前课程会话 */}
      {currentCourse && (
        <div className="current-session">
          <div className="session-header">
            <h3>🎯 当前课程: {currentCourse.title}</h3>
            <div className="session-status">
              <span className={`status-badge ${sessionStatus}`}>
                {sessionStatus === 'active' ? '进行中' : 
                 sessionStatus === 'paused' ? '已暂停' : '等待中'}
              </span>
            </div>
          </div>
          
          <div className="session-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">👤 学生:</span>
                <span className="value">{currentCourse.student_name}</span>
              </div>
              <div className="info-item">
                <span className="label">📚 课程类型:</span>
                <span className="value">{currentCourse.course_type}</span>
              </div>
              <div className="info-item">
                <span className="label">⏰ 开始时间:</span>
                <span className="value">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="info-item">
                <span className="label">⏱️ 课程时长:</span>
                <span className="value">{currentCourse.duration_minutes}分钟</span>
              </div>
            </div>
          </div>

          {/* 教学工具 */}
          <div className="teaching-tools">
            <h4>🛠️ 教学工具</h4>
            <div className="tools-grid">
              <button 
                className="tool-btn"
                onClick={() => openTool('whiteboard')}
              >
                🎨 共享白板
              </button>
              <button 
                className="tool-btn"
                onClick={() => openTool('reading')}
              >
                📖 阅读材料
              </button>
              <button 
                className="tool-btn"
                onClick={() => openTool('writing')}
              >
                ✍️ 写作练习
              </button>
              <button 
                className="tool-btn"
                onClick={() => openTool('video')}
              >
                📹 视频通话
              </button>
              <button 
                className="tool-btn"
                onClick={() => openTool('assessment')}
              >
                📋 在线测评
              </button>
              <button 
                className="tool-btn"
                onClick={() => openTool('resources')}
              >
                📚 教学资源
              </button>
            </div>
          </div>

          {/* 学生状态监控 */}
          <div className="student-monitor">
            <h4>📊 学生状态监控</h4>
            <div className="monitor-grid">
              <div className="monitor-item">
                <span className="label">准备状态:</span>
                <span className="value">
                  {studentProgress[currentCourse.student_id]?.ready ? '✅ 已准备' : '⏳ 准备中'}
                </span>
              </div>
              <div className="monitor-item">
                <span className="label">当前任务:</span>
                <span className="value">
                  {studentProgress[currentCourse.student_id]?.current_task || '无'}
                </span>
              </div>
              <div className="monitor-item">
                <span className="label">完成度:</span>
                <span className="value">
                  {studentProgress[currentCourse.student_id]?.completion_rate || 0}%
                </span>
              </div>
              <div className="monitor-item">
                <span className="label">专注度:</span>
                <span className="value">
                  {studentProgress[currentCourse.student_id]?.focus_level || '未知'}
                </span>
              </div>
            </div>
          </div>

          {/* 课程笔记 */}
          <div className="session-notes">
            <h4>📝 课程笔记</h4>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="记录本节课的重点内容、学生表现、需要改进的地方..."
              rows={4}
            />
          </div>

          {/* 课程控制 */}
          <div className="session-controls">
            {sessionStatus === 'active' && (
              <>
                <button 
                  onClick={pauseCourse}
                  className="btn btn-warning"
                >
                  ⏸️ 暂停课程
                </button>
                <button 
                  onClick={endCourse}
                  className="btn btn-danger"
                >
                  🏁 结束课程
                </button>
              </>
            )}
            {sessionStatus === 'paused' && (
              <button 
                onClick={resumeCourse}
                className="btn btn-success"
              >
                ▶️ 恢复课程
              </button>
            )}
            <button className="btn btn-outline">
              📤 发送消息
            </button>
            <button className="btn btn-outline">
              📋 查看大纲
            </button>
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="quick-actions">
        <h3>⚡ 快速操作</h3>
        <div className="action-buttons">
          <button className="action-btn">
            📊 查看学生进度
          </button>
          <button className="action-btn">
            📚 准备教学材料
          </button>
          <button className="action-btn">
            💬 发送消息
          </button>
          <button className="action-btn">
            📋 课程记录
          </button>
          <button className="action-btn">
            🎯 设置目标
          </button>
          <button className="action-btn">
            📈 生成报告
          </button>
        </div>
      </div>

      {/* 工具面板 */}
      {activeTool && (
        <div className="tool-panel">
          <div className="tool-header">
            <h4>{activeTool === 'whiteboard' ? '🎨 共享白板' :
                 activeTool === 'reading' ? '📖 阅读材料' :
                 activeTool === 'writing' ? '✍️ 写作练习' :
                 activeTool === 'video' ? '📹 视频通话' :
                 activeTool === 'assessment' ? '📋 在线测评' :
                 '📚 教学资源'}</h4>
            <button onClick={closeTool} className="close-btn">✕</button>
          </div>
          <div className="tool-content">
            {activeTool === 'whiteboard' && (
              <div className="whiteboard-tool">
                <p>白板功能开发中...</p>
              </div>
            )}
            {activeTool === 'reading' && (
              <div className="reading-tool">
                <p>阅读材料功能开发中...</p>
              </div>
            )}
            {activeTool === 'writing' && (
              <div className="writing-tool">
                <p>写作练习功能开发中...</p>
              </div>
            )}
            {activeTool === 'video' && (
              <div className="video-tool">
                <p>视频通话功能开发中...</p>
              </div>
            )}
            {activeTool === 'assessment' && (
              <div className="assessment-tool">
                <p>在线测评功能开发中...</p>
              </div>
            )}
            {activeTool === 'resources' && (
              <div className="resources-tool">
                <p>教学资源功能开发中...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTeachingConsole;
