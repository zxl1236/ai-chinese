import React, { useState } from 'react';
import './UserProfile.css';

function UserProfile({ user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const getUserTypeLabel = (userType) => {
    const labels = {
      'student': '学生',
      'teacher': '教师',
      'admin': '管理员'
    };
    return labels[userType] || userType;
  };

  const getUserTypeIcon = (userType) => {
    const icons = {
      'student': '👨‍🎓',
      'teacher': '👨‍🏫',
      'admin': '👑'
    };
    return icons[userType] || '👤';
  };

  const handleLogout = async () => {
    // 显示确认对话框
    const confirmed = window.confirm('确定要退出登录吗？退出后需要重新登录才能继续使用。');
    
    if (!confirmed) {
      return;
    }
    
    try {
      // 获取存储的token
      const token = localStorage.getItem('token');
      
      // 调用后端退出登录API
      if (token) {
        const response = await fetch('http://localhost:5000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ 服务器退出登录成功:', data.message);
        } else {
          console.warn('⚠️ 服务器退出登录失败:', data.error);
        }
      }
    } catch (error) {
      console.error('❌ 退出登录请求失败:', error);
    } finally {
      // 无论服务器响应如何，都清除本地存储
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('studyContent');
      localStorage.removeItem('activeSection');
      localStorage.removeItem('writingProgress');
      
      // 关闭下拉菜单
      setShowDropdown(false);
      
      // 显示退出成功提示
      alert('退出登录成功！感谢您的使用。');
      
      // 调用父组件的退出回调
      onLogout();
    }
  };

  return (
    <div className="user-profile">
      <div 
        className="user-avatar"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="user-icon">{getUserTypeIcon(user.user_type)}</span>
        <span className="user-name">{user.nickname || user.username}</span>
        <span className="dropdown-arrow">▼</span>
      </div>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-detail">
              <strong>{user.nickname || user.username}</strong>
            </div>
            <div className="user-type">
              {getUserTypeIcon(user.user_type)} {getUserTypeLabel(user.user_type)}
            </div>
            <div className="user-username">
              @{user.username}
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-actions">
            <button className="dropdown-item" onClick={() => setShowDropdown(false)}>
              📊 学习统计
            </button>
            <button className="dropdown-item" onClick={() => setShowDropdown(false)}>
              ⚙️ 个人设置
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item logout-item" onClick={handleLogout}>
              🚪 退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
