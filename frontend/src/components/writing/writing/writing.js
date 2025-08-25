// 中考作文训练模块
class WritingModule {
    constructor(container = null) {
        this.container = container;
        this.currentCategory = '全命题作文';
        this.currentSubCategory = null;
        this.currentTopic = null;
        this.drafts = this.loadDrafts();
        this.autoSaveTimer = null;
        
        // 获取配置
        this.config = window.WritingConfig || {
            get: () => false,
            log: () => {},
            getAPIConfig: () => ({ enabled: false, baseURL: '', timeout: 5000 }),
            getUIConfig: () => ({ showDataSource: true, autoSaveInterval: 2000 })
        };

        this.sidebarCollapsed = false;

        // 分类对应的标题和图标
        this.categoryConfig = {
            '全命题作文': {
                title: '📋 全命题作文训练',
                subcategories: ['成长体验类', '情感感悟类', '生活写实类']
            },
            '半命题作文': {
                title: '📝 半命题作文训练',
                subcategories: ['前置空白类', '后置空白类', '中间空白类']
            },
            '话题作文': {
                title: '💭 话题作文训练',
                subcategories: ['情感话题', '成长话题', '生活话题']
            },
            '材料作文': {
                title: '📄 材料作文训练',
                subcategories: ['寓言故事类', '名言警句类', '时事热点类']
            },
            '应用文': {
                title: '📧 应用文训练',
                subcategories: []
            }
        };

        this.init();
    }

    createHTML() {
        if (!this.container) {
            console.error('WritingModule: 没有提供容器');
            return;
        }

        this.container.innerHTML = `
            <div class="writing-layout-vertical">
                <!-- 侧边栏切换按钮（移动端） -->
                <button type="button" class="sidebar-toggle" id="sidebar-toggle" aria-label="切换题目列表">
                    <span id="toggle-icon">✕</span>
                </button>

                <!-- 左侧题目选择区域（折叠式） -->
                <div class="sidebar-collapsible active" id="sidebar">
                    <div class="sidebar-header">
                        <h2 id="current-category-title">📋 全命题作文训练</h2>
                        
                        <!-- 分类选择器 -->
                        <div class="category-selector">
                            <select id="writing-category" class="category-select">
                                <option value="全命题作文">全命题作文</option>
                                <option value="半命题作文">半命题作文</option>
                                <option value="话题作文">话题作文</option>
                                <option value="材料作文">材料作文</option>
                                <option value="应用文">应用文</option>
                            </select>
                        </div>

                        <!-- 子分类标签 -->
                        <div class="difficulty-tabs" id="difficulty-tabs">
                            <!-- 动态生成 -->
                        </div>


                    </div>

                    <!-- 题目列表 -->
                    <div class="topics-list" id="topics-list">
                        <!-- 动态生成 -->
                    </div>

                    <!-- 草稿管理 -->
                    <div class="drafts-section">
                        <div class="drafts-header">
                            <h3>📝 我的草稿 (<span id="drafts-count">0</span>)</h3>
                            <div class="drafts-controls">
                                <button type="button" id="drafts-toggle" class="drafts-toggle">查看所有草稿</button>
                                <button type="button" id="clear-all-drafts" class="clear-all-drafts" title="清除所有草稿">🗑️</button>
                            </div>
                        </div>
                        <div class="drafts-list" id="drafts-list" style="display: none;">
                            <!-- 动态生成 -->
                        </div>
                    </div>
                </div>

                <!-- 侧边栏遮罩（移动端） -->
                <div class="sidebar-overlay" id="sidebar-overlay"></div>

                <!-- 主内容区域 - 垂直布局 -->
                <div class="main-content-vertical" id="main-content">
                    <!-- 欢迎页面 -->
                    <div class="welcome-page" id="welcome-page">
                        <div class="welcome-content">
                            <h1>🌟 欢迎使用写作训练模块</h1>
                            <p>选择下方分类开始你的写作训练吧！</p>
                            
                            <!-- 分类卡片容器 -->
                            <div class="category-cards" id="category-cards">
                                <!-- 动态生成分类卡片 -->
                            </div>
                            
                            <div class="ai-intro">
                                <p>💡 本模块配备了智能AI写作助手，选择题目后即可获得个性化的写作指导</p>
                            </div>
                        </div>
                    </div>

                    <!-- 写作内容区域 - 垂直布局 -->
                    <div class="writing-content-vertical" id="writing-content" style="display: none;">
                        <!-- 上部：题目信息区域 -->
                        <div class="topic-info-section">
                            <div class="topic-info-card">
                                <h2 id="current-title">题目标题</h2>
                                <div class="topic-meta">
                                    <span id="current-description">题目描述</span>
                                </div>
                                <div class="topic-requirements">
                                    <h4>📋 写作要求：</h4>
                                    <div id="requirements">写作要求</div>
                                </div>
                            </div>
                        </div>

                        <!-- 中部：写作区域 -->
                        <div class="writing-area">
                            <!-- 标题输入 -->
                            <div class="title-section">
                                <input type="text" id="article-title" class="title-input" placeholder="请输入文章标题...">
                            </div>

                            <!-- 内容编辑器 -->
                            <div class="content-section">
                                <div id="content-editor" class="content-editor" contenteditable="true" 
                                     placeholder="开始你的写作...点击右侧AI助手获取智能指导"></div>
                            </div>

                            <!-- 状态栏 -->
                            <div class="status-bar">
                                <div class="status-left">
                                    <span id="word-count">字数: 0</span>
                                    <span id="save-status" class="save-status"></span>
                                    <span id="last-save-time" class="last-save-time"></span>
                                </div>
                                <div class="status-right">
                                    <button type="button" id="quick-save" class="quick-save-btn" title="快速保存">
                                        <span class="save-icon">💾</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 下部：操作按钮 -->
                        <div class="bottom-actions" id="bottom-actions">
                            <div class="action-buttons">
                                <button type="button" id="save-draft" class="btn btn-primary">
                                    <span class="btn-icon">💾</span>
                                    保存草稿
                                </button>
                                <button type="button" id="export-md" class="btn btn-secondary">
                                    <span class="btn-icon">📄</span>
                                    导出MD
                                </button>
                                <button type="button" id="clear-content" class="btn btn-danger">
                                    <span class="btn-icon">🗑️</span>
                                    清空内容
                                </button>
                                <button type="button" id="clear-drafts" class="btn btn-warning">
                                    <span class="btn-icon">🗂️</span>
                                    清理草稿
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 写作指导侧边栏 -->
                <div class="help-sidebar" id="help-sidebar">
                    <div class="help-content">
                        <div class="help-section">
                            <h3>💡 写作指导</h3>
                            <div id="tips-content" class="help-text">
                                选择题目后将显示写作指导
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h3>📋 写作提纲</h3>
                            <div id="outline-content" class="help-text">
                                选择题目后将显示写作提纲
                            </div>
                        </div>
                        
                        <div class="help-section" id="exam-tips-section" style="display: none;">
                            <h3>🎯 考试要点</h3>
                            <div id="exam-tips-help" class="help-text">
                                选择题目后将显示考试要点
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模态框已简化，写作指导请使用右侧的AI助手 -->
        `;
    }

    initializeElements() {
        const elements = {
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebar-overlay'),
            mainContent: document.getElementById('main-content'),
            sidebarToggle: document.getElementById('sidebar-toggle'),
            toggleIcon: document.getElementById('toggle-icon'),
            categoryTitle: document.getElementById('current-category-title'),
            categorySelect: document.getElementById('writing-category'),
            difficultyTabs: document.getElementById('difficulty-tabs'),
            topicsList: document.getElementById('topics-list'),
            writingContent: document.getElementById('writing-content'),
            bottomActions: document.getElementById('bottom-actions'),
            welcomePage: document.getElementById('welcome-page'),
            helpSidebar: document.getElementById('help-sidebar'),
            currentTitle: document.getElementById('current-title'),
            currentDescription: document.getElementById('current-description'),
            difficultyBadge: document.getElementById('difficulty-badge'),
            requirements: document.getElementById('requirements'),
            articleTitle: document.getElementById('article-title'),
            contentEditor: document.getElementById('content-editor'),
            wordCount: document.getElementById('word-count'),
            saveStatus: document.getElementById('save-status'),
            lastSaveTime: document.getElementById('last-save-time'),
            quickSaveBtn: document.getElementById('quick-save'),
            clearDraftsBtn: document.getElementById('clear-drafts'),
            clearAllDraftsBtn: document.getElementById('clear-all-drafts'),
            tipsContent: document.getElementById('tips-content'),
            outlineContent: document.getElementById('outline-content'),
            draftsList: document.getElementById('drafts-list'),
            draftsCount: document.getElementById('drafts-count'),
            imageInput: document.getElementById('image-input'),
            // 新增的导航元素
            navigationBreadcrumb: document.getElementById('navigation-breadcrumb'),
            categoryCards: document.getElementById('category-cards'),


        };
        return elements;
    }

    init() {
        // 首先创建HTML结构
        this.createHTML();
        
        // 然后初始化元素引用
        this.elements = this.initializeElements();
        
        this.setupEventListeners();
        this.loadWritingData();
        this.updateDraftsDisplay();
        this.showWelcomePage();
        
        // 显示加载状态
        this.showLoadingState();
    }



    async loadWritingData() {
        try {
            // 优先尝试从后端API获取数据
            const backendData = await this.fetchFromBackend();
            if (backendData) {
                this.writingData = backendData;
                this.showSuccessMessage('数据已从服务器加载');
                this.hideLoadingState();
                this.initializeUI();
                return;
            }
        } catch (error) {
            console.warn('后端数据加载失败，使用默认数据:', error);
        }

        // 检查全局写作题目数据是否已加载
        if (typeof writingPrompts !== 'undefined' && writingPrompts) {
            this.writingData = writingPrompts;
            this.hideLoadingState();
            this.initializeUI();
            return;
        }

        // 降级到默认数据
        this.writingData = this.getDefaultData();
        this.hideLoadingState();
        this.initializeUI();
        this.showInfoMessage('正在使用离线数据，部分功能可能受限');
        }

    async fetchFromBackend() {
        const apiConfig = this.config.getAPIConfig();
        
        // 如果配置中禁用了后端API，直接返回null使用默认数据
        if (!apiConfig.enabled) {
            this.config.log('后端API已禁用，使用默认数据', 'info');
            return null;
        }
        
        this.config.log('开始从后端获取写作题目数据', 'info');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);
            
            const response = await fetch(`${apiConfig.baseURL}/api/writing/topics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-App-Version': '1.0.0',
                    // 这里可以添加认证头
                    // 'Authorization': `Bearer ${this.getAuthToken()}`
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // 验证数据格式
            if (this.validateBackendData(data)) {
                this.config.log('后端数据获取成功', 'success');
                return data;
        } else {
                throw new Error('后端数据格式不正确');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                this.config.log(`API请求超时 (${apiConfig.timeout}ms)`, 'warn');
            } else {
                this.config.log(`后端数据获取失败: ${error.message}`, 'warn');
            }
            return null;
        }
    }

    validateBackendData(data) {
        // 验证后端数据的基本结构
        if (!data || typeof data !== 'object') return false;
        
        const requiredCategories = ['全命题作文', '半命题作文', '话题作文', '材料作文', '应用文'];
        return requiredCategories.every(category => 
            data.hasOwnProperty(category) && 
            (Array.isArray(data[category]) || typeof data[category] === 'object')
        );
    }

    initializeUI() {
        // 默认显示欢迎页面
        this.showWelcomePage();
        
        this.updateCategoryDisplay();
        this.renderCategoryCards();
        this.renderSubCategories();
        this.renderTopics();
    }

    showWelcomePage() {
        // 显示欢迎页面
        const welcomePage = document.getElementById('welcome-page');
        if (welcomePage) {
            welcomePage.style.display = 'block';
        }
        
        // 隐藏侧边栏
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
            sidebar.classList.remove('active');
        }
        
        // 隐藏顶部栏
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            topBar.style.display = 'none';
        }
    }

    setupEventListeners() {
        // 分类选择器
        if (this.elements.categorySelect) {
            this.elements.categorySelect.addEventListener('change', (e) => {
                this.switchCategory(e.target.value);
            });
        }

        // 子分类标签切换
        if (this.elements.difficultyTabs) {
            this.elements.difficultyTabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('difficulty-tab')) {
                    document.querySelectorAll('.difficulty-tab').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentSubCategory = e.target.dataset.difficulty;
                    this.renderTopics();
                }
            });
        }

        // 侧边栏切换
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // 侧边栏遮罩（移动端）
        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // 桌面端侧边栏头部点击切换（避免与题目选择冲突）
        if (this.elements.sidebar) {
            const sidebarHeader = this.elements.sidebar.querySelector('.sidebar-header');
            if (sidebarHeader) {
                sidebarHeader.addEventListener('click', (e) => {
                    if (window.innerWidth > 1024 && !e.target.closest('.topics-list')) {
                        this.toggleSidebar();
                    }
                });
            }
        }

        // 编辑器事件
        if (this.elements.articleTitle) {
            this.elements.articleTitle.addEventListener('input', () => {
                this.updateWordCount();
                this.scheduleAutoSave();
            });
        }

        if (this.elements.contentEditor) {
            this.elements.contentEditor.addEventListener('input', () => {
                this.updateWordCount();
                this.scheduleAutoSave();
            });
        }

        // 格式化工具栏
        this.setupFormattingTools();

        // 功能按钮
        this.setupActionButtons();

        // 草稿管理
        this.setupDraftManagement();
    }

    updateCategoryDisplay() {
        const config = this.categoryConfig[this.currentCategory];
        if (config && this.elements.categoryTitle) {
            this.elements.categoryTitle.textContent = config.title;
        }
        
        // 更新面包屑导航
        this.updateBreadcrumb();
        
        // 更新欢迎页面的标题
        const welcomeTitle = document.querySelector('.welcome-page h1');
        if (welcomeTitle && config) {
            welcomeTitle.textContent = `🌟 ${config.title}`;
        }
        
        // 更新欢迎页面的描述
        const welcomeDesc = document.querySelector('.welcome-page p');
        if (welcomeDesc) {
            welcomeDesc.textContent = '选择左侧的题目开始你的写作训练吧！';
        }
    }

    updateBreadcrumb() {
        const breadcrumbContainer = document.getElementById('navigation-breadcrumb');
        if (!breadcrumbContainer) return;

        const config = this.categoryConfig[this.currentCategory];
        let breadcrumbHTML = `
            <div class="breadcrumb-item">
                <span class="breadcrumb-icon">🏠</span>
                <span class="breadcrumb-text">写作训练</span>
            </div>
        `;

        if (config) {
            breadcrumbHTML += `
                <div class="breadcrumb-separator">›</div>
                <div class="breadcrumb-item active">
                    <span class="breadcrumb-text">${config.title.replace(/📋|📝|💭|📄|📧/g, '').trim()}</span>
                </div>
            `;
        }

        if (this.currentSubCategory) {
            breadcrumbHTML += `
                <div class="breadcrumb-separator">›</div>
                <div class="breadcrumb-item active">
                    <span class="breadcrumb-text">${this.currentSubCategory}</span>
                </div>
            `;
        }

        breadcrumbContainer.innerHTML = breadcrumbHTML;
    }

    renderCategoryCards() {
        const categoryCardsContainer = document.getElementById('category-cards');
        if (!categoryCardsContainer) return;

        const cardsHTML = Object.entries(this.categoryConfig).map(([key, config]) => {
            const isActive = key === this.currentCategory;
            return `
                <div class="category-card ${isActive ? 'active' : ''}" data-category="${key}">
                    <div class="category-icon">${config.title.match(/[📋📝💭📄📧]/)?.[0] || '📝'}</div>
                    <div class="category-info">
                        <h3 class="category-name">${config.title.replace(/📋|📝|💭|📄|📧/g, '').trim()}</h3>
                        <p class="category-desc">${this.getCategoryDescription(key)}</p>
                        <div class="category-stats">
                            <span class="stats-item">
                                <span class="stats-icon">📝</span>
                                <span class="stats-text">${this.getTopicCount(key)} 题目</span>
                            </span>
                        </div>
                    </div>
                    <div class="category-arrow">›</div>
                </div>
            `;
        }).join('');

        categoryCardsContainer.innerHTML = cardsHTML;

        // 绑定点击事件
        categoryCardsContainer.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                if (category !== this.currentCategory) {
                    this.switchCategory(category);
                }
            });
        });
    }

    getCategoryDescription(category) {
        const descriptions = {
            '全命题作文': '完整题目，发挥想象',
            '半命题作文': '自由填空，创意写作',
            '话题作文': '围绕话题，深度思考',
            '材料作文': '材料启发，观点表达',
            '应用文': '实用文体，规范写作'
        };
        return descriptions[category] || '写作训练';
    }

    getTopicCount(category) {
        if (!this.writingData || !this.writingData[category]) return 0;
        
        const categoryData = this.writingData[category];
        if (Array.isArray(categoryData)) {
            return categoryData.length;
        }
        
        return Object.values(categoryData).reduce((total, topics) => {
            return total + (Array.isArray(topics) ? topics.length : 0);
        }, 0);
    }

    switchCategory(category) {
        this.currentCategory = category;
        this.currentSubCategory = null;
        
        // 切换界面显示状态
        this.showCategoryInterface();
        
        this.updateCategoryDisplay();
        this.renderCategoryCards();
        this.renderSubCategories();
        this.renderTopics();
        
        // 更新分类选择器
        if (this.elements.categorySelect) {
            this.elements.categorySelect.value = category;
        }
    }

    showCategoryInterface() {
        // 隐藏欢迎页面
        const welcomePage = document.getElementById('welcome-page');
        if (welcomePage) {
            welcomePage.style.display = 'none';
        }
        
        // 显示侧边栏
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = 'block';
            sidebar.classList.add('active');
        }
        
        // 显示顶部栏（包含分类选择器等）
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            topBar.style.display = 'flex';
        }
    }

    renderSubCategories() {
        const config = this.categoryConfig[this.currentCategory];
        if (!config || !this.elements.difficultyTabs) return;

        if (config.subcategories.length === 0) {
            this.elements.difficultyTabs.style.display = 'none';
            this.currentSubCategory = null;
        } else {
            this.elements.difficultyTabs.style.display = 'flex';
            this.elements.difficultyTabs.innerHTML = config.subcategories.map((sub, index) => 
                `<button type="button" class="difficulty-tab ${index === 0 ? 'active' : ''}" data-difficulty="${sub}">
                    <span class="tab-icon">${this.getSubCategoryIcon(sub)}</span>
                    <span class="tab-text">${sub.replace('类', '').replace('话题', '')}</span>
                </button>`
            ).join('');
            this.currentSubCategory = config.subcategories[0];
        }
    }

    getSubCategoryIcon(subCategory) {
        const icons = {
            '成长体验类': '🌱',
            '情感感悟类': '💖',
            '生活写实类': '🏠',
            '前置空白类': '📝',
            '后置空白类': '✏️',
            '中间空白类': '📄',
            '情感话题': '💝',
            '成长话题': '🌟',
            '生活话题': '🎭',
            '寓言故事类': '📚',
            '名言警句类': '💬',
            '时事热点类': '📰'
        };
        return icons[subCategory] || '📝';
    }

    renderTopics() {
        if (!this.writingData || !this.elements.topicsList) return;

        const categoryData = this.writingData[this.currentCategory];
        if (!categoryData) {
            this.elements.topicsList.innerHTML = '<div class="no-topics">暂无题目</div>';
            return;
        }

        let topics = [];
        if (Array.isArray(categoryData)) {
            topics = categoryData;
        } else if (this.currentSubCategory && categoryData[this.currentSubCategory]) {
            topics = categoryData[this.currentSubCategory];
        } else {
            const firstSubCategory = Object.keys(categoryData)[0];
            if (firstSubCategory) {
                topics = categoryData[firstSubCategory];
                this.currentSubCategory = firstSubCategory;
            }
        }

        if (!topics || topics.length === 0) {
            this.elements.topicsList.innerHTML = '<div class="no-topics">暂无题目</div>';
            return;
        }

        const topicsHTML = topics.map((topic, index) => {
            const typeIcon = this.getTypeIcon(topic.type);
            const difficultyLevel = this.getDifficultyLevel(topic.difficulty);
            const hasProgress = this.getTopicProgress(topic.id);
            
            return `
                <div class="topic-card-enhanced" data-topic-id="${topic.id}">
                    <div class="topic-header">
                        <div class="topic-meta">
                    <span class="topic-icon">${typeIcon}</span>
                            <span class="topic-index">#${String(index + 1).padStart(2, '0')}</span>
                            <span class="difficulty-badge ${difficultyLevel.class}">${difficultyLevel.text}</span>
                        </div>
                        ${hasProgress ? '<span class="progress-indicator">✓</span>' : ''}
                    </div>
                    <h4 class="topic-title">${topic.title}</h4>
                    <p class="topic-description">${topic.description || '点击查看详细要求'}</p>
                    <div class="topic-stats">
                        <span class="stats-item">
                            <span class="stats-icon">✏️</span>
                            <span class="stats-text">${topic.requirements ? topic.requirements.split('字数不少于')[1]?.split('字')[0] || '500' : '500'}字</span>
                        </span>
                        <span class="stats-item">
                            <span class="stats-icon">🎯</span>
                            <span class="stats-text">${this.getTopicType(topic.type)}</span>
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.topicsList.innerHTML = topicsHTML;

        // 绑定题目点击事件
        if (this.elements.topicsList) {
            this.elements.topicsList.querySelectorAll('.topic-card-enhanced').forEach(item => {
                item.addEventListener('click', (e) => {
                    // 移除其他项目的选中状态
                    this.elements.topicsList.querySelectorAll('.topic-card-enhanced').forEach(i => i.classList.remove('active'));
                    // 添加当前项目的选中状态
                    item.classList.add('active');
                    
                    const topicId = item.dataset.topicId;
                    const topic = topics.find(t => t.id === topicId);
                    if (topic) {
                        this.selectTopic(topic);
                    }
                });
            });
        }
    }



    getDifficultyLevel(difficulty) {
        const levels = {
            1: { class: 'easy', text: '简单' },
            2: { class: 'medium', text: '中等' },
            3: { class: 'hard', text: '困难' }
        };
        return levels[difficulty] || levels[1];
    }

    getTopicProgress(topicId) {
        // 检查草稿中是否有该题目的内容
        return Object.values(this.drafts).some(draft => draft.topicId === topicId);
    }

    getTopicType(type) {
        const types = {
            'full-title': '全命题',
            'semi-title': '半命题',
            'topic': '话题',
            'material': '材料',
            'practical': '应用文',
            'narrative': '记叙文',
            'argumentative': '议论文'
        };
        return types[type] || '写作';
    }

    getTypeIcon(type) {
        const icons = {
            'full-title': '📋',
            'semi-title': '📝',
            'topic': '💭',
            'material': '📄',
            'practical': '📧',
            'narrative': '📖',
            'argumentative': '💬'
        };
        return icons[type] || '📝';
    }

    selectTopic(topic) {
        this.currentTopic = topic;
        this.showTopicWritingArea();
        this.updateTopicDisplay();
        this.hideWelcomePage();
        
        // 在垂直布局中，选择题目后隐藏侧边栏（移动端）
        this.hideSidebar();
    }

    updateTopicDisplay() {
        if (!this.currentTopic) return;

        const topic = this.currentTopic;
        
        if (this.elements.currentTitle) {
            this.elements.currentTitle.textContent = topic.title;
        }
        
        if (this.elements.currentDescription) {
            this.elements.currentDescription.textContent = topic.description;
        }
        
        if (this.elements.requirements) {
            this.elements.requirements.textContent = topic.requirements;
        }
        


        this.currentExamTips = topic.examTips || '';

        // 更新写作指导
        if (this.elements.tipsContent && topic.tips) {
            this.elements.tipsContent.innerHTML = topic.tips.replace(/\n/g, '<br>');
        }
        
        if (this.elements.outlineContent && topic.outline) {
            this.elements.outlineContent.innerHTML = topic.outline.replace(/\n/g, '<br>');
        }

        const examTipsHelp = document.getElementById('exam-tips-help');
        if (examTipsHelp && this.currentExamTips) {
            examTipsHelp.textContent = this.currentExamTips;
            examTipsHelp.parentElement.style.display = 'block';
        }

        this.updateWordCount();
    }

    showTopicWritingArea() {
        if (this.elements.writingContent) {
            this.elements.writingContent.style.display = 'flex';
        }
        if (this.elements.bottomActions) {
            this.elements.bottomActions.style.display = 'block';
        }
    }

    hideWelcomePage() {
        if (this.elements.welcomePage) {
            this.elements.welcomePage.style.display = 'none';
        }
    }

    showWelcomePage() {
        if (this.elements.welcomePage) {
            this.elements.welcomePage.style.display = 'flex';
        }
        if (this.elements.writingContent) {
            this.elements.writingContent.style.display = 'none';
        }
        if (this.elements.bottomActions) {
            this.elements.bottomActions.style.display = 'none';
        }
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        
        if (this.sidebarCollapsed) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }

    hideSidebar() {
        if (this.elements.sidebar) {
            // 支持两种布局：传统布局和垂直布局
            if (this.elements.sidebar.classList.contains('sidebar-collapsible')) {
                // 垂直布局 - 移除 active 类
                this.elements.sidebar.classList.remove('active');
            } else {
                // 传统布局 - 添加 collapsed 类
            this.elements.sidebar.classList.add('collapsed');
            }
        }
        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.classList.remove('active');
        }
        if (this.elements.toggleIcon) {
            this.elements.toggleIcon.textContent = '☰';
        }
        this.sidebarCollapsed = true;
    }

    showSidebar() {
        if (this.elements.sidebar) {
            // 支持两种布局：传统布局和垂直布局
            if (this.elements.sidebar.classList.contains('sidebar-collapsible')) {
                // 垂直布局 - 添加 active 类
                this.elements.sidebar.classList.add('active');
            } else {
                // 传统布局 - 移除 collapsed 类
            this.elements.sidebar.classList.remove('collapsed');
        }
        }
        if (this.elements.sidebarOverlay && window.innerWidth <= 768) {
            this.elements.sidebarOverlay.classList.add('active');
        }
        if (this.elements.toggleIcon) {
            this.elements.toggleIcon.textContent = '✕';
        }
        this.sidebarCollapsed = false;
    }

    setupFormattingTools() {
        // 简化版本 - 格式化工具已移除，AI助手会提供写作指导
        console.log('格式化工具已简化，请使用AI助手获取写作指导');
    }

    setupActionButtons() {
        // 保存草稿按钮
    const saveDraftBtn = document.getElementById('save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                this.saveDraft();
            });
        }

        // 导出按钮
    const exportMdBtn = document.getElementById('export-md');
        if (exportMdBtn) {
            exportMdBtn.addEventListener('click', () => {
                this.exportToMarkdown();
            });
        }

        // 清空按钮
        const clearBtn = document.getElementById('clear-content');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearEditor();
            });
        }

        // 快速保存按钮
        if (this.elements.quickSaveBtn) {
            this.elements.quickSaveBtn.addEventListener('click', () => {
                this.quickSave();
            });
        }

        // 清理草稿按钮
        if (this.elements.clearDraftsBtn) {
            this.elements.clearDraftsBtn.addEventListener('click', () => {
                this.showClearDraftsDialog();
            });
        }

        // 清除所有草稿按钮（侧边栏）
        if (this.elements.clearAllDraftsBtn) {
            this.elements.clearAllDraftsBtn.addEventListener('click', () => {
                this.showClearDraftsDialog();
            });
        }
    }

    setupDraftManagement() {
        // 草稿切换按钮
        const draftsToggle = document.getElementById('drafts-toggle');
        if (draftsToggle) {
            draftsToggle.addEventListener('click', () => {
                if (this.elements.draftsList) {
                    const isHidden = this.elements.draftsList.style.display === 'none';
                    this.elements.draftsList.style.display = isHidden ? 'block' : 'none';
                    draftsToggle.textContent = isHidden ? '隐藏草稿' : '查看所有草稿';
                }
            });
        }
    }

    updateWordCount() {
        if (!this.elements.wordCount) return;

        const titleLength = this.elements.articleTitle?.value?.length || 0;
        const contentLength = this.elements.contentEditor?.innerText?.length || 0;
        const totalWords = titleLength + contentLength;

        this.elements.wordCount.textContent = `字数: ${totalWords}`;
    }

    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        const interval = this.config.getUIConfig().autoSaveInterval;
        this.autoSaveTimer = setTimeout(() => {
            this.autoSave();
        }, interval);
    }

    autoSave() {
        if (!this.currentTopic) return;

        const title = this.elements.articleTitle?.value || '';
        const content = this.elements.contentEditor?.innerHTML || '';

        if (!title && !content) return;

        const draftKey = `draft_${this.currentTopic.id}_auto`;
        const draftData = {
            id: draftKey,
            topicId: this.currentTopic.id,
            topicTitle: this.currentTopic.title,
            title: title,
            content: content,
            savedAt: new Date().toISOString(),
            type: 'auto'
        };

        localStorage.setItem(draftKey, JSON.stringify(draftData));
        
        if (this.elements.saveStatus) {
            this.elements.saveStatus.textContent = '已自动保存';
            this.elements.saveStatus.className = 'save-status auto-save';
            setTimeout(() => {
                if (this.elements.saveStatus) {
                    this.elements.saveStatus.textContent = '';
                    this.elements.saveStatus.className = 'save-status';
                }
            }, 3000);
        }

        // 更新最后保存时间
        if (this.elements.lastSaveTime) {
            const now = new Date();
            this.elements.lastSaveTime.textContent = `最后保存: ${now.toLocaleTimeString()}`;
        }
    }

    saveDraft() {
        if (!this.currentTopic) {
            this.showNotification('请先选择一个写作题目', 'warning');
            return;
        }

        const title = this.elements.articleTitle?.value || '';
        const content = this.elements.contentEditor?.innerHTML || '';

        if (!title && !content) {
            this.showNotification('请输入内容后再保存', 'warning');
            return;
        }

        const draftId = `draft_${this.currentTopic.id}_${Date.now()}`;
        const draftData = {
            id: draftId,
            topicId: this.currentTopic.id,
            topicTitle: this.currentTopic.title,
            title: title,
            content: content,
            savedAt: new Date().toISOString(),
            type: 'manual'
        };

        localStorage.setItem(draftId, JSON.stringify(draftData));
        this.drafts[draftId] = draftData;

        this.updateDraftsDisplay();
        this.showNotification('草稿保存成功！', 'success');

        // 更新保存状态反馈
        if (this.elements.saveStatus) {
            this.elements.saveStatus.textContent = '手动保存成功';
            this.elements.saveStatus.className = 'save-status manual-save';
            setTimeout(() => {
                if (this.elements.saveStatus) {
                    this.elements.saveStatus.textContent = '';
                    this.elements.saveStatus.className = 'save-status';
                }
            }, 3000);
        }

        // 更新最后保存时间
        if (this.elements.lastSaveTime) {
            const now = new Date();
            this.elements.lastSaveTime.textContent = `最后保存: ${now.toLocaleTimeString()}`;
        }
    }

    // 快速保存功能
    quickSave() {
        if (!this.currentTopic) {
            this.showNotification('请先选择一个写作题目', 'warning');
            return;
        }

        const title = this.elements.articleTitle?.value || '';
        const content = this.elements.contentEditor?.innerHTML || '';

        if (!title && !content) {
            this.showNotification('请输入内容后再保存', 'warning');
            return;
        }

        // 使用自动保存的逻辑，但显示快速保存的反馈
        this.autoSave();
        
        // 覆盖自动保存的反馈
        if (this.elements.saveStatus) {
            this.elements.saveStatus.textContent = '快速保存成功';
            this.elements.saveStatus.className = 'save-status quick-save';
        }
    }

    // 显示清理草稿对话框
    showClearDraftsDialog() {
        const draftCount = Object.keys(this.drafts).length;
        if (draftCount === 0) {
            this.showNotification('没有草稿需要清理', 'info');
            return;
        }

        const message = `确定要删除所有 ${draftCount} 个草稿吗？此操作不可撤销。`;
        if (confirm(message)) {
            this.clearAllDrafts();
        }
    }

    // 清除所有草稿
    clearAllDrafts() {
        // 清除localStorage中的草稿
        const keysToDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('draft_') || key.startsWith('writing_draft_'))) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            localStorage.removeItem(key);
        });

        // 清空内存中的草稿
        this.drafts = {};

        // 更新显示
        this.updateDraftsDisplay();
        this.showNotification(`已清除 ${keysToDelete.length} 个草稿`, 'success');
    }

    // 删除单个草稿
    deleteDraft(draftId) {
        if (confirm('确定要删除这个草稿吗？')) {
            localStorage.removeItem(draftId);
            delete this.drafts[draftId];
            this.updateDraftsDisplay();
            this.showNotification('草稿已删除', 'success');
        }
    }

    loadDrafts() {
        const drafts = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('draft_')) {
                try {
                    const draftData = JSON.parse(localStorage.getItem(key));
                    drafts[key] = draftData;
                } catch (e) {
                    console.error('Error loading draft:', key, e);
                }
            }
        }
        return drafts;
    }

    updateDraftsDisplay() {
        const draftCount = Object.keys(this.drafts).length;
        if (this.elements.draftsCount) {
            this.elements.draftsCount.textContent = draftCount;
        }

        if (this.elements.draftsList) {
            if (draftCount === 0) {
                this.elements.draftsList.innerHTML = '<div class="no-drafts">暂无草稿</div>';
            } else {
                const draftsHTML = Object.values(this.drafts)
                    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
                    .map(draft => {
                        const saveType = draft.type || 'auto';
                        const saveTypeIcon = saveType === 'manual' ? '💾' : saveType === 'auto' ? '⏰' : '⚡';
                        const saveTypeText = saveType === 'manual' ? '手动' : saveType === 'auto' ? '自动' : '快速';
                        
                        return `
                        <div class="draft-item" data-draft-id="${draft.id}">
                            <div class="draft-header">
                                <span class="draft-title">${draft.title || '无标题'}</span>
                                <span class="draft-meta">
                                    <span class="save-type" title="${saveTypeText}保存">${saveTypeIcon}</span>
                                    <span class="draft-date">${new Date(draft.savedAt).toLocaleDateString()}</span>
                                </span>
                            </div>
                            <div class="draft-topic">${draft.topicTitle}</div>
                            <div class="draft-actions">
                                <button type="button" class="btn-small load-draft" title="加载草稿">📂</button>
                                <button type="button" class="btn-small delete-draft" title="删除草稿">🗑️</button>
                            </div>
                        </div>`;
                    }).join('');
                
                this.elements.draftsList.innerHTML = draftsHTML;

                // 绑定草稿操作事件
                this.elements.draftsList.querySelectorAll('.load-draft').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const draftId = e.target.closest('.draft-item').dataset.draftId;
                        this.loadDraft(draftId);
                    });
                });

                this.elements.draftsList.querySelectorAll('.delete-draft').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const draftId = e.target.closest('.draft-item').dataset.draftId;
                        this.deleteDraft(draftId);
                    });
                });
            }
        }
    }

    loadDraft(draftId) {
        const draft = this.drafts[draftId];
        if (!draft) return;

        if (this.elements.articleTitle) {
            this.elements.articleTitle.value = draft.title || '';
        }
        if (this.elements.contentEditor) {
            this.elements.contentEditor.innerHTML = draft.content || '';
        }

        this.updateWordCount();
        this.showNotification('草稿加载成功！', 'success');
    }



    clearEditor() {
        if (confirm('确定要清空所有内容吗？此操作不可撤销。')) {
            if (this.elements.articleTitle) {
                this.elements.articleTitle.value = '';
            }
            if (this.elements.contentEditor) {
                this.elements.contentEditor.innerHTML = '';
            }
            this.updateWordCount();
            this.showNotification('内容已清空', 'info');
        }
    }

    // 图片上传功能已简化，可通过AI助手获取图文结合的写作建议

    exportToMarkdown() {
        if (!this.currentTopic) {
            this.showNotification('请先选择一个写作题目', 'warning');
            return;
        }

        const title = this.elements.articleTitle?.value || '无标题';
        const content = this.elements.contentEditor?.innerHTML || '';

        if (!content) {
            this.showNotification('请输入内容后再导出', 'warning');
            return;
        }

        const markdown = this.htmlToMarkdown(content);
        const fullMarkdown = `# ${title}\n\n## 题目：${this.currentTopic.title}\n\n${this.currentTopic.description}\n\n**要求：** ${this.currentTopic.requirements}\n\n---\n\n${markdown}`;

        const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Markdown文件导出成功！', 'success');
    }

    // PDF导出功能已简化，建议使用Markdown导出后转换为PDF

    htmlToMarkdown(html) {
        // 简单的HTML到Markdown转换
        return html
            .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
            .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
            .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
            .replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
            .replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*')
            .replace(/<u[^>]*>(.*?)<\/u>/g, '$1')
            .replace(/<br[^>]*>/g, '\n')
            .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
            .replace(/<div[^>]*>(.*?)<\/div>/g, '$1\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    }

    // 模态框功能已简化，请使用AI助手获取写作指导

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showError(message) {
        if (this.elements.topicsList) {
            this.elements.topicsList.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    showLoadingState() {
        // 显示加载状态
        if (this.elements.topicsList) {
            this.elements.topicsList.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">正在从服务器获取最新数据...</div>
                    <div class="loading-subtitle">如果加载时间过长，将自动切换到离线模式</div>
                </div>
            `;
        }

        // 在欢迎页面也显示加载状态
        const welcomeContainer = document.querySelector('.welcome-content');
        if (welcomeContainer) {
            const existingStatus = welcomeContainer.querySelector('.data-loading-status');
            if (!existingStatus) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'data-loading-status';
                statusDiv.innerHTML = `
                    <div class="status-indicator">
                        <div class="status-icon">🔄</div>
                        <div class="status-text">正在获取最新写作题目数据...</div>
                    </div>
                `;
                welcomeContainer.appendChild(statusDiv);
            }
        }
    }

    hideLoadingState() {
        // 移除加载状态
        const loadingContainers = document.querySelectorAll('.loading-container, .data-loading-status');
        loadingContainers.forEach(container => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
        
        // 根据配置决定是否显示数据来源
        if (this.config.getUIConfig().showDataSource) {
            const welcomeContainer = document.querySelector('.welcome-content');
            if (welcomeContainer) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'data-source-info success';
                statusDiv.innerHTML = `
                    <div class="source-indicator">
                        <div class="source-icon">✅</div>
                        <div class="source-text">数据已从服务器同步 (最新版本)</div>
                    </div>
                `;
                welcomeContainer.appendChild(statusDiv);
            }
        }
    }

    showInfoMessage(message) {
        this.showNotification(message, 'info');
        
        // 根据配置决定是否显示数据来源
        if (this.config.getUIConfig().showDataSource) {
            const welcomeContainer = document.querySelector('.welcome-content');
            if (welcomeContainer) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'data-source-info offline';
                statusDiv.innerHTML = `
                    <div class="source-indicator">
                        <div class="source-icon">📱</div>
                        <div class="source-text">正在使用离线数据 (部分功能受限)</div>
                    </div>
                `;
                welcomeContainer.appendChild(statusDiv);
            }
        }
    }

    getDefaultData() {
        // 提供默认的离线数据
        return {
            "全命题作文": {
                "成长体验类": [
                    {
                        id: "offline-full-growth-1",
                        title: "那是最美的风景",
                        description: "在你的成长路上，哪一种风景最美丽？可以是自然风景，也可以是人文风景。",
                        requirements: "内容自定，文体不限，字数不少于500字。",
                        difficulty: 1,
                        type: "full-title",
                        tips: "1. 细审命题，关注'最美'的限制词\n2. 选择具有典型意义的'风景'\n3. 可以从多个角度理解'风景'的含义",
                        outline: "开头：点题，什么是最美的风景\n正文：具体描述这道风景的美丽之处\n结尾：升华主题，表达感悟",
                        examTips: "全命题作文要特别注意题目中的限制词，'最美'是关键"
                    },
                    {
                        id: "offline-full-growth-2", 
                        title: "成长路上的那盏灯",
                        description: "在成长的道路上，总有一些人或事像明灯一样指引着我们前行。",
                        requirements: "文体不限，字数不少于600字。",
                        difficulty: 2,
                        type: "full-title",
                        tips: "1. '灯'可以是具体的，也可以是抽象的\n2. 重点写出'那盏灯'的指引作用\n3. 体现成长的过程和感悟",
                        outline: "开头：设置悬念，引出那盏灯\n正文：叙述与灯相关的经历和感悟\n结尾：抒发感情，点明主旨",
                        examTips: "注意'灯'的象征意义，以及它对成长的指引作用"
                    }
                ],
                "情感感悟类": [
                    {
                        id: "offline-full-emotion-1",
                        title: "温暖就在身边",
                        description: "生活中处处有温暖，可能来自家人、朋友，也可能来自陌生人的善意。",
                        requirements: "文体不限（诗歌除外），字数不少于600字。",
                        difficulty: 1,
                        type: "full-title",
                        tips: "1. 选择身边真实的温暖事例\n2. 细节描写要生动感人\n3. 要有真情实感",
                        outline: "开头：点题，温暖无处不在\n正文：具体事例展现身边的温暖\n结尾：升华感悟，珍惜温暖",
                        examTips: "重点在于发现生活中的美好，传递正能量"
                    }
                ],
                "生活写实类": [
                    {
                        id: "offline-full-life-1",
                        title: "我的一天",
                        description: "记录你平凡或不平凡的一天，展现真实的生活。",
                        requirements: "以记叙文为主，字数不少于500字。",
                        difficulty: 1,
                        type: "full-title",
                        tips: "1. 选择有意义的一天\n2. 按时间顺序叙述\n3. 注意详略得当",
                        outline: "开头：交代时间地点\n正文：按时间顺序叙述一天的经历\n结尾：总结感悟",
                        examTips: "平凡中见不平凡，注意挖掘生活的意义"
                    }
                ]
            },
            "半命题作文": {
                "前置空白类": [
                    {
                        id: "offline-semi-pre-1",
                        title: "_____让我成长",
                        description: "在空白处填入合适的词语，如挫折、阅读、旅行等。",
                        requirements: "先补全题目，再作文。文体不限，字数不少于600字。",
                        difficulty: 2,
                        type: "semi-title",
                        tips: "1. 选择对成长有重要意义的内容填空\n2. 要突出'让我成长'的过程\n3. 首尾呼应，扣题准确",
                        outline: "开头：引出话题，补充完整的题目\n正文：具体叙述成长的过程\n结尾：总结成长的收获",
                        examTips: "半命题作文的关键在于补题要准确贴切"
                    }
                ],
                "后置空白类": [
                    {
                        id: "offline-semi-post-1",
                        title: "感谢有你_____",
                        description: "在空白处可以填入具体的人、事、物等。",
                        requirements: "先补全题目，再作文。文体不限，字数不少于600字。",
                        difficulty: 2,
                        type: "semi-title",
                        tips: "1. 明确感谢的对象\n2. 具体写出感谢的原因\n3. 表达真挚的情感",
                        outline: "开头：点明感谢的对象\n正文：具体叙述值得感谢的经历\n结尾：抒发感谢之情",
                        examTips: "要突出'感谢'的情感，写出真情实感"
                    }
                ],
                "中间空白类": [
                    {
                        id: "offline-semi-mid-1",
                        title: "我在_____中长大",
                        description: "可以填入环境、氛围、感情等词语。",
                        requirements: "先补全题目，再作文。文体不限，字数不少于600字。",
                        difficulty: 2,
                        type: "semi-title",
                        tips: "1. 选择对成长有重要影响的环境或氛围\n2. 体现'长大'的过程\n3. 感情要真挚",
                        outline: "开头：介绍成长的环境\n正文：叙述在此环境中成长的经历\n结尾：总结成长的意义",
                        examTips: "重点写出环境对成长的影响和作用"
                    }
                ]
            },
            "话题作文": {
                "情感话题": [
                    {
                        id: "offline-topic-emotion-1",
                        title: "以'感恩'为话题",
                        description: "围绕'感恩'这个话题，自拟题目，写一篇文章。",
                        requirements: "题目自拟，文体不限，字数不少于600字。",
                        difficulty: 2,
                        type: "topic",
                        tips: "1. 围绕话题选择合适的角度\n2. 自拟一个响亮的题目\n3. 内容要扣住话题",
                        outline: "开头：引出话题\n正文：从不同角度阐述话题\n结尾：升华主题",
                        examTips: "话题作文给了很大的发挥空间，但要紧扣话题"
                    }
                ],
                "成长话题": [
                    {
                        id: "offline-topic-growth-1",
                        title: "以'梦想'为话题",
                        description: "每个人都有梦想，围绕'梦想'写一篇文章。",
                        requirements: "题目自拟，文体不限，字数不少于600字。",
                        difficulty: 2,
                        type: "topic",
                        tips: "1. 可以写追求梦想的过程\n2. 可以写梦想的力量\n3. 要有积极向上的主题",
                        outline: "开头：点出梦想的重要性\n正文：围绕梦想展开叙述或议论\n结尾：表达对梦想的坚持",
                        examTips: "梦想话题要体现积极向上的价值观"
                    }
                ],
                "生活话题": [
                    {
                        id: "offline-topic-life-1",
                        title: "以'幸福'为话题",
                        description: "什么是幸福？每个人的理解不同，谈谈你对幸福的理解。",
                        requirements: "题目自拟，文体不限，字数不少于600字。",
                        difficulty: 2,
                        type: "topic",
                        tips: "1. 从自己的生活体验出发\n2. 可以从小事中发现幸福\n3. 要有自己独特的理解",
                        outline: "开头：提出对幸福的思考\n正文：用事例阐述幸福的含义\n结尾：总结对幸福的理解",
                        examTips: "幸福话题要贴近生活，有真实感受"
                    }
                ]
            },
            "材料作文": {
                "寓言故事类": [
                    {
                        id: "offline-material-fable-1",
                        title: "根据寓言故事写作",
                        description: "一只小鸟因为翅膀受伤无法飞行，在地上艰难地爬行。一个路人看到了，想要帮助它，但小鸟拒绝了帮助，坚持自己爬行。最终小鸟的翅膀康复了，重新飞上了天空。",
                        requirements: "根据材料自拟题目，写一篇不少于600字的文章。",
                        difficulty: 3,
                        type: "material",
                        tips: "1. 分析材料的含义\n2. 提炼出正确的主题\n3. 联系现实生活",
                        outline: "开头：概述材料，提出观点\n正文：分析材料含义，联系实际\n结尾：总结升华主题",
                        examTips: "材料作文要准确理解材料的寓意，不能脱离材料"
                    }
                ],
                "名言警句类": [
                    {
                        id: "offline-material-quote-1",
                        title: "根据名言写作",
                        description: "\"宝剑锋从磨砺出，梅花香自苦寒来。\"这句古诗告诉我们什么道理？",
                        requirements: "根据材料自拟题目，写一篇不少于600字的文章。",
                        difficulty: 3,
                        type: "material",
                        tips: "1. 理解名言的深层含义\n2. 用事例证明观点\n3. 联系自身体验",
                        outline: "开头：引用名言，阐释含义\n正文：用事例论证名言的道理\n结尾：总结升华",
                        examTips: "名言警句类材料要深入理解名言的哲理"
                    }
                ],
                "时事热点类": [
                    {
                        id: "offline-material-news-1",
                        title: "根据时事材料写作",
                        description: "近年来，越来越多的年轻人选择回到家乡创业，为家乡建设贡献力量。他们放弃了大城市的高薪工作，选择在小城镇或农村地区发展。",
                        requirements: "根据材料自拟题目，谈谈你的看法，不少于600字。",
                        difficulty: 3,
                        type: "material",
                        tips: "1. 分析现象背后的原因\n2. 表达自己的观点和态度\n3. 思考其积极意义",
                        outline: "开头：概述现象，提出观点\n正文：分析原因和意义\n结尾：表达期望和建议",
                        examTips: "时事类材料要客观分析，表达积极向上的观点"
                    }
                ]
            },
            "应用文": [
                {
                    id: "offline-practical-1",
                    title: "写一封建议书",
                    description: "针对学校食堂就餐拥挤的问题，以学生会的名义写一份建议书。",
                    requirements: "格式正确，内容合理，字数不少于400字。",
                    difficulty: 2,
                    type: "practical",
                    tips: "1. 注意建议书的格式\n2. 分析问题的原因\n3. 提出合理的建议",
                    outline: "标题→称呼→正文（现状分析+具体建议）→结尾→署名日期",
                    examTips: "应用文要特别注意格式的准确性"
                }
            ]
        };
    }



}

// 简化的数据加载函数
function loadWritingData() {
    if (typeof writingPrompts !== 'undefined') {
        return writingPrompts;
    }
    
    // 提供默认数据
    window.writingPrompts = {
        "全命题作文": {
            "成长体验类": [{
                id: "default-1",
                title: "那是最美的风景",
                description: "在你的心中哪一种风景最美丽呢？",
                requirements: "内容自定，文体不限，字数不少于500字",
                difficulty: 1,
                type: "full-title",
                tips: "细审命题，关注'最美'的限制；选择具有典型意义的'风景'",
                outline: "开头：点题，什么是最美的风景\n正文：具体描述这道风景的美丽之处\n结尾：升华主题，表达感悟",
                examTips: "全命题作文要特别注意题目中的限制词"
            }],
            "情感感悟类": [],
            "生活写实类": []
        },
        "半命题作文": {
            "成长体验类": [],
            "情感感悟类": [],
            "生活写实类": []
        },
        "话题作文": {
            "成长体验类": [],
            "情感感悟类": [],
            "生活写实类": []
        },
        "材料作文": {
            "成长体验类": [],
            "情感感悟类": [],
            "生活写实类": []
        },
        "应用文": []
    };
    
    return window.writingPrompts;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadWritingData();
    window.writingModule = new WritingModule();
});