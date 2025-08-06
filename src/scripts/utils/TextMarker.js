/**
 * 文本标记工具类 - 支持圈点、高亮、下划线等标记功能
 */
class TextMarker {
  constructor(container) {
    this.container = container;
    this.isMarking = false;
    this.currentMode = 'circle'; // circle, highlight, underline, note
    this.markings = new Map(); // 存储标记数据
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
    
    // 显示提示
    this.showToast(this.isMarking ? '标记模式已开启，选择文字进行标记' : '标记模式已关闭');
  }

  handleTextSelection(range) {
    const selectedText = range.toString().trim();
    if (selectedText.length === 0) return;

    const markId = `mark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 检查选择的内容类型
    const selectionContext = this.getSelectionContext(range);
    
    if (this.currentMode === 'note') {
      this.handleNoteMarking(range, markId, selectedText, selectionContext);
    } else {
      this.applyTextMarking(range, markId, selectedText, selectionContext);
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
    const span = document.createElement('span');
    span.className = `text-mark text-mark-${this.currentMode}`;
    span.dataset.markId = markId;
    span.dataset.markMode = this.currentMode;
    span.dataset.markContext = context;
    
    try {
      range.surroundContents(span);
      
      // 保存标记数据
      this.markings.set(markId, {
        id: markId,
        mode: this.currentMode,
        text: selectedText,
        context: context,
        timestamp: Date.now()
      });

      const contextText = this.getContextText(context);
      this.showToast(`已在${contextText}${this.getModeText()}标记: "${selectedText.length > 10 ? selectedText.substr(0, 10) + '...' : selectedText}"`);
      
    } catch (error) {
      console.warn('标记应用失败:', error);
      this.showToast('标记失败，请重新选择文字');
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
    if (confirm('确定要清除所有标记吗？')) {
      const marks = this.container.querySelectorAll('.text-mark');
      marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.insertBefore(document.createTextNode(mark.textContent), mark);
        parent.removeChild(mark);
        parent.normalize();
      });
      
      this.markings.clear();
      this.showToast('所有标记已清除');
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
      setTimeout(() => document.body.removeChild(toast), 300);
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
        this.container.innerHTML = markingsData.html;
        
        // 重建标记映射
        this.markings.clear();
        markingsData.markings.forEach(marking => {
          this.markings.set(marking.id, marking);
        });
        
        this.showToast('标记已恢复');
        return true;
      }
    } catch (error) {
      console.warn('标记恢复失败:', error);
    }
    return false;
  }
}

// 导出类
window.TextMarker = TextMarker;