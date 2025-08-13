// 中考作文训练模块
class WritingModule {
    constructor() {
        this.currentCategory = '全命题作文';
        this.currentSubCategory = null;
        this.currentTopic = null;
        this.drafts = this.loadDrafts();
        this.autoSaveTimer = null;
        
        this.elements = {
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebar-overlay'),
            mainContent: document.getElementById('main-content'),
            sidebarToggle: document.getElementById('sidebar-toggle'),
            toggleIcon: document.getElementById('toggle-icon'),
            categoryTitle: document.getElementById('current-category-title'),
            categorySelect: document.getElementById('writing-category'),
            difficultyTabs: document.getElementById('difficulty-tabs'),
            topicsList: document.getElementById('topics-list'),
            topicHeader: document.getElementById('topic-header'),
            writingArea: document.getElementById('writing-area'),
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
            tipsContent: document.getElementById('tips-content'),
            outlineContent: document.getElementById('outline-content'),
            draftsList: document.getElementById('drafts-list'),
            draftsCount: document.getElementById('drafts-count'),
            imageInput: document.getElementById('image-input'),
            // AI助手相关元素
            
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

    init() {
        this.setupEventListeners();
        this.loadWritingData();
        this.updateDraftsDisplay();
        this.showWelcomePage();
        
        // 检查URL参数，自动选择分类
        this.handleUrlParams();
        
        // 在移动端默认收起侧边栏
        if (window.innerWidth <= 1024) {
            this.sidebarCollapsed = true;
            this.elements.sidebar.classList.add('collapsed');
            this.elements.toggleIcon.textContent = '☰';
        }
    }

    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        if (category && this.categoryConfig[category]) {
            this.currentCategory = category;
            if (this.elements.categorySelect) {
                this.elements.categorySelect.value = category;
            }
            this.updateCategoryDisplay();
            this.renderSubCategories();
            this.renderTopics();
        }
    }

    loadWritingData() {
        // 检查全局写作题目数据是否已加载
        if (typeof writingPrompts !== 'undefined') {
            this.writingData = writingPrompts;
            this.updateCategoryDisplay();
            this.renderSubCategories();
            this.renderTopics();
        } else {
            console.error('写作题目数据未加载，尝试延迟加载...');
            // 延迟重试加载
            setTimeout(() => {
                if (typeof writingPrompts !== 'undefined') {
                    this.writingData = writingPrompts;
                    this.updateCategoryDisplay();
                    this.renderSubCategories();
                    this.renderTopics();
                } else {
                    this.showError('写作题目数据加载失败，请检查网络连接或刷新页面重试');
                }
            }, 1000);
        }
    }

    setupEventListeners() {
        // 分类选择器
        if (this.elements.categorySelect) {
            this.elements.categorySelect.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.currentSubCategory = null;
                this.updateCategoryDisplay();
                this.renderSubCategories();
                this.renderTopics();
            });
        }

        // 子分类标签切换
        this.elements.difficultyTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('difficulty-tab')) {
                document.querySelectorAll('.difficulty-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSubCategory = e.target.dataset.difficulty;
                this.renderTopics();
            }
        });

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
                    // 只有点击头部区域（不是题目列表区域）才触发切换
                    if (window.innerWidth > 1024 && 
                        !e.target.closest('.topics-list') && 
                        !e.target.closest('.category-select') &&
                        !e.target.closest('.difficulty-tab')) {
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

    renderSubCategories() {
        const config = this.categoryConfig[this.currentCategory];
        if (!config || !this.elements.difficultyTabs) return;

        if (config.subcategories.length === 0) {
            // 应用文没有子分类
            this.elements.difficultyTabs.style.display = 'none';
            this.currentSubCategory = null;
        } else {
            this.elements.difficultyTabs.style.display = 'flex';
            this.elements.difficultyTabs.innerHTML = config.subcategories.map((sub, index) => 
                `<button class="difficulty-tab ${index === 0 ? 'active' : ''}" data-difficulty="${sub}">${sub.replace('类', '').replace('话题', '')}</button>`
            ).join('');
            this.currentSubCategory = config.subcategories[0];
        }
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
            // 应用文是数组格式
            topics = categoryData;
        } else if (this.currentSubCategory && categoryData[this.currentSubCategory]) {
            // 其他分类有子分类
            topics = categoryData[this.currentSubCategory];
        } else {
            // 显示第一个子分类的题目
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

        const topicsHTML = topics.map(topic => {
            const difficultyClass = this.getDifficultyClass(topic.difficulty);
            const typeIcon = this.getTypeIcon(topic.type);
            
            return `
                <div class="topic-card" data-topic-id="${topic.id}">
                    <span class="topic-icon">${typeIcon}</span>
                    <span class="topic-title">${topic.title}</span>
                </div>
            `;
        }).join('');

        this.elements.topicsList.innerHTML = topicsHTML;

        // 绑定题目点击事件
        this.elements.topicsList.querySelectorAll('.topic-card').forEach(item => {
            item.addEventListener('click', (e) => {
                // 阻止事件冒泡，避免触发侧边栏切换
                e.stopPropagation();
                
                // 移除其他项目的选中状态
                this.elements.topicsList.querySelectorAll('.topic-card').forEach(i => i.classList.remove('active'));
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

    getDifficultyClass(difficulty) {
        if (!difficulty) return '';
        if (difficulty <= 1) return 'easy';
        if (difficulty <= 2) return 'medium';
        return 'hard';
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
        
        // 在移动端选择题目后隐藏侧边栏
        if (window.innerWidth <= 1024) {
            this.hideSidebar();
        }
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
        
        // 移除难度标签显示
        if (this.elements.difficultyBadge) {
            this.elements.difficultyBadge.style.display = 'none';
        }

        // 保存考试提示到实例变量，用于写作指导弹窗
        this.currentExamTips = topic.examTips || '';

        // 更新写作指导
        if (this.elements.tipsContent && topic.tips) {
            this.elements.tipsContent.innerHTML = topic.tips.replace(/\n/g, '<br>');
        }
        
        if (this.elements.outlineContent && topic.outline) {
            this.elements.outlineContent.innerHTML = topic.outline.replace(/\n/g, '<br>');
        }

        // 更新考试提示到写作指导弹窗
        const examTipsHelp = document.getElementById('exam-tips-help');
        if (examTipsHelp) {
            if (this.currentExamTips) {
                examTipsHelp.textContent = this.currentExamTips;
                examTipsHelp.parentElement.style.display = 'block';
            } else {
                examTipsHelp.parentElement.style.display = 'none';
            }
        }

        this.updateWordCount();
    }

    showTopicWritingArea() {
        if (this.elements.writingArea) {
            this.elements.writingArea.style.display = 'block';
        }
        if (this.elements.topicHeader) {
            this.elements.topicHeader.style.display = 'block';
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
        if (this.elements.writingArea) {
            this.elements.writingArea.style.display = 'none';
        }
        if (this.elements.topicHeader) {
            this.elements.topicHeader.style.display = 'none';
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
            this.elements.sidebar.classList.add('collapsed');
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
            this.elements.sidebar.classList.remove('collapsed');
        }
        if (this.elements.sidebarOverlay && window.innerWidth <= 1024) {
            this.elements.sidebarOverlay.classList.add('active');
        }
        if (this.elements.toggleIcon) {
            this.elements.toggleIcon.textContent = '✕';
        }
        this.sidebarCollapsed = false;
    }

    setupFormattingTools() {
        const formatButtons = [
            { id: 'bold', command: 'bold' },
            { id: 'italic', command: 'italic' },
            { id: 'underline', command: 'underline' },
            { id: 'h1', command: 'formatBlock', value: '<h1>' },
            { id: 'h2', command: 'formatBlock', value: '<h2>' },
            { id: 'h3', command: 'formatBlock', value: '<h3>' },
            { id: 'align-left', command: 'justifyLeft' },
            { id: 'align-center', command: 'justifyCenter' },
            { id: 'align-right', command: 'justifyRight' },
            { id: 'indent', command: 'indent' },
            { id: 'outdent', command: 'outdent' }
        ];

        formatButtons.forEach(({ id, command, value }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    if (value) {
                        document.execCommand(command, false, value);
                    } else {
                        document.execCommand(command);
                    }
                    if (this.elements.contentEditor) {
                        this.elements.contentEditor.focus();
                    }
                });
            }
        });

        // 图片上传
        const imageUploadBtn = document.getElementById('image-upload');
        if (imageUploadBtn && this.elements.imageInput) {
            imageUploadBtn.addEventListener('click', () => {
                this.elements.imageInput.click();
            });

            this.elements.imageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }
    }

    setupActionButtons() {
        // 写作题目按钮
        const promptBtn = document.getElementById('show-prompt');
        if (promptBtn) {
            promptBtn.addEventListener('click', () => {
                this.showModal('prompt-modal');
            });
        }

        // 写作指导按钮
        const guideBtn = document.getElementById('show-guide');
        if (guideBtn) {
            guideBtn.addEventListener('click', () => {
                this.showModal('guide-modal');
            });
        }

        // AI助手按钮已移除

        // AI配置关闭按钮


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

    const exportPdfBtn = document.getElementById('export-pdf');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }

        // 清空按钮
        const clearBtn = document.getElementById('clear-content');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearEditor();
            });
        }

        // 模态框关闭
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // 模态框背景点击关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
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

        this.autoSaveTimer = setTimeout(() => {
            this.autoSave();
        }, 2000);
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
            setTimeout(() => {
                if (this.elements.saveStatus) {
                    this.elements.saveStatus.textContent = '';
                }
            }, 2000);
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
                    .map(draft => `
                        <div class="draft-item" data-draft-id="${draft.id}">
                            <div class="draft-header">
                                <span class="draft-title">${draft.title || '无标题'}</span>
                                <span class="draft-date">${new Date(draft.savedAt).toLocaleDateString()}</span>
                            </div>
                            <div class="draft-topic">${draft.topicTitle}</div>
                            <div class="draft-actions">
                                <button class="btn-small load-draft">加载</button>
                                <button class="btn-small delete-draft">删除</button>
                            </div>
                        </div>
                    `).join('');
                
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

    deleteDraft(draftId) {
        if (confirm('确定要删除这个草稿吗？')) {
            localStorage.removeItem(draftId);
            delete this.drafts[draftId];
            this.updateDraftsDisplay();
            this.showNotification('草稿删除成功！', 'success');
        }
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

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('请选择图片文件', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            if (this.elements.contentEditor) {
                this.elements.contentEditor.appendChild(img);
                this.updateWordCount();
                this.scheduleAutoSave();
            }
        };
        reader.readAsDataURL(file);
    }

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

    exportToPDF() {
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

        const printContent = `
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: 'Microsoft YaHei', sans-serif; line-height: 1.6; margin: 40px; }
                    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                    .topic-info { background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff; }
                    .content { margin-top: 30px; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="topic-info">
                    <h3>题目：${this.currentTopic.title}</h3>
                    <p><strong>描述：</strong>${this.currentTopic.description}</p>
                    <p><strong>要求：</strong>${this.currentTopic.requirements}</p>
                </div>
                <div class="content">${content}</div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

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

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

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

    // AI助手相关方法（已废弃，使用简化版AI助手）

    showNewAiAssistant() {
        // 使用简化版AI助手
        if (typeof window.simpleAI !== 'undefined') {
            window.simpleAI.show();
        } else {
            // 如果简化版AI助手还没初始化，等待一下再试
            setTimeout(() => {
                if (typeof window.simpleAI !== 'undefined') {
                    window.simpleAI.show();
                } else {
                    this.showNotification('AI助手正在加载中，请稍后重试...', 'warning');
                }
            }, 1000);
        }
    }


















}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 开始初始化写作模块...');
    
    // 延迟初始化，确保所有脚本都已加载
    setTimeout(() => {
        if (typeof writingPrompts !== 'undefined') {
            window.writingModule = new WritingModule();
            console.log('✅ 写作模块已加载，AI助手将自动启动');
        } else {
            console.error('❌ 写作题目数据未加载，请检查writing-prompts.js文件');
            // 显示错误信息给用户
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #f8d7da;
                color: #721c24;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #f5c6cb;
                z-index: 10000;
                text-align: center;
            `;
            errorDiv.innerHTML = `
                <h3>⚠️ 加载失败</h3>
                <p>写作题目数据加载失败，请检查：</p>
                <ul style="text-align: left;">
                    <li>网络连接是否正常</li>
                    <li>是否从正确的路径访问页面</li>
                    <li>浏览器控制台是否有错误信息</li>
                </ul>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">刷新页面</button>
            `;
            document.body.appendChild(errorDiv);
        }
    }, 500);
});