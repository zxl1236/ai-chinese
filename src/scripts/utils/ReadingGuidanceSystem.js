/**
 * 圣博高效阅读六步法智能训练系统
 * 集成真人陪练功能的K9学生阅读训练平台
 */
class ReadingGuidanceSystem {
  constructor(options = {}) {
    this.container = options.container;
    this.textMarker = options.textMarker;
    this.currentStep = 1;
    this.maxSteps = 6;
    this.currentArticle = null;
    this.currentQuestions = [];
    this.userProgress = new Map();
    this.trainingHistory = [];
    
    // 陪练功能配置
    this.tutor = {
      isOnline: false,
      currentTutor: null,
      sessionId: null,
      interactionMode: 'ai', // 'ai' | 'human' | 'hybrid'
      responseStyle: 'encouraging' // 'encouraging' | 'strict' | 'analytical'
    };
    
    // 训练模式配置
    this.trainingMode = {
      current: 'guided', // 'guided' | 'independent' | 'exam' | 'challenge'
      difficulty: 'adaptive', // 'basic' | 'intermediate' | 'advanced' | 'adaptive'
      timeLimit: null,
      hintLevel: 'full' // 'none' | 'minimal' | 'moderate' | 'full'
    };

    // 答题公式库
    this.answerFormulas = {
      '概括题': {
        formula: '主体 + 做什么 + 结果/意义',
        examples: [
          '文章通过...的故事，表现了...',
          '作者通过...的描写，揭示了...'
        ],
        steps: ['确定主体', '找出事件/内容', '概括意义/效果']
      },
      '理解题': {
        formula: '词义 + 语境义 + 表达效果',
        examples: [
          '本义是...，在文中指...，表现了...',
          '表面意思是...，实际表达了...'
        ],
        steps: ['解释词语本义', '分析语境含义', '说明表达效果']
      },
      '赏析题': {
        formula: '手法 + 内容 + 效果',
        examples: [
          '运用了...手法，描写了...，表现了...',
          '采用...方式，突出了...，给人...的感受'
        ],
        steps: ['识别表达手法', '分析描写内容', '说明表达效果']
      },
      '作用题': {
        formula: '结构作用 + 内容作用 + 主题作用',
        examples: [
          '在结构上...，在内容上...，在主题上...',
          '承上启下，丰富内容，深化主题'
        ],
        steps: ['分析结构功能', '分析内容作用', '分析主题意义']
      },
      '人物分析': {
        formula: '性格特点 + 具体表现 + 意义价值',
        examples: [
          '人物具有...性格，表现在...，体现了...',
          '通过...行为/语言，表现出...品质'
        ],
        steps: ['概括性格特点', '找出具体表现', '分析人物意义']
      },
      '环境描写': {
        formula: '描写内容 + 描写手法 + 作用效果',
        examples: [
          '描写了...环境，运用...手法，营造了...氛围',
          '通过...描写，渲染了...，为...做铺垫'
        ],
        steps: ['分析描写内容', '识别描写手法', '说明作用效果']
      }
    };

    // 六步法详细配置
    this.steps = [
      {
        id: 1,
        name: '读',
        title: '第一步：通读文章和题目',
        description: '先读题目，再读文章，最后重读问题',
        trainingFocus: ['阅读速度', '信息捕捉', '问题意识'],
        timeEstimate: '5-8分钟',
        guidance: this.getReadingGuidance,
        exercises: this.getReadingExercises,
        validation: this.validateReading
      },
      {
        id: 2, 
        name: '解读文本',
        title: '第二步：判断文体并解读',
        description: '识别文体特点，选择对应的解读方法',
        trainingFocus: ['文体识别', '结构分析', '要素提取'],
        timeEstimate: '8-12分钟',
        guidance: this.getTextAnalysisGuidance,
        exercises: this.getTextAnalysisExercises,
        validation: this.validateTextAnalysis
      },
      {
        id: 3,
        name: '归纳中心',
        title: '第三步：概括文章中心',
        description: '运用简括和详括方法提取文章主旨',
        trainingFocus: ['主旨提取', '段落归纳', '逻辑梳理'],
        timeEstimate: '6-10分钟',
        guidance: this.getCenterGuidance,
        exercises: this.getCenterExercises,
        validation: this.validateCenter
      },
      {
        id: 4,
        name: '认真审题',
        title: '第四步：深度理解题目',
        description: '培养阅读认真度、理解度、感悟度、拓展能力',
        trainingFocus: ['题目分析', '考点识别', '答题规划'],
        timeEstimate: '5-8分钟',
        guidance: this.getQuestionGuidance,
        exercises: this.getQuestionExercises,
        validation: this.validateQuestion
      },
      {
        id: 5,
        name: '根据文章意境答题',
        title: '第五步：结合文章内容分点答题',
        description: '基于文章内容，分类分点组织答案',
        trainingFocus: ['公式运用', '分点组织', '规范表达'],
        timeEstimate: '15-25分钟',
        guidance: this.getAnswerGuidance,
        exercises: this.getAnswerExercises,
        validation: this.validateAnswer
      },
      {
        id: 6,
        name: '检查修正',
        title: '第六步：检查和完善答案',
        description: '检查答案完整性和准确性，进行必要修正',
        trainingFocus: ['答案检查', '逻辑完善', '表达优化'],
        timeEstimate: '5-8分钟',
        guidance: this.getCheckGuidance,
        exercises: this.getCheckExercises,
        validation: this.validateCheck
      }
    ];

    this.init();
  }

  init() {
    this.createTrainingInterface();
    this.initTutorSystem();
    this.bindEvents();
    this.loadUserProgress();
  }

  // 创建训练界面
  createTrainingInterface() {
    const trainingPanel = document.createElement('div');
    trainingPanel.className = 'reading-training-system';
    trainingPanel.innerHTML = `
      <!-- 头部控制区 -->
      <div class="training-header">
        <div class="system-title">
          <h2>圣博高效阅读六步法训练系统</h2>
          <div class="training-status">
            <span class="mode-indicator">${this.trainingMode.current}</span>
            <span class="difficulty-indicator">${this.trainingMode.difficulty}</span>
          </div>
        </div>
        
        <div class="tutor-panel">
          <div class="tutor-status ${this.tutor.isOnline ? 'online' : 'offline'}">
            <span class="tutor-avatar">👨‍🏫</span>
            <div class="tutor-info">
              <div class="tutor-name">${this.tutor.isOnline ? '陪练老师在线' : 'AI助教模式'}</div>
              <div class="tutor-mode">${this.tutor.interactionMode}</div>
            </div>
          </div>
          <button class="btn-tutor" onclick="this.toggleTutorMode()">
            ${this.tutor.isOnline ? '切换AI模式' : '申请真人陪练'}
          </button>
        </div>
      </div>

      <!-- 步骤进度区 -->
      <div class="step-progress-section">
        <div class="progress-header">
          <h3>训练进度</h3>
          <div class="time-tracker">
            <span>已用时间: <span id="elapsed-time">00:00</span></span>
            <span>预计剩余: <span id="estimated-time">--:--</span></span>
          </div>
        </div>
        
        <div class="step-indicator-advanced">
          ${this.steps.map((step, index) => `
            <div class="step-card ${index === 0 ? 'active' : ''}" data-step="${step.id}">
              <div class="step-header">
                <div class="step-number">${step.id}</div>
                <div class="step-name">${step.name}</div>
                <div class="step-time">${step.timeEstimate}</div>
              </div>
              <div class="step-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="step-status">待开始</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 主要训练区 -->
      <div class="training-main">
        <div class="training-content">
          <!-- 当前步骤信息 -->
          <div class="current-step-panel">
            <div class="step-info">
              <h3 id="current-step-title">${this.steps[0].title}</h3>
              <p id="current-step-description">${this.steps[0].description}</p>
              <div class="training-focus">
                <strong>训练重点：</strong>
                <span id="training-focus">${this.steps[0].trainingFocus.join('、')}</span>
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-help" onclick="this.requestHelp()">💡 需要帮助</button>
              <button class="btn-formula" onclick="this.showAnswerFormula()">📝 查看答题公式</button>
              <button class="btn-example" onclick="this.showExamples()">📚 查看示例</button>
            </div>
          </div>

          <!-- 训练练习区 -->
          <div class="training-exercises" id="training-exercises">
            <!-- 动态生成练习内容 -->
          </div>

          <!-- 陪练对话区 -->
          <div class="tutor-chat-panel">
            <div class="chat-header">
              <h4>💬 陪练对话</h4>
              <button class="chat-toggle" onclick="this.toggleChat()">收起</button>
            </div>
            <div class="chat-messages" id="chat-messages">
              <div class="message tutor-message">
                <div class="message-content">
                  你好！我是你的阅读训练陪练。让我们开始第一步的训练吧！有什么问题随时问我。
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
              </div>
            </div>
            <div class="chat-input">
              <input type="text" id="chat-input" placeholder="输入你的问题或想法...">
              <button onclick="this.sendMessage()">发送</button>
            </div>
          </div>
        </div>

        <!-- 侧边栏 - 工具和资源 -->
        <div class="training-sidebar">
          <div class="tools-panel">
            <h4>训练工具</h4>
            <div class="tool-buttons">
              <button class="tool-btn" onclick="this.openNotebook()">📔 笔记本</button>
              <button class="tool-btn" onclick="this.openTimerSettings()">⏱️ 计时器</button>
              <button class="tool-btn" onclick="this.openProgressReport()">📊 进度报告</button>
              <button class="tool-btn" onclick="this.openFormulaLibrary()">📋 公式库</button>
            </div>
          </div>

          <div class="resources-panel">
            <h4>学习资源</h4>
            <div class="resource-list">
              <div class="resource-item" onclick="this.openTextTypeGuide()">
                📖 文体识别指南
              </div>
              <div class="resource-item" onclick="this.openAnswerTemplates()">
                📝 答题模板库
              </div>
              <div class="resource-item" onclick="this.openCommonMistakes()">
                ⚠️ 常见错误避免
              </div>
              <div class="resource-item" onclick="this.openExamTips()">
                🎯 考试技巧
              </div>
            </div>
          </div>

          <div class="achievement-panel">
            <h4>学习成就</h4>
            <div class="achievement-list" id="achievements">
              <!-- 动态生成成就 -->
            </div>
          </div>
        </div>
      </div>

      <!-- 导航控制 -->
      <div class="training-navigation">
        <button id="prev-step" class="btn-nav" disabled>← 上一步</button>
        <button id="pause-training" class="btn-pause">⏸️ 暂停训练</button>
        <button id="next-step" class="btn-nav">下一步 →</button>
        <button id="complete-training" class="btn-complete" style="display:none">🎉 完成训练</button>
      </div>
    `;

    const targetContainer = this.container || document.querySelector('.reading-section');
    if (targetContainer) {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(trainingPanel);
    }

    this.trainingPanel = trainingPanel;
  }

  // 初始化陪练系统
  initTutorSystem() {
    this.tutorResponses = {
      encouraging: {
        step1: [
          "很好！先快速浏览题目，这样能帮你更有目标地阅读文章。",
          "记住，阅读时要带着问题去读，这样效率会更高。",
          "不要担心第一遍读不懂，这是正常的。重点是要抓住大意。"
        ],
        step2: [
          "文体判断很重要！不同文体有不同的阅读方法。",
          "你能尝试说出这是什么文体吗？说出你的理由。",
          "很棒！继续分析文章的结构层次。"
        ],
        step3: [
          "归纳中心思想需要抓住关键词，你找到了哪些关键词？",
          "试着用一句话概括文章的主要内容。",
          "很好的总结！现在让我们深入分析一下。"
        ],
        step4: [
          "审题是得分的关键！每个字都要仔细看。",
          "这个题目考查的是什么能力？你能分析一下吗？",
          "注意题目中的关键词，它们会指导你的答题方向。"
        ],
        step5: [
          "现在运用我们学过的答题公式来组织答案吧！",
          "记住要分点作答，条理清晰。",
          "很好！你的答案结构很清楚。"
        ],
        step6: [
          "检查答案时要从三个维度：完整性、准确性、规范性。",
          "看看你的答案是否回答了题目的所有要求。",
          "优秀！你的学习态度很认真。"
        ]
      },
      analytical: {
        step1: [
          "根据题目类型，我建议你重点关注文章的以下部分...",
          "这类题目通常考查...,阅读时需要特别注意...",
          "从题目设置来看，文章的重点应该在..."
        ],
        step2: [
          "从语言特点看，这篇文章具有...的特征",
          "结构分析显示，文章采用了...的组织方式",
          "根据写作手法，我们可以判断..."
        ],
        step3: [
          "通过关键词分析，文章的中心思想围绕...",
          "段落层次分析表明...",
          "主题提取需要注意..."
        ],
        step4: [
          "题目类型分析：这是...题，主要考查...",
          "答题策略建议：...",
          "常见陷阱提醒：..."
        ],
        step5: [
          "根据题型，应该使用...答题公式",
          "答案组织建议：...",
          "表达规范要求：..."
        ],
        step6: [
          "检查重点：...",
          "改进建议：...",
          "评分标准对照：..."
        ]
      }
    };
  }

  // 获取第一步练习
  getReadingExercises() {
    return `
      <div class="training-exercise step1-exercise">
        <div class="exercise-header">
          <h5>📖 阅读训练</h5>
          <div class="exercise-timer">
            <span>建议用时: 5-8分钟</span>
            <button class="start-timer" onclick="this.startStepTimer()">开始计时</button>
          </div>
        </div>

        <div class="exercise-content">
          <div class="reading-task">
            <h6>任务一：题目预览（2分钟）</h6>
            <div class="task-instruction">
              快速浏览所有题目，用不同颜色标记关键词：
              <ul>
                <li>🔴 题目类型词（概括、理解、赏析等）</li>
                <li>🔵 考查对象（词语、句子、段落等）</li>
                <li>🟢 具体要求（作用、含义、手法等）</li>
              </ul>
            </div>
            
            <div class="questions-preview">
              ${this.currentQuestions.map((q, i) => `
                <div class="question-preview" data-question="${i}">
                  <div class="question-number">题目 ${i + 1}</div>
                  <div class="question-text selectable-text" onclick="this.highlightKeywords(${i})">${q.question}</div>
                  <div class="keyword-tools">
                    <button class="highlight-btn red" data-color="red">类型词</button>
                    <button class="highlight-btn blue" data-color="blue">考查对象</button>
                    <button class="highlight-btn green" data-color="green">具体要求</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="reading-task">
            <h6>任务二：文章通读（3-5分钟）</h6>
            <div class="task-instruction">
              通读文章，完成以下记录：
            </div>
            
            <div class="reading-notes">
              <div class="note-item">
                <label>文章主要写了什么？</label>
                <textarea placeholder="用一句话概括..." rows="2"></textarea>
              </div>
              <div class="note-item">
                <label>你的第一印象是什么？</label>
                <textarea placeholder="记录你的直观感受..." rows="2"></textarea>
              </div>
              <div class="note-item">
                <label>哪些地方让你印象深刻？</label>
                <textarea placeholder="标记重点段落或句子..." rows="2"></textarea>
              </div>
            </div>
          </div>

          <div class="reading-task">
            <h6>任务三：问题重读（1分钟）</h6>
            <div class="task-instruction">
              带着对文章的理解，重新思考题目要求：
            </div>
            
            <div class="question-rethink">
              ${this.currentQuestions.map((q, i) => `
                <div class="question-rethink-item">
                  <div class="question-brief">题目${i + 1}: ${q.question.substring(0, 20)}...</div>
                  <div class="answer-plan">
                    <label>我需要从文章哪部分找答案？</label>
                    <input type="text" placeholder="段落范围或关键位置...">
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="exercise-validation">
          <h6>✓ 完成确认</h6>
          <div class="validation-checklist">
            <label><input type="checkbox" data-task="preview"> 我已完成题目预览并标记关键词</label>
            <label><input type="checkbox" data-task="reading"> 我已通读文章并记录要点</label>
            <label><input type="checkbox" data-task="rethink"> 我已重新思考题目要求</label>
          </div>
          <button class="validate-step" onclick="this.validateCurrentStep()">完成第一步</button>
        </div>
      </div>
    `;
  }

  // 获取第二步练习
  getTextAnalysisExercises() {
    const detectedType = this.detectTextType();
    
    return `
      <div class="training-exercise step2-exercise">
        <div class="exercise-header">
          <h5>🔍 文本解读训练</h5>
          <div class="exercise-timer">
            <span>建议用时: 8-12分钟</span>
          </div>
        </div>

        <div class="exercise-content">
          <div class="text-analysis-task">
            <h6>任务一：文体判断（3分钟）</h6>
            <div class="text-type-detection">
              <div class="detection-result">
                <span>AI检测结果：<strong>${detectedType}</strong></span>
                <button class="btn-small" onclick="this.showTypeFeatures('${detectedType}')">查看特征</button>
              </div>
              
              <div class="manual-analysis">
                <label>你的判断和理由：</label>
                <textarea placeholder="我认为这是...文，因为..." rows="3"></textarea>
              </div>
              
              <div class="type-features" id="type-features-${detectedType}" style="display:none">
                <h6>${detectedType}的特征：</h6>
                <ul>
                  ${this.textTypes[detectedType]?.features.map(f => `<li>${f}</li>`).join('') || ''}
                </ul>
              </div>
            </div>
          </div>

          <div class="structure-analysis-task">
            <h6>任务二：结构分析（5-7分钟）</h6>
            <div class="structure-tools">
              <div class="paragraph-analysis">
                <h6>段落层次分析：</h6>
                <div class="paragraph-list">
                  ${this.generateParagraphAnalysis()}
                </div>
              </div>
              
              <div class="logical-relationship">
                <h6>逻辑关系梳理：</h6>
                <div class="relationship-map">
                  <canvas id="structure-canvas" width="400" height="200"></canvas>
                  <div class="relationship-tools">
                    <button onclick="this.addRelationship('并列')">并列</button>
                    <button onclick="this.addRelationship('递进')">递进</button>
                    <button onclick="this.addRelationship('转折')">转折</button>
                    <button onclick="this.addRelationship('因果')">因果</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-extraction-task">
            <h6>任务三：内容要素提取（2分钟）</h6>
            <div class="elements-extraction">
              ${this.generateElementsExtraction(detectedType)}
            </div>
          </div>
        </div>

        <div class="exercise-validation">
          <button class="validate-step" onclick="this.validateCurrentStep()">完成第二步</button>
        </div>
      </div>
    `;
  }

  // 获取第三步练习
  getCenterExercises() {
    return `
      <div class="training-exercise step3-exercise">
        <div class="exercise-header">
          <h5>🎯 中心归纳训练</h5>
          <div class="exercise-timer">
            <span>建议用时: 6-10分钟</span>
          </div>
        </div>

        <div class="exercise-content">
          <div class="method-selection">
            <h6>选择归纳方法：</h6>
            <div class="method-buttons">
              <button class="method-btn active" data-method="simple" onclick="this.selectMethod('simple')">
                简括法<br><small>快速抓要点</small>
              </button>
              <button class="method-btn" data-method="detailed" onclick="this.selectMethod('detailed')">
                详括法<br><small>分段归纳</small>
              </button>
            </div>
          </div>

          <div class="center-extraction-workspace" id="extraction-workspace">
            <div class="simple-method-content active">
              <div class="keyword-extraction">
                <h6>步骤1：关键词提取</h6>
                <div class="keyword-tools">
                  <button class="extract-btn" onclick="this.autoExtractKeywords()">AI辅助提取</button>
                  <button class="extract-btn" onclick="this.manualExtractKeywords()">手动标记</button>
                </div>
                <div class="keywords-display">
                  <div class="keyword-categories">
                    <div class="keyword-category">
                      <label>人物/对象：</label>
                      <div class="keyword-tags" data-category="subject"></div>
                    </div>
                    <div class="keyword-category">
                      <label>事件/内容：</label>
                      <div class="keyword-tags" data-category="event"></div>
                    </div>
                    <div class="keyword-category">
                      <label>情感/主题：</label>
                      <div class="keyword-tags" data-category="theme"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="content-summary">
                <h6>步骤2：内容概括</h6>
                <textarea placeholder="用一句话概括文章主要内容（谁+做什么+结果）..." rows="3"></textarea>
                <div class="summary-hints">
                  <button class="hint-btn" onclick="this.showSummaryHint()">💡 概括提示</button>
                  <button class="hint-btn" onclick="this.showSummaryFormula()">📝 概括公式</button>
                </div>
              </div>

              <div class="theme-extraction">
                <h6>步骤3：主题提炼</h6>
                <textarea placeholder="这篇文章想要表达什么思想感情或道理？" rows="3"></textarea>
                <div class="theme-suggestions" id="theme-suggestions">
                  <!-- AI生成的主题建议 -->
                </div>
              </div>
            </div>

            <div class="detailed-method-content">
              <div class="paragraph-summary">
                <h6>分段归纳：</h6>
                <div class="paragraph-summaries">
                  ${this.generateDetailedSummaryFramework()}
                </div>
              </div>
              
              <div class="overall-integration">
                <h6>整体整合：</h6>
                <textarea placeholder="综合各段内容，概括全文中心..." rows="4"></textarea>
              </div>
            </div>
          </div>

          <div class="center-validation-tools">
            <h6>自我验证：</h6>
            <div class="validation-questions">
              <div class="validation-item">
                <span>我的概括是否抓住了文章的核心内容？</span>
                <div class="rating">
                  <button class="rating-btn" data-score="1">👎</button>
                  <button class="rating-btn" data-score="2">👌</button>
                  <button class="rating-btn" data-score="3">👍</button>
                </div>
              </div>
              <div class="validation-item">
                <span>我的表述是否简洁明了？</span>
                <div class="rating">
                  <button class="rating-btn" data-score="1">👎</button>
                  <button class="rating-btn" data-score="2">👌</button>
                  <button class="rating-btn" data-score="3">👍</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="exercise-validation">
          <button class="validate-step" onclick="this.validateCurrentStep()">完成第三步</button>
        </div>
      </div>
    `;
  }

  // 获取第四步练习
  getQuestionExercises() {
    return `
      <div class="training-exercise step4-exercise">
        <div class="exercise-header">
          <h5>🔎 审题训练</h5>
          <div class="exercise-timer">
            <span>建议用时: 5-8分钟</span>
          </div>
        </div>

        <div class="exercise-content">
          ${this.currentQuestions.map((question, index) => `
            <div class="question-analysis-card" data-question="${index}">
              <div class="question-header">
                <h6>题目 ${index + 1} 深度分析</h6>
                <div class="difficulty-indicator">
                  <span class="difficulty-level">${this.assessQuestionDifficulty(question)}</span>
                </div>
              </div>

              <div class="question-display">
                <div class="question-text-analysis">
                  <div class="original-question">${question.question}</div>
                  <button class="analyze-btn" onclick="this.analyzeQuestionStructure(${index})">句法分析</button>
                </div>
              </div>

              <div class="analysis-dimensions">
                <div class="dimension-item">
                  <h6>题型识别：</h6>
                  <div class="type-analysis">
                    <span class="detected-type">${this.analyzeQuestionType(question)}</span>
                    <div class="type-features">
                      <small>${this.getQuestionTypeFeatures(question)}</small>
                    </div>
                  </div>
                </div>

                <div class="dimension-item">
                  <h6>关键词分解：</h6>
                  <div class="keyword-breakdown">
                    ${this.breakdownQuestionKeywords(question.question)}
                  </div>
                </div>

                <div class="dimension-item">
                  <h6>考查能力：</h6>
                  <div class="ability-analysis">
                    ${this.analyzeRequiredAbilities(question)}
                  </div>
                </div>

                <div class="dimension-item">
                  <h6>答题策略：</h6>
                  <div class="strategy-recommendation">
                    <div class="recommended-formula">
                      <strong>建议使用公式：</strong>
                      <span class="formula-name">${this.recommendFormula(question)}</span>
                      <button onclick="this.showFormulaDetails('${this.recommendFormula(question)}')">查看详情</button>
                    </div>
                    <div class="answer-steps">
                      <strong>答题步骤：</strong>
                      <ol>
                        ${this.getAnswerSteps(question).map(step => `<li>${step}</li>`).join('')}
                      </ol>
                    </div>
                  </div>
                </div>

                <div class="dimension-item">
                  <h6>定位指导：</h6>
                  <div class="location-guidance">
                    <textarea placeholder="我需要从文章的哪个部分寻找答案？为什么？" rows="2"></textarea>
                    <button class="hint-btn" onclick="this.showLocationHint(${index})">💡 定位提示</button>
                  </div>
                </div>
              </div>

              <div class="understanding-check">
                <h6>理解程度自检：</h6>
                <div class="check-questions">
                  <label><input type="checkbox"> 我明确了这道题考查什么</label>
                  <label><input type="checkbox"> 我知道用什么方法回答</label>
                  <label><input type="checkbox"> 我清楚从哪里找答案</label>
                  <label><input type="checkbox"> 我了解答案应该包含哪些要点</label>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="exercise-validation">
          <button class="validate-step" onclick="this.validateCurrentStep()">完成第四步</button>
        </div>
      </div>
    `;
  }

  // 获取第五步练习
  getAnswerExercises() {
    return `
      <div class="training-exercise step5-exercise">
        <div class="exercise-header">
          <h5>✍️ 答题训练</h5>
          <div class="exercise-timer">
            <span>建议用时: 15-25分钟</span>
          </div>
        </div>

        <div class="exercise-content">
          <div class="answer-workspace">
            <div class="question-selector">
              <h6>选择题目进行练习：</h6>
              <div class="question-tabs">
                ${this.currentQuestions.map((q, i) => `
                  <button class="question-tab ${i === 0 ? 'active' : ''}" 
                          data-question="${i}" 
                          onclick="this.selectQuestion(${i})">
                    题目 ${i + 1}
                    <span class="tab-indicator"></span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="current-question-workspace" id="question-workspace">
              ${this.generateQuestionWorkspace(0)}
            </div>
          </div>

          <div class="formula-assistant">
            <div class="assistant-header">
              <h6>📝 答题助手</h6>
              <button class="toggle-assistant" onclick="this.toggleAssistant()">收起</button>
            </div>
            
            <div class="assistant-content">
              <div class="formula-display" id="current-formula">
                <!-- 显示当前题目适用的公式 -->
              </div>
              
              <div class="template-builder">
                <h6>答案模板构建：</h6>
                <div class="template-steps" id="template-steps">
                  <!-- 动态生成模板步骤 -->
                </div>
              </div>
              
              <div class="real-time-feedback">
                <h6>实时反馈：</h6>
                <div class="feedback-display" id="feedback-display">
                  开始写答案，我会给你实时建议...
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="exercise-validation">
          <div class="answer-quality-check">
            <h6>答案质量检查：</h6>
            <div class="quality-dimensions">
              <div class="dimension">
                <span>完整性</span>
                <div class="score-bar"><div class="score-fill" style="width: 0%"></div></div>
              </div>
              <div class="dimension">
                <span>准确性</span>
                <div class="score-bar"><div class="score-fill" style="width: 0%"></div></div>
              </div>
              <div class="dimension">
                <span>规范性</span>
                <div class="score-bar"><div class="score-fill" style="width: 0%"></div></div>
              </div>
            </div>
          </div>
          <button class="validate-step" onclick="this.validateCurrentStep()">完成第五步</button>
        </div>
      </div>
    `;
  }

  // 获取第六步练习
  getCheckExercises() {
    return `
      <div class="training-exercise step6-exercise">
        <div class="exercise-header">
          <h5>✅ 检查优化训练</h5>
          <div class="exercise-timer">
            <span>建议用时: 5-8分钟</span>
          </div>
        </div>

        <div class="exercise-content">
          <div class="comprehensive-review">
            <h6>全面检查：</h6>
            <div class="review-sections">
              ${this.currentQuestions.map((q, i) => `
                <div class="answer-review-card" data-question="${i}">
                  <div class="review-header">
                    <h6>题目 ${i + 1} 答案检查</h6>
                    <div class="review-status" id="review-status-${i}">待检查</div>
                  </div>
                  
                  <div class="answer-display">
                    <div class="answer-content" id="answer-content-${i}">
                      <!-- 显示用户的答案 -->
                    </div>
                  </div>
                  
                  <div class="check-dimensions">
                    <div class="dimension-check">
                      <h6>内容检查：</h6>
                      <div class="check-items">
                        <label><input type="checkbox" data-check="requirements"> 回答了所有要求</label>
                        <label><input type="checkbox" data-check="points"> 要点无遗漏</label>
                        <label><input type="checkbox" data-check="depth"> 论述充分</label>
                      </div>
                    </div>
                    
                    <div class="dimension-check">
                      <h6>逻辑检查：</h6>
                      <div class="check-items">
                        <label><input type="checkbox" data-check="logic"> 逻辑清晰</label>
                        <label><input type="checkbox" data-check="consistency"> 前后一致</label>
                        <label><input type="checkbox" data-check="relevance"> 紧扣文章</label>
                      </div>
                    </div>
                    
                    <div class="dimension-check">
                      <h6>表达检查：</h6>
                      <div class="check-items">
                        <label><input type="checkbox" data-check="language"> 语言准确</label>
                        <label><input type="checkbox" data-check="format"> 格式规范</label>
                        <label><input type="checkbox" data-check="length"> 字数合适</label>
                      </div>
                    </div>
                  </div>
                  
                  <div class="improvement-area">
                    <h6>改进建议：</h6>
                    <textarea placeholder="基于检查结果，你认为这个答案还需要怎样改进？" rows="3"></textarea>
                    <div class="ai-suggestions" id="ai-suggestions-${i}">
                      <!-- AI生成的改进建议 -->
                    </div>
                  </div>
                  
                  <div class="revision-area">
                    <h6>答案修正：</h6>
                    <textarea placeholder="在此写出修正后的答案..." rows="4"></textarea>
                    <button class="compare-btn" onclick="this.compareAnswers(${i})">对比版本</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="overall-assessment">
            <h6>整体评估：</h6>
            <div class="assessment-summary">
              <div class="strength-analysis">
                <h6>优势分析：</h6>
                <ul id="strengths-list">
                  <!-- 动态生成优势 -->
                </ul>
              </div>
              
              <div class="improvement-opportunities">
                <h6>改进空间：</h6>
                <ul id="improvements-list">
                  <!-- 动态生成改进建议 -->
                </ul>
              </div>
              
              <div class="next-steps">
                <h6>下一步建议：</h6>
                <div id="next-steps-recommendations">
                  <!-- 个性化学习建议 -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="exercise-validation">
          <button class="complete-training" onclick="this.completeTraining()">🎉 完成训练</button>
        </div>
      </div>
    `;
  }

  // 陪练对话功能
  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    this.addChatMessage('user', message);
    input.value = '';

    // 模拟思考时间
    setTimeout(() => {
      const response = this.generateTutorResponse(message);
      this.addChatMessage('tutor', response);
    }, 1000);
  }

  addChatMessage(sender, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.innerHTML = `
      <div class="message-content">${content}</div>
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  generateTutorResponse(userMessage) {
    const currentStepResponses = this.tutorResponses[this.tutor.responseStyle][`step${this.currentStep}`];
    
    // 简单的关键词匹配回复
    if (userMessage.includes('不懂') || userMessage.includes('不会')) {
      return "没关系，我们一步一步来。" + (currentStepResponses[0] || "你可以先尝试...");
    } else if (userMessage.includes('怎么') || userMessage.includes('如何')) {
      return currentStepResponses[1] || "让我详细解释一下...";
    } else if (userMessage.includes('对吗') || userMessage.includes('正确')) {
      return "很好的思考！" + (currentStepResponses[2] || "你的理解很到位。");
    } else {
      return currentStepResponses[Math.floor(Math.random() * currentStepResponses.length)] || "很好的问题，让我们继续。";
    }
  }

  // 请求帮助
  requestHelp() {
    const helpContent = this.getStepSpecificHelp();
    this.showHelpModal(helpContent);
  }

  getStepSpecificHelp() {
    const helpContent = {
      1: {
        title: "第一步帮助：通读文章和题目",
        content: `
          <h6>🎯 这一步的目标：</h6>
          <ul>
            <li>建立对文章的整体认识</li>
            <li>明确题目的考查方向</li>
            <li>为后续精读做好准备</li>
          </ul>
          
          <h6>💡 具体方法：</h6>
          <ol>
            <li><strong>先读题目</strong>：了解要回答什么问题</li>
            <li><strong>带着问题读文章</strong>：有目标的阅读更高效</li>
            <li><strong>重读问题</strong>：确认对题目的理解</li>
          </ol>
          
          <h6>⚠️ 常见问题：</h6>
          <ul>
            <li>读得太慢，过分纠结细节</li>
            <li>忽略题目，盲目阅读</li>
            <li>一遍过，不回头确认</li>
          </ul>
        `
      },
      2: {
        title: "第二步帮助：判断文体并解读",
        content: `
          <h6>🎯 文体判断要点：</h6>
          <ul>
            <li><strong>记叙文</strong>：有时间、地点、人物、事件</li>
            <li><strong>散文</strong>：形散神不散，情感丰富</li>
            <li><strong>说明文</strong>：介绍事物，有说明方法</li>
            <li><strong>议论文</strong>：有观点、论据、论证</li>
          </ul>
          
          <h6>📋 结构分析方法：</h6>
          <ol>
            <li>标记段落，找出中心句</li>
            <li>分析段落间的逻辑关系</li>
            <li>理清文章的整体脉络</li>
          </ol>
        `
      },
      3: {
        title: "第三步帮助：概括文章中心",
        content: `
          <h6>🎯 归纳方法选择：</h6>
          <ul>
            <li><strong>简括法</strong>：直接提取中心，适用于大部分情况</li>
            <li><strong>详括法</strong>：先分段再整合，适用于复杂文章</li>
          </ul>
          
          <h6>📝 概括公式：</h6>
          <p><strong>主要内容</strong> = 谁 + 做什么 + 结果</p>
          <p><strong>中心思想</strong> = 通过...表现/揭示/赞美了...</p>
        `
      },
      4: {
        title: "第四步帮助：认真审题",
        content: `
          <h6>🔍 审题三要素：</h6>
          <ol>
            <li><strong>题型判断</strong>：概括、理解、赏析、作用等</li>
            <li><strong>考查对象</strong>：词语、句子、段落、全文</li>
            <li><strong>具体要求</strong>：含义、作用、手法、情感等</li>
          </ol>
          
          <h6>💡 审题技巧：</h6>
          <ul>
            <li>圈出关键词，不放过任何一个字</li>
            <li>分析题目的层次结构</li>
            <li>明确答题的方向和重点</li>
          </ul>
        `
      },
      5: {
        title: "第五步帮助：根据文章意境答题",
        content: `
          <h6>📝 答题要求：</h6>
          <ul>
            <li><strong>准确</strong>：用文中的词语组织语言</li>
            <li><strong>完整</strong>：不遗漏主要内容</li>
            <li><strong>简洁</strong>：字数适中，表达简练</li>
          </ul>
          
          <h6>🔧 答题公式：</h6>
          <p>根据题型选择对应的答题公式，分点作答，条理清晰。</p>
        `
      },
      6: {
        title: "第六步帮助：检查修正",
        content: `
          <h6>✅ 检查维度：</h6>
          <ol>
            <li><strong>内容检查</strong>：是否回答了所有要求</li>
            <li><strong>逻辑检查</strong>：前后是否一致</li>
            <li><strong>表达检查</strong>：语言是否规范</li>
          </ol>
          
          <h6>🔧 修正方法：</h6>
          <ul>
            <li>补充遗漏的要点</li>
            <li>调整表达的顺序</li>
            <li>优化语言的准确性</li>
          </ul>
        `
      }
    };
    
    return helpContent[this.currentStep] || helpContent[1];
  }

  // 显示答题公式
  showAnswerFormula() {
    if (!this.currentQuestions.length) return;
    
    const currentQuestion = this.currentQuestions[0]; // 简化，显示第一题的公式
    const questionType = this.analyzeQuestionType(currentQuestion);
    const formula = this.answerFormulas[questionType];
    
    if (formula) {
      this.showFormulaModal(formula, questionType);
    }
  }

  showFormulaModal(formula, questionType) {
    const modal = document.createElement('div');
    modal.className = 'formula-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h4>${questionType} 答题公式</h4>
          <button class="close-btn" onclick="this.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="formula-display">
            <h5>答题公式：</h5>
            <div class="formula-text">${formula.formula}</div>
          </div>
          <div class="formula-steps">
            <h5>答题步骤：</h5>
            <ol>
              ${formula.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
          <div class="formula-examples">
            <h5>答题示例：</h5>
            <ul>
              ${formula.examples.map(example => `<li>${example}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // 其他辅助方法...
  detectTextType() {
    if (!this.currentArticle) return '散文';
    
    const content = this.currentArticle.content;
    
    // 更精确的文体检测
    const features = {
      '说明文': [/说明|介绍|阐述/, /首先|其次|最后/, /因为|所以|由于/, /\d+\.\d+%/, /据统计|根据/],
      '议论文': [/认为|觉得|应该/, /论证|论据|论点/, /总而言之|综上所述/, /然而|但是|可是/, /因此|所以/],
      '记叙文': [/时间|地点/, /他|她|我/, /突然|忽然/, /回忆|想起/, /从前|那时/],
      '散文': [/仿佛|好像/, /心情|感受/, /美丽|温暖/, /回味|思念/, /或许|也许/]
    };
    
    let maxScore = 0;
    let detectedType = '散文';
    
    Object.entries(features).forEach(([type, patterns]) => {
      let score = 0;
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) score += matches.length;
      });
      
      if (score > maxScore) {
        maxScore = score;
        detectedType = type;
      }
    });
    
    return detectedType;
  }

  // 验证当前步骤
  validateCurrentStep() {
    const stepData = this.gatherStepData();
    const isValid = this.steps[this.currentStep - 1].validation.call(this, stepData);
    
    if (isValid) {
      this.userProgress.set(this.currentStep, {
        completed: true,
        timestamp: Date.now(),
        data: stepData
      });
      
      this.updateStepStatus('completed');
      this.saveProgress();
      
      if (this.currentStep < this.maxSteps) {
        setTimeout(() => {
          this.nextStep();
        }, 1000);
      } else {
        this.completeTraining();
      }
    } else {
      this.showValidationFeedback();
    }
  }

  // 完成训练
  completeTraining() {
    const completionData = {
      totalTime: this.calculateTotalTime(),
      accuracy: this.calculateAccuracy(),
      strengths: this.identifyStrengths(),
      improvements: this.identifyImprovements()
    };
    
    this.showCompletionReport(completionData);
  }

  // 保存进度
  saveProgress() {
    const progressData = {
      currentStep: this.currentStep,
      userProgress: Object.fromEntries(this.userProgress),
      trainingMode: this.trainingMode,
      timestamp: Date.now(),
      articleId: this.currentArticle?.title || 'unknown'
    };
    
    localStorage.setItem('reading_training_progress', JSON.stringify(progressData));
  }

  // 加载进度
  loadUserProgress() {
    const saved = localStorage.getItem('reading_training_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.currentStep = data.currentStep || 1;
        this.userProgress = new Map(Object.entries(data.userProgress || {}));
        this.trainingMode = { ...this.trainingMode, ...data.trainingMode };
        this.updateInterface();
      } catch (error) {
        console.warn('Failed to load progress:', error);
      }
    }
  }

  // 更新界面
  updateInterface() {
    this.updateStepIndicator();
    this.updateTrainingContent();
    this.updateNavigationButtons();
  }

  // 切换陪练模式
  toggleTutorMode() {
    this.tutor.isOnline = !this.tutor.isOnline;
    this.tutor.interactionMode = this.tutor.isOnline ? 'human' : 'ai';
    this.updateTutorInterface();
  }

  // 更新陪练界面
  updateTutorInterface() {
    const tutorStatus = document.querySelector('.tutor-status');
    const tutorButton = document.querySelector('.btn-tutor');
    
    if (this.tutor.isOnline) {
      tutorStatus.classList.add('online');
      tutorStatus.classList.remove('offline');
      tutorButton.textContent = '切换AI模式';
      this.addChatMessage('system', '真人陪练老师已上线，开始为您提供专业指导！');
    } else {
      tutorStatus.classList.add('offline');
      tutorStatus.classList.remove('online');
      tutorButton.textContent = '申请真人陪练';
      this.addChatMessage('system', '已切换到AI助教模式，继续为您提供智能指导。');
    }
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReadingGuidanceSystem;
} else if (typeof window !== 'undefined') {
  window.ReadingGuidanceSystem = ReadingGuidanceSystem;
}
