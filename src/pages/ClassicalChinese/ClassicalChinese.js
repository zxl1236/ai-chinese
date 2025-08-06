/**
 * 文言文阅读页面组件
 * 包含文言文阅读理解、翻译练习、文言知识等功能
 */
class ClassicalChinesePage {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('classical-chinese-section');
    this.onBack = options.onBack || null;
    this.currentTab = 'reading';
    this.currentArticle = 0;
    this.currentQuestion = 0;
    
    // 文言文文章数据
    this.articles = [
      {
        title: '《陋室铭》',
        author: '刘禹锡',
        dynasty: '唐',
        content: `山不在高，有仙则名。水不在深，有龙则灵。斯是陋室，惟吾德馨。苔痕上阶绿，草色入帘青。谈笑有鸿儒，往来无白丁。可以调素琴，阅金经。无丝竹之乱耳，无案牍之劳形。南阳诸葛庐，西蜀子云亭。孔子云：何陋之有？`,
        translation: `山不一定要高，有了仙人就出名了。水不一定要深，有了龙就灵验了。这是简陋的房子，只是我的品德好（就不感到简陋了）。苔痕碧绿，长到台阶上，草色青葱，映入帘子中。到这里谈笑的都是知识渊博的大学者，交往的没有知识浅薄的人。可以弹奏不加装饰的古琴，阅读佛经。没有奏乐的声音扰乱双耳，没有官府的公文使身体劳累。南阳有诸葛亮的茅庐，西蜀有扬子云的亭子。孔子说：有什么简陋的呢？`,
        notes: {
          '仙': '仙人',
          '灵': '灵验，神奇',
          '斯': '这',
          '惟': '只',
          '德馨': '品德高尚',
          '鸿儒': '大儒，博学的人',
          '白丁': '平民，这里指没有学问的人',
          '调': '弹奏',
          '素琴': '不加装饰的琴',
          '金经': '用泥金书写的佛经',
          '丝竹': '琴瑟、箫管等乐器，这里泛指奏乐的声音',
          '案牍': '官府的公文',
          '劳形': '使身体劳累'
        },
        questions: [
          {
            type: 'single',
            stem: '下列句子中"之"字的用法与其他三项不同的是（ ）',
            options: [
              'A. 无丝竹之乱耳',
              'B. 无案牍之劳形',
              'C. 何陋之有',
              'D. 水不在深，有龙则灵'
            ],
            answer: 'C',
            explanation: '【解析】C项"何陋之有"中的"之"是宾语前置的标志，其他三项都是结构助词"的"。'
          },
          {
            type: 'single',
            stem: '本文表达的主要思想是（ ）',
            options: [
              'A. 赞美陋室环境的优雅',
              'B. 表现作者安贫乐道的情怀',
              'C. 说明居住环境不重要',
              'D. 强调交友要慎重选择'
            ],
            answer: 'B',
            explanation: '【解析】本文通过描写陋室不陋，表达了作者安贫乐道、洁身自好的高尚情操。'
          },
          {
            type: 'translation',
            stem: '翻译下列句子：谈笑有鸿儒，往来无白丁。',
            answer: '到这里谈笑的都是知识渊博的大学者，交往的没有知识浅薄的人。',
            explanation: '【解析】"鸿儒"指博学的人，"白丁"指没有学问的平民。'
          },
          {
            type: 'short',
            stem: '作者在文中是如何体现"惟吾德馨"的？请结合具体内容分析。',
            answer: '【参考答案】作者通过描写陋室的环境（苔痕草色）、来往的人物（鸿儒）、日常生活（调琴阅经）等方面，体现了主人高雅的志趣和高尚的品德，从而突出"德馨"的主题。',
            explanation: '【解析】要从环境、人物、生活等多个角度分析。'
          }
        ]
      },
      {
        title: '《爱莲说》',
        author: '周敦颐',
        dynasty: '宋',
        content: `水陆草木之花，可爱者甚蕃。晋陶渊明独爱菊。自李唐来，世人甚爱牡丹。予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。

予谓菊，花之隐逸者也；牡丹，花之富贵者也；莲，花之君子者也。噫！菊之爱，陶后鲜有闻。莲之爱，同予者何人？牡丹之爱，宜乎众矣。`,
        translation: `水上、陆地上各种草本木本的花，值得喜爱的很多。晋代的陶渊明只喜爱菊花。从李氏唐朝以来，世人很喜爱牡丹。我只喜爱莲花从淤泥中长出来，却不被污染，在清水里洗涤过但是不显得妖媚，它的茎内空外直，不生蔓不长枝，香气传播更加清香，笔直洁净地竖立在水中，可以远远地观赏但是不可以贴近去轻慢地玩弄它。

我认为菊花，是花中的隐士；牡丹，是花中的富贵者；莲花，是花中的君子。唉！对于菊花的喜爱，陶渊明以后就很少听到了。对于莲花的喜爱，像我一样的还有什么人呢？对于牡丹的喜爱，人数当然就很多了。`,
        notes: {
          '蕃': '同"繁"，多',
          '淤泥': '河沟或池塘里积存的污泥',
          '濯': '洗涤',
          '清涟': '清水',
          '妖': '美丽而不端庄',
          '蔓': '生枝蔓',
          '亭亭': '耸立的样子',
          '净植': '洁净地立着',
          '亵玩': '玩弄',
          '隐逸': '隐居的人',
          '鲜': '少',
          '宜乎众矣': '人数当然就很多了'
        },
        questions: [
          {
            type: 'single',
            stem: '下列句子中加点词的意思相同的一组是（ ）',
            options: [
              'A. 可爱者甚蕃 / 蕃然成风',
              'B. 香远益清 / 清汤寡水',
              'C. 陶后鲜有闻 / 鲜为人知',
              'D. 宜乎众矣 / 众人皆醉'
            ],
            answer: 'C',
            explanation: '【解析】C项两个"鲜"都是"少"的意思。A项"蕃"通"繁"，多；"蕃然"茂盛的样子。B项"清"分别指清香、清澈。D项"众"分别指多、众人。'
          },
          {
            type: 'single',
            stem: '作者写莲花"出淤泥而不染"是为了突出莲花的什么品质？',
            options: [
              'A. 外表美丽',
              'B. 生命力强',
              'C. 品格高洁', 
              'D. 香气清雅'
            ],
            answer: 'C',
            explanation: '【解析】"出淤泥而不染"比喻莲花在污浊的环境中能保持纯洁，突出了莲花品格高洁的特点。'
          },
          {
            type: 'translation',
            stem: '翻译下列句子：予独爱莲之出淤泥而不染，濯清涟而不妖。',
            answer: '我只喜爱莲花从淤泥中长出来，却不被污染，在清水里洗涤过但是不显得妖媚。',
            explanation: '【解析】注意"予"是"我"，"之"是结构助词，"濯"是洗涤的意思。'
          },
          {
            type: 'short',
            stem: '作者借莲花表达了怎样的人生态度和理想追求？',
            answer: '【参考答案】作者借莲花表达了洁身自好、不与世俗同流合污的人生态度，以及追求高洁品格、做君子的理想追求。',
            explanation: '【解析】要结合莲花的特点和作者的议论来分析。'
          }
        ]
      }
    ];
  }

  render() {
    const classicalChineseHTML = `
      <div class="classical-chinese-content">
        <!-- Tab导航 -->
        <div class="classical-tab-nav">
          <button class="classical-tab ${this.currentTab === 'reading' ? 'active' : ''}" data-tab="reading">文言阅读</button>
          <button class="classical-tab ${this.currentTab === 'translation' ? 'active' : ''}" data-tab="translation">翻译练习</button>
          <button class="classical-tab ${this.currentTab === 'knowledge' ? 'active' : ''}" data-tab="knowledge">文言知识</button>
          <button class="classical-tab ${this.currentTab === 'culture' ? 'active' : ''}" data-tab="culture">文化常识</button>
        </div>

        <!-- 文言阅读内容 -->
        <div id="classical-tab-reading" class="classical-tab-content ${this.currentTab === 'reading' ? 'active' : ''}">
          ${this.renderReadingTab()}
        </div>

        <!-- 其他Tab内容 -->
        <div id="classical-tab-translation" class="classical-tab-content ${this.currentTab === 'translation' ? 'active' : ''}">
          <h3>翻译练习</h3>
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">📝</div>
              <div class="feature-text">
                <div class="feature-title">句子翻译</div>
                <div class="feature-desc">重点句式翻译练习</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📖</div>
              <div class="feature-text">
                <div class="feature-title">段落翻译</div>
                <div class="feature-desc">完整段落理解翻译</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <div class="feature-text">
                <div class="feature-title">翻译技巧</div>
                <div class="feature-desc">掌握翻译方法和技巧</div>
              </div>
            </div>
          </div>
        </div>

        <div id="classical-tab-knowledge" class="classical-tab-content ${this.currentTab === 'knowledge' ? 'active' : ''}">
          <h3>文言知识</h3>
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">📚</div>
              <div class="feature-text">
                <div class="feature-title">实词积累</div>
                <div class="feature-desc">常见文言实词用法</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔗</div>
              <div class="feature-text">
                <div class="feature-title">虚词辨析</div>
                <div class="feature-desc">重要文言虚词功能</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🏗️</div>
              <div class="feature-text">
                <div class="feature-title">句式结构</div>
                <div class="feature-desc">特殊句式识别与翻译</div>
              </div>
            </div>
          </div>
        </div>

        <div id="classical-tab-culture" class="classical-tab-content ${this.currentTab === 'culture' ? 'active' : ''}">
          <h3>文化常识</h3>
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">👑</div>
              <div class="feature-text">
                <div class="feature-title">古代政治</div>
                <div class="feature-desc">官职制度、政治体制</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎭</div>
              <div class="feature-text">
                <div class="feature-title">礼仪文化</div>
                <div class="feature-desc">古代礼仪、习俗传统</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📅</div>
              <div class="feature-text">
                <div class="feature-title">历史纪年</div>
                <div class="feature-desc">古代纪年、历法知识</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (this.container) {
      console.log('📜 文言文阅读页面开始渲染', this.container);
      this.container.innerHTML = classicalChineseHTML;
      this.bindEvents();
      this.initQuestionInteraction();
      console.log('✅ 文言文阅读页面渲染完成');
    } else {
      console.error('❌ 文言文阅读页面容器不存在');
    }

    return this.container;
  }

  renderReadingTab() {
    const article = this.articles[this.currentArticle];
    const question = article.questions[this.currentQuestion];

    return `
      <!-- 文章选择区 -->
      <div class="article-selector">
        <button class="classical-article-tab ${this.currentArticle === 0 ? 'active' : ''}" data-article="0">《陋室铭》</button>
        <button class="classical-article-tab ${this.currentArticle === 1 ? 'active' : ''}" data-article="1">《爱莲说》</button>
      </div>

      <!-- 当前文章内容 -->
      <div class="classical-article-content">
        <div class="classical-article-header">
          <div class="classical-article-title">${article.title}</div>
          <div class="classical-article-meta">${article.dynasty}·${article.author}</div>
        </div>
        
        <div class="classical-text-container">
          <div class="classical-original-text">
            <h4>原文</h4>
            <div class="classical-text">${article.content}</div>
          </div>
          
          <div class="classical-translation-text">
            <h4>译文</h4>
            <div class="translation-text">${article.translation}</div>
          </div>
        </div>

        <div class="classical-notes">
          <h4>注释</h4>
          <div class="notes-grid">
            ${Object.entries(article.notes).map(([word, meaning]) => 
              `<div class="note-item">
                <span class="note-word">${word}</span>：<span class="note-meaning">${meaning}</span>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>

      <!-- 题号Tab -->
      <div class="question-nav">
        ${article.questions.map((q, index) => 
          `<button class="classical-q-tab ${index === this.currentQuestion ? 'active' : ''}" data-q="${index}">${index + 1}</button>`
        ).join('')}
      </div>

      <!-- 当前题目 -->
      <div class="classical-question-card" id="current-classical-question">
        ${this.renderQuestion(question, this.currentQuestion)}
      </div>

      <!-- 答题信息 -->
      <div class="classical-info-bar">
        <span>第${this.currentQuestion + 1}/${article.questions.length}题</span>
        <span>文章：${article.title}</span>
        <span>难度：中等</span>
      </div>
    `;
  }

  renderQuestion(question, index) {
    if (question.type === 'single') {
      return `
        <div class="classical-question">${question.stem}</div>
        <div class="classical-options">
          ${question.options.map(option => 
            `<div class="classical-option" data-value="${option.charAt(0)}">${option}</div>`
          ).join('')}
        </div>
        <button class="classical-submit-btn">提交答案</button>
        <button class="classical-explain-btn">显示解析</button>
        <div class="classical-feedback" style="display:none;"></div>
        <div class="classical-explain" style="display:none;">${question.explanation}</div>
        <button class="classical-reset-btn" style="display:none;">再次作答</button>
      `;
    } else if (question.type === 'translation') {
      return `
        <div class="classical-question">${question.stem}</div>
        <textarea class="classical-translation-input" rows="3" placeholder="请在此输入翻译..."></textarea>
        <button class="classical-submit-btn">提交答案</button>
        <button class="classical-explain-btn">显示参考答案</button>
        <div class="classical-feedback" style="display:none;"></div>
        <div class="classical-explain" style="display:none;">
          <div class="reference-answer">
            <strong>参考答案：</strong>${question.answer}
          </div>
          ${question.explanation}
        </div>
        <button class="classical-reset-btn" style="display:none;">再次作答</button>
      `;
    } else if (question.type === 'short') {
      return `
        <div class="classical-question">${question.stem}</div>
        <textarea class="classical-short-input" rows="4" placeholder="请在此输入你的答案..."></textarea>
        <button class="classical-submit-btn">提交答案</button>
        <button class="classical-explain-btn">显示参考答案</button>
        <div class="classical-feedback" style="display:none;"></div>
        <div class="classical-explain" style="display:none;">
          <div class="reference-answer">
            <strong>参考答案：</strong><br>${question.answer}
          </div>
          ${question.explanation}
        </div>
        <button class="classical-reset-btn" style="display:none;">再次作答</button>
      `;
    }
  }

  bindEvents() {
    // Tab切换事件
    const tabs = this.container.querySelectorAll('.classical-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = tab.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });

    // 使用事件委托处理动态生成的元素
    this.container.addEventListener('click', (e) => {
      // 文章切换事件
      if (e.target.classList.contains('classical-article-tab')) {
        const articleIndex = parseInt(e.target.getAttribute('data-article'));
        this.switchArticle(articleIndex);
      }
      
      // 题号切换事件
      if (e.target.classList.contains('classical-q-tab')) {
        const questionIndex = parseInt(e.target.getAttribute('data-q'));
        this.switchQuestion(questionIndex);
      }
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    
    // 更新Tab状态
    this.container.querySelectorAll('.classical-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    // 更新内容显示
    this.container.querySelectorAll('.classical-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `classical-tab-${tabName}`);
    });

    // 如果切换到阅读Tab，重新渲染
    if (tabName === 'reading') {
      const readingContent = this.container.querySelector('#classical-tab-reading');
      readingContent.innerHTML = this.renderReadingTab();
      this.initQuestionInteraction();
    }
  }

  switchArticle(articleIndex) {
    this.currentArticle = articleIndex;
    this.currentQuestion = 0; // 重置题目索引
    
    // 重新渲染阅读Tab
    const readingContent = this.container.querySelector('#classical-tab-reading');
    readingContent.innerHTML = this.renderReadingTab();
    this.initQuestionInteraction();
  }

  switchQuestion(questionIndex) {
    this.currentQuestion = questionIndex;
    
    // 重新渲染阅读Tab
    const readingContent = this.container.querySelector('#classical-tab-reading');
    readingContent.innerHTML = this.renderReadingTab();
    this.initQuestionInteraction();
  }

  initQuestionInteraction() {
    const questionCard = this.container.querySelector('#current-classical-question');
    if (!questionCard) return;

    const article = this.articles[this.currentArticle];
    const question = article.questions[this.currentQuestion];
    
    const options = questionCard.querySelectorAll('.classical-option');
    const submitBtn = questionCard.querySelector('.classical-submit-btn');
    const explainBtn = questionCard.querySelector('.classical-explain-btn');
    const feedback = questionCard.querySelector('.classical-feedback');
    const explain = questionCard.querySelector('.classical-explain');
    const resetBtn = questionCard.querySelector('.classical-reset-btn');
    const translationInput = questionCard.querySelector('.classical-translation-input');
    const shortInput = questionCard.querySelector('.classical-short-input');

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

    // 翻译题和简答题交互
    if (question.type === 'translation' || question.type === 'short') {
      const inputElement = question.type === 'translation' ? translationInput : shortInput;
      
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
        feedback.textContent = '已提交，可查看参考答案';
        resetBtn.style.display = 'inline-block';
      });
    }

    // 显示/隐藏解析
    explainBtn.addEventListener('click', function() {
      if (explain.style.display === 'block') {
        explain.style.display = 'none';
        explainBtn.textContent = question.type === 'single' ? '显示解析' : '显示参考答案';
      } else {
        explain.style.display = 'block';
        explainBtn.textContent = question.type === 'single' ? '隐藏解析' : '隐藏参考答案';
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
      } else if (question.type === 'translation') {
        translationInput.value = '';
      } else if (question.type === 'short') {
        shortInput.value = '';
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
  module.exports = ClassicalChinesePage;
} else {
  window.ClassicalChinesePage = ClassicalChinesePage;
}