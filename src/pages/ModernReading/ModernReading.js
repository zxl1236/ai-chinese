/**
 * 现代文阅读页面组件
 * 包含题目练习、文章解析、训练记录、题库管理等功能
 */
class ModernReadingPage {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('modern-reading-section');
    this.onBack = options.onBack || null;
    this.currentTab = 'practice';
    this.currentArticle = 0;
    this.currentQuestion = 0;
    this.showAISummary = true; // AI摘要显示状态
    this.textMarker = null; // 文本标记工具
    
    // 文章数据
    this.articles = [
      {
        title: '《江上》',
        author: '冯至',
        content: `子胥望着昭关以外的山水，世界好像换了一件新的衣裳，他自己却真实地获得了真实的生命。时节正是晚秋，眼前还是一片绿色，夏天仿佛还没有结束。

他在这荒凉的原野里走了三四天，后来原野渐渐变成田畴，村落也随着出现了，子胥穿过几个村落，最后到了江边。

太阳已经西斜，岸上三三两两集聚了十来个人：有的操着吴音，有的说着楚语。有人在抱怨，二十年来，这一带总是打过来打过去，弄得田也不好耕，买卖也不好做。

"他只自己保持高洁，而一般人都还在水火里过日子，——我恨这样的人，我们都是吃了他高洁的苦。"一个年轻人愤恨地说。

那老年人却谅解季札："士各有志。他用行为感动我们，不是比做国王有意义得多吗？——就以他在徐君墓旁挂剑的那件事而论，对于友情是怎样好的一幅画图！"

子胥听着这些话，再低下头看一看自己佩着的剑，不觉起了一个愿望："我这时若有一个朋友，我也愿意把我的剑，当作一个友情的赠品，——而我永久只是一个人。"

这时江水的上游忽然浮下一只渔船，船上回环不断地唱着歌：

日月昭昭乎侵已驰，
与子期乎芦之漪。

面前的景色，自己的身世，是怎样感动子胥的心！他听着歌声，身不由己地向芦苇丛中走去。渔舟在芦苇旁停住了，子胥身不由己地上了船。

多少天的风尘仆仆，一走上船，呼吸着水上清新的空气，立即感到水的温柔。子胥无言，渔夫无语，耳边只有和谐的橹声。船到江中央，世界回到原始一般地宁静。

船靠岸了，子胥口里有些嗫嚅，但他最后不得不开口："朋友。我把什么留给你作纪念呢？"这时子胥已经解下他的剑，捧在渔夫的面前。

渔夫说："我，江上的人，要这有什么用呢？"

子胥半吞半吐地说："你渡我过了江，同时也渡过了我的仇恨。将来说不定会有那么一天，你再渡我回去。"渔夫听了这句话，一点也不懂，他只拨转船头，向下游驶去。

（节选自历史小说《伍子胥》）`,
        questions: [
          {
            type: 'single',
            stem: '🤖 AI智能分析：下列对文本相关内容和艺术特色的分析鉴赏，不正确的一项是（3分）',
            options: [
              'A. 子胥过了昭关，所见风景与前大不相同，那大片绿色和原野，也是子胥再次"获得了真实的生命"的心情写照。',
              'B. "多少天的风尘仆仆"表现了子胥逃亡路上的艰辛，江上的经历让他暂时忘却了奔波之苦。',
              'C. 子胥同渔夫道别，说话时"有些嗫嚅""半吞半吐"，表现的是子胥渴望同渔夫交流，又碍于隐情而无法敞开心扉。',
              'D. "你渡我过了江，同时也渡过了我的仇恨"，子胥在江上领会到渔夫的"世界"，他对自己的使命有了更深的理解。'
            ],
            answer: 'C',
            explanation: '🎯 AI解析：C项"渴望同渔夫交流"不准确。子胥的"嗫嚅"和"半吞半吐"是因为内心情感复杂，想要表达感激却又难以言喻，并非渴望交流。',
            aiTip: '💡 AI提示：注意区分人物行为的表面现象和深层动机。'
          },
          {
            type: 'single',
            stem: '📝 语言运用：文中运用了多种修辞手法，下列分析正确的一项是（3分）',
            options: [
              'A. "世界好像换了一件新的衣裳"运用比喻，生动描写了子胥心境的变化',
              'B. "日月昭昭乎侵已驰"运用夸张，强调时间流逝之快',
              'C. "江里边永久捉不到的一块宝石"运用拟人，赋予月影以人的特征',
              'D. "血的仇恨"和"清淡的云水之乡"运用对比，突出两种不同的人生境界'
            ],
            answer: 'D',
            explanation: '🎯 AI解析：D项正确。"血的仇恨"与"清淡的云水之乡"形成鲜明对比，突出了子胥和渔夫两种截然不同的人生状态和精神境界。',
            aiTip: '💡 AI提示：对比是现代文中常用的表现手法，要注意识别并分析其表达效果。'
          },
          {
            type: 'ai-analysis',
            stem: '🧠 AI深度解读：请运用AI分析工具，从"情感变化"角度分析子胥在江上的心理历程（6分）',
            answer: '【AI分析要点】\n1. 初见江景：从压抑到释然，"获得真实生命"体现心境转换\n2. 听闻议论：触发思考，对友情的渴望反映内心孤独\n3. 遇见渔夫：从戒备到感动，渔夫的歌声引起共鸣\n4. 江上对话：从感激到不舍，体验到久违的温情\n5. 赠剑告别：从冲动到深思，完成情感的升华',
            explanation: '🎯 AI解析：子胥的情感变化呈现螺旋上升的轨迹，每个阶段都有其心理动因和表现特征。',
            aiTip: '💡 AI提示：分析人物情感变化要抓住关键节点，注意前后呼应。'
          },
          {
            type: 'creative',
            stem: '🎨 创意表达：如果你是子胥，在江上遇到渔夫后，你会如何表达感激之情？请发挥想象，写一段100字左右的心理独白（8分）',
            answer: '【参考示例】\n"这位素不相识的渔夫，用他朴实的歌声和无私的帮助，让我在逃亡路上感受到了久违的温暖。他不求回报的善意，如同这江水一般清澈纯净。我虽身负血仇，心怀怨恨，但在这一刻，我愿意相信人间还有真情。这把剑，不仅是我的感谢，更是我对美好人性的致敬。"',
            explanation: '🎯 AI解析：创意表达要结合文本内容，体现人物性格特点，语言要有感染力。',
            aiTip: '💡 AI提示：心理独白要符合人物身份和当时情境，注意情感的真实性。'
          },
          {
            type: 'comparison',
            stem: '🔍 对比分析：比较文中子胥与渔夫的人物形象，分析作者塑造这两个人物的用意（6分）',
            answer: '【对比分析】\n子胥：复仇者形象，内心充满"血的仇恨"，孤独、痛苦，代表现实的沉重\n渔夫：普通人形象，生活在"清淡的云水之乡"，平和、善良，代表理想的美好\n\n【作者用意】\n通过对比突出主题：在残酷现实中，普通人的善意如明灯般珍贵；展现人性的复杂性和美好品质的可贵；表达对和谐、宁静生活的向往。',
            explanation: '🎯 AI解析：对比手法能够突出人物特点，深化作品主题，增强艺术感染力。',
            aiTip: '💡 AI提示：人物对比分析要从外在行为和内在精神两个层面进行。'
          },
          {
            type: 'extension',
            stem: '🌟 拓展思考：联系现实生活，谈谈"陌生人的善意"给你的启发（6分）',
            answer: '【思考角度】\n1. 善意的力量：微小的善举能够温暖人心，改变他人的人生轨迹\n2. 人性的美好：即使在困难时期，人与人之间的温情依然存在\n3. 现实意义：在快节奏的现代社会，我们更需要保持对他人的关爱\n4. 个人行动：从自己做起，向他人传递善意和温暖',
            explanation: '🎯 AI解析：文学作品的价值在于能够引发读者对现实生活的思考和感悟。',
            aiTip: '💡 AI提示：拓展思考要结合文本内容，联系个人体验，体现思辨性。'
          }
        ]
      }
    ];
  }

  render() {
    const modernReadingHTML = `
      <div class="modern-reading-content">
        <!-- Tab导航 -->
        <div class="modern-tab-nav">
          <button type="button" class="modern-tab ${this.currentTab === 'practice' ? 'active' : ''}" data-tab="practice" aria-label="切换到题目练习模块">题目练习</button>
          <button type="button" class="modern-tab ${this.currentTab === 'article' ? 'active' : ''}" data-tab="article" aria-label="切换到文章阅读与解析模块">文章阅读与解析</button>
          <button type="button" class="modern-tab ${this.currentTab === 'record' ? 'active' : ''}" data-tab="record" aria-label="切换到训练记录进度模块">训练记录/进度</button>
          <button type="button" class="modern-tab ${this.currentTab === 'bank' ? 'active' : ''}" data-tab="bank" aria-label="切换到题库管理模块">题库管理</button>
        </div>

        <!-- 题目练习内容 -->
        <div id="modern-tab-practice" class="modern-tab-content ${this.currentTab === 'practice' ? 'active' : ''}">
          ${this.renderPracticeTab()}
        </div>

        <!-- 其他Tab内容 -->
        <div id="modern-tab-article" class="modern-tab-content ${this.currentTab === 'article' ? 'active' : ''}">
          <h3>文章阅读与解析</h3>
          <ul>
            <li>精读文本呈现（段落标注、关键词高亮）</li>
            <li>难点词句注释（AI辅助释义）</li>
            <li>段落小测+提问交互</li>
            <li>解析+错因剖析（智能讲解+学情标签）</li>
          </ul>
          <p>图文并茂+批注辅助，支持"教师点评"或"AI讲解"双模式。</p>
        </div>

        <div id="modern-tab-record" class="modern-tab-content ${this.currentTab === 'record' ? 'active' : ''}">
          <h3>训练记录 / 进度</h3>
          <ul>
            <li>每日/每周练习次数、题型覆盖率</li>
            <li>正确率趋势图（按题型/文本类别）</li>
            <li>阅读速度分析（字数/答题时间）</li>
            <li>难度挑战记录（易/中/难分级）</li>
            <li>能力雷达图（主旨理解、推理判断等维度）</li>
          </ul>
          <p>折线图+雷达图，支持切换不同时间维度。</p>
        </div>

        <div id="modern-tab-bank" class="modern-tab-content ${this.currentTab === 'bank' ? 'active' : ''}">
          <h3>题库管理（教师/后台专用）</h3>
          <ul>
            <li>题目上传（支持PDF/Word粘贴、结构化识别）</li>
            <li>题目分类管理（题型/文本类别/难度）</li>
            <li>AI标签标注（可训练题型+知识点）</li>
            <li>智能组卷（设定题型比例/难度自动生成）</li>
            <li>错题审核与打标签（适配错题本使用）</li>
          </ul>
          <p>后台表格样式+批量导入/导出功能，仅教师或运营端可见。</p>
        </div>
      </div>
    `;

    if (this.container) {
      console.log('📖 现代文阅读页面开始渲染', this.container);
      this.container.innerHTML = modernReadingHTML;
      this.bindEvents();
      this.initQuestionInteraction();
      console.log('✅ 现代文阅读页面渲染完成');
    } else {
      console.error('❌ 现代文阅读页面容器不存在');
    }

    return this.container;
  }

  renderPracticeTab() {
    const article = this.articles[this.currentArticle];
    const question = article.questions[this.currentQuestion];

    return `
      <!-- 文章选择区 -->
      <div class="article-selector">
        <button type="button" class="practice-article-tab active" data-article="0" aria-label="选择江上文章">《江上》</button>
      </div>

      <!-- 当前文章内容 -->
      <div class="practice-article-content">
        <div class="practice-article-header">
          <div class="practice-article-title">${article.title}</div>
          <div class="practice-article-author">作者：${article.author}</div>
          <button type="button" class="ai-summary-toggle" id="ai-summary-toggle" aria-label="切换阅读模式">
            ${this.showAISummary ? '📖 专注阅读' : '📋 六分阅读法'}
          </button>
        </div>
        
        <div class="article-main-content ${this.showAISummary ? '' : 'fullwidth'}">
          <div class="practice-article-text">${article.content}</div>
          
          <div class="practice-article-summary ${this.showAISummary ? '' : 'hidden'}">
            <div class="summary-title">
              📖 六分阅读法
            </div>
            <div class="summary-content">
              <div class="reading-method-item"><strong>1分钟</strong> 快速浏览全文，把握大意</div>
              <div class="reading-method-item"><strong>2分钟</strong> 精读题目，圈出关键词</div>
              <div class="reading-method-item"><strong>1分钟</strong> 带着问题重读文章相关段落</div>
              <div class="reading-method-item"><strong>1分钟</strong> 对比选项，找出最佳答案</div>
              <div class="reading-method-item"><strong>1分钟</strong> 检查答案，确认无误</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 题号Tab -->
      <div class="question-nav">
        ${article.questions.map((q, index) => 
          `<button type="button" class="practice-q-tab ${index === this.currentQuestion ? 'active' : ''}" data-q="${index}" aria-label="选择第${index + 1}题">${index + 1}</button>`
        ).join('')}
      </div>

      <!-- 当前题目 -->
      <div class="practice-card" id="current-question">
        ${this.renderQuestion(question, this.currentQuestion)}
      </div>

      <!-- 答题信息 -->
      <div class="practice-info-bar">
        <span>第${this.currentQuestion + 1}/${article.questions.length}题</span>
        <span>答题时间：00:12</span>
        <span>AI评估正确率：100%</span>
      </div>
    `;
  }

  initTextMarker() {
    // 销毁之前的标记工具
    if (this.textMarker) {
      const oldToolbar = this.container.querySelector('.text-marker-toolbar');
      if (oldToolbar) {
        oldToolbar.remove();
      }
    }

    // 为整个练习区域创建标记工具（包括文章和题目）
    const markableContainer = this.container.querySelector('#modern-tab-practice');
    if (markableContainer && window.TextMarker) {
      this.textMarker = new TextMarker(markableContainer);
      
      // 尝试恢复之前的标记
      const article = this.articles[this.currentArticle];
      const storageKey = `${article.title}_q${this.currentQuestion}`;
      this.textMarker.loadMarkings(storageKey);
      
      // 自动保存标记
      this.autoSaveMarkings();
    }
  }

  autoSaveMarkings() {
    if (!this.textMarker) return;
    
    // 每30秒自动保存一次
    if (this.markingSaveTimer) {
      clearInterval(this.markingSaveTimer);
    }
    
    this.markingSaveTimer = setInterval(() => {
      const article = this.articles[this.currentArticle];
      const storageKey = `${article.title}_q${this.currentQuestion}`;
      this.textMarker.saveMarkings(storageKey);
    }, 30000);
  }

  renderQuestion(question, index) {
    const baseHTML = `
      <div class="question-header">
        <div class="practice-question">${question.stem}</div>
        <div class="reading-tip">
          <span class="tip-icon">👁️</span>
          <span class="tip-text">圈点读题</span>
        </div>
      </div>
      ${this.renderQuestionContent(question)}
      <div class="ai-tip-container">
        ${question.aiTip ? `<div class="ai-tip">${question.aiTip}</div>` : ''}
      </div>
      <div class="question-actions">
        <button type="button" class="practice-submit-btn" aria-label="提交答案进行AI智能评分">🚀 AI智能评分</button>
        <button type="button" class="practice-explain-btn" aria-label="查看题目AI解析">🎯 查看AI解析</button>
      </div>
      <div class="practice-feedback" style="display:none;"></div>
      <div class="practice-explain" style="display:none;">
        <div class="ai-explanation">${question.explanation}</div>
      </div>
      <button type="button" class="practice-reset-btn" style="display:none;" aria-label="重新作答当前题目">🔄 重新作答</button>
    `;
    return baseHTML;
  }

  renderQuestionContent(question) {
    switch(question.type) {
      case 'single':
        return `
          <div class="practice-options">
            ${question.options.map(option => 
              `<div class="practice-option" data-value="${option.charAt(0)}">${option}</div>`
            ).join('')}
          </div>
        `;
      
      case 'ai-analysis':
        return `
          <div class="ai-analysis-container">
            <div class="ai-analysis-hint">💡 请运用AI分析思维，从多个角度深入思考</div>
            <textarea class="practice-analysis-input" rows="6" placeholder="请输入你的分析...支持多角度、多层次的深度解读"></textarea>
          </div>
        `;
      
      case 'creative':
        return `
          <div class="creative-container">
            <div class="creative-hint">🎨 发挥你的创意和想象力，表达要生动有感染力</div>
            <textarea class="practice-creative-input" rows="5" placeholder="请发挥想象，写出你的创意表达..."></textarea>
            <div class="word-counter">字数统计: <span class="creative-word-count">0</span>/100</div>
          </div>
        `;
      
      case 'comparison':
        return `
          <div class="comparison-container">
            <div class="comparison-hint">🔍 请从对比的角度分析，注意找出异同点</div>
            <textarea class="practice-comparison-input" rows="6" placeholder="请进行对比分析..."></textarea>
          </div>
        `;
      
      case 'extension':
        return `
          <div class="extension-container">
            <div class="extension-hint">🌟 联系现实生活，谈谈你的思考和感悟</div>
            <textarea class="practice-extension-input" rows="5" placeholder="请结合现实生活，谈谈你的思考..."></textarea>
          </div>
        `;
      
      default:
        return `
          <textarea class="practice-short-input" rows="4" placeholder="请在此输入你的答案..."></textarea>
        `;
    }
  }

  bindEvents() {
    // Tab切换事件
    const tabs = this.container.querySelectorAll('.modern-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = tab.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });

    // 使用事件委托处理题号切换，因为题号是动态生成的
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('practice-q-tab')) {
        const questionIndex = parseInt(e.target.getAttribute('data-q'));
        this.switchQuestion(questionIndex);
      }
      
      // AI摘要切换按钮
      if (e.target.classList.contains('ai-summary-toggle') || e.target.id === 'ai-summary-toggle') {
        this.toggleAISummary();
      }
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    
    // 更新Tab状态
    this.container.querySelectorAll('.modern-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    // 更新内容显示
    this.container.querySelectorAll('.modern-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `modern-tab-${tabName}`);
    });

    // 如果切换到练习Tab，重新渲染
    if (tabName === 'practice') {
      const practiceContent = this.container.querySelector('#modern-tab-practice');
      practiceContent.innerHTML = this.renderPracticeTab();
      this.initQuestionInteraction();
      this.initTextMarker();
    }
  }

  switchQuestion(questionIndex) {
    this.currentQuestion = questionIndex;
    
    // 重新渲染练习Tab
    const practiceContent = this.container.querySelector('#modern-tab-practice');
    practiceContent.innerHTML = this.renderPracticeTab();
    this.initQuestionInteraction();
    this.initTextMarker();
  }

  toggleAISummary() {
    this.showAISummary = !this.showAISummary;
    
    // 重新渲染练习Tab以更新布局
    const practiceContent = this.container.querySelector('#modern-tab-practice');
    practiceContent.innerHTML = this.renderPracticeTab();
    this.initQuestionInteraction();
    this.initTextMarker();
    
    // 添加切换动画
    const articleContent = this.container.querySelector('.article-main-content');
    if (articleContent) {
      articleContent.style.transition = 'all 0.3s ease';
    }
  }

  initQuestionInteraction() {
    const questionCard = this.container.querySelector('#current-question');
    if (!questionCard) return;

    const article = this.articles[this.currentArticle];
    const question = article.questions[this.currentQuestion];
    
    const options = questionCard.querySelectorAll('.practice-option');
    const submitBtn = questionCard.querySelector('.practice-submit-btn');
    const explainBtn = questionCard.querySelector('.practice-explain-btn');
    const feedback = questionCard.querySelector('.practice-feedback');
    const explain = questionCard.querySelector('.practice-explain');
    const resetBtn = questionCard.querySelector('.practice-reset-btn');
    const shortInput = questionCard.querySelector('.practice-short-input');

    let selected = null;
    let answered = false;

    // 单选题交互
    if (question.type === 'single') {
      options.forEach(opt => {
        opt.addEventListener('click', function() {
          if (answered) return;
          options.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          selected = opt.getAttribute('data-value');
        });
      });

      submitBtn.addEventListener('click', function() {
        if (answered) return;
        if (!selected) {
          feedback.style.display = 'block';
          feedback.style.color = '#e53935';
          feedback.textContent = '请选择一个选项';
          return;
        }

        answered = true;
        options.forEach(opt => {
          const value = opt.getAttribute('data-value');
          if (value === question.answer) {
            opt.style.background = '#43a047';
            opt.style.color = '#fff';
            opt.style.border = '1.5px solid #43a047';
          } else if (opt.classList.contains('selected')) {
            opt.style.background = '#e53935';
            opt.style.color = '#fff';
            opt.style.border = '1.5px solid #e53935';
          } else {
            opt.style.opacity = 0.7;
          }
        });

        if (selected === question.answer) {
          feedback.style.display = 'block';
          feedback.style.color = '#43a047';
          feedback.textContent = '回答正确！';
        } else {
          feedback.style.display = 'block';
          feedback.style.color = '#e53935';
          feedback.textContent = '答错了，请再试一次！';
          resetBtn.style.display = 'inline-block';
        }
      });
    }

    // 所有非单选题交互（包括AI分析、创意表达、对比分析、拓展思考）
    if (['short', 'ai-analysis', 'creative', 'comparison', 'extension'].includes(question.type)) {
      const inputElement = shortInput || 
                          questionCard.querySelector('.practice-analysis-input') ||
                          questionCard.querySelector('.practice-creative-input') ||
                          questionCard.querySelector('.practice-comparison-input') ||
                          questionCard.querySelector('.practice-extension-input');
      
      if (inputElement) {
        // 为创意表达题添加字数统计
        if (question.type === 'creative') {
          const wordCountElement = questionCard.querySelector('.creative-word-count');
          if (wordCountElement) {
            inputElement.addEventListener('input', function() {
              const wordCount = inputElement.value.length;
              wordCountElement.textContent = wordCount;
              
              // 字数超限提示
              if (wordCount > 100) {
                wordCountElement.style.color = '#e53935';
              } else {
                wordCountElement.style.color = '';
              }
            });
          }
        }
        
        submitBtn.addEventListener('click', function() {
          if (answered) return;
          if (!inputElement.value.trim()) {
            feedback.style.display = 'block';
            feedback.style.color = '#e53935';
            feedback.textContent = '请填写答案';
            return;
          }

          answered = true;
          feedback.style.display = 'block';
          feedback.style.color = '#43a047';
          feedback.textContent = '已提交，可查看参考答案和AI解析';
          resetBtn.style.display = 'inline-block';
        });
      }
    }

    // 显示/隐藏解析
    explainBtn.addEventListener('click', function() {
      if (explain.style.display === 'block') {
        explain.style.display = 'none';
        explainBtn.textContent = '显示解析';
      } else {
        explain.style.display = 'block';
        explainBtn.textContent = '隐藏解析';
      }
    });

    // 重新作答
    resetBtn.addEventListener('click', function() {
      answered = false;
      selected = null;
      
      if (question.type === 'single') {
        options.forEach(opt => {
          opt.classList.remove('selected');
          opt.style.background = '';
          opt.style.color = '';
          opt.style.border = '';
          opt.style.opacity = 1;
        });
      } else {
        // 清空所有可能的输入框
        const inputs = [
          shortInput,
          questionCard.querySelector('.practice-analysis-input'),
          questionCard.querySelector('.practice-creative-input'),
          questionCard.querySelector('.practice-comparison-input'),
          questionCard.querySelector('.practice-extension-input')
        ];
        
        inputs.forEach(input => {
          if (input) input.value = '';
        });
      }
      
      feedback.style.display = 'none';
      resetBtn.style.display = 'none';
    });
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernReadingPage;
} else {
  window.ModernReadingPage = ModernReadingPage;
}