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
          <p>演示账户（一键登录）：</p>
          <div className="demo-buttons">
            <button 
              className="demo-btn student-btn" 
              onClick={() => handleDemoLogin('student')}
            >
              👨‍🎓 学生账户
            </button>
            <button 
              className="demo-btn teacher-btn" 
              onClick={() => handleDemoLogin('teacher')}
            >
              👨‍🏫 教师账户
            </button>
            <button 
              className="demo-btn admin-btn" 
              onClick={() => handleDemoLogin('admin')}
            >
              👑 管理员账户
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>不同账户类型将看到不同的功能和内容</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
