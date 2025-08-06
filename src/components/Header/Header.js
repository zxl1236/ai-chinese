/**
 * 头部组件
 * 支持普通头部和带返回按钮的头部
 */
class Header {
  constructor(options = {}) {
    this.title = options.title || 'AI语文学习助手';
    this.showBackButton = options.showBackButton || false;
    this.onBack = options.onBack || null;
    this.container = options.container || document.body;
  }

  render() {
    const headerHTML = `
      <div class="header ${this.showBackButton ? 'header-with-back' : ''}">
        ${this.showBackButton ? `
          <button class="header-back-btn" id="header-back-btn">
            ←
          </button>
        ` : ''}
        <span class="header-title">📘 ${this.title}</span>
      </div>
    `;

    // 如果已存在头部，先移除
    const existingHeader = this.container.querySelector('.header');
    if (existingHeader) {
      existingHeader.remove();
    }

    // 插入新头部
    this.container.insertAdjacentHTML('afterbegin', headerHTML);

    // 绑定事件
    this.bindEvents();

    return this.container.querySelector('.header');
  }

  bindEvents() {
    if (this.showBackButton && this.onBack) {
      const backBtn = this.container.querySelector('#header-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', this.onBack);
      }
    }
  }

  updateTitle(newTitle) {
    this.title = newTitle;
    const titleElement = this.container.querySelector('.header-title');
    if (titleElement) {
      titleElement.textContent = `📘 ${newTitle}`;
    }
  }

  destroy() {
    const header = this.container.querySelector('.header');
    if (header) {
      header.remove();
    }
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Header;
} else {
  window.Header = Header;
}