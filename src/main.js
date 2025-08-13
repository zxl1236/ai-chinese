/**
 * 应用主入口文件
 * 负责初始化应用、路由管理、组件协调
 */
class App {
  constructor() {
    this.currentPage = 'study';
    this.components = {};
    this.pages = {};
    
    this.init();
  }

  async init() {
    try {
      // 等待DOM加载完成
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // 初始化组件
      this.initComponents();
      
      // 创建页面容器
      this.createPageContainers();
      
      // 初始化页面
      this.initPages();
      
      // 设置路由
      this.setupRouting();
      
      // 显示初始页面
      this.showPage('study', false);
      
      // 隐藏加载动画
      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.display = 'none';
      }
      
      console.log('✅ AI语文学习助手初始化完成');
    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      
      // 即使初始化失败也要隐藏加载动画
      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.display = 'none';
      }
    }
  }

  initComponents() {
    // 初始化头部组件
    this.components.header = new Header({
      title: 'AI语文学习助手',
      container: document.body
    });

    // 初始化底部导航组件
    this.components.navigation = new Navigation({
      items: [
        { icon: '🏠', text: '首页', href: '#home' },
        { icon: '📚', text: '学习', href: '#study' },
        { icon: '👨‍🏫', text: '陪练', href: '#tutor' },
        { icon: '📊', text: '统计', href: '#stats' },
        { icon: '👤', text: '我的', href: '#profile' }
      ],
      onItemClick: (index, item) => {
        const pageMap = {
          0: 'home',
          1: 'study',
          2: 'tutor',
          3: 'stats',
          4: 'profile'
        };
        const page = pageMap[index];
        if (page === 'tutor') {
          this.showPage('tutor');
          return;
        }
        if (page) this.showPage(page);
      },
      container: document.body
    });

    // 渲染组件
    this.components.header.render();
    this.components.navigation.render();
  }

  initPages() {
    // 初始化首页
    this.pages['home'] = new HomePage({
      container: document.getElementById('home-section'),
      onRecommendationClick: (type) => {
        console.log('推荐点击:', type);
        if (type === 'reading') {
          this.showPage('modern-reading');
        }
      },
      onQuickActionClick: (action) => {
        console.log('快捷功能点击:', action);
        if (action === 'ai-tutor') {
          this.showPage('tutor');
        }
      }
    });

    // 初始化学习页面 - 修复回调函数名
    this.pages['study'] = new StudyPage({
      container: document.getElementById('study-section'),
      onCourseSelect: (courseType) => {
        console.log('课程选择:', courseType);
        this.showPage(courseType);
      }
    });

    // 初始化现代文阅读页面
    this.pages['modern-reading'] = new ModernReadingPage({
      container: document.getElementById('modern-reading-section'),
      onBack: () => {
        this.showPage('study');
      }
    });

    // 初始化古诗文页面
    this.pages['classical-chinese'] = new ClassicalChinesePage({
      container: document.getElementById('classical-chinese-section'),
      onBack: () => {
        this.showPage('study');
      }
    });

    // 初始化陪练页面
    this.pages['tutor'] = new TutorPage({
      container: document.getElementById('tutor-section'),
      onBack: () => {
        this.showPage('study');
      }
    });

    // 初始化统计页面
    this.pages['stats'] = new StatsPage({
      container: document.getElementById('stats-section'),
      onBack: () => {
        this.showPage('study');
      }
    });

    // 渲染所有页面
    Object.values(this.pages).forEach(page => {
      if (page && typeof page.render === 'function') {
        page.render();
      }
    });
  }

  createPageContainers() {
    const body = document.body;
    
    // 清除现有内容（除了head中的内容）
    const existingMain = document.querySelector('main');
    if (existingMain) {
      existingMain.remove();
    }

    // 创建主容器
    const main = document.createElement('main');
    main.className = 'main-container';
    
    // 创建各页面容器
    const containers = [
      'home-section',
      'study-section', 
      'modern-reading-section',
      'classical-chinese-section',
      'tutor-section',
      'stats-section',
      'profile-section'
    ];
    
    containers.forEach(containerId => {
      const section = document.createElement('section');
      section.id = containerId;
      section.className = 'page-section';
      section.style.display = 'none';
      main.appendChild(section);
    });
    
    body.appendChild(main);
  }

  setupRouting() {
    // 监听hash变化
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        this.showPage(hash);
      }
    });

    // 监听后退按钮
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.page) {
        this.showPage(event.state.page, false);
      }
    });
  }

  showPage(pageName, addToHistory = true) {
    console.log('切换页面:', pageName);
    
    if (this.pages[pageName]) {
      // 隐藏所有页面
      Object.keys(this.pages).forEach(key => {
        const container = document.getElementById(`${key}-section`);
        if (container) {
          container.style.display = 'none';
        }
      });
      
      // 显示目标页面
      const targetContainer = document.getElementById(`${pageName}-section`);
      if (targetContainer) {
        targetContainer.style.display = 'block';
        this.currentPage = pageName;
        
        // 添加到浏览器历史记录
        if (addToHistory) {
          window.history.pushState({ page: pageName }, '', `#${pageName}`);
        }
      }
      
      // 如果页面有特殊的显示逻辑，执行它
      const page = this.pages[pageName];
      if (page && typeof page.onShow === 'function') {
        page.onShow();
      }
    } else {
      console.warn('页面不存在:', pageName);
    }
  }
}

// 创建陪练页面类
class TutorPage {
  constructor(options = {}) {
    this.container = options.container;
    this.onBack = options.onBack || (() => {});
    this.readingGuidanceSystem = null;
  }

  render() {
    if (!this.container) return;

    const tutorHTML = `
      <div class="tutor-page">
        <!-- 页面头部 -->
        <div class="page-header">
          <button class="back-btn" onclick="app.showPage('study')">
            <span class="back-icon">←</span>
            <span class="back-text">返回</span>
          </button>
          <h1 class="page-title">
            <span class="title-icon">👨‍🏫</span>
            AI智能陪练
          </h1>
          <div class="page-subtitle">个性化阅读训练指导</div>
        </div>

        <!-- 陪练模式选择 -->
        <div class="tutor-mode-selection">
          <div class="section-title">🎯 选择陪练模式</div>
          <div class="mode-cards">
            <div class="mode-card recommended" data-mode="reading-guidance">
              <div class="mode-header">
                <div class="mode-icon">📖</div>
                <div class="mode-badge">推荐</div>
              </div>
              <div class="mode-content">
                <h3>圣博六步法训练</h3>
                <p>系统化的阅读方法训练</p>
                <div class="mode-features">
                  <span class="feature">✓ 分步指导</span>
                  <span class="feature">✓ 公式训练</span>
                  <span class="feature">✓ 实时反馈</span>
                </div>
              </div>
              <button class="mode-btn primary">开始训练</button>
            </div>

            <div class="mode-card" data-mode="ai-chat">
              <div class="mode-header">
                <div class="mode-icon">🤖</div>
              </div>
              <div class="mode-content">
                <h3>AI智能问答</h3>
                <p>随时提问，即时解答</p>
                <div class="mode-features">
                  <span class="feature">✓ 24小时在线</span>
                  <span class="feature">✓ 智能分析</span>
                  <span class="feature">✓ 个性化建议</span>
                </div>
              </div>
              <button class="mode-btn secondary">立即体验</button>
            </div>

            <div class="mode-card" data-mode="human-tutor">
              <div class="mode-header">
                <div class="mode-icon">👩‍🏫</div>
                <div class="tutor-status offline">离线</div>
              </div>
              <div class="mode-content">
                <h3>真人陪练</h3>
                <p>专业老师一对一指导</p>
                <div class="mode-features">
                  <span class="feature">✓ 专业指导</span>
                  <span class="feature">✓ 深度交流</span>
                  <span class="feature">✓ 定制方案</span>
                </div>
              </div>
              <button class="mode-btn tertiary">预约陪练</button>
            </div>
          </div>
        </div>

        <!-- 训练记录 -->
        <div class="training-history">
          <div class="section-title">📊 训练记录</div>
          <div class="history-cards">
            <div class="history-card">
              <div class="history-header">
                <div class="history-date">今天</div>
                <div class="history-time">14:30</div>
              </div>
              <div class="history-content">
                <div class="history-title">《江上》阅读训练</div>
                <div class="history-progress">
                  <span class="progress-text">完成 4/6 步</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 67%"></div>
                  </div>
                </div>
              </div>
              <button class="continue-btn">继续训练</button>
            </div>

            <div class="history-card completed">
              <div class="history-header">
                <div class="history-date">昨天</div>
                <div class="history-time">16:45</div>
              </div>
              <div class="history-content">
                <div class="history-title">散文阅读理解</div>
                <div class="history-score">
                  <span class="score-text">得分: 85分</span>
                  <span class="score-badge excellent">优秀</span>
                </div>
              </div>
              <button class="review-btn">查看详情</button>
            </div>

            <div class="history-card">
              <div class="history-header">
                <div class="history-date">3天前</div>
                <div class="history-time">10:20</div>
              </div>
              <div class="history-content">
                <div class="history-title">议论文结构分析</div>
                <div class="history-score">
                  <span class="score-text">得分: 78分</span>
                  <span class="score-badge good">良好</span>
                </div>
              </div>
              <button class="review-btn">查看详情</button>
            </div>
          </div>
        </div>

        <!-- 陪练系统容器 -->
        <div id="reading-guidance-container" style="display: none;">
          <!-- 圣博六步法训练系统将在这里动态加载 -->
        </div>
      </div>
    `;

    this.container.innerHTML = tutorHTML;
    this.bindEvents();
  }

  bindEvents() {
    // 绑定陪练模式选择事件
    const modeCards = this.container.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
      const modeBtn = card.querySelector('.mode-btn');
      if (modeBtn) {
        modeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const mode = card.getAttribute('data-mode');
          this.handleModeSelect(mode);
        });
      }
    });
  }

  handleModeSelect(mode) {
    console.log('选择陪练模式:', mode);
    
    if (mode === 'reading-guidance') {
      this.startReadingGuidance();
    } else if (mode === 'ai-chat') {
      // 启动AI问答模式
      alert('AI问答功能开发中...');
    } else if (mode === 'human-tutor') {
      // 启动真人陪练模式
      alert('真人陪练功能开发中...');
    }
  }

  async startReadingGuidance() {
    try {
      const container = document.getElementById('reading-guidance-container');
      if (!container) {
        console.error('找不到阅读指导容器');
        return;
      }

      // 隐藏陪练选择界面
      const tutorPage = this.container.querySelector('.tutor-page');
      if (tutorPage) {
        tutorPage.style.display = 'none';
      }

      // 显示阅读指导容器
      container.style.display = 'block';

      // 初始化圣博六步法系统
      if (!this.readingGuidanceSystem) {
        if (typeof ReadingGuidanceSystem !== 'undefined') {
          this.readingGuidanceSystem = new ReadingGuidanceSystem({
            container: container,
            onBack: () => {
              // 返回陪练选择界面
              container.style.display = 'none';
              if (tutorPage) {
                tutorPage.style.display = 'block';
              }
            }
          });
          
          await this.readingGuidanceSystem.init();
        } else {
          console.error('ReadingGuidanceSystem 未加载');
          alert('阅读指导系统加载失败，请刷新页面重试');
        }
      } else {
        this.readingGuidanceSystem.show();
      }
    } catch (error) {
      console.error('启动阅读指导失败:', error);
      alert('启动阅读指导失败，请重试');
    }
  }

  onShow() {
    // 页面显示时的逻辑
    console.log('陪练页面显示');
  }
}

// 创建统计页面类
class StatsPage {
  constructor(options = {}) {
    this.container = options.container;
    this.onBack = options.onBack || (() => {});
  }

  render() {
    if (!this.container) return;

    const statsHTML = `
      <div class="stats-page">
        <!-- 页面头部 -->
        <div class="page-header">
          <button class="back-btn" onclick="app.showPage('study')">
            <span class="back-icon">←</span>
            <span class="back-text">返回</span>
          </button>
          <h1 class="page-title">
            <span class="title-icon">📊</span>
            学习统计
          </h1>
          <div class="page-subtitle">详细的学习数据分析</div>
        </div>

        <!-- 学习概览统计 -->
        <div class="learning-stats">
          <div class="section-title">📈 学习统计</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">⏱️</div>
              <div class="stat-content">
                <div class="stat-number">2.5</div>
                <div class="stat-label">小时</div>
                <div class="stat-desc">本周训练时长</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-number">12</div>
                <div class="stat-label">次</div>
                <div class="stat-desc">完成训练次数</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <div class="stat-number">82</div>
                <div class="stat-label">分</div>
                <div class="stat-desc">平均训练得分</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-content">
                <div class="stat-number">7</div>
                <div class="stat-label">天</div>
                <div class="stat-desc">连续训练天数</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细数据分析 -->
        <div class="detailed-stats">
          <div class="section-title">📊 详细分析</div>
          
          <!-- 能力分析 -->
          <div class="ability-analysis">
            <h3>能力分析</h3>
            <div class="ability-chart">
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
            </div>
          </div>

          <!-- 学习趋势 -->
          <div class="trend-analysis">
            <h3>学习趋势</h3>
            <div class="trend-chart">
              <div class="trend-item">
                <div class="trend-title">本周学习时长</div>
                <div class="trend-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 60%"></div>
                  </div>
                  <span class="progress-text">6/10 小时</span>
                </div>
              </div>
              
              <div class="trend-item">
                <div class="trend-title">错题复习完成度</div>
                <div class="trend-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 75%"></div>
                  </div>
                  <span class="progress-text">15/20 题</span>
                </div>
              </div>
              
              <div class="trend-item">
                <div class="trend-title">作业完成率</div>
                <div class="trend-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 90%"></div>
                  </div>
                  <span class="progress-text">18/20 份</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 学习建议 -->
          <div class="learning-suggestions">
            <h3>💡 学习建议</h3>
            <div class="suggestion-list">
              <div class="suggestion-item">
                <div class="suggestion-icon">📚</div>
                <div class="suggestion-content">
                  <div class="suggestion-title">加强古诗文学习</div>
                  <div class="suggestion-desc">建议每天安排15分钟进行古诗文练习</div>
                </div>
              </div>
              
              <div class="suggestion-item">
                <div class="suggestion-icon">✍️</div>
                <div class="suggestion-content">
                  <div class="suggestion-title">提升写作技巧</div>
                  <div class="suggestion-desc">多练习议论文写作，注重逻辑性和论证力</div>
                </div>
              </div>
              
              <div class="suggestion-item">
                <div class="suggestion-icon">📈</div>
                <div class="suggestion-content">
                  <div class="suggestion-title">保持学习节奏</div>
                  <div class="suggestion-desc">当前学习状态良好，继续保持每日学习习惯</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = statsHTML;
    this.bindEvents();
  }

  bindEvents() {
    // 可以添加统计页面相关的事件绑定
    console.log('统计页面事件绑定完成');
  }

  onShow() {
    // 页面显示时的逻辑
    console.log('统计页面显示');
  }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
});

// 全局作用域暴露app实例
window.app = app;