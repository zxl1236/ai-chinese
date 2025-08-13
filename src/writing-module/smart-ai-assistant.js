/**
 * 智能AI写作助手
 * 直接集成多提供商模型（本地 Ollama / 在线 DeepSeek / 在线 Qwen）
 * - 自动根据模型判定 provider
 * - 前端 fetch 超时与重试，不复用旧的 AbortSignal
 * - 自动按页面协议选择 http/https，避免混合内容拦截
 */

class SmartAIAssistant {
    constructor() {
        this.isVisible = false;
        this.isMinimized = false;
        this.currentTopic = '';
        this.currentContent = '';
        this.wordCount = 0;
        this.writingStage = 'ready'; // ready, planning, starting, writing, reviewing
        this.handleTriggerClick = null; // 记录触发按钮的单一点击处理器，避免重复绑定
        this.isProcessing = false; // 防止快速点击导致的抖动
        console.log('[AI] 构造函数完成，isProcessing:', this.isProcessing);
        this._eventsBound = false; // 防止重复绑定事件
        this.isAnimating = false; // 动画锁，防止过渡期间重复切换

        // 后端API配置（根据页面协议自动拼接，避免 https→http 混合内容）
        const baseOrigin = (window.location.protocol === 'https:'
            ? 'https://localhost:5000'
            : 'http://localhost:5000');

        this.apiConfig = {
            baseUrl: `${baseOrigin}/api`, // ensureBaseUrl 会在 init 里校验/切换
            model: 'qwen-turbo',          // 默认在线快速模型
            provider: 'qwen',             // 与默认模型对应的提供商
            temperature: 0.7,
            timeout: 120000,              // ✅ 单次调用超时 120s（原 60s）
            maxRetries: 1                 // 失败后重试 1 次（总计 2 次）
        };

        // 可用的模型选项（带 provider）
        this.availableModels = {
            'qwen-plus-2025-04-28': { name: 'Qwen Plus 思考模型 (在线)', provider: 'qwen',   speed: 'thinking' },
            'qwen-turbo':            { name: 'Qwen Turbo (在线)',        provider: 'qwen',   speed: 'fastest'  },
            'qwen-plus':             { name: 'Qwen Plus (在线)',         provider: 'qwen',   speed: 'fast'     },
            'qwen-max':              { name: 'Qwen Max (在线)',          provider: 'qwen',   speed: 'medium'   },
            'deepseek-chat':         { name: 'DeepSeek Chat (在线)',     provider: 'deepseek', speed: 'fast'   },
            'deepseek-coder':        { name: 'DeepSeek Coder (在线)',    provider: 'deepseek', speed: 'fast'   },
            'deepseek-r1:1.5b':      { name: 'DeepSeek R1 (本地)',       provider: 'ollama', speed: 'slow'     },
            'qwen2.5:0.5b':          { name: 'Qwen2.5 0.5B (本地)',      provider: 'ollama', speed: 'medium'   },
            'llama3.2:1b':           { name: 'Llama3.2 1B (本地)',       provider: 'ollama', speed: 'medium'   }
        };

        this.init(); // 异步初始化
    }

    // 根据模型名返回 provider
    getModelProvider(model) {
        return this.availableModels[model]?.provider || 'ollama';
    }

    // ✅ 自动探测正确的 baseUrl（处理 https 页面/混合内容/端口不一致）
    async ensureBaseUrl() {
        const tryBase = async (base) => {
            try {
                // 注意：后端是 /api/health
                const r = await fetch(`${base}/api/health`, { mode: 'cors', cache: 'no-store' });
                return r.ok;
            } catch { return false; }
        };

        // 先从当前的 base 推导（把 /api 去掉）
        let currentBase = this.apiConfig.baseUrl.replace(/\/api$/, '');

        // 1) 先试当前协议
        if (await tryBase(currentBase)) {
            this.apiConfig.baseUrl = `${currentBase}/api`;
            console.log('[AI] baseUrl OK:', this.apiConfig.baseUrl);
            return;
        }

        // 2) 再试切换协议
        const swapped = currentBase.startsWith('https://')
            ? currentBase.replace('https://', 'http://')
            : currentBase.replace('http://', 'https://');

        if (await tryBase(swapped)) {
            this.apiConfig.baseUrl = `${swapped}/api`;
            console.log('[AI] baseUrl switched to:', this.apiConfig.baseUrl);
            return;
        }

        // 3) 最后尝试同源相对路径（如果前端 dev 服务器把 /api 代理到后端）
        const sameOrigin = `${window.location.origin}`;
        if (await tryBase(sameOrigin)) {
            this.apiConfig.baseUrl = `${sameOrigin}/api`;
            console.log('[AI] baseUrl use same-origin:', this.apiConfig.baseUrl);
            return;
        }

        console.warn('[AI] 无法探测可用 baseUrl，请确认后端已启动且协议与当前页面匹配');
    }

    async init() {
        await this.ensureBaseUrl();   // << 确保第一次请求前 baseUrl 有效
        this.loadHTML();
        this.startMonitoring();
        this.checkConnection();
    }

    loadHTML() {
        if (document.getElementById('smart-ai-assistant')) {
            console.log('AI助手HTML已存在，直接绑定事件');
            this.bindEvents(true);
            return;
        }

        const htmlPath = window.location.pathname.includes('writing-module') 
            ? 'smart-ai-assistant.html' 
            : 'src/writing-module/smart-ai-assistant.html';
            
        fetch(htmlPath)
            .then(response => {
                if (!response.ok) throw new Error('HTML文件加载失败');
                return response.text();
            })
            .then(html => {
                document.body.insertAdjacentHTML('beforeend', html);
                console.log('✅ AI助手HTML已加载');
                this.normalizePanelStyles();  // ← 新增
                
                // 等待DOM渲染完成后再绑定事件
                requestAnimationFrame(() => {
                    this.bindEvents(true);
                });
            })
            .catch((error) => {
                console.log('📄 HTML文件加载失败，使用内置HTML:', error.message);
                this.createHTML();
            });
    }

    createHTML() {
        this.addCSS();
        const html = `
        <div id="smart-ai-assistant" class="smart-ai-assistant">
            <div class="ai-trigger" id="ai-trigger">
                <div class="ai-avatar">
                    <span class="ai-icon">🤖</span>
                    <div class="ai-pulse"></div>
                </div>
                <div class="ai-status" id="ai-status">
                    <span class="status-text">AI助手</span>
                    <span class="status-hint">点击获取帮助</span>
                </div>
            </div>

            <div class="ai-panel" id="ai-panel">
                <div class="ai-header">
                    <div class="ai-title">
                        <span class="ai-emoji">🤖</span>
                        <span>AI写作助手</span>
                    </div>
                    <div class="ai-controls">
                        <button class="ai-minimize" id="ai-minimize" title="最小化">−</button>
                        <button class="ai-close" id="ai-close" title="关闭">×</button>
                    </div>
                </div>

                <div class="ai-content">
                    <div class="writing-status">
                        <div class="status-item">
                            <span class="status-label">当前状态：</span>
                            <span class="status-value" id="writing-stage">准备写作</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">题目：</span>
                            <span class="status-value" id="current-topic-display">未输入</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">字数：</span>
                            <span class="status-value" id="word-count-display">0字</span>
                        </div>
                    </div>

                    <div class="ai-suggestions" id="ai-suggestions">
                        <div class="suggestion-header">
                            <span class="suggestion-icon">💡</span>
                            <span>智能建议</span>
                        </div>
                        <div class="suggestion-content" id="suggestion-content">
                            <p class="suggestion-placeholder">输入题目后，我会为您提供写作建议</p>
                        </div>
                    </div>

                    <div class="ai-actions">
                        <button class="ai-action-btn" id="analyze-topic-btn" disabled>
                            <span class="btn-icon">🔍</span>
                            <span class="btn-text">分析题目</span>
                        </button>
                        
                        <button class="ai-action-btn" id="get-inspiration-btn" disabled>
                            <span class="btn-icon">💡</span>
                            <span class="btn-text">获取灵感</span>
                        </button>
                        
                        <button class="ai-action-btn" id="improve-writing-btn" disabled>
                            <span class="btn-icon">✨</span>
                            <span class="btn-text">优化文章</span>
                        </button>
                        
                        <button class="ai-action-btn" id="continue-writing-btn" disabled>
                            <span class="btn-icon">✍️</span>
                            <span class="btn-text">续写建议</span>
                        </button>
                    </div>

                    <div class="ai-response" id="ai-response" style="display: none;">
                        <div class="response-header">
                            <span class="response-title" id="response-title">AI建议</span>
                            <div class="response-actions">
                                <button class="response-action" id="copy-response" title="复制">📋</button>
                                <button class="response-action" id="apply-response" title="应用" style="display: none;">✅</button>
                                <button class="response-action" id="close-response" title="关闭">×</button>
                            </div>
                        </div>
                        <div class="response-content" id="response-content"></div>
                    </div>
                </div>

                <div class="ai-footer">
                    <div class="model-selector" style="margin-bottom: 12px; position: relative; z-index: 10;">
                        <label style="font-size: 12px; color: #64748b; margin-bottom: 6px; display: block;">AI模型选择:</label>
                        <select id="model-selector" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; background: white; cursor: pointer; appearance: auto; -webkit-appearance: menulist; -moz-appearance: menulist;">
                            <option value="qwen-turbo" selected>Qwen Turbo (在线) - 最快 🚀</option>
                            <option value="qwen-plus-2025-04-28">Qwen Plus 思考模型 🧠 - 深度分析</option>
                            <option value="qwen-plus">Qwen Plus (在线) - 平衡</option>
                            <option value="qwen-max">Qwen Max (在线) - 质量最佳</option>
                            <option value="deepseek-chat">DeepSeek Chat (在线) - 需要密钥</option>
                            <option value="deepseek-coder">DeepSeek Coder (在线) - 需要密钥</option>
                            <option value="deepseek-r1:1.5b">DeepSeek R1 (本地) - 较慢</option>
                            <option value="qwen2.5:0.5b">Qwen2.5 (本地) - 轻量</option>
                            <option value="llama3.2:1b">Llama3.2 (本地) - 轻量</option>
                        </select>
                    </div>
                    
                    <div class="connection-status" id="connection-status">
                        <span class="status-dot"></span>
                        <span class="status-text">正在连接AI服务...</span>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        console.log('✅ AI助手HTML已创建');
        this.normalizePanelStyles();  // ← 新增
        
        // 等待DOM渲染完成后再绑定事件
        requestAnimationFrame(() => {
            this.bindEvents(true);
        });
    }

    // 标准化面板样式，清除内联display:none
    normalizePanelStyles() {
        const panel = document.getElementById('ai-panel');
        if (!panel) return;
        // 去掉阻塞显示的内联样式
        if (panel.style.display === 'none') {
            panel.style.removeProperty('display');
        }
        // 确保面板初始状态是隐藏的
        panel.classList.remove('visible');
        this.isVisible = false;
    }

    // 从一组选择器里找到第一个有值的元素，返回其文本/值
    getFirstText(selectors = []) {
        console.log('[AI] getFirstText 开始检测，选择器:', selectors);
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            console.log(`[AI] 检查选择器 "${sel}":`, el ? '找到元素' : '未找到');
            if (!el) continue;
            let v = '';
            if ('value' in el) {
                v = (el.value || '').trim();
                console.log(`[AI] 从 value 获取: "${v}"`);
            } else {
                v = (el.textContent || '').trim();
                console.log(`[AI] 从 textContent 获取: "${v}"`);
            }
            if (v) {
                console.log(`[AI] 找到内容: "${v}"`);
                return v;
            }
        }
        console.log('[AI] 未找到任何内容');
        return '';
    }

    addCSS() {
        if (document.getElementById('smart-ai-assistant-css')) return;
        const css = `
        <style id="smart-ai-assistant-css">
        .smart-ai-assistant{position:fixed;top:20px;right:20px;z-index:2147483647;font-family:'Microsoft YaHei',-apple-system,BlinkMacSystemFont,sans-serif}
        .ai-trigger{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:12px 16px;border-radius:50px;cursor:pointer;box-shadow:0 8px 25px rgba(102,126,234,.3);transition:all .3s cubic-bezier(.4,0,.2,1);user-select:none;position:relative;pointer-events:auto !important}
        .ai-trigger:hover:not(.active){/* 不再位移，避免创建新的 stacking context */ box-shadow:0 12px 35px rgba(102,126,234,.4)}
        /* 防止按钮自身尺寸变化引起抖动：active 状态不改宽高/内边距/边框厚度 */
        .ai-trigger.active{
          /* 原有的 border-radius/阴影可以保留 */
          border-radius:16px 16px 0 0;
          box-shadow:0 8px 25px rgba(102,126,234,.2);
          /* ⚠️ 不要在 active 中改 padding/border-width/font-size/line-height */
        }
        .ai-trigger:active{/* 去掉缩放，避免 hover/active 与面板过渡打架 */}
        .ai-avatar{position:relative;width:32px;height:32px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ai-icon{font-size:18px;line-height:1}
        .ai-pulse{position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:#10b981;border-radius:50%;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.2)}}
        .ai-status{display:flex;flex-direction:column;gap:2px}
        .status-text{font-size:14px;font-weight:600;line-height:1.2}
        .status-hint{font-size:11px;opacity:.8;line-height:1.2}
        /* 让面板用透明度与位移过渡，避免 reflow 抖动 */
        .ai-panel{
          position:fixed; top:80px; right:20px; width:360px;  /* ← 固定到视口，避开祖先 transform/overflow 影响 */
          background:#fff; border-radius:16px;
          box-shadow:0 20px 60px rgba(0,0,0,.15);
          border:1px solid rgba(0,0,0,.1);
          overflow:visible;
          z-index:2147483646;  /* ← 比页面上大多数元素更高，只低于 .smart-ai-assistant */

          opacity:0; transform: translateY(6px);
          pointer-events:none;
          transition: opacity .22s ease, transform .22s ease;
          will-change: opacity, transform;
        }
        .ai-panel.visible{
          opacity:1; transform: translateY(0);
          pointer-events:auto;
        }
        .ai-header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
        .ai-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600}
        .ai-controls{display:flex;gap:8px}
        .ai-minimize,.ai-close{background:rgba(255,255,255,.2);border:none;color:#fff;width:28px;height:28px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:background .2s}
        .ai-minimize:hover,.ai-close:hover{background:rgba(255,255,255,.3)}
        .ai-content{padding:20px}
        .writing-status{background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px}
        .status-item{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
        .status-item:last-child{margin-bottom:0}
        .status-label{font-size:13px;color:#64748b;font-weight:500}
        .status-value{font-size:13px;color:#1e293b;font-weight:600}
        .ai-suggestions{margin-bottom:20px}
        .suggestion-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:14px;font-weight:600;color:#1e293b}
        .suggestion-content{background:#f1f5f9;border-radius:8px;padding:12px;font-size:13px;color:#64748b;line-height:1.5}
        .ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
        .ai-action-btn{display:flex;align-items:center;gap:8px;background:#fff;border:2px solid #e2e8f0;color:#64748b;padding:12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:500;transition:all .2s}
        .ai-action-btn:not(:disabled):hover{border-color:#667eea;color:#667eea;background:#f8faff}
        .ai-action-btn:disabled{opacity:.5;cursor:not-allowed}
        .ai-response{background:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:20px}
        .response-header{background:#e2e8f0;padding:12px 16px;display:flex;justify-content:space-between;align-items:center}
        .response-title{font-size:14px;font-weight:600;color:#1e293b}
        .response-actions{display:flex;gap:8px}
        .response-action{background:transparent;border:none;color:#64748b;cursor:pointer;padding:4px;border-radius:4px;transition:background .2s}
        .response-action:hover{background:rgba(0,0,0,.1)}
        .response-content{padding:16px;font-size:13px;line-height:1.6;color:#1e293b}
        .ai-footer{background:#f8fafc;padding:12px 20px;border-top:1px solid #e2e8f0}
        .connection-status{display:flex;align-items:center;gap:8px;font-size:12px;color:#64748b}
        .status-dot{width:8px;height:8px;background:#10b981;border-radius:50%;animation:pulse 2s infinite}
        .status-dot.error{background:#ef4444}
        /* 确保下拉菜单可以正常工作 */
        .model-selector select{pointer-events:auto !important;position:relative;z-index:1000}
        .model-selector select:focus{outline:2px solid #667eea;outline-offset:2px}
        .ai-footer{overflow:visible !important;position:relative;z-index:100}
        /* 防止抖动 */
        .ai-trigger{will-change:transform}
        .ai-trigger.thinking{animation:none !important}
        .ai-trigger *{pointer-events:none}
        .ai-trigger{pointer-events:auto !important}
        /* 面板显示时禁用hover效果 */
        .ai-trigger.active:hover{transform:none !important;box-shadow:0 8px 25px rgba(102,126,234,.2) !important}
        /* 确保active状态优先级最高 */
        .ai-trigger.active{transform:none !important}
        /* 让下拉所在容器单独建立层叠环境，并抬高层级 */
        .model-selector { position: relative; z-index: 2147483647; }
        </style>`;
        document.head.insertAdjacentHTML('beforeend', css);
    }

    bindEvents(force = false) {
        if (this._eventsBound && !force) return;

        const tryBind = () => {
            const root = document.getElementById('smart-ai-assistant');
            const trigger = document.getElementById('ai-trigger');
            const panel = document.getElementById('ai-panel');

            // 只等待这三个关键节点；其它节点可选
            if (!root || !trigger || !panel) {
                requestAnimationFrame(tryBind);
                return;
            }

            // ===== 触发按钮 =====
            // 先移除所有可能的点击事件
            trigger.removeEventListener('click', this.handleTriggerClick);
            trigger.onclick = null;
            
            this.handleTriggerClick = (e) => {
                console.log('[AI] 触发按钮被点击');
                e.preventDefault();
                e.stopPropagation();
                if (this.isProcessing || this.isAnimating) {
                    console.log('[AI] 点击被阻止，正在处理中', {isProcessing: this.isProcessing, isAnimating: this.isAnimating});
                    return;
                }
                console.log('[AI] 开始处理点击');
                this.isProcessing = true;
                setTimeout(() => { 
                    console.log('[AI] isProcessing 重置为 false');
                    this.isProcessing = false; 
                }, 300);
                this.togglePanel();
            };
            trigger.addEventListener('click', this.handleTriggerClick, { passive: false });
            console.log('[AI] 触发按钮事件已绑定');

            // ===== 其它按钮 =====
            const minimizeBtn = document.getElementById('ai-minimize');
            if (minimizeBtn) minimizeBtn.addEventListener('click', () => this.minimizePanel());
            const closeBtn = document.getElementById('ai-close');
            if (closeBtn) closeBtn.addEventListener('click', () => this.closePanel());
            const analyzeBtnEl = document.getElementById('analyze-topic-btn');
            if (analyzeBtnEl) analyzeBtnEl.addEventListener('click', () => this.analyzeTopic());
            const inspirationBtnEl = document.getElementById('get-inspiration-btn');
            if (inspirationBtnEl) inspirationBtnEl.addEventListener('click', () => this.getInspiration());
            const improveBtnEl = document.getElementById('improve-writing-btn');
            if (improveBtnEl) improveBtnEl.addEventListener('click', () => this.improveWriting());
            const continueBtnEl = document.getElementById('continue-writing-btn');
            if (continueBtnEl) continueBtnEl.addEventListener('click', () => this.continueWriting());
            const copyBtnEl = document.getElementById('copy-response');
            if (copyBtnEl) copyBtnEl.addEventListener('click', () => this.copyResponse());
            const closeRespBtnEl = document.getElementById('close-response');
            if (closeRespBtnEl) closeRespBtnEl.addEventListener('click', () => this.closeResponse());

            // ===== 模型选择器（可选）=====
            const modelSelector = document.getElementById('model-selector');
            if (modelSelector) {
                console.log('✅ 找到模型选择器，绑定事件');
                modelSelector.value = this.apiConfig.model;
                modelSelector.addEventListener('change', (e) => {
                    this.apiConfig.model = e.target.value;
                    this.apiConfig.provider = this.getModelProvider(this.apiConfig.model);
                    this.updateConnectionStatus();
                    localStorage.setItem('ai-selected-model', e.target.value);
                });
                const savedModel = localStorage.getItem('ai-selected-model');
                if (savedModel && this.availableModels[savedModel]) {
                    modelSelector.value = savedModel;
                    this.apiConfig.model = savedModel;
                    this.apiConfig.provider = this.getModelProvider(savedModel);
                }
            } else {
                console.warn('⚠️ 未找到模型选择器元素，功能不受影响，稍后可再绑定');
            }

            // ===== 外部点击/ESC 关闭 =====
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target) && e.target !== trigger) this.setPanelVisible(false);
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.setPanelVisible(false);
            });

            this._eventsBound = true;
        };

        tryBind();
    }

    // 统一的 fetch 重试封装：每次请求使用新的 AbortSignal
    async fetchWithRetry(url, opts = {}, retries = 1, timeoutMs = 15000) {
        for (let attempt = 1; attempt <= (retries + 1); attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log(`请求超时 (${timeoutMs}ms)，中断请求`);
                controller.abort();
            }, timeoutMs);

            try {
                const resp = await fetch(url, {
                    mode: 'cors',
                    cache: 'no-store',
                    credentials: 'omit',
                    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
                    signal: controller.signal,
                    ...opts
                });
                
                clearTimeout(timeoutId);
                
                if (!resp.ok) {
                    const text = await resp.text().catch(() => '');
                    throw new Error(`HTTP ${resp.status}: ${text.slice(0, 500)}`);
                }
                return await resp.json();
            } catch (err) {
                clearTimeout(timeoutId);
                
                const retriable = err?.name === 'AbortError' ||
                                  /Failed to fetch|NetworkError|timed out/i.test(err?.message) ||
                                  /HTTP 5\d{2}/.test(err?.message);
                if (!retriable || attempt === (retries + 1)) throw err;
                
                console.log(`尝试 ${attempt} 失败，将重试:`, err.message);
                await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt - 1)));
            }
        }
    }

    // 通用API调用方法（自动附带 model / provider / temperature）
    async callAPI(endpoint, data = {}, retryCount = 0) {
        try {
            const url = this.apiConfig.baseUrl + endpoint;
            const body = {
                model: this.apiConfig.model,
                provider: this.apiConfig.provider || this.getModelProvider(this.apiConfig.model),
                temperature: this.apiConfig.temperature,
                ...data
            };
            // 调试：如需关闭可注释
            console.log('[callAPI]', url, 'body=', body);

            const result = await this.fetchWithRetry(
                url,
                { method: 'POST', body: JSON.stringify(body) },
                this.apiConfig.maxRetries,
                Math.max(this.apiConfig.timeout, 15000) // ✅ 使用 120000ms
            );
            return result;
        } catch (error) {
            console.error(`API调用失败 (尝试 ${retryCount + 1}/${this.apiConfig.maxRetries + 1}):`, error);
            if (error.name === 'AbortError') throw new Error('AI响应超时，请检查网络连接或稍后重试');
            if (/Failed to fetch|NetworkError/i.test(error.message)) throw new Error('无法连接到AI服务，请确保后端服务正在运行');
            throw error;
        }
    }

    // 开始监控写作状态
    startMonitoring() {
        console.log('[AI] startMonitoring 开始执行');
        
        // 监听题目输入
        const titleSelectors = ['#article-title', '#current-title'];
        for (const selector of titleSelectors) {
            const titleInput = document.querySelector(selector);
            if (titleInput) {
                titleInput.addEventListener('input', () => {
                    this.updateTopic();
                    this.provideSuggestions();
                });
                console.log(`[AI] 已监听题目输入: ${selector}`);
            }
        }

        // 监听内容输入
        const contentSelectors = ['#content-editor', 'textarea[name="content"]'];
        for (const selector of contentSelectors) {
            const contentEditor = document.querySelector(selector);
            if (contentEditor) {
                contentEditor.addEventListener('input', () => {
                    this.updateContent();
                    this.updateWritingStage();
                });
                console.log(`[AI] 已监听内容输入: ${selector}`);
            }
        }

        console.log('[AI] 设置定时器，每2秒检查状态');
        setInterval(() => { 
            if (this.isVisible) {
                console.log('[AI] 定时器触发，面板可见，更新状态');
                this.updateStatus(); 
            }
        }, 2000);
        
        console.log('[AI] startMonitoring 执行完成');
    }

    // 更新题目
    updateTopic() {
        const topicDisplay = document.getElementById('current-topic-display');

        // 依次尝试这些常见位置（按你的页面结构排在前面的优先）
        const topic = this.getFirstText([
            '#current-title',
            '#article-title',
            '#test-title',  // 测试页面专用
            '.writing-title h1',
            '.writing-title',
            '.task-title',
            'input[name="title"]',
            'input#title',
            'textarea#title'
        ]);

        console.log('[AI] 检测题目:', {
            found: topic,
            current: this.currentTopic,
            selectors: ['#current-title', '#article-title', '#test-title', '.writing-title h1', '.writing-title', '.task-title', 'input[name="title"]', 'input#title', 'textarea#title']
        });

        if (topic !== this.currentTopic) {
            this.currentTopic = topic;
            if (topicDisplay) topicDisplay.textContent = topic || '未输入';
            this.updateButtonStates();
        }
    }

    // 更新内容
    updateContent() {
        // 常见编辑器容器：contenteditable、textarea、Quill、ProseMirror 等
        const candidates = [
            '#content-editor',
            'textarea#content-editor',
            'textarea[name="content"]',
            '#test-content',  // 测试页面专用
            '.ql-editor',            // Quill
            '.ProseMirror',          // ProseMirror / TipTap
            '[contenteditable="true"]#content-editor',
            '[contenteditable="true"][data-editor="content"]',
            '#editor', '.editor', '.editor-area'
        ];

        let text = '';
        for (const sel of candidates) {
            const el = document.querySelector(sel);
            if (!el) continue;
            if ('value' in el) text = el.value;
            else text = el.innerText || el.textContent || '';
            text = (text || '').trim();
            if (text) break;
        }

        this.currentContent = text;
        this.wordCount = (text || '').replace(/\s/g, '').length;

        console.log('[AI] 检测内容:', {
            found: text,
            wordCount: this.wordCount,
            selectors: ['#content-editor', 'textarea#content-editor', 'textarea[name="content"]', '#test-content', '.ql-editor', '.ProseMirror', '[contenteditable="true"]#content-editor', '[contenteditable="true"][data-editor="content"]', '#editor', '.editor', '.editor-area']
        });

        const wordCountDisplay = document.getElementById('word-count-display');
        if (wordCountDisplay) wordCountDisplay.textContent = `${this.wordCount}字`;
    }

    // 更新写作阶段
    updateWritingStage() {
        let stage = 'ready';
        let stageText = '准备写作';
        if (this.currentTopic) {
            if (this.wordCount === 0) {
                stage = 'planning'; stageText = '构思中';
            } else if (this.wordCount < 200) {
                stage = 'starting'; stageText = '开始写作';
            } else if (this.wordCount < 500) {
                stage = 'writing'; stageText = '写作中';
            } else {
                stage = 'reviewing'; stageText = '完善中';
            }
        }
        this.writingStage = stage;
        const stageDisplay = document.getElementById('writing-stage');
        if (stageDisplay) stageDisplay.textContent = stageText;
    }

    // 更新按钮状态
    updateButtonStates() {
        const hasTitle = Boolean(this.currentTopic);
        const hasContent = this.wordCount > 0;

        const analyzeBtn = document.getElementById('analyze-topic-btn');
        const inspirationBtn = document.getElementById('get-inspiration-btn');
        const improveBtn = document.getElementById('improve-writing-btn');
        const continueBtn = document.getElementById('continue-writing-btn');

        if (analyzeBtn) analyzeBtn.disabled = !hasTitle;
        if (inspirationBtn) inspirationBtn.disabled = !hasTitle;
        if (improveBtn) improveBtn.disabled = !hasContent;
        if (continueBtn) continueBtn.disabled = !hasContent;

        // 调试信息
        console.log('[AI] 按钮状态更新:', {
            hasTitle,
            hasContent,
            currentTopic: this.currentTopic,
            wordCount: this.wordCount,
            analyzeBtn: analyzeBtn?.disabled,
            inspirationBtn: inspirationBtn?.disabled,
            improveBtn: improveBtn?.disabled,
            continueBtn: continueBtn?.disabled
        });
    }

    // 状态聚合更新
    updateStatus() {
        console.log('[AI] updateStatus 开始执行');
        this.updateTopic();
        this.updateContent();
        this.updateWritingStage();
        this.updateButtonStates();
        console.log('[AI] updateStatus 执行完成');
    }

    // 提供智能建议（本地逻辑，不调用AI）
    async provideSuggestions() {
        if (!this.currentTopic) return;
        const suggestionContent = document.getElementById('suggestion-content');
        if (!suggestionContent) return;

        let suggestion = '';
        switch (this.writingStage) {
            case 'planning':  suggestion = '💡 建议先分析题目，理解题意，然后构思文章结构'; break;
            case 'starting':  suggestion = '✍️ 可以从一个引人注目的开头开始，比如场景描述或问题引入'; break;
            case 'writing':   suggestion = '📝 继续展开内容，注意段落之间的逻辑连接'; break;
            case 'reviewing': suggestion = '✨ 文章已有一定长度，可以考虑优化语言表达和结构'; break;
            default:          suggestion = '🎯 输入题目后，我会根据您的写作进度提供相应建议';
        }
        suggestionContent.innerHTML = `<p>${suggestion}</p>`;
    }

    // 调试方法：检查DOM元素状态
    debugDOMElements() {
        console.log('🔍 调试DOM元素状态:');
        console.log('- ai-trigger:', document.getElementById('ai-trigger'));
        console.log('- ai-panel:', document.getElementById('ai-panel'));
        console.log('- model-selector:', document.getElementById('model-selector'));
        console.log('- 所有包含model-selector的元素:', document.querySelectorAll('[id*="model"]'));
        
        // 检查整个AI助手容器
        const assistant = document.getElementById('smart-ai-assistant');
        if (assistant) {
            console.log('- smart-ai-assistant 存在，子元素数量:', assistant.children.length);
            console.log('- 所有子元素:', Array.from(assistant.children).map(el => el.tagName + (el.id ? '#' + el.id : '')));
        } else {
            console.log('- smart-ai-assistant 不存在');
        }
    }



    // 统一的显示控制函数
    setPanelVisible(visible) {
        const panel = document.getElementById('ai-panel');
        const trigger = document.getElementById('ai-trigger');
        if (!panel || !trigger) return;

        // 动画锁：过渡期间不允许反复切换，避免抖动
        if (this.isAnimating) return;

        // 避免外部 HTML 带来的内联 display:none 继续生效
        if (visible && panel.style.display === 'none') {
            panel.style.removeProperty('display');
        }

        this.isVisible = visible;
        panel.classList.toggle('visible', visible);
        trigger.classList.toggle('active', visible);



        // 进入/离开时加锁，结束后解锁
        const onStart = () => { this.isAnimating = true; };
        const onEnd = () => { this.isAnimating = false; };
        panel.removeEventListener('transitionstart', onStart);
        panel.removeEventListener('transitionend', onEnd);
        panel.addEventListener('transitionstart', onStart, { once: true });
        panel.addEventListener('transitionend', onEnd, { once: true });

        // 面板打开时立即刷新状态，避免等待轮询
        if (visible) {
            console.log('[AI] 面板即将显示，开始更新状态');
            // 先立即跑一次，避免等待 2s 轮询
            this.updateStatus();
            // 下一帧再跑，确保富文本编辑器的 DOM 就绪
            requestAnimationFrame(() => {
                console.log('[AI] requestAnimationFrame 触发，再次更新状态');
                this.updateStatus();
            });
            // 再延迟一点，确保所有元素都加载完成
            setTimeout(() => {
                console.log('[AI] setTimeout 触发，最后更新状态');
                this.updateStatus();
            }, 100);
        }
    }

    // 面板控制
    togglePanel() {
        console.log('[AI] togglePanel 被调用', {
            isProcessing: this.isProcessing,
            isAnimating: this.isAnimating,
            currentVisible: this.isVisible
        });
        // 移除防抖检查，因为点击事件已经处理了防抖
        this.setPanelVisible(!this.isVisible);
    }
    minimizePanel() {
        this.setPanelVisible(false);
    }

    closePanel() {
        this.minimizePanel();
        this.closeResponse();
    }

    // ====== 四个 AI 业务入口（只传业务字段，model/provider 由 callAPI 统一补全） ======
    async analyzeTopic() {
        if (!this.currentTopic) {
            console.log('[AI] 分析题目失败：没有题目');
            return;
        }
        console.log('[AI] 开始分析题目:', this.currentTopic);
        const btn = document.getElementById('analyze-topic-btn');
        this.setButtonLoading(btn, true); this.showThinking();
        try {
            const res = await this.callAPI('/analyze-topic', { topic: this.currentTopic });
            console.log('[AI] 分析题目响应:', res);
            if (res.success) this.showResponse('题目分析', res.response || res.result || res.data || '');
            else throw new Error(res.error || '分析失败');
        } catch (e) { 
            console.error('[AI] 分析题目失败:', e);
            this.showError('分析失败：' + e.message); 
        }
        finally { this.setButtonLoading(btn, false); this.hideThinking(); }
    }

    async getInspiration() {
        if (!this.currentTopic) return;
        const btn = document.getElementById('get-inspiration-btn');
        this.setButtonLoading(btn, true); this.showThinking();
        try {
            const res = await this.callAPI('/get-inspiration', { topic: this.currentTopic });
            if (res.success) this.showResponse('写作灵感', res.response || res.result || '');
            else throw new Error(res.error || '获取灵感失败');
        } catch (e) { this.showError('获取灵感失败：' + e.message); }
        finally { this.setButtonLoading(btn, false); this.hideThinking(); }
    }

    async improveWriting() {
        if (!this.currentContent) return;
        const btn = document.getElementById('improve-writing-btn');
        this.setButtonLoading(btn, true); this.showThinking();
        try {
            const res = await this.callAPI('/improve-writing', { content: this.currentContent });
            if (res.success) this.showResponse('文章优化建议', res.response || res.result || '');
            else throw new Error(res.error || '优化失败');
        } catch (e) { this.showError('优化失败：' + e.message); }
        finally { this.setButtonLoading(btn, false); this.hideThinking(); }
    }

    async continueWriting() {
        if (!this.currentContent) return;
        const btn = document.getElementById('continue-writing-btn');
        this.setButtonLoading(btn, true); this.showThinking();
        try {
            const res = await this.callAPI('/continue-writing', { content: this.currentContent });
            if (res.success) this.showResponse('续写建议', res.response || res.result || '');
            else throw new Error(res.error || '续写建议失败');
        } catch (e) { this.showError('续写建议失败：' + e.message); }
        finally { this.setButtonLoading(btn, false); this.hideThinking(); }
    }

    // ====== 连接状态 ======
    async checkConnection() {
        this.updateConnectionStatus();
    }

    async updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;
        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('.status-text');

        try {
            const response = await fetch(this.apiConfig.baseUrl + '/providers');
            if (!response.ok) throw new Error('无法获取提供商信息');
            const data = await response.json();

            const modelInfo = this.availableModels[this.apiConfig.model];
            const provider = (modelInfo?.provider) || this.apiConfig.provider || 'ollama';

            if (statusDot) statusDot.classList.remove('error');

            if (provider === 'deepseek' || provider === 'qwen') {
                const providerInfo = data.providers?.[provider];
                if (providerInfo?.api_key_available) {
                    if (statusText) statusText.textContent = `${modelInfo?.name || this.apiConfig.model} - 已连接`;
                    if (provider === 'qwen' && this.apiConfig.model === 'qwen-plus-2025-04-28') {
                        if (statusText) statusText.textContent = `${modelInfo?.name || this.apiConfig.model} - 思考模式已启用 🧠`;
                    }
                } else {
                    if (statusText) statusText.textContent =
                        `${modelInfo?.name || this.apiConfig.model} - 需要${provider === 'qwen' ? 'DASHSCOPE_API_KEY' : 'DEEPSEEK_API_KEY'}`;
                    if (statusDot) statusDot.classList.add('error');
                }
            } else {
                if (statusText) statusText.textContent = `${modelInfo?.name || this.apiConfig.model} - 本地模型`;
            }
        } catch (error) {
            if (statusDot) statusDot.classList.add('error');
            if (statusText) statusText.textContent = '服务连接失败';
        }
    }

    // ====== 界面辅助 ======
    setButtonLoading(button, loading) { if (!button) return; if (loading){button.classList.add('loading');button.disabled=true;} else {button.classList.remove('loading');this.updateButtonStates();} }
    showThinking(){ const t=document.getElementById('ai-trigger'); if(t) t.classList.add('thinking'); }
    hideThinking(){ const t=document.getElementById('ai-trigger'); if(t) t.classList.remove('thinking'); }

    showResponse(title, content) {
        const responseEl = document.getElementById('ai-response');
        const titleEl = document.getElementById('response-title');
        const contentEl = document.getElementById('response-content');
        if (responseEl && titleEl && contentEl) {
            titleEl.textContent = title;
            contentEl.innerHTML = this.formatResponse(content);
            responseEl.style.display = 'block';
            responseEl.classList.remove('error');
            responseEl.classList.add('success');
        }
    }

    showError(message) {
        const responseEl = document.getElementById('ai-response');
        const titleEl = document.getElementById('response-title');
        const contentEl = document.getElementById('response-content');
        if (responseEl && titleEl && contentEl) {
            titleEl.textContent = '出现错误';
            let errorContent = `<p style="color: #ef4444;">${message}</p>`;
            if (message.includes('超时')) {
                errorContent += `
                <div style="margin-top: 12px; padding: 12px; background: #fef7cd; border-radius: 6px; font-size: 12px;">
                    <strong>💡 解决建议：</strong><br>
                    • AI正在思考中，请耐心等待<br>
                    • 尝试简化问题描述或缩短文本长度<br>
                    • 检查网络连接状态
                </div>`;
            } else if (message.includes('连接')) {
                errorContent += `
                <div style="margin-top: 12px; padding: 12px; background: #fef7cd; border-radius: 6px; font-size: 12px;">
                    <strong>🔧 解决步骤：</strong><br>
                    1. 确保后端服务正在运行 (localhost:5000)<br>
                    2. 确保 Ollama 服务正在运行 (localhost:11434)<br>
                    3. 若选在线模型，已设置 DASHSCOPE_API_KEY/DEEPSEEK_API_KEY<br>
                    4. 检查防火墙设置
                </div>`;
            }
            contentEl.innerHTML = errorContent;
            responseEl.style.display = 'block';
            responseEl.classList.remove('success');
            responseEl.classList.add('error');
        }
    }

    formatResponse(content) {
        return (content || '')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>').replace(/$/, '</p>')
            .replace(/(\d+\.\s)/g, '<br><strong>$1</strong>')
            .replace(/([：:]\s*)/g, '$1<br>');
    }

    closeResponse() {
        const responseEl = document.getElementById('ai-response');
        if (responseEl) responseEl.style.display = 'none';
    }

    async copyResponse() {
        const contentEl = document.getElementById('response-content');
        if (!contentEl) return;
        try {
            const text = contentEl.textContent || contentEl.innerText;
            await navigator.clipboard.writeText(text);
            const copyBtn = document.getElementById('copy-response');
            if (copyBtn) {
                const originalText = copyBtn.title;
                copyBtn.title = '已复制!';
                setTimeout(() => { copyBtn.title = originalText; }, 2000);
            }
        } catch (error) { console.error('复制失败:', error); }
    }
}

// 初始化智能AI助手
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.smartAI) {
            const oldElement = document.getElementById('smart-ai-assistant');
            if (oldElement) oldElement.remove();
        }
        window.smartAI = new SmartAIAssistant();
    }, 1000);
});

// 提供手动初始化方法
window.initSmartAI = function() {
    if (window.smartAI) {
        const oldElement = document.getElementById('smart-ai-assistant');
        if (oldElement) oldElement.remove();
    }
    window.smartAI = new SmartAIAssistant();
};
