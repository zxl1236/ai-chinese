import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../../common/ConfirmDialog';
import './ContentManagement.css';

const ContentManagement = ({ user, onUpdate }) => {
  const [modules, setModules] = useState([]);
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showDeleteModuleDialog, setShowDeleteModuleDialog] = useState(false);
  const [showDeleteContentDialog, setShowDeleteContentDialog] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState(null);
  const [deletingContentId, setDeletingContentId] = useState(null);

  // 模块表单状态
  const [moduleForm, setModuleForm] = useState({
    module_id: '',
    title: '',
    description: '',
    icon: '📚',
    category: 'basic',
    difficulty: 1,
    is_active: true
  });

  // 内容表单状态
  const [contentForm, setContentForm] = useState({
    module_id: '',
    content_type: 'text',
    title: '',
    content: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/study-modules');
      if (response.ok) {
        const data = await response.json();
        if (data.allModules) {
          setModules(data.allModules);
          // 为每个模块获取内容
          data.allModules.forEach(module => {
            fetchModuleContents(module.id);
          });
        }
      }
    } catch (error) {
      console.error('获取学习模块失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleContents = async (moduleId) => {
    try {
      const response = await fetch(`/api/module/${moduleId}/content`);
      if (response.ok) {
        const data = await response.json();
        setContents(prev => ({
          ...prev,
          [moduleId]: data.contents || []
        }));
      }
    } catch (error) {
      console.error(`获取模块 ${moduleId} 内容失败:`, error);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('学习模块创建成功！');
          setShowModuleForm(false);
          resetModuleForm();
          fetchModules();
          onUpdate && onUpdate();
        } else {
          alert(`创建失败: ${data.error}`);
        }
      } else {
        alert('创建失败，请检查网络连接');
      }
    } catch (error) {
      console.error('创建学习模块失败:', error);
      alert('创建失败，请稍后重试');
    }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/modules/${editingModule.module_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('学习模块更新成功！');
          setEditingModule(null);
          resetModuleForm();
          fetchModules();
          onUpdate && onUpdate();
        } else {
          alert(`更新失败: ${data.error}`);
        }
      } else {
        alert('更新失败，请检查网络连接');
      }
    } catch (error) {
      console.error('更新学习模块失败:', error);
      alert('更新失败，请稍后重试');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    setDeletingModuleId(moduleId);
    setShowDeleteModuleDialog(true);
  };

  const confirmDeleteModule = async () => {
    try {
      const response = await fetch(`/api/admin/modules/${deletingModuleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('学习模块删除成功！');
          fetchModules();
          onUpdate && onUpdate();
        } else {
          alert(`删除失败: ${data.error}`);
        }
      } else {
        alert('删除失败，请检查网络连接');
      }
    } catch (error) {
      console.error('删除学习模块失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setShowDeleteModuleDialog(false);
      setDeletingModuleId(null);
    }
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('学习内容创建成功！');
          setShowContentForm(false);
          resetContentForm();
          fetchModuleContents(contentForm.module_id);
          onUpdate && onUpdate();
        } else {
          alert(`创建失败: ${data.error}`);
        }
      } else {
        alert('创建失败，请检查网络连接');
      }
    } catch (error) {
      console.error('创建学习内容失败:', error);
      alert('创建失败，请稍后重试');
    }
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/contents/${editingContent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('学习内容更新成功！');
          setEditingContent(null);
          resetContentForm();
          fetchModuleContents(contentForm.module_id);
          onUpdate && onUpdate();
        } else {
          alert(`更新失败: ${data.error}`);
        }
      } else {
        alert('更新失败，请检查网络连接');
      }
    } catch (error) {
      console.error('更新学习内容失败:', error);
      alert('更新失败，请稍后重试');
    }
  };

  const handleDeleteContent = async (contentId, moduleId) => {
    setDeletingContentId({ contentId, moduleId });
    setShowDeleteContentDialog(true);
  };

  const confirmDeleteContent = async () => {
    try {
      const response = await fetch(`/api/admin/contents/${deletingContentId.contentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('学习内容删除成功！');
          fetchModuleContents(deletingContentId.moduleId);
          onUpdate && onUpdate();
        } else {
          alert(`删除失败: ${data.error}`);
        }
      } else {
        alert('删除失败，请检查网络连接');
      }
    } catch (error) {
      console.error('删除学习内容失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setShowDeleteContentDialog(false);
      setDeletingContentId(null);
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setModuleForm({
      module_id: module.id,
      title: module.title,
      description: module.description || '',
      icon: module.icon || '📚',
      category: module.category || 'basic',
      difficulty: module.difficulty || 1,
      is_active: module.is_active !== false
    });
    setShowModuleForm(true);
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setContentForm({
      module_id: content.module_id,
      content_type: content.content_type,
      title: content.title,
      content: content.content,
      order_index: content.order_index || 0,
      is_active: content.is_active !== false
    });
    setShowContentForm(true);
  };

  const resetModuleForm = () => {
    setModuleForm({
      module_id: '',
      title: '',
      description: '',
      icon: '📚',
      category: 'basic',
      difficulty: 1,
      is_active: true
    });
    setEditingModule(null);
  };

  const resetContentForm = () => {
    setContentForm({
      module_id: '',
      content_type: 'text',
      title: '',
      content: '',
      order_index: 0,
      is_active: true
    });
    setEditingContent(null);
  };

  const getCategoryText = (category) => {
    const categoryMap = {
      'basic': '基础训练',
      'reading': '阅读理解',
      'writing': '写作表达',
      'speaking': '语音交流',
      'knowledge': '文学常识'
    };
    return categoryMap[category] || category;
  };

  const getContentTypeText = (type) => {
    const typeMap = {
      'text': '文本',
      'image': '图片',
      'video': '视频',
      'exercise': '练习'
    };
    return typeMap[type] || type;
  };

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty);
  };

  return (
    <div className="content-management">
      <div className="management-header">
        <h2>📚 内容管理</h2>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => {
              setShowModuleForm(true);
              resetModuleForm();
            }}
          >
            ➕ 新建模块
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              setShowContentForm(true);
              resetContentForm();
            }}
          >
            📝 新建内容
          </button>
        </div>
      </div>

      {/* 模块管理 */}
      <div className="modules-section">
        <h3>📋 学习模块 ({modules.length})</h3>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>加载中...</p>
          </div>
        ) : modules.length > 0 ? (
          <div className="modules-grid">
            {modules.map((module) => (
              <div key={module.id} className="module-card">
                <div className="module-header">
                  <div className="module-icon">{module.icon}</div>
                  <div className="module-info">
                    <h4 className="module-title">{module.title}</h4>
                    <div className="module-meta">
                      <span className="module-category">{getCategoryText(module.category)}</span>
                      <span className="module-difficulty">{getDifficultyStars(module.difficulty)}</span>
                    </div>
                  </div>
                  <div className="module-status">
                    <span className={`status-badge ${module.is_active ? 'active' : 'inactive'}`}>
                      {module.is_active ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>

                <div className="module-description">
                  {module.description || '暂无描述'}
                </div>

                <div className="module-stats">
                  <span className="stat-item">
                    📝 {contents[module.id]?.length || 0} 个内容
                  </span>
                </div>

                <div className="module-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditModule(module)}
                  >
                    ✏️ 编辑
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    🗑️ 删除
                  </button>
                  <button 
                    className="btn-view"
                    onClick={() => setSelectedModule(module)}
                  >
                    👁️ 查看内容
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>暂无学习模块</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setShowModuleForm(true);
                resetModuleForm();
              }}
            >
              ➕ 创建第一个模块
            </button>
          </div>
        )}
      </div>

      {/* 内容管理 */}
      {selectedModule && (
        <div className="contents-section">
          <div className="contents-header">
            <h3>📝 {selectedModule.title} - 学习内容</h3>
            <button 
              className="btn-primary"
              onClick={() => {
                setContentForm(prev => ({ ...prev, module_id: selectedModule.id }));
                setShowContentForm(true);
                resetContentForm();
              }}
            >
              ➕ 添加内容
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setSelectedModule(null)}
            >
              ✕ 关闭
            </button>
          </div>

          <div className="contents-list">
            {contents[selectedModule.id]?.length > 0 ? (
              contents[selectedModule.id].map((content) => (
                <div key={content.id} className="content-item">
                  <div className="content-header">
                    <h4 className="content-title">{content.title}</h4>
                    <div className="content-meta">
                      <span className="content-type">{getContentTypeText(content.content_type)}</span>
                      <span className="content-order">#{content.order_index}</span>
                      <span className={`content-status ${content.is_active ? 'active' : 'inactive'}`}>
                        {content.is_active ? '启用' : '禁用'}
                      </span>
                    </div>
                  </div>

                  <div className="content-preview">
                    {content.content_type === 'text' && (
                      <p className="text-preview">
                        {content.content.length > 100 
                          ? content.content.substring(0, 100) + '...' 
                          : content.content
                        }
                      </p>
                    )}
                    {content.content_type === 'image' && (
                      <div className="image-preview">
                        <span>🖼️ 图片内容</span>
                      </div>
                    )}
                    {content.content_type === 'video' && (
                      <div className="video-preview">
                        <span>🎥 视频内容</span>
                      </div>
                    )}
                    {content.content_type === 'exercise' && (
                      <div className="exercise-preview">
                        <span>🎯 练习内容</span>
                      </div>
                    )}
                  </div>

                  <div className="content-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditContent(content)}
                    >
                      ✏️ 编辑
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteContent(content.id, selectedModule.id)}
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>该模块暂无学习内容</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setContentForm(prev => ({ ...prev, module_id: selectedModule.id }));
                    setShowContentForm(true);
                    resetContentForm();
                  }}
                >
                  ➕ 添加第一个内容
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 模块表单 */}
      {showModuleForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingModule ? '✏️ 编辑模块' : '➕ 新建模块'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModuleForm(false);
                  resetModuleForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingModule ? handleUpdateModule : handleCreateModule}>
              <div className="form-grid">
                <div className="form-group">
                  <label>模块ID *</label>
                  <input 
                    type="text"
                    required
                    value={moduleForm.module_id}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, module_id: e.target.value }))}
                    placeholder="输入模块ID，如：word-foundation"
                    disabled={!!editingModule}
                  />
                </div>

                <div className="form-group">
                  <label>模块标题 *</label>
                  <input 
                    type="text"
                    required
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入模块标题"
                  />
                </div>

                <div className="form-group">
                  <label>模块图标</label>
                  <input 
                    type="text"
                    value={moduleForm.icon}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="输入Emoji图标"
                  />
                </div>

                <div className="form-group">
                  <label>模块类别</label>
                  <select 
                    value={moduleForm.category}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="basic">基础训练</option>
                    <option value="reading">阅读理解</option>
                    <option value="writing">写作表达</option>
                    <option value="speaking">语音交流</option>
                    <option value="knowledge">文学常识</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>难度等级</label>
                  <select 
                    value={moduleForm.difficulty}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                  >
                    <option value={1}>1星 - 入门</option>
                    <option value={2}>2星 - 基础</option>
                    <option value={3}>3星 - 进阶</option>
                    <option value={4}>4星 - 高级</option>
                    <option value={5}>5星 - 专家</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>状态</label>
                  <select 
                    value={moduleForm.is_active}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                  >
                    <option value={true}>启用</option>
                    <option value={false}>禁用</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>模块描述</label>
                  <textarea 
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入模块描述"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingModule ? '💾 保存修改' : '✅ 创建模块'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowModuleForm(false);
                    resetModuleForm();
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 内容表单 */}
      {showContentForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingContent ? '✏️ 编辑内容' : '📝 新建内容'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowContentForm(false);
                  resetContentForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingContent ? handleUpdateContent : handleCreateContent}>
              <div className="form-grid">
                <div className="form-group">
                  <label>所属模块 *</label>
                  <select 
                    required
                    value={contentForm.module_id}
                    onChange={(e) => setContentForm(prev => ({ ...prev, module_id: e.target.value }))}
                    disabled={!!editingContent}
                  >
                    <option value="">选择模块</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>内容类型</label>
                  <select 
                    value={contentForm.content_type}
                    onChange={(e) => setContentForm(prev => ({ ...prev, content_type: e.target.value }))}
                  >
                    <option value="text">文本</option>
                    <option value="image">图片</option>
                    <option value="video">视频</option>
                    <option value="exercise">练习</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>内容标题 *</label>
                  <input 
                    type="text"
                    required
                    value={contentForm.title}
                    onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入内容标题"
                  />
                </div>

                <div className="form-group">
                  <label>显示顺序</label>
                  <input 
                    type="number"
                    min="0"
                    value={contentForm.order_index}
                    onChange={(e) => setContentForm(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="form-group">
                  <label>状态</label>
                  <select 
                    value={contentForm.is_active}
                    onChange={(e) => setContentForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                  >
                    <option value={true}>启用</option>
                    <option value={false}>禁用</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>内容详情 *</label>
                  <textarea 
                    required
                    value={contentForm.content}
                    onChange={(e) => setContentForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={
                      contentForm.content_type === 'text' ? '输入文本内容' :
                      contentForm.content_type === 'image' ? '输入图片URL或描述' :
                      contentForm.content_type === 'video' ? '输入视频URL或嵌入代码' :
                      '输入练习内容（JSON格式）'
                    }
                    rows="6"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingContent ? '💾 保存修改' : '✅ 创建内容'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowContentForm(false);
                    resetContentForm();
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除模块确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteModuleDialog}
        title="删除学习模块"
        message="确定要删除这个学习模块吗？此操作不可撤销。"
        onConfirm={confirmDeleteModule}
        onCancel={() => {
          setShowDeleteModuleDialog(false);
          setDeletingModuleId(null);
        }}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />

      {/* 删除内容确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteContentDialog}
        title="删除学习内容"
        message="确定要删除这个学习内容吗？此操作不可撤销。"
        onConfirm={confirmDeleteContent}
        onCancel={() => {
          setShowDeleteContentDialog(false);
          setDeletingContentId(null);
        }}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
};

export default ContentManagement;
