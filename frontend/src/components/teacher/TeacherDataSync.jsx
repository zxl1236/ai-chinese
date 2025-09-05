import React, { useState, useEffect, useRef } from 'react';
import './TeacherDataSync.css';

const TeacherDataSync = ({ teacherId }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, completed, error
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [selectedData, setSelectedData] = useState({
    courseRecords: true,
    studentProgress: true,
    teachingMaterials: true,
    assessments: true,
    feedback: true,
    schedules: true
  });
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [autoSyncInterval, setAutoSyncInterval] = useState(30); // 分钟
  const [retryOnFailure, setRetryOnFailure] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  const [syncOnlyNewData, setSyncOnlyNewData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncStats, setSyncStats] = useState({
    totalRecords: 0,
    newRecords: 0,
    updatedRecords: 0,
    failedRecords: 0
  });

  const autoSyncTimerRef = useRef(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    fetchSyncHistory();
    fetchLastSyncTime();
    fetchSyncStats();
    
    if (autoSyncEnabled) {
      startAutoSync();
    }
    
    return () => {
      if (autoSyncTimerRef.current) {
        clearInterval(autoSyncTimerRef.current);
      }
    };
  }, [teacherId, autoSyncEnabled, autoSyncInterval]);

  const fetchSyncHistory = async () => {
    try {
      const response = await fetch(`/api/teacher/${teacherId}/sync-history`);
      if (response.ok) {
        const data = await response.json();
        setSyncHistory(data.history || []);
      }
    } catch (error) {
      console.error('获取同步历史失败:', error);
    }
  };

  const fetchLastSyncTime = async () => {
    try {
      const response = await fetch(`/api/teacher/${teacherId}/last-sync`);
      if (response.ok) {
        const data = await response.json();
        setLastSyncTime(data.last_sync_time);
      }
    } catch (error) {
      console.error('获取最后同步时间失败:', error);
    }
  };

  const fetchSyncStats = async () => {
    try {
      const response = await fetch(`/api/teacher/${teacherId}/sync-stats`);
      if (response.ok) {
        const data = await response.json();
        setSyncStats(data.stats || {
          totalRecords: 0,
          newRecords: 0,
          updatedRecords: 0,
          failedRecords: 0
        });
      }
    } catch (error) {
      console.error('获取同步统计失败:', error);
    }
  };

  const startAutoSync = () => {
    if (autoSyncTimerRef.current) {
      clearInterval(autoSyncTimerRef.current);
    }
    
    autoSyncTimerRef.current = setInterval(() => {
      if (autoSyncEnabled) {
        startDataSync();
      }
    }, autoSyncInterval * 60 * 1000); // 转换为毫秒
  };

  const startDataSync = async (isRetry = false) => {
    if (syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    setSyncProgress(0);
    setLoading(true);
    
    if (isRetry) {
      retryCountRef.current++;
    } else {
      retryCountRef.current = 0;
    }

    try {
      // 模拟同步过程
      const syncSteps = [
        { name: '课程记录', progress: 20 },
        { name: '学生进度', progress: 40 },
        { name: '教学材料', progress: 60 },
        { name: '评估数据', progress: 80 },
        { name: '反馈信息', progress: 90 },
        { name: '课程安排', progress: 100 }
      ];

      for (let i = 0; i < syncSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setSyncProgress(syncSteps[i].progress);
      }

      // 执行实际同步
      const response = await fetch('/api/teacher/data-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacherId,
          data_types: Object.keys(selectedData).filter(key => selectedData[key]),
          sync_only_new: syncOnlyNewData,
          retry_count: retryCountRef.current
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSyncStatus('completed');
        setLastSyncTime(new Date().toISOString());
        setSyncStats(result.stats || syncStats);
        
        // 刷新数据
        fetchSyncHistory();
        fetchSyncStats();
        
        showNotification('数据同步完成', 'success');
      } else {
        throw new Error('同步失败');
      }
    } catch (error) {
      console.error('数据同步失败:', error);
      setSyncStatus('error');
      
      // 如果启用了重试且未达到最大重试次数
      if (retryOnFailure && retryCountRef.current < maxRetries) {
        showNotification(`同步失败，${3}秒后重试...`, 'warning');
        setTimeout(() => {
          startDataSync(true);
        }, 3000);
      } else {
        showNotification('数据同步失败', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const stopSync = () => {
    setSyncStatus('idle');
    setSyncProgress(0);
    showNotification('同步已停止', 'info');
  };

  const toggleAutoSync = () => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    
    if (newValue) {
      startAutoSync();
      showNotification('自动同步已启用', 'success');
    } else {
      if (autoSyncTimerRef.current) {
        clearInterval(autoSyncTimerRef.current);
      }
      showNotification('自动同步已禁用', 'info');
    }
  };

  const getSyncStatusText = (status) => {
    switch (status) {
      case 'idle': return '待同步';
      case 'syncing': return '同步中';
      case 'completed': return '已完成';
      case 'error': return '同步失败';
      default: return '未知';
    }
  };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'idle': return '#9E9E9E';
      case 'syncing': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="teacher-data-sync">
      {/* 头部信息 */}
      <div className="sync-header">
        <div className="header-left">
          <h2>🔄 数据同步管理</h2>
          <p>同步课程数据、学生进度和教学材料</p>
        </div>
        <div className="header-right">
          <div className="last-sync-info">
            <span>最后同步: </span>
            <span className="last-sync-time">
              {lastSyncTime ? 
                new Date(lastSyncTime).toLocaleString('zh-CN') : 
                '从未同步'
              }
            </span>
          </div>
        </div>
      </div>

      {/* 同步状态概览 */}
      <div className="sync-overview">
        <div className="overview-card">
          <div className="overview-icon">📊</div>
          <div className="overview-content">
            <h3>同步状态</h3>
            <p className={`status-text ${syncStatus}`}>
              {getSyncStatusText(syncStatus)}
            </p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">⏰</div>
          <div className="overview-content">
            <h3>自动同步</h3>
            <p className={autoSyncEnabled ? 'enabled' : 'disabled'}>
              {autoSyncEnabled ? '已启用' : '已禁用'}
            </p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">📈</div>
          <div className="overview-content">
            <h3>同步进度</h3>
            <p>{syncProgress}%</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">📋</div>
          <div className="overview-content">
            <h3>总记录数</h3>
            <p>{syncStats.totalRecords}</p>
          </div>
        </div>
      </div>

      {/* 数据选择 */}
      <div className="data-selection">
        <h3>选择要同步的数据类型</h3>
        <div className="data-options">
          <label className="data-option">
            <input
              type="checkbox"
              checked={selectedData.courseRecords}
              onChange={(e) => setSelectedData(prev => ({
                ...prev,
                courseRecords: e.target.checked
              }))}
            />
            <span className="option-text">📝 课程记录</span>
            <span className="option-desc">包含课程安排、完成情况等</span>
          </label>

          <label className="data-option">
            <input
              type="checkbox"
              checked={selectedData.studentProgress}
              onChange={(e) => setSelectedData(prev => ({
                ...prev,
                studentProgress: e.target.checked
              }))}
            />
            <span className="option-text">📊 学生进度</span>
            <span className="option-desc">学习进度、作业完成情况</span>
          </label>

          <label className="data-option">
            <input
              type="checkbox"
              checked={selectedData.teachingMaterials}
              onChange={(e) => setSelectedData(prev => ({
                ...prev,
                teachingMaterials: e.target.checked
              }))}
            />
            <span className="option-text">📚 教学材料</span>
            <span className="option-desc">课件、练习题、参考资料</span>
          </label>

          <label className="data-option">
            <input
              type="checkbox"
              checked={selectedData.assessments}
              onChange={(e) => setSelectedData(prev => ({
                ...prev,
                assessments: e.target.checked
              }))}
            />
            <span className="option-text">📋 评估数据</span>
            <span className="option-desc">测试成绩、评价反馈</span>
          </label>

          <label className="data-option">
            <input
              type="checkbox"
              checked={selectedData.feedback}
              onChange={(e) => setSelectedData(prev => ({
                ...prev,
                feedback: e.target.checked
              }))}
            />
            <span className="option-text">💬 反馈信息</span>
            <span className="option-desc">学生反馈、家长沟通记录</span>
          </label>

          <label className="data-option">
            <input
              type="checkbox"
              checked={selectedData.schedules}
              onChange={(e) => setSelectedData(prev => ({
                ...prev,
                schedules: e.target.checked
              }))}
            />
            <span className="option-text">📅 课程安排</span>
            <span className="option-desc">时间表、预约信息</span>
          </label>
        </div>
      </div>

      {/* 同步控制 */}
      <div className="sync-controls">
        <div className="control-buttons">
          <button
            onClick={() => startDataSync()}
            disabled={syncStatus === 'syncing'}
            className={`sync-btn ${syncStatus === 'syncing' ? 'syncing' : ''}`}
          >
            {syncStatus === 'syncing' ? '🔄 同步中...' : '🚀 开始同步'}
          </button>

          {syncStatus === 'syncing' && (
            <button onClick={stopSync} className="stop-btn">
              ⏹️ 停止同步
            </button>
          )}
        </div>

        {syncStatus === 'syncing' && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
            <span className="progress-text">{syncProgress}%</span>
          </div>
        )}
      </div>

      {/* 同步统计 */}
      <div className="sync-statistics">
        <h3>📊 同步统计</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{syncStats.totalRecords}</div>
            <div className="stat-label">总记录数</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{syncStats.newRecords}</div>
            <div className="stat-label">新增记录</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{syncStats.updatedRecords}</div>
            <div className="stat-label">更新记录</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{syncStats.failedRecords}</div>
            <div className="stat-label">失败记录</div>
          </div>
        </div>
      </div>

      {/* 自动同步设置 */}
      <div className="auto-sync-settings">
        <h3>⚙️ 自动同步设置</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <label className="setting-label">
              <input 
                type="checkbox" 
                checked={autoSyncEnabled}
                onChange={toggleAutoSync}
              />
              <span>启用自动同步</span>
            </label>
            <p className="setting-desc">定期自动同步数据</p>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>同步间隔:</span>
              <select 
                value={autoSyncInterval}
                onChange={(e) => setAutoSyncInterval(Number(e.target.value))}
                disabled={!autoSyncEnabled}
              >
                <option value={15}>15分钟</option>
                <option value={30}>30分钟</option>
                <option value={60}>1小时</option>
                <option value={120}>2小时</option>
              </select>
            </label>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <input 
                type="checkbox" 
                checked={retryOnFailure}
                onChange={(e) => setRetryOnFailure(e.target.checked)}
              />
              <span>同步失败时重试</span>
            </label>
            <p className="setting-desc">最多重试{maxRetries}次</p>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <input 
                type="checkbox" 
                checked={syncOnlyNewData}
                onChange={(e) => setSyncOnlyNewData(e.target.checked)}
              />
              <span>仅同步新数据</span>
            </label>
            <p className="setting-desc">节省网络流量和时间</p>
          </div>
        </div>
      </div>

      {/* 同步历史 */}
      <div className="sync-history">
        <div className="section-header">
          <h3>📋 同步历史</h3>
          <button onClick={fetchSyncHistory} className="refresh-btn">
            🔄 刷新
          </button>
        </div>
        
        {syncHistory.length === 0 ? (
          <div className="no-history">
            <p>暂无同步历史记录</p>
          </div>
        ) : (
          <div className="history-list">
            {syncHistory.map(record => (
              <div key={record.id} className="history-item">
                <div className="history-header">
                  <span className="sync-time">
                    {new Date(record.sync_time).toLocaleString('zh-CN')}
                  </span>
                  <span 
                    className={`sync-status ${record.status}`}
                    style={{ backgroundColor: getSyncStatusColor(record.status) }}
                  >
                    {getSyncStatusText(record.status)}
                  </span>
                </div>
                
                <div className="history-details">
                  <div className="detail-row">
                    <span className="label">数据类型:</span>
                    <span className="value">{record.data_types.join(', ')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">同步记录数:</span>
                    <span className="value">{record.record_count}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">数据大小:</span>
                    <span className="value">{formatFileSize(record.data_size || 0)}</span>
                  </div>
                  {record.error_message && (
                    <div className="detail-row error">
                      <span className="label">错误信息:</span>
                      <span className="value error-message">{record.error_message}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">处理中...</div>
        </div>
      )}
    </div>
  );
};

export default TeacherDataSync;
