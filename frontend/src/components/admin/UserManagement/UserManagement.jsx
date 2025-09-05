import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../../common/ConfirmDialog';
import './UserManagement.css';

const UserManagement = ({ user, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    user_type: '',
    is_active: ''
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // 用户表单状态
  const [userForm, setUserForm] = useState({
    username: '',
    nickname: '',
    password: '',
    user_type: 'student',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users || []);
        }
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('用户创建成功！');
          setShowUserForm(false);
          resetUserForm();
          fetchUsers();
          onUpdate && onUpdate();
        } else {
          alert(`创建失败: ${data.error}`);
        }
      } else {
        alert('创建失败，请检查网络连接');
      }
    } catch (error) {
      console.error('创建用户失败:', error);
      alert('创建失败，请稍后重试');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('用户更新成功！');
          setEditingUser(null);
          resetUserForm();
          fetchUsers();
          onUpdate && onUpdate();
        } else {
          alert(`更新失败: ${data.error}`);
        }
      } else {
        alert('更新失败，请检查网络连接');
      }
    } catch (error) {
      console.error('更新用户失败:', error);
      alert('更新失败，请稍后重试');
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${deletingUserId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('用户删除成功！');
          fetchUsers();
          onUpdate && onUpdate();
        } else {
          alert(`删除失败: ${data.error}`);
        }
      } else {
        alert('删除失败，请检查网络连接');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setShowDeleteDialog(false);
      setDeletingUserId(null);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`用户状态${!currentStatus ? '启用' : '禁用'}成功！`);
          fetchUsers();
          onUpdate && onUpdate();
        } else {
          alert(`状态更新失败: ${data.error}`);
        }
      } else {
        alert('状态更新失败，请检查网络连接');
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      alert('状态更新失败，请稍后重试');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      nickname: user.nickname || '',
      password: '', // 编辑时不显示密码
      user_type: user.user_type,
      is_active: user.is_active
    });
    setShowUserForm(true);
  };

  const resetUserForm = () => {
    setUserForm({
      username: '',
      nickname: '',
      password: '',
      user_type: 'student',
      is_active: true
    });
    setEditingUser(null);
  };

  const getUserTypeText = (userType) => {
    const typeMap = {
      'admin': '管理员',
      'teacher': '教师',
      'student': '学生'
    };
    return typeMap[userType] || userType;
  };

  const getUserTypeIcon = (userType) => {
    const iconMap = {
      'admin': '👑',
      'teacher': '👨‍🏫',
      'student': '👨‍🎓'
    };
    return iconMap[userType] || '👤';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (isActive) => {
    return `status-badge ${isActive ? 'active' : 'inactive'}`;
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>👥 用户管理</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowUserForm(true);
            resetUserForm();
          }}
        >
          ➕ 新建用户
        </button>
      </div>

      {/* 筛选器 */}
      <div className="filters-section">
        <h3>🔍 筛选条件</h3>
        <div className="filters-grid">
          <div className="filter-item">
            <label>用户类型:</label>
            <select 
              value={filters.user_type} 
              onChange={(e) => setFilters(prev => ({ ...prev, user_type: e.target.value }))}
            >
              <option value="">全部类型</option>
              <option value="admin">管理员</option>
              <option value="teacher">教师</option>
              <option value="student">学生</option>
            </select>
          </div>

          <div className="filter-item">
            <label>状态:</label>
            <select 
              value={filters.is_active} 
              onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
            >
              <option value="">全部状态</option>
              <option value="true">启用</option>
              <option value="false">禁用</option>
            </select>
          </div>

          <div className="filter-item">
            <button 
              className="btn-secondary"
              onClick={() => setFilters({
                user_type: '',
                is_active: ''
              })}
            >
              🔄 重置筛选
            </button>
          </div>
        </div>
      </div>

      {/* 用户统计 */}
      <div className="user-stats-section">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">👑</div>
            <div className="stat-content">
              <div className="stat-number">
                {users.filter(u => u.user_type === 'admin').length}
              </div>
              <div className="stat-label">管理员</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-content">
              <div className="stat-number">
                {users.filter(u => u.user_type === 'teacher').length}
              </div>
              <div className="stat-label">教师</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div className="stat-content">
              <div className="stat-number">
                {users.filter(u => u.user_type === 'student').length}
              </div>
              <div className="stat-label">学生</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">
                {users.filter(u => u.is_active).length}
              </div>
              <div className="stat-label">活跃用户</div>
            </div>
          </div>
        </div>
      </div>

      {/* 用户表单 */}
      {showUserForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingUser ? '✏️ 编辑用户' : '➕ 新建用户'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowUserForm(false);
                  resetUserForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>用户名 *</label>
                  <input 
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="输入用户名"
                    disabled={!!editingUser}
                  />
                </div>

                <div className="form-group">
                  <label>昵称</label>
                  <input 
                    type="text"
                    value={userForm.nickname}
                    onChange={(e) => setUserForm(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="输入昵称"
                  />
                </div>

                <div className="form-group">
                  <label>{editingUser ? '新密码' : '密码 *'}</label>
                  <input 
                    type="password"
                    required={!editingUser}
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={editingUser ? '留空则不修改密码' : '输入密码'}
                  />
                </div>

                <div className="form-group">
                  <label>用户类型 *</label>
                  <select 
                    required
                    value={userForm.user_type}
                    onChange={(e) => setUserForm(prev => ({ ...prev, user_type: e.target.value }))}
                  >
                    <option value="student">学生</option>
                    <option value="teacher">教师</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>状态</label>
                  <select 
                    value={userForm.is_active}
                    onChange={(e) => setUserForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                  >
                    <option value={true}>启用</option>
                    <option value={false}>禁用</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingUser ? '💾 保存修改' : '✅ 创建用户'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowUserForm(false);
                    resetUserForm();
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 用户列表 */}
      <div className="users-section">
        <h3>📋 用户列表 ({users.length})</h3>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>加载中...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">
                    {getUserTypeIcon(user.user_type)}
                  </div>
                  <div className="user-info">
                    <h4 className="user-name">
                      {user.nickname || user.username}
                    </h4>
                    <div className="user-meta">
                      <span className="user-type">
                        {getUserTypeText(user.user_type)}
                      </span>
                      <span className="user-username">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                  <div className="user-status">
                    <span className={getStatusClass(user.is_active)}>
                      {user.is_active ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>

                <div className="user-details">
                  <div className="detail-item">
                    <span className="detail-label">🆔 用户ID:</span>
                    <span className="detail-value">{user.id}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">📅 创建时间:</span>
                    <span className="detail-value">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                  
                  {user.nickname && (
                    <div className="detail-item">
                      <span className="detail-label">📝 昵称:</span>
                      <span className="detail-value">{user.nickname}</span>
                    </div>
                  )}
                </div>

                <div className="user-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(user)}
                  >
                    ✏️ 编辑
                  </button>
                  
                  <button 
                    className={`btn-toggle ${user.is_active ? 'btn-disable' : 'btn-enable'}`}
                    onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                  >
                    {user.is_active ? '🚫 禁用' : '✅ 启用'}
                  </button>
                  
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.user_type === 'admin' && users.filter(u => u.user_type === 'admin').length === 1}
                  >
                    🗑️ 删除
                  </button>
                </div>

                {user.user_type === 'admin' && users.filter(u => u.user_type === 'admin').length === 1 && (
                  <div className="admin-warning">
                    ⚠️ 这是唯一的管理员账号，无法删除
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>暂无用户数据</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setShowUserForm(true);
                resetUserForm();
              }}
            >
              ➕ 创建第一个用户
            </button>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="删除用户"
        message="确定要删除这个用户吗？此操作不可撤销。"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeletingUserId(null);
        }}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
};

export default UserManagement;
