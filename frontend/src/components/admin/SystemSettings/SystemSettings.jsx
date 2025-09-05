import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../../common/ConfirmDialog';
import './SystemSettings.css';

const SystemSettings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [systemInfo, setSystemInfo] = useState({
    version: '2.0.0',
    uptime: '0天 0小时 0分钟',
    database_size: '0 MB',
    total_users: 0,
    total_courses: 0,
    total_modules: 0
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [backupStatus, setBackupStatus] = useState('idle');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showClearLogsDialog, setShowClearLogsDialog] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
    fetchSystemLogs();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      // 这里可以调用后端API获取系统信息
      // 暂时使用模拟数据
      setSystemInfo({
        version: '2.0.0',
        uptime: '3天 12小时 45分钟',
        database_size: '2.5 MB',
        total_users: 15,
        total_courses: 28,
        total_modules: 16
      });
    } catch (error) {
      console.error('获取系统信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      // 这里可以调用后端API获取系统日志
      // 暂时使用模拟数据
      setLogs([
        {
          id: 1,
          timestamp: '2025-01-20 15:30:00',
          level: 'INFO',
          message: '系统启动成功',
          user: 'admin'
        },
        {
          id: 2,
          timestamp: '2025-01-20 15:25:00',
          level: 'INFO',
          message: '数据库连接正常',
          user: 'system'
        },
        {
          id: 3,
          timestamp: '2025-01-20 15:20:00',
          level: 'WARNING',
          message: '检测到异常登录尝试',
          user: 'unknown'
        }
      ]);
    } catch (error) {
      console.error('获取系统日志失败:', error);
    }
  };

  const handleBackup = async () => {
    try {
      setBackupStatus('backing_up');
      
      // 模拟备份过程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setBackupStatus('completed');
      alert('数据备份完成！');
      
      setTimeout(() => setBackupStatus('idle'), 2000);
    } catch (error) {
      console.error('备份失败:', error);
      setBackupStatus('failed');
      alert('备份失败，请稍后重试');
      
      setTimeout(() => setBackupStatus('idle'), 2000);
    }
  };

  const handleRestore = async () => {
    setShowRestoreDialog(true);
  };

  const confirmRestore = async () => {
    try {
      // 这里实现数据恢复逻辑
      alert('数据恢复功能开发中...');
    } catch (error) {
      console.error('恢复失败:', error);
      alert('恢复失败，请稍后重试');
    } finally {
      setShowRestoreDialog(false);
    }
  };

  const handleClearLogs = async () => {
    setShowClearLogsDialog(true);
  };

  const confirmClearLogs = async () => {
    try {
      setLogs([]);
      alert('日志清空成功！');
    } catch (error) {
      console.error('清空日志失败:', error);
      alert('清空失败，请稍后重试');
    } finally {
      setShowClearLogsDialog(false);
    }
  };

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level} - ${log.message} (用户: ${log.user})`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogLevelClass = (level) => {
    const levelMap = {
      'INFO': 'log-info',
      'WARNING': 'log-warning',
      'ERROR': 'log-error',
      'DEBUG': 'log-debug'
    };
    return levelMap[level] || 'log-info';
  };

  const getBackupStatusText = () => {
    const statusMap = {
      'idle': '准备就绪',
      'backing_up': '备份中...',
      'completed': '备份完成',
      'failed': '备份失败'
    };
    return statusMap[backupStatus];
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>⚙️ 基本设置</h3>
      
      <div className="setting-group">
        <label className="setting-label">系统名称</label>
        <input 
          type="text" 
          defaultValue="AI语文学习助手" 
          className="setting-input"
        />
      </div>

      <div className="setting-group">
        <label className="setting-label">系统描述</label>
        <textarea 
          defaultValue="基于AI技术的智能语文学习系统，提供个性化学习体验"
          className="setting-textarea"
          rows="3"
        />
      </div>

      <div className="setting-group">
        <label className="setting-label">维护模式</label>
        <div className="setting-toggle">
          <input type="checkbox" id="maintenance-mode" />
          <label htmlFor="maintenance-mode">启用维护模式</label>
        </div>
        <small className="setting-help">启用后只有管理员可以访问系统</small>
      </div>

      <div className="setting-group">
        <label className="setting-label">自动备份</label>
        <div className="setting-toggle">
          <input type="checkbox" id="auto-backup" defaultChecked />
          <label htmlFor="auto-backup">启用自动备份</label>
        </div>
        <small className="setting-help">每天凌晨2点自动备份数据</small>
      </div>

      <div className="setting-group">
        <label className="setting-label">备份保留天数</label>
        <input 
          type="number" 
          defaultValue="30" 
          min="1" 
          max="365"
          className="setting-input"
        />
        <small className="setting-help">超过天数的备份文件将被自动删除</small>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className="settings-section">
      <h3>📊 系统信息</h3>
      
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      ) : (
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🔢</div>
            <div className="info-content">
              <div className="info-label">系统版本</div>
              <div className="info-value">{systemInfo.version}</div>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">⏰</div>
            <div className="info-content">
              <div className="info-label">运行时间</div>
              <div className="info-value">{systemInfo.uptime}</div>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">💾</div>
            <div className="info-content">
              <div className="info-label">数据库大小</div>
              <div className="info-value">{systemInfo.database_size}</div>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">👥</div>
            <div className="info-content">
              <div className="info-label">总用户数</div>
              <div className="info-value">{systemInfo.total_users}</div>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📚</div>
            <div className="info-content">
              <div className="info-label">总课程数</div>
              <div className="info-value">{systemInfo.total_courses}</div>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📝</div>
            <div className="info-content">
              <div className="info-label">学习模块</div>
              <div className="info-value">{systemInfo.total_modules}</div>
            </div>
          </div>
        </div>
      )}

      <div className="system-actions">
        <button className="btn-primary" onClick={fetchSystemInfo}>
          🔄 刷新信息
        </button>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="settings-section">
      <h3>💾 数据管理</h3>
      
      <div className="backup-section">
        <h4>数据备份</h4>
        <div className="backup-status">
          <span className={`status-indicator ${backupStatus}`}>
            {getBackupStatusText()}
          </span>
        </div>
        
        <div className="backup-actions">
          <button 
            className="btn-primary"
            onClick={handleBackup}
            disabled={backupStatus === 'backing_up'}
          >
            💾 立即备份
          </button>
          
          <button 
            className="btn-secondary"
            onClick={handleRestore}
          >
            🔄 数据恢复
          </button>
        </div>
        
        <div className="backup-info">
          <p><strong>上次备份:</strong> 2025-01-20 02:00:00</p>
          <p><strong>备份大小:</strong> 2.5 MB</p>
          <p><strong>备份位置:</strong> ./backups/</p>
        </div>
      </div>

      <div className="cleanup-section">
        <h4>数据清理</h4>
        <div className="cleanup-actions">
          <button className="btn-warning">
            🗑️ 清理过期数据
          </button>
          <button className="btn-warning">
            📊 清理统计数据
          </button>
        </div>
        <small className="setting-help">
          清理操作将删除30天前的临时数据和统计数据
        </small>
      </div>
    </div>
  );

  const renderSystemLogs = () => (
    <div className="settings-section">
      <h3>📋 系统日志</h3>
      
      <div className="logs-header">
        <div className="logs-info">
          共 {logs.length} 条日志记录
        </div>
        <div className="logs-actions">
          <button className="btn-secondary" onClick={exportLogs}>
            📥 导出日志
          </button>
          <button className="btn-warning" onClick={handleClearLogs}>
            🗑️ 清空日志
          </button>
        </div>
      </div>

      <div className="logs-container">
        {logs.length > 0 ? (
          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id} className={`log-item ${getLogLevelClass(log.level)}`}>
                <div className="log-header">
                  <span className="log-timestamp">{log.timestamp}</span>
                  <span className={`log-level ${log.level.toLowerCase()}`}>
                    {log.level}
                  </span>
                  <span className="log-user">用户: {log.user}</span>
                </div>
                <div className="log-message">{log.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-logs">
            <p>暂无日志记录</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>🔒 安全设置</h3>
      
      <div className="setting-group">
        <label className="setting-label">密码策略</label>
        <div className="setting-options">
          <div className="setting-option">
            <input type="checkbox" id="require-uppercase" defaultChecked />
            <label htmlFor="require-uppercase">要求包含大写字母</label>
          </div>
          <div className="setting-option">
            <input type="checkbox" id="require-lowercase" defaultChecked />
            <label htmlFor="require-lowercase">要求包含小写字母</label>
          </div>
          <div className="setting-option">
            <input type="checkbox" id="require-numbers" defaultChecked />
            <label htmlFor="require-numbers">要求包含数字</label>
          </div>
          <div className="setting-option">
            <input type="checkbox" id="require-symbols" />
            <label htmlFor="require-symbols">要求包含特殊字符</label>
          </div>
        </div>
      </div>

      <div className="setting-group">
        <label className="setting-label">最小密码长度</label>
        <input 
          type="number" 
          defaultValue="8" 
          min="6" 
          max="20"
          className="setting-input"
        />
      </div>

      <div className="setting-group">
        <label className="setting-label">登录失败锁定</label>
        <div className="setting-toggle">
          <input type="checkbox" id="login-lock" defaultChecked />
          <label htmlFor="login-lock">启用登录失败锁定</label>
        </div>
      </div>

      <div className="setting-group">
        <label className="setting-label">锁定阈值</label>
        <input 
          type="number" 
          defaultValue="5" 
          min="3" 
          max="10"
          className="setting-input"
        />
        <small className="setting-help">连续失败次数达到阈值后锁定账户</small>
      </div>

      <div className="setting-group">
        <label className="setting-label">锁定时间 (分钟)</label>
        <input 
          type="number" 
          defaultValue="30" 
          min="5" 
          max="1440"
          className="setting-input"
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'system-info':
        return renderSystemInfo();
      case 'data-management':
        return renderDataManagement();
      case 'system-logs':
        return renderSystemLogs();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="system-settings">
      <div className="settings-header">
        <h2>⚙️ 系统设置</h2>
        <p>管理系统配置、数据备份和安全设置</p>
      </div>

      <div className="settings-navigation">
        <nav className="settings-nav">
          <button
            className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ 基本设置
          </button>
          <button
            className={`nav-item ${activeTab === 'system-info' ? 'active' : ''}`}
            onClick={() => setActiveTab('system-info')}
          >
            📊 系统信息
          </button>
          <button
            className={`nav-item ${activeTab === 'data-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('data-management')}
          >
            💾 数据管理
          </button>
          <button
            className={`nav-item ${activeTab === 'system-logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('system-logs')}
          >
            📋 系统日志
          </button>
          <button
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 安全设置
          </button>
        </nav>
      </div>

      <div className="settings-content">
        {renderContent()}
      </div>

      {/* 数据恢复确认对话框 */}
      <ConfirmDialog
        isOpen={showRestoreDialog}
        title="数据恢复"
        message="确定要恢复数据吗？此操作将覆盖当前所有数据！"
        onConfirm={confirmRestore}
        onCancel={() => setShowRestoreDialog(false)}
        confirmText="恢复"
        cancelText="取消"
        type="warning"
      />

      {/* 清空日志确认对话框 */}
      <ConfirmDialog
        isOpen={showClearLogsDialog}
        title="清空日志"
        message="确定要清空所有日志吗？此操作不可撤销！"
        onConfirm={confirmClearLogs}
        onCancel={() => setShowClearLogsDialog(false)}
        confirmText="清空"
        cancelText="取消"
        type="warning"
      />
    </div>
  );
};

export default SystemSettings;
