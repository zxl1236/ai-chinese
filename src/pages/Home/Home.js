/**
 * 首页组件
 * 包含AI推荐、学习概览、快捷功能、能力分析等模块
 */
class HomePage {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('home-section');
    this.onRecommendationClick = options.onRecommendationClick || null;
    this.onQuickActionClick = options.onQuickActionClick || null;
  }

  render() {
    const homeHTML = `
      <!-- AI智能推荐区 -->
      <div class="recommendation-section">
        <div class="section-title">🤖 AI为你推荐</div>
        <div class="recommendation-card">
          <div class="rec-header">
            <span class="rec-title">今日重点训练</span>
            <span class="rec-badge">个性化</span>
          </div>
          <div class="rec-content">
            <div class="rec-item">
              <span class="rec-icon">📖</span>
              <div class="rec-text">
                <div class="rec-main">现代文阅读理解</div>
                <div class="rec-sub">基于你的薄弱点分析</div>
              </div>
              <button type="button" class="rec-btn" data-type="reading" aria-label="开始现代文阅读训练">开始</button>
            </div>
            <div class="rec-item">
              <span class="rec-icon">✍️</span>
              <div class="rec-text">
                <div class="rec-main">议论文写作练习</div>
                <div class="rec-sub">提升论证逻辑能力</div>
              </div>
              <button type="button" class="rec-btn" data-type="writing" aria-label="开始议论文写作练习">开始</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习概览卡片 -->
      <div class="overview-section">
        <div class="section-title">📊 学习概览</div>
        <div class="overview-grid">
          <div class="overview-card primary">
            <div class="overview-icon">🎯</div>
            <div class="overview-content">
              <div class="overview-number">75%</div>
              <div class="overview-label">今日完成度</div>
              <div class="overview-detail">还差2个任务</div>
            </div>
          </div>
          <div class="overview-card">
            <div class="overview-icon">🏆</div>
            <div class="overview-content">
              <div class="overview-number">12</div>
              <div class="overview-label">连续学习天数</div>
              <div class="overview-detail">超越85%同学</div>
            </div>
          </div>
          <div class="overview-card">
            <div class="overview-icon">📈</div>
            <div class="overview-content">
              <div class="overview-number">+8分</div>
              <div class="overview-label">本周提升</div>
              <div class="overview-detail">阅读理解能力</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷功能区 -->
      <div class="quick-actions">
        <div class="section-title">🚀 快捷功能</div>
        <div class="card-grid">
          <div class="card clickable" data-action="daily-tasks">
            <div class="card-title"><span class="card-icon">📅</span> 每日任务</div>
            <div class="card-subtitle">3/5 已完成</div>
            <div class="card-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: 60%"></div>
              </div>
            </div>
          </div>
          <div class="card clickable" data-action="error-review">
            <div class="card-title"><span class="card-icon">🗂</span> 错题复习</div>
            <div class="card-subtitle">12个待复习</div>
            <div class="card-badge urgent">紧急</div>
          </div>
          <div class="card clickable" data-action="homework">
            <div class="card-title"><span class="card-icon">📝</span> 我的作业</div>
            <div class="card-subtitle">2份待完成</div>
            <div class="card-deadline">明天截止</div>
          </div>
          <div class="card clickable" data-action="ai-tutor">
            <div class="card-title"><span class="card-icon">👩‍🏫</span> AI陪练</div>
            <div class="card-subtitle">智能一对一</div>
            <div class="card-status online">在线</div>
          </div>
        </div>
      </div>

      <!-- 能力分析区 -->
      <div class="ability-analysis">
        <div class="section-title">📈 能力分析报告</div>
        <div class="ability-container">
          <div class="ability-header">
            <div class="ability-score">
              <div class="score-number">78</div>
              <div class="score-label">综合评分</div>
              <div class="score-trend">↗️ +5</div>
            </div>
            <div class="ability-level">
              <div class="level-badge intermediate">中级</div>
              <div class="level-desc">继续加油，即将突破到高级！</div>
            </div>
          </div>
          
          <div class="ability-details">
            <div class="ability-item excellent">
              <div class="ability-info">
                <span class="ability-icon">📖</span>
                <span class="ability-name">阅读理解</span>
                <span class="ability-level-text">优秀</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" style="width: 85%"></div>
              </div>
              <div class="ability-score-text">85分</div>
            </div>
            
            <div class="ability-item good">
              <div class="ability-info">
                <span class="ability-icon">📝</span>
                <span class="ability-name">写作表达</span>
                <span class="ability-level-text">良好</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" style="width: 72%"></div>
              </div>
              <div class="ability-score-text">72分</div>
            </div>
            
            <div class="ability-item needs-improvement">
              <div class="ability-info">
                <span class="ability-icon">🏛️</span>
                <span class="ability-name">古诗文</span>
                <span class="ability-level-text">待提升</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" style="width: 58%"></div>
              </div>
              <div class="ability-score-text">58分</div>
            </div>
            
            <div class="ability-item good">
              <div class="ability-info">
                <span class="ability-icon">🎭</span>
                <span class="ability-name">修辞运用</span>
                <span class="ability-level-text">良好</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" style="width: 76%"></div>
              </div>
              <div class="ability-score-text">76分</div>
            </div>
            
            <div class="ability-item average">
              <div class="ability-info">
                <span class="ability-icon">💭</span>
                <span class="ability-name">逻辑思维</span>
                <span class="ability-level-text">一般</span>
              </div>
              <div class="ability-bar">
                <div class="ability-fill" style="width: 65%"></div>
              </div>
              <div class="ability-score-text">65分</div>
            </div>
          </div>
          
          <div class="ability-suggestions">
            <div class="suggestion-title">💡 提升建议</div>
            <div class="suggestion-list">
              <div class="suggestion-item">
                <span class="suggestion-dot"></span>
                <span>多练习古诗文翻译和理解，建议每天15分钟</span>
              </div>
              <div class="suggestion-item">
                <span class="suggestion-dot"></span>
                <span>加强逻辑思维训练，多做议论文分析</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (this.container) {
      this.container.innerHTML = homeHTML;
      this.bindEvents();
      this.initAnimations();
    }

    return this.container;
  }

  bindEvents() {
    // 推荐按钮事件
    const recBtns = this.container.querySelectorAll('.rec-btn');
    recBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = btn.getAttribute('data-type');
        this.handleRecommendationClick(type, btn);
      });
    });

    // 快捷功能卡片事件
    const quickCards = this.container.querySelectorAll('.card.clickable');
    quickCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const action = card.getAttribute('data-action');
        this.handleQuickActionClick(action, card);
      });
    });

    // 学习概览卡片悬停效果
    const overviewCards = this.container.querySelectorAll('.overview-card');
    overviewCards.forEach(card => {
      card.addEventListener('mouseenter', this.handleOverviewHover.bind(this));
    });
  }

  handleRecommendationClick(type, btn) {
    // 按钮反馈动效
    btn.textContent = '已开始';
    btn.style.background = '#4caf50';
    btn.style.color = 'white';
    
    setTimeout(() => {
      btn.textContent = '开始';
      btn.style.background = 'white';
      btn.style.color = '#667eea';
    }, 2000);

    if (this.onRecommendationClick) {
      this.onRecommendationClick(type);
    }
  }

  handleQuickActionClick(action, card) {
    // 点击动效
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);

    if (this.onQuickActionClick) {
      this.onQuickActionClick(action);
    }
  }

  handleOverviewHover(e) {
    const card = e.currentTarget;
    const number = card.querySelector('.overview-number');
    
    if (number && !number.classList.contains('animating')) {
      number.classList.add('animating');
      const originalText = number.textContent;
      
      // 数字跳动效果
      let count = 0;
      const target = parseInt(originalText) || 0;
      const increment = target / 10;
      
      const counter = setInterval(() => {
        count += increment;
        if (count >= target) {
          number.textContent = originalText;
          clearInterval(counter);
          number.classList.remove('animating');
        } else {
          number.textContent = Math.floor(count) + originalText.replace(/\d+/g, '').trim();
        }
      }, 50);
    }
  }

  initAnimations() {
    // 能力条动画
    const abilityFills = this.container.querySelectorAll('.ability-fill');
    abilityFills.forEach(fill => {
      const targetWidth = fill.style.width;
      fill.style.width = '0%';
      
      setTimeout(() => {
        fill.style.width = targetWidth;
      }, 500);
    });

    // 页面加载动画
    const sections = this.container.querySelectorAll('.recommendation-section, .overview-section, .quick-actions, .ability-analysis');
    sections.forEach((section, index) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        section.style.transition = 'all 0.5s ease';
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  updateData(data) {
    // 更新页面数据的方法
    if (data.progress) {
      const progressElement = this.container.querySelector('.overview-number');
      if (progressElement) {
        progressElement.textContent = data.progress + '%';
      }
    }
    
    // 可以添加更多数据更新逻辑
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomePage;
} else {
  window.HomePage = HomePage;
}