import React, { useState } from 'react';
import './UserSwitcher.css';

function UserSwitcher({ currentUser, onSwitchUser, onLogout }) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [loading, setLoading] = useState(false);

  // 可切换的用户列表（这里可以根据实际需求调整）
  const availableUsers = [
    {
      username: 'teacher1',
      password: 'teacher123',
      nickname: '李老师',
      user_type: 'teacher',
      description: '陪练教师'
    },
    {
      username: 'student1',
      password: 'student123',
      nickname: '张小明',
      user_type: 'student',
      description: '学生用户'
    },
    {
      username: 'admin',
      password: 'admin123',
      nickname: '系统管理员',
      user_type: 'admin',
      description: '系统管理'
    }
  ];

  const handleSwitchUser = async (targetUser) => {
    if (targetUser.username === currentUser.username) {
      alert('您已经是该用户了！');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: targetUser.username,
          password: targetUser.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 保存新用户信息到localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // 调用父组件的切换回调
        onSwitchUser(data.user);
        
        // 关闭切换器
        setShowSwitcher(false);
        
        // 显示切换成功提示
        alert(`已成功切换到 ${targetUser.nickname} (${targetUser.description})`);
      } else {
        alert(`切换失败: ${data.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('切换用户失败:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm('确定要退出登录吗？退出后需要重新登录才能继续使用。');
    if (confirmed) {
      onLogout();
    }
  };

  const getUserTypeIcon = (userType) => {
    const icons = {
      'student': '👨‍🎓',
      'teacher': '👨‍🏫',
      'admin': '👑'
    };
    return icons[userType] || '👤';
  };

  const getUserTypeLabel = (userType) => {
    const labels = {
      'student': '学生',
      'teacher': '教师',
      'admin': '管理员'
    };
    return labels[userType] || userType;
  };

  return (
    <div className="user-switcher">
      <div 
        className="user-switcher-trigger"
        onClick={() => setShowSwitcher(!showSwitcher)}
      >
        <span className="current-user-info">
          <span className="user-icon">{getUserTypeIcon(currentUser.user_type)}</span>
          <span className="user-name">{currentUser.nickname || currentUser.username}</span>
          <span className="user-type">({getUserTypeLabel(currentUser.user_type)})</span>
        </span>
        <span className="switch-arrow">▼</span>
      </div>

      {showSwitcher && (
        <div className="user-switcher-dropdown">
          <div className="switcher-header">
            <h4>快速切换用户</h4>
            <p className="current-user-display">
              当前用户: {currentUser.nickname || currentUser.username} 
              <span className="user-type-badge">
                {getUserTypeIcon(currentUser.user_type)} {getUserTypeLabel(currentUser.user_type)}
              </span>
            </p>
          </div>

          <div className="available-users">
            <h5>可切换的用户:</h5>
            {availableUsers.map((user) => (
              <div 
                key={user.username}
                className={`user-option ${user.username === currentUser.username ? 'current-user' : ''}`}
                onClick={() => handleSwitchUser(user)}
              >
                <div className="user-option-info">
                  <span className="user-icon">{getUserTypeIcon(user.user_type)}</span>
                  <div className="user-details">
                    <div className="user-name">{user.nickname}</div>
                    <div className="user-description">{user.description}</div>
                  </div>
                </div>
                {user.username === currentUser.username ? (
                  <span className="current-indicator">当前</span>
                ) : (
                  <button 
                    className="switch-btn"
                    disabled={loading}
                  >
                    {loading ? '切换中...' : '切换'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="switcher-actions">
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              🚪 退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSwitcher;
