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
        { icon: '✏️', text: '写作', href: '#writing' },
        { icon: '📊', text: '统计', href: '#stats' },
        { icon: '👤', text: '我的', href: '#profile' }
      ],
      onItemClick: (index, item) => {
        const pageMap = {
          0: 'home',
          1: 'study',
          2: 'writing',
          3: 'stats',
          4: 'profile'
        };
        
        const page = pageMap[index];
        if (page) {
          this.showPage(page);
        }
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
        this.handleQuickAction(action);
      }
    });

    // 初始化学习中心页面
    this.pages['study'] = new StudyPage({
      container: document.getElementById('study-section'),
      onCourseSelect: (course) => {
        console.log('课程选择:', course);
        if (course === 'modern-reading') {
          this.showPage('modern-reading');
        } else if (course === 'classical-chinese') {
          this.showPage('classical-chinese');
        }
      }
    });

    // 初始化现代文阅读页面
    this.pages['modern-reading'] = new ModernReadingPage({
      container: document.getElementById('modern-reading-section'),
      onBack: () => {
        this.showPage('study');
      }
    });

    // 初始化文言文阅读页面
    this.pages['classical-chinese'] = new ClassicalChinesePage({
      container: document.getElementById('classical-chinese-section'),
      onBack: () => {
        this.showPage('study');
      }
    });

    console.log('📄 所有页面初始化完成', Object.keys(this.pages));
  }

  createPageContainers() {
    console.log('🏗️ 开始创建页面容器');
    const mainContainer = document.createElement('main');
    mainContainer.className = 'main-content';
    
    const pageContainers = [
      'home-section',
      'study-section', 
      'modern-reading-section',
      'classical-chinese-section',
      'writing-section',
      'stats-section',
      'profile-section'
    ];

    pageContainers.forEach(id => {
      const container = document.createElement('div');
      container.id = id;
      container.className = 'page-container';
      container.style.display = 'none';
      mainContainer.appendChild(container);
      console.log(`📦 创建容器: ${id}`);
    });

    // 插入到body中，在导航之前
    const nav = document.querySelector('.bottom-nav');
    if (nav) {
      document.body.insertBefore(mainContainer, nav);
    } else {
      document.body.appendChild(mainContainer);
    }
    
    console.log('✅ 页面容器创建完成');
  }

  setupRouting() {
    // 监听浏览器前进后退
    window.addEventListener('popstate', (e) => {
      const page = e.state?.page || 'home';
      this.showPage(page, false);
    });

    // 监听hash变化
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash && this.pages[hash]) {
        this.showPage(hash);
      }
    });
  }

  showPage(pageName, pushState = true) {
    // 隐藏所有页面
    document.querySelectorAll('.page-container').forEach(container => {
      container.style.display = 'none';
    });

    // 显示目标页面
    const targetContainer = document.getElementById(`${pageName}-section`);
    if (targetContainer) {
      targetContainer.style.display = 'block';
    }

    // 渲染页面内容
    if (this.pages[pageName]) {
      console.log(`🎨 渲染页面: ${pageName}`);
      this.pages[pageName].render();
    } else {
      console.error(`❌ 页面不存在: ${pageName}`, Object.keys(this.pages));
    }

    // 更新导航状态
    const navIndexMap = {
      'home': 0,
      'study': 1,
      'writing': 2,
      'stats': 3,
      'profile': 4
    };

    if (navIndexMap.hasOwnProperty(pageName)) {
      this.components.navigation.setActive(navIndexMap[pageName]);
    }

    // 更新头部
    this.updateHeader(pageName);

    // 更新浏览器历史（仅在非file协议时启用）
    if (pushState && window.location.protocol !== 'file:') {
      try {
        const url = pageName === 'home' ? '/' : `#${pageName}`;
        history.pushState({ page: pageName }, '', url);
      } catch (error) {
        console.warn('无法更新URL:', error);
      }
    }

    this.currentPage = pageName;
    console.log(`📄 切换到页面: ${pageName}`);
  }

  updateHeader(pageName) {
    const headerTitles = {
      'home': 'AI语文学习助手',
      'study': '学习中心',
      'modern-reading': '现代文阅读',
      'classical-chinese': '文言文阅读',
      'writing': '写作训练',
      'stats': '学习统计',
      'profile': '个人中心'
    };

    const showBackButton = ['modern-reading', 'classical-chinese'].includes(pageName);
    
    this.components.header.destroy();
    this.components.header = new Header({
      title: headerTitles[pageName] || 'AI语文学习助手',
      showBackButton,
      onBack: () => {
        if (pageName === 'modern-reading' || pageName === 'classical-chinese') {
          this.showPage('study');
        }
      },
      container: document.body
    });
    this.components.header.render();
  }

  handleQuickAction(action) {
    const actionMap = {
      'daily-tasks': () => console.log('打开每日任务'),
      'error-review': () => console.log('打开错题复习'),
      'homework': () => console.log('打开我的作业'),
      'ai-tutor': () => console.log('启动AI陪练')
    };

    if (actionMap[action]) {
      actionMap[action]();
    }
  }

  // 全局错误处理
  handleError(error) {
    console.error('应用错误:', error);
    // 这里可以添加错误上报逻辑
  }
}

// 应用启动
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

// 全局错误捕获
window.addEventListener('error', (e) => {
  if (window.app) {
    window.app.handleError(e.error);
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (window.app) {
    window.app.handleError(e.reason);
  }
});