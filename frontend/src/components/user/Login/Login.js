import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 保存用户信息到localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || '登录失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (userType) => {
    switch (userType) {
      case 'student':
        setUsername('student1');
        setPassword('123456');
        break;
      case 'teacher':
        setUsername('teacher01');
        setPassword('123456');
        break;
      case 'admin':
        setUsername('admin');
        setPassword('admin123');
        break;
      default:
        // 默认情况，不做任何操作
        break;
    }
  };

  const handleSkipLogin = (userType) => {
    // 创建模拟用户数据，直接跳过登录
    const mockUsers = {
      student: {
        id: 1,
        username: 'demo_student',
        nickname: '演示学生',
        full_name: '演示学生用户',
        user_type: 'student',
        demo_mode: true
      },
      teacher: {
        id: 2,
        username: 'demo_teacher',
        nickname: '演示教师',
        full_name: '演示教师用户',
        user_type: 'teacher',
        demo_mode: true
      },
      admin: {
        id: 3,
        username: 'demo_admin',
        nickname: '演示管理员',
        full_name: '演示管理员用户',
        user_type: 'admin',
        demo_mode: true
      }
    };

    const mockUser = mockUsers[userType];
    if (mockUser) {
      // 保存演示用户信息到localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('demo_mode', 'true');
      onLogin(mockUser);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>🎓 AI语文学习助手</h2>
          <p>请登录您的账户</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="demo-accounts">
          <p>快速体验（无需后端）：</p>
          <div className="demo-buttons">
            <button 
              className="demo-btn student-btn" 
              onClick={() => handleSkipLogin('student')}
            >
              👨‍🎓 学生演示
            </button>
            <button 
              className="demo-btn teacher-btn" 
              onClick={() => handleSkipLogin('teacher')}
            >
              👨‍🏫 教师演示
            </button>
            <button 
              className="demo-btn admin-btn" 
              onClick={() => handleSkipLogin('admin')}
            >
              👑 管理员演示
            </button>
          </div>
          
          <div className="login-divider">
            <span>或</span>
          </div>
          
          <p>正式登录（需要后端服务）：</p>
          <div className="demo-buttons small">
            <button 
              className="demo-btn-small student-btn" 
              onClick={() => handleDemoLogin('student')}
            >
              👨‍🎓 学生
            </button>
            <button 
              className="demo-btn-small teacher-btn" 
              onClick={() => handleDemoLogin('teacher')}
            >
              👨‍🏫 教师
            </button>
            <button 
              className="demo-btn-small admin-btn" 
              onClick={() => handleDemoLogin('admin')}
            >
              👑 管理员
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>💡 推荐：先点击"演示"按钮体验功能，后期再部署后端服务</p>
          <p>不同账户类型将看到不同的功能和内容</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
