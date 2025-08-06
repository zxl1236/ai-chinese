/**
 * 底部导航组件
 * 支持多个导航项，活跃状态管理，徽章显示
 */
class Navigation {
  constructor(options = {}) {
    this.items = options.items || this.getDefaultItems();
    this.activeIndex = options.activeIndex || 0;
    this.onItemClick = options.onItemClick || null;
    this.container = options.container || document.body;
  }

  getDefaultItems() {
    return [
      { icon: '🏠', text: '首页', href: '#home', badge: null },
      { icon: '📚', text: '学习', href: '#study', badge: null },
      { icon: '✏️', text: '写作', href: '#writing', badge: null },
      { icon: '📊', text: '统计', href: '#stats', badge: null },
      { icon: '👤', text: '我的', href: '#profile', badge: null }
    ];
  }

  render() {
    const navHTML = `
      <div class="bottom-nav">
        ${this.items.map((item, index) => `
          <a href="${item.href}" class="nav-item ${index === this.activeIndex ? 'active' : ''}" data-index="${index}">
            <div class="nav-icon">
              ${item.icon}
              ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            </div>
            <div class="nav-text">${item.text}</div>
          </a>
        `).join('')}
      </div>
    `;

    // 如果已存在导航，先移除
    const existingNav = this.container.querySelector('.bottom-nav');
    if (existingNav) {
      existingNav.remove();
    }

    // 插入新导航
    this.container.insertAdjacentHTML('beforeend', navHTML);

    // 绑定事件
    this.bindEvents();

    return this.container.querySelector('.bottom-nav');
  }

  bindEvents() {
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActive(index);
        
        if (this.onItemClick) {
          this.onItemClick(index, this.items[index], e);
        }
      });
    });
  }

  setActive(index) {
    this.activeIndex = index;
    
    // 更新活跃状态
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  setBadge(index, badge) {
    if (index >= 0 && index < this.items.length) {
      this.items[index].badge = badge;
      
      // 更新DOM中的徽章
      const navItem = this.container.querySelector(`.nav-item[data-index="${index}"]`);
      if (navItem) {
        const existingBadge = navItem.querySelector('.nav-badge');
        const iconContainer = navItem.querySelector('.nav-icon');
        
        if (existingBadge) {
          existingBadge.remove();
        }
        
        if (badge) {
          iconContainer.insertAdjacentHTML('beforeend', `<span class="nav-badge">${badge}</span>`);
        }
      }
    }
  }

  updateItem(index, newItem) {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = { ...this.items[index], ...newItem };
      this.render(); // 重新渲染
    }
  }

  destroy() {
    const nav = this.container.querySelector('.bottom-nav');
    if (nav) {
      nav.remove();
    }
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Navigation;
} else {
  window.Navigation = Navigation;
}