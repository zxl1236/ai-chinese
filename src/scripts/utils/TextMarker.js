/**
 * 文本标记工具类 - 支持圈点、高亮、下划线等标记功能
 */
class TextMarker {
  constructor(container) {
    this.container = container;
    this.isMarking = false;
    this.currentMode = 'circle'; // circle, highlight, underline, note
    this.markings = new Map(); // 存储标记数据
    this.eventListeners = new Map(); // 自定义事件监听器
    this.config = {
      enableAutoSave: true,
      saveInterval: 10000,
      showTooltips: true
    };
    this.init();
  }

  init() {
    this.createToolbar();
    this.bindEvents();
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'text-marker-toolbar';
    toolbar.innerHTML = `
      <div class="marker-tools">
        <button class="marker-btn ${this.currentMode === 'circle' ? 'active' : ''}" data-mode="circle" title="圈圈标记">
          ⭕ 圈圈
        </button>
        <button class="marker-btn ${this.currentMode === 'highlight' ? 'active' : ''}" data-mode="highlight" title="高亮标记">
          🖍️ 高亮
        </button>
        <button class="marker-btn ${this.currentMode === 'underline' ? 'active' : ''}" data-mode="underline" title="下划线">
          📏 下划线
        </button>
        <button class="marker-btn ${this.currentMode === 'note' ? 'active' : ''}" data-mode="note" title="添加笔记">
          📝 笔记
        </button>
        <button class="marker-btn clear-btn" data-action="clear" title="清除所有标记">
          🧹 清除
        </button>
        <button class="marker-btn toggle-btn ${this.isMarking ? 'active' : ''}" data-action="toggle" title="开启/关闭标记">
          ${this.isMarking ? '🎯 标记中' : '✏️ 开始标记'}
        </button>
      </div>
    `;
    
    // 插入到容器顶部
    this.container.insertBefore(toolbar, this.container.firstChild);
    this.toolbar = toolbar;
  }

  bindEvents() {
    // 工具栏事件
    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.marker-btn');
      if (!btn) return;

      const mode = btn.dataset.mode;
      const action = btn.dataset.action;

      if (mode) {
        this.setMode(mode);
      } else if (action === 'toggle') {
        this.toggleMarking();
      } else if (action === 'clear') {
        this.clearAllMarkings();
      }
    });

    // 文本选择事件
    document.addEventListener('mouseup', (e) => {
      if (!this.isMarking) return;
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        
        // 检查选择是否在标记容器内
        if (this.container.contains(range.commonAncestorContainer)) {
          this.handleTextSelection(range);
        }
      }
    });
  }

  setMode(mode) {
    this.currentMode = mode;
    
    // 更新按钮状态
    this.toolbar.querySelectorAll('.marker-btn[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  toggleMarking() {
    this.isMarking = !this.isMarking;
    
    const toggleBtn = this.toolbar.querySelector('[data-action="toggle"]');
    toggleBtn.classList.toggle('active', this.isMarking);
    toggleBtn.innerHTML = this.isMarking ? '🎯 标记中' : '✏️ 开始标记';
    
    // 更新容器样式
    this.container.classList.toggle('marking-mode', this.isMarking);
    
    // 触发自定义事件
    this.dispatchEvent('markingToggled', { isMarking: this.isMarking });
    
    // 显示提示
    this.showToast(this.isMarking ? '标记模式已开启，选择文字进行标记' : '标记模式已关闭');
  }

  handleTextSelection(range) {
    const selectedText = range.toString().trim();
    if (selectedText.length === 0) {
      this.showToast('请选择有效文本');
      return;
    }

    // 检查是否已经有标记
    if (this.isRangeMarked(range)) {
      this.showToast('该文本已经被标记');
      window.getSelection().removeAllRanges();
      return;
    }

    const markId = `mark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 检查选择的内容类型
    const selectionContext = this.getSelectionContext(range);
    
    try {
      if (this.currentMode === 'note') {
        this.handleNoteMarking(range, markId, selectedText, selectionContext);
      } else {
        this.applyTextMarking(range, markId, selectedText, selectionContext);
      }
    } catch (error) {
      console.warn('标记应用失败:', error);
      this.showToast('标记失败，请重新选择');
    }

    // 清除选择
    window.getSelection().removeAllRanges();
  }

  getSelectionContext(range) {
    const commonAncestor = range.commonAncestorContainer;
    let context = 'article'; // 默认为文章
    
    // 检查是否在题目区域
    let element = commonAncestor.nodeType === Node.TEXT_NODE ? 
                  commonAncestor.parentElement : commonAncestor;
    
    while (element && element !== this.container) {
      if (element.classList.contains('practice-question')) {
        context = 'question';
        break;
      } else if (element.classList.contains('practice-options')) {
        context = 'options';
        break;
      } else if (element.classList.contains('practice-article-text')) {
        context = 'article';
        break;
      }
      element = element.parentElement;
    }
    
    return context;
  }

  applyTextMarking(range, markId, selectedText, context = 'article') {
    // 检查range是否跨越多个元素
    if (this.isComplexRange(range)) {
      this.applyComplexMarking(range, markId, selectedText, context);
      return;
    }
    
    const span = document.createElement('span');
    span.className = `text-mark text-mark-${this.currentMode}`;
    span.dataset.markId = markId;
    span.dataset.markMode = this.currentMode;
    span.dataset.markContext = context;
    span.title = `${this.getModeText()}标记: ${selectedText}`;
    
    try {
      range.surroundContents(span);
      
      // 为标记添加点击事件
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleMarkClick(markId, span);
      });
      
      // 保存标记数据
      this.markings.set(markId, {
        id: markId,
        mode: this.currentMode,
        text: selectedText,
        context: context,
        timestamp: Date.now(),
        element: span
      });

      const contextText = this.getContextText(context);
      this.showToast(`已在${contextText}${this.getModeText()}标记: "${selectedText.length > 15 ? selectedText.substr(0, 15) + '...' : selectedText}"`);
      
      // 触发标记添加事件
      this.dispatchEvent('markingAdded', { markId, text: selectedText, context });
      
    } catch (error) {
      console.warn('标记应用失败:', error);
      throw error;
    }
  }

  handleNoteMarking(range, markId, selectedText, context = 'article') {
    const noteText = prompt(`为 "${selectedText}" 添加笔记:`);
    if (!noteText) return;

    const span = document.createElement('span');
    span.className = 'text-mark text-mark-note';
    span.dataset.markId = markId;
    span.dataset.markMode = 'note';
    span.dataset.markContext = context;
    span.dataset.noteText = noteText;
    span.title = `笔记: ${noteText}`;
    
    try {
      range.surroundContents(span);
      
      // 保存标记数据
      this.markings.set(markId, {
        id: markId,
        mode: 'note',
        text: selectedText,
        context: context,
        note: noteText,
        timestamp: Date.now()
      });

      const contextText = this.getContextText(context);
      this.showToast(`已在${contextText}添加笔记: "${selectedText}"`);
      
    } catch (error) {
      console.warn('笔记添加失败:', error);
      this.showToast('笔记添加失败，请重新选择文字');
    }
  }

  getContextText(context) {
    const contextTexts = {
      article: '文章中',
      question: '题目中',
      options: '选项中'
    };
    return contextTexts[context] || '内容中';
  }

  clearAllMarkings() {
    const markCount = this.markings.size;
    if (markCount === 0) {
      this.showToast('没有可清除的标记');
      return;
    }
    
    if (confirm(`确定要清除所有 ${markCount} 个标记吗？`)) {
      const marks = this.container.querySelectorAll('.text-mark');
      marks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.insertBefore(document.createTextNode(mark.textContent), mark);
          parent.removeChild(mark);
          parent.normalize();
        }
      });
      
      this.markings.clear();
      this.showToast(`已清除 ${markCount} 个标记`);
      
      // 触发清除事件
      this.dispatchEvent('markingsCleared', { count: markCount });
    }
  }

  getModeText() {
    const modeTexts = {
      circle: '圈圈',
      highlight: '高亮',
      underline: '下划线',
      note: '笔记'
    };
    return modeTexts[this.currentMode] || '';
  }

  showToast(message) {
    if (!this.config.showTooltips) return;
    
    // 清理之前的提示
    const existingToasts = document.querySelectorAll('.marker-toast');
    existingToasts.forEach(toast => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
    
    // 创建提示框
    const toast = document.createElement('div');
    toast.className = 'marker-toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自动隐藏
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2000);
  }

  // 获取所有标记数据
  getMarkings() {
    return Array.from(this.markings.values());
  }

  // 保存标记到本地存储
  saveMarkings(key) {
    const markingsData = {
      markings: this.getMarkings(),
      html: this.container.innerHTML
    };
    localStorage.setItem(`text_markings_${key}`, JSON.stringify(markingsData));
  }

  // 从本地存储恢复标记
  loadMarkings(key) {
    try {
      const data = localStorage.getItem(`text_markings_${key}`);
      if (data) {
        const markingsData = JSON.parse(data);
        
        // 只恢复标记数据，不更改HTML结构
        this.markings.clear();
        markingsData.markings.forEach(marking => {
          this.markings.set(marking.id, marking);
        });
        
        // 重新应用所有标记
        this.reapplyMarkings();
        
        if (this.config.showTooltips) {
          this.showToast(`恢复了 ${markingsData.markings.length} 个标记`);
        }
        return true;
      }
    } catch (error) {
      console.warn('标记恢复失败:', error);
    }
    return false;
  }

  // 重新应用所有标记
  reapplyMarkings() {
    // 清除现有标记
    const existingMarks = this.container.querySelectorAll('.text-mark');
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      parent.insertBefore(document.createTextNode(mark.textContent), mark);
      parent.removeChild(mark);
      parent.normalize();
    });
    
    // TODO: 重新应用标记逻辑将在后续版本中实现
    console.log('标记重新应用功能将在后续版本中实现');
  }

  // 事件系统
  addEventListener(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  dispatchEvent(event, detail) {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler({ type: event, detail });
        } catch (error) {
          console.warn(`事件处理器错误 (${event}):`, error);
        }
      });
    }
  }

  // 检查范围是否已经被标记
  isRangeMarked(range) {
    const container = range.commonAncestorContainer;
    let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
    
    while (element && element !== this.container) {
      if (element.classList && element.classList.contains('text-mark')) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  // 检查是否为复杂范围（跨越多个元素）
  isComplexRange(range) {
    return range.startContainer !== range.endContainer;
  }

  // 处理复杂范围标记
  applyComplexMarking(range, markId, selectedText, context) {
    // 简化处理：将复杂选择转换为简单标记
    const span = document.createElement('span');
    span.className = `text-mark text-mark-${this.currentMode}`;
    span.dataset.markId = markId;
    span.dataset.markMode = this.currentMode;
    span.dataset.markContext = context;
    span.title = `${this.getModeText()}标记: ${selectedText}`;
    
    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      
      // 保存数据
      this.markings.set(markId, {
        id: markId,
        mode: this.currentMode,
        text: selectedText,
        context: context,
        timestamp: Date.now(),
        element: span,
        complex: true
      });
      
      const contextText = this.getContextText(context);
      this.showToast(`已在${contextText}${this.getModeText()}标记: "${selectedText.length > 15 ? selectedText.substr(0, 15) + '...' : selectedText}"`);
      
    } catch (error) {
      console.warn('复杂标记失败:', error);
      throw error;
    }
  }

  // 处理标记点击
  handleMarkClick(markId, element) {
    const marking = this.markings.get(markId);
    if (!marking) return;
    
    const action = confirm(`是否删除这个${this.getModeText()}标记？\n\n内容: "${marking.text}"`);
    if (action) {
      this.removeMark(markId);
    }
  }

  // 删除单个标记
  removeMark(markId) {
    const marking = this.markings.get(markId);
    if (!marking) return;
    
    const element = marking.element || this.container.querySelector(`[data-mark-id="${markId}"]`);
    if (element && element.parentNode) {
      const parent = element.parentNode;
      parent.insertBefore(document.createTextNode(element.textContent), element);
      parent.removeChild(element);
      parent.normalize();
    }
    
    this.markings.delete(markId);
    this.showToast(`已删除${this.getModeText()}标记`);
    
    // 触发删除事件
    this.dispatchEvent('markingRemoved', { markId, text: marking.text });
  }
}

// 导出类
window.TextMarker = TextMarker;