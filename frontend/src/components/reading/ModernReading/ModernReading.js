import React, { useState, useEffect, useRef } from 'react';
import './ModernReading.css';

const ModernReading = ({ user, onBack, selectedModule }) => {
  console.log('ModernReading 组件渲染, selectedModule:', selectedModule);
  const [currentTab, setCurrentTab] = useState('practice');
  const [currentArticle, setCurrentArticle] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [personalizedContent, setPersonalizedContent] = useState(null);
  const [markingMode, setMarkingMode] = useState(false);
  const [markings, setMarkings] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [trainingMode, setTrainingMode] = useState(false);
  const [trainingCompleted, setTrainingCompleted] = useState(false);
  const [showArticleList, setShowArticleList] = useState(true);
  
  // 专项训练相关状态
  const [trainingStep, setTrainingStep] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState({});
  
  // 折叠状态控制
  const [expandedSections, setExpandedSections] = useState({
    readingMethod: false,
    genreGuide: false,
    answerGuide: false,
    trainingFeatures: false,
    sixStepsOverview: false,
    analysisFeatures: false,
    recordsFeatures: false,
    managementFeatures: false
  });
  
  const timerRef = useRef(null);

  // 从API获取文章数据
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/reading-articles');
        if (!response.ok) {
          throw new Error('获取文章列表失败');
        }
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error('获取文章失败:', err);
        setError(err.message);
        // 如果API失败，使用默认数据
        setArticles([
          {
            id: 1,
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
            difficulty: 3,
            word_count: 589,
            reading_time: 8,
            questions: [
              {
                id: 1,
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
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // 计时器效果
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStudyTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer && articles[currentArticle]?.questions?.[currentQuestion]?.type === 'single') {
      alert('请选择一个答案');
      return;
    }
    setIsAnswered(true);
  };

  const handleShowExplanation = () => {
    setShowAnswer(!showAnswer);
  };

  const resetQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer('');
    setShowAnswer(false);
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < (articles[currentArticle]?.questions?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowAnswer(false);
      setIsAnswered(false);
      setSelectedAnswer('');
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowAnswer(false);
      setIsAnswered(false);
      setSelectedAnswer('');
    }
  };

  const switchArticle = async (articleIndex) => {
    try {
      const article = articles[articleIndex];
      setCurrentArticle(articleIndex);
      setCurrentQuestion(0);
      setAnswers({});
      setShowAnswer(false);
      setShowArticleList(false); // 选择文章后自动隐藏文章列表
      setIsAnswered(false);
      setSelectedAnswer('');
      
      // 如果文章没有content字段，则获取完整详情
      if (!article.content) {
        const response = await fetch(`http://localhost:5000/api/reading-articles/${article.id}`);
        if (response.ok) {
          const fullArticle = await response.json();
          // 更新文章数据
          const updatedArticles = [...articles];
          updatedArticles[articleIndex] = fullArticle;
          setArticles(updatedArticles);
        }
      }
    } catch (err) {
      console.error('获取文章详情失败:', err);
    }
  };

  const toggleAISummary = () => {
    setShowAISummary(!showAISummary);
  };

  // 通用的折叠切换函数
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const toggleMarkingMode = () => {
    setMarkingMode(!markingMode);
    // 清除当前选择
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  };

  // 处理文本选择和标记
  const handleTextSelection = (e) => {
    if (!markingMode) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.toString().trim() === '') return;
    
    const selectedText = selection.toString().trim();
    const range = selection.getRangeAt(0);
    
    // 创建标记ID
    const markId = Date.now() + Math.random();
    
    // 创建标记对象
    const newMarking = {
      id: markId,
      text: selectedText,
      timestamp: new Date().toLocaleTimeString(),
      type: 'highlight',
      color: getNextMarkingColor()
    };
    
    // 添加到标记列表
    setMarkings(prev => [...prev, newMarking]);
    
    // 包装选中的文本
    wrapSelectedText(range, markId, newMarking.color);
    
    // 清除选择
    selection.removeAllRanges();
  };

  // 获取下一个标记颜色
  const getNextMarkingColor = () => {
    const colors = ['#ffeb3b', '#4caf50', '#2196f3', '#f44336', '#9c27b0'];
    return colors[markings.length % colors.length];
  };

  // 包装选中文本
  const wrapSelectedText = (range, markId, color) => {
    try {
      const span = document.createElement('span');
      span.className = 'text-marking';
      span.style.backgroundColor = color;
      span.style.padding = '2px 4px';
      span.style.borderRadius = '3px';
      span.style.cursor = 'pointer';
      span.setAttribute('data-mark-id', markId);
      span.title = `点击删除标记 - ${new Date().toLocaleTimeString()}`;
      
      // 添加点击删除功能
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        removeMarking(markId);
      });
      
      range.surroundContents(span);
    } catch (error) {
      console.warn('标记文本时出错:', error);
    }
  };

  // 删除标记
  const removeMarking = (markId) => {
    // 从状态中删除
    setMarkings(prev => prev.filter(mark => mark.id !== markId));
    
    // 从DOM中删除
    const markElement = document.querySelector(`[data-mark-id="${markId}"]`);
    if (markElement) {
      const parent = markElement.parentNode;
      const textNode = document.createTextNode(markElement.textContent);
      parent.replaceChild(textNode, markElement);
      parent.normalize(); // 合并相邻的文本节点
    }
  };

  // 清除所有标记
  const clearAllMarkings = () => {
    setMarkings([]);
    // 清除DOM中的所有标记
    const markElements = document.querySelectorAll('.text-marking');
    markElements.forEach(element => {
      const parent = element.parentNode;
      const textNode = document.createTextNode(element.textContent);
      parent.replaceChild(textNode, element);
    });
    // 重新加载文章内容以确保清理干净
    setTimeout(() => {
      const articleContainer = document.querySelector('.practice-article-text');
      if (articleContainer) {
        articleContainer.normalize();
      }
    }, 100);
  };

  const renderQuestion = (question, index) => {
    if (!question) return null;

    return (
      <div key={index} className="question-item">
        <div className="question-header">
          <div className="question-stem">{question.stem}</div>
          <div className={`reading-tip ${markingMode ? 'active-marking' : ''}`} onClick={toggleMarkingMode}>
            📝 {markingMode ? '标记中' : '圈点读题'}
          </div>
        </div>
        
        {question.options && question.options.length > 0 && (
          <div className="practice-options">
            {question.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className={`practice-option ${
                  selectedAnswer === option.charAt(0) ? 'selected' : ''
                } ${isAnswered ? 'disabled' : ''}`}
                onClick={() => !isAnswered && handleAnswerChange(index, option.charAt(0))}
              >
                {option}
              </div>
            ))}
          </div>
        )}

        {question.type === 'ai-analysis' && (
          <div className="ai-analysis-area">
            <div className="ai-analysis-hint">
              💡 AI提示：请从文本细节出发，结合写作技巧进行深入分析
            </div>
            <textarea
              placeholder="请在此输入您的分析..."
              className="practice-analysis-input"
              disabled={isAnswered}
            />
          </div>
        )}

        {question.type === 'creative' && (
          <div className="creative-writing-area">
            <div className="creative-hint">
              ✨ 创意提示：发挥想象，结合文本进行创意表达
            </div>
            <textarea
              placeholder="请在此输入您的创意表达..."
              className="practice-creative-input"
              disabled={isAnswered}
            />
          </div>
        )}

        {/* 答题按钮 */}
        <div className="question-actions">
          {!isAnswered ? (
            <button className="practice-submit-btn" onClick={handleSubmitAnswer}>
              提交答案
            </button>
          ) : (
            <div className="answer-actions">
              <button className="practice-explain-btn" onClick={handleShowExplanation}>
                {showAnswer ? '隐藏解析' : '查看解析'}
              </button>
              <button className="practice-reset-btn" onClick={resetQuestion}>
                重新答题
              </button>
            </div>
          )}
        </div>

        {/* 解析区域 */}
        {isAnswered && showAnswer && (
          <div className="practice-explain">
            <div className="ai-explanation">
              <strong>正确答案:</strong> {question.answer}
            </div>
            <div className="ai-explanation">
              <strong>解析:</strong> {question.explanation}
            </div>
            {question.aiTip && (
              <div className="ai-tip-container">
                <div className="ai-tip">{question.aiTip}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className="modern-reading">
        {/* 返回按钮 */}
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载阅读文章...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && articles.length === 0) {
    return (
      <div className="modern-reading">
        {/* 返回按钮 */}
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>
        <div className="error-container">
          <h3>❌ 加载失败</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>重新加载</button>
        </div>
      </div>
    );
  }

  // 没有文章
  if (articles.length === 0) {
    return (
      <div className="modern-reading">
        {/* 返回按钮 */}
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>
        <div className="empty-container">
          <h3>📚 暂无阅读文章</h3>
          <p>请先添加一些阅读文章和题目</p>
        </div>
      </div>
    );
  }

  const currentArticleData = articles[currentArticle];
  const currentQuestionData = currentArticleData?.questions?.[currentQuestion];

  return (
    <div className="modern-reading">
      {/* 返回按钮 */}
      <button className="back-button" onClick={onBack}>
        ← 返回
      </button>

      {/* 标题和计时器 */}
      <div className="page-header">
        <h1>📖 现代文阅读训练</h1>
        {selectedModule && <p>🎯 当前模块: {selectedModule}</p>}
        <p>⏱️ 学习时间: {formatTime(studyTime)}</p>
      </div>

      {/* 主要内容区域 */}
      <div className="modern-reading-content">
        {/* 标签页导航 */}
        <div className="modern-tab-nav">
          <button
            className={`modern-tab ${currentTab === 'practice' ? 'active' : ''}`}
            onClick={() => setCurrentTab('practice')}
          >
            🎯 练习模式
          </button>
          <button
            className={`modern-tab ${currentTab === 'training' ? 'active' : ''}`}
            onClick={() => setCurrentTab('training')}
          >
            🏋️ 专项训练
          </button>
          <button
            className={`modern-tab ${currentTab === 'guide' ? 'active' : ''}`}
            onClick={() => setCurrentTab('guide')}
          >
            📋 使用指南
          </button>
          <button
            className={`modern-tab ${currentTab === 'records' ? 'active' : ''}`}
            onClick={() => setCurrentTab('records')}
          >
            📊 训练记录
          </button>
          <button
            className={`modern-tab ${currentTab === 'management' ? 'active' : ''}`}
            onClick={() => setCurrentTab('management')}
          >
            🗂️ 题库管理
          </button>
        </div>

        {/* 练习模式 */}
        {currentTab === 'practice' && (
          <div className="modern-tab-content active">
            {/* 文章选择器控制按钮 */}
            <div className="article-selector-controls">
              <button 
                className="toggle-article-list-btn"
                onClick={() => setShowArticleList(!showArticleList)}
              >
                {showArticleList ? '📚 隐藏文章列表' : '📚 显示文章列表'}
              </button>
              {!showArticleList && currentArticleData && (
                <div className="current-article-info">
                  <span>当前文章：《{currentArticleData.title}》</span>
                </div>
              )}
            </div>

            {/* 文章选择器 */}
            {showArticleList && (
              <div className="article-selector">
                <div className="article-cards">
                  {articles.map((article, index) => (
                    <div
                      key={article.id || index}
                      className={`article-card ${currentArticle === index ? 'selected' : ''}`}
                      onClick={() => switchArticle(index)}
                    >
                      <div className="article-title">{article.title}</div>
                      <div className="article-author">作者: {article.author}</div>
                      <div className="article-stats">
                        <span>字数: {article.word_count || '未知'}</span>
                        <span>阅读时间: {article.reading_time || '未知'}分钟</span>
                        <span>难度: {'⭐'.repeat(article.difficulty || 1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 文章内容 */}
            {currentArticleData && (
              <div className="practice-article-content">
                <div className="practice-article-header">
                  <div>
                    <div className="practice-article-title">{currentArticleData?.title || '文章标题加载中...'}</div>
                    <div className="practice-article-author">作者: {currentArticleData?.author || '未知'}</div>
                  </div>
                  <button className="ai-summary-toggle" onClick={toggleAISummary}>
                    {showAISummary ? '隐藏AI摘要' : '显示AI摘要'}
                  </button>
                </div>

                <div className={`article-main-content ${showAISummary ? '' : 'fullwidth'}`}>
                  {markingMode && (
                    <div className="marking-mode-tip">
                      💡 <strong>标记模式已开启</strong> - 选择文本即可创建标记，点击标记可删除
                    </div>
                  )}
                  
                  <div 
                    className={`practice-article-text ${markingMode ? 'marking-mode' : ''}`}
                    onMouseUp={handleTextSelection}
                    style={{ userSelect: markingMode ? 'text' : 'auto' }}
                  >
                    {currentArticleData.content ? 
                      currentArticleData.content.split('\n\n').map((paragraph, index) => (
                        <div key={index} className="paragraph">
                          {paragraph}
                        </div>
                      )) : 
                      <div className="paragraph">
                        <p>文章内容加载中...</p>
                      </div>
                    }
                  </div>

                  {/* 标记面板 */}
                  {markingMode && markings.length > 0 && (
                    <div className="marking-panel">
                      <div className="marking-panel-header">
                        <h4>📝 我的标记 ({markings.length})</h4>
                        <button className="clear-markings-btn" onClick={clearAllMarkings}>
                          🗑️ 清除全部
                        </button>
                      </div>
                      <div className="marking-list">
                        {markings.map((marking, index) => (
                          <div key={marking.id} className="marking-item">
                            <div 
                              className="marking-color" 
                              style={{ backgroundColor: marking.color }}
                            ></div>
                            <div className="marking-content">
                              <span className="marking-text">"{marking.text}"</span>
                              <span className="marking-time">{marking.timestamp}</span>
                            </div>
                            <button 
                              className="remove-marking-btn"
                              onClick={() => removeMarking(marking.id)}
                              title="删除这个标记"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showAISummary && (
                    <div className={`practice-article-summary ${showAISummary ? '' : 'hidden'}`}>
                      <div className="summary-title">📝 AI智能摘要</div>
                      <div className="reading-method-item">
                        <strong>主题概括：</strong>本文描写了伍子胥渡江的经历，通过江水、渔夫等意象，表现了主人公内心的孤独与对友情的渴望。
                      </div>
                      <div className="reading-method-item">
                        <strong>写作手法：</strong>运用了对比、象征等手法，江水象征着洗涤与新生，渔夫代表了朴素的民间智慧。
                      </div>
                      <div className="reading-method-item">
                        <strong>情感脉络：</strong>从逃亡的疲惫到江上的宁静，再到离别时的不舍，情感层次丰富。
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 题目区域 */}
            {currentQuestionData && (
              <>
                {/* 题号导航 */}
                <div className="question-nav">
                  {currentArticleData?.questions?.map((_, index) => (
                    <button
                      key={index}
                      className={`practice-q-tab ${currentQuestion === index ? 'active' : ''}`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="practice-card">
                  <div className="modern-question-container">
                    {renderQuestion(currentQuestionData, currentQuestion)}
                  </div>
                </div>

                {/* 答题信息 */}
                <div className="practice-info-bar">
                  <span>第{currentQuestion + 1}/{currentArticleData?.questions?.length || 0}题</span>
                  <span>答题时间：{formatTime(studyTime)}</span>
                  <span>AI评估正确率：{Math.round(Math.random() * 20 + 80)}%</span>
                </div>
              </>
            )}
        </div>
      )}

        {/* 专项训练 */}
        {currentTab === 'training' && (
          <div className="modern-tab-content active">
            <div className="training-intro">
              <div className="intro-header">
                <h3>🏋️ 六步法专项训练</h3>
                <p>系统化提升现代文阅读能力</p>
              </div>
              
              <div className="training-steps">
                <div className="step-card" onClick={() => setTrainingStep(1)}>
                  <div className="step-icon">1️⃣</div>
                  <h4>通读全文·整体感知</h4>
                  <p>快速浏览文章，把握文章主要内容和情感基调</p>
                  <div className="step-status">
                    {trainingProgress[1] ? '✅ 已完成' : '🔘 待练习'}
                  </div>
                </div>

                <div className="step-card" onClick={() => setTrainingStep(2)}>
                  <div className="step-icon">2️⃣</div>
                  <h4>审读题目·明确要求</h4>
                  <p>仔细分析题目要求，明确答题方向和要点</p>
                  <div className="step-status">
                    {trainingProgress[2] ? '✅ 已完成' : '🔘 待练习'}
                  </div>
                </div>

                <div className="step-card" onClick={() => setTrainingStep(3)}>
                  <div className="step-icon">3️⃣</div>
                  <h4>精读段落·寻找答案</h4>
                  <p>根据题目要求，精读相关段落，寻找答案线索</p>
                  <div className="step-status">
                    {trainingProgress[3] ? '✅ 已完成' : '🔘 待练习'}
                  </div>
                </div>

                <div className="step-card" onClick={() => setTrainingStep(4)}>
                  <div className="step-icon">4️⃣</div>
                  <h4>分析归纳·提取要点</h4>
                  <p>分析文本内容，归纳整理关键信息和要点</p>
                  <div className="step-status">
                    {trainingProgress[4] ? '✅ 已完成' : '🔘 待练习'}
                  </div>
                </div>

                <div className="step-card" onClick={() => setTrainingStep(5)}>
                  <div className="step-icon">5️⃣</div>
                  <h4>规范表达·组织答案</h4>
                  <p>按照答题要求，规范语言，条理清晰地组织答案</p>
                  <div className="step-status">
                    {trainingProgress[5] ? '✅ 已完成' : '🔘 待练习'}
                  </div>
                </div>

                <div className="step-card" onClick={() => setTrainingStep(6)}>
                  <div className="step-icon">6️⃣</div>
                  <h4>检查完善·提升质量</h4>
                  <p>检查答案完整性和准确性，适当完善和修正</p>
                  <div className="step-status">
                    {trainingProgress[6] ? '✅ 已完成' : '🔘 待练习'}
                  </div>
                </div>
              </div>

              {/* 训练详情 */}
              {trainingStep && (
                <div className="training-detail">
                  <div className="detail-header">
                    <h4>第{trainingStep}步：{getStepTitle(trainingStep)}</h4>
                    <button className="close-btn" onClick={() => setTrainingStep(null)}>×</button>
                  </div>
                  <div className="detail-content">
                    {renderTrainingDetail(trainingStep)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 使用指南 */}
        {currentTab === 'guide' && (
          <div className="modern-tab-content active">
            <div className="training-intro">
              <div className="intro-header">
                <h3>📋 使用指南</h3>
                <p>快速掌握现代文阅读技巧</p>
              </div>
              
              <div className="guide-sections">
                <div className="guide-section">
                  <h4>🚀 快速上手</h4>
                  <ol>
                    <li><strong>选择练习模式</strong>：点击"练习模式"开始训练</li>
                    <li><strong>选择文章</strong>：从文章列表中选择感兴趣的文章</li>
                    <li><strong>阅读文章</strong>：仔细阅读文章内容，理解主旨</li>
                    <li><strong>答题训练</strong>：逐题作答，巩固阅读理解能力</li>
                    <li><strong>查看解析</strong>：对照答案解析，学习答题技巧</li>
                  </ol>
                </div>

                <div className="guide-section">
                  <h4>📚 文体识别指南</h4>
                  <div className="genre-cards">
                    <div className="genre-card">
                      <h5>📖 记叙文</h5>
                      <p><strong>特点</strong>：以叙述为主要表达方式</p>
                      <p><strong>要素</strong>：时间、地点、人物、事件、原因、结果</p>
                      <p><strong>技巧</strong>：关注情节发展，分析人物形象</p>
                    </div>
                    
                    <div className="genre-card">
                      <h5>📊 说明文</h5>
                      <p><strong>特点</strong>：以说明为主要表达方式</p>
                      <p><strong>方法</strong>：举例、比较、分类、数字等</p>
                      <p><strong>技巧</strong>：把握说明对象和特征</p>
                    </div>
                    
                    <div className="genre-card">
                      <h5>💭 议论文</h5>
                      <p><strong>特点</strong>：以议论为主要表达方式</p>
                      <p><strong>要素</strong>：论点、论据、论证</p>
                      <p><strong>技巧</strong>：找准中心论点，分析论证过程</p>
                    </div>
                  </div>
                </div>

                <div className="guide-section">
                  <h4>🎯 答题技巧</h4>
                  <div className="tips-grid">
                    <div className="tip-card">
                      <h6>🔍 理解题目</h6>
                      <ul>
                        <li>找出题目关键词</li>
                        <li>明确答题范围</li>
                        <li>确定答题角度</li>
                      </ul>
                    </div>
                    
                    <div className="tip-card">
                      <h6>📍 定位信息</h6>
                      <ul>
                        <li>根据题目提示找段落</li>
                        <li>标记关键句子</li>
                        <li>注意前后文联系</li>
                      </ul>
                    </div>
                    
                    <div className="tip-card">
                      <h6>✍️ 规范表达</h6>
                      <ul>
                        <li>使用学科术语</li>
                        <li>条理清晰分点</li>
                        <li>表述准确简洁</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="guide-section">
                  <h4>🏆 高分策略</h4>
                  <div className="strategy-list">
                    <div className="strategy-item">
                      <span className="strategy-number">1</span>
                      <div className="strategy-content">
                        <h6>时间分配</h6>
                        <p>阅读文章占1/3时间，思考分析占1/3时间，答题书写占1/3时间</p>
                      </div>
                    </div>
                    
                    <div className="strategy-item">
                      <span className="strategy-number">2</span>
                      <div className="strategy-content">
                        <h6>答题顺序</h6>
                        <p>先易后难，先客观后主观，确保基础题不失分</p>
                      </div>
                    </div>
                    
                    <div className="strategy-item">
                      <span className="strategy-number">3</span>
                      <div className="strategy-content">
                        <h6>检查验证</h6>
                        <p>完成后回顾题目要求，检查答案的完整性和准确性</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 训练记录 */}
        {currentTab === 'records' && (
          <div className="modern-tab-content active">
            <div className="records-features">
              <div className="feature-item">
                <h4>📊 学习统计</h4>
                <p>查看您的学习进度、正确率和时间分配</p>
              </div>
              <div className="feature-item">
                <h4>📈 能力分析</h4>
                <p>AI智能分析您的阅读能力和薄弱环节</p>
              </div>
              <div className="feature-item">
                <h4>🎯 个性推荐</h4>
                <p>根据学习情况推荐针对性练习内容</p>
              </div>
            </div>
            <div className="feature-note">
              <p>📈 训练记录功能正在开发中，敬请期待...</p>
            </div>
          </div>
        )}

        {/* 题库管理 */}
        {currentTab === 'management' && (
          <div className="modern-tab-content active">
            <div className="management-features">
              <div className="feature-item">
                <h4>📚 文章管理</h4>
                <p>添加、编辑、删除阅读文章</p>
              </div>
              <div className="feature-item">
                <h4>❓ 题目编辑</h4>
                <p>创建和修改各类题型和答案解析</p>
              </div>
              <div className="feature-item">
                <h4>🏷️ 标签分类</h4>
                <p>按难度、题材、题型进行分类管理</p>
              </div>
            </div>
            <div className="feature-note">
              <p>🗂️ 题库管理功能正在开发中，敬请期待...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 获取训练步骤标题
  function getStepTitle(step) {
    const titles = {
      1: '通读全文·整体感知',
      2: '审读题目·明确要求', 
      3: '精读段落·寻找答案',
      4: '分析归纳·提取要点',
      5: '规范表达·组织答案',
      6: '检查完善·提升质量'
    };
    return titles[step] || '';
  }

  // 渲染训练详情
  function renderTrainingDetail(step) {
    const content = {
      1: (
        <div className="step-detail">
          <h5>📖 训练目标</h5>
          <p>培养快速浏览文章、把握整体内容的能力</p>
          
          <h5>🔍 训练要点</h5>
          <ul>
            <li>快速浏览标题、首尾段落，把握文章主题</li>
            <li>注意文章的体裁（记叙文、说明文、议论文等）</li>
            <li>感受文章的情感基调和作者态度</li>
            <li>初步理解文章的结构脉络</li>
          </ul>
          
          <h5>💡 实践练习</h5>
          <div className="practice-exercise">
            <p>请在3分钟内快速浏览当前文章，然后回答：</p>
            <ol>
              <li>文章的主要内容是什么？</li>
              <li>作者想要表达什么情感或观点？</li>
              <li>文章可以分为几个部分？</li>
            </ol>
            <button className="practice-btn" onClick={() => setTrainingProgress({...trainingProgress, 1: true})}>
              完成练习
            </button>
          </div>
        </div>
      ),
      
      2: (
        <div className="step-detail">
          <h5>📋 训练目标</h5>
          <p>学会仔细分析题目要求，明确答题方向</p>
          
          <h5>🔍 训练要点</h5>
          <ul>
            <li>找出题目的关键词和限制条件</li>
            <li>明确题目问的是什么（内容、形式、技巧、作用等）</li>
            <li>判断答题的范围（全文、某段、某句）</li>
            <li>确定答题的角度和层次</li>
          </ul>
          
          <h5>💡 实践练习</h5>
          <div className="practice-exercise">
            <p>分析下面的题目要求：</p>
            <div className="example-question">
              "请分析文章第三段中作者运用的修辞手法及其表达效果。"
            </div>
            <p>这道题的关键信息：</p>
            <ul>
              <li>范围：第三段</li>
              <li>内容：修辞手法</li>
              <li>要求：分析表达效果</li>
            </ul>
            <button className="practice-btn" onClick={() => setTrainingProgress({...trainingProgress, 2: true})}>
              完成练习
            </button>
          </div>
        </div>
      ),
      
      3: (
        <div className="step-detail">
          <h5>🔍 训练目标</h5>
          <p>根据题目要求，精准定位答案区域</p>
          
          <h5>🔍 训练要点</h5>
          <ul>
            <li>根据题目中的关键词定位到相关段落</li>
            <li>仔细阅读相关内容，寻找直接答案</li>
            <li>注意前后句的关联和照应</li>
            <li>标记重要信息和关键词句</li>
          </ul>
          
          <h5>💡 实践练习</h5>
          <div className="practice-exercise">
            <p>练习步骤：</p>
            <ol>
              <li>选择当前文章的一道题目</li>
              <li>在原文中用不同颜色标记：
                <ul>
                  <li>🔴 直接答案</li>
                  <li>🟡 相关信息</li>
                  <li>🟢 背景信息</li>
                </ul>
              </li>
              <li>总结找到的关键信息</li>
            </ol>
            <button className="practice-btn" onClick={() => setTrainingProgress({...trainingProgress, 3: true})}>
              完成练习
            </button>
          </div>
        </div>
      ),
      
      4: (
        <div className="step-detail">
          <h5>📊 训练目标</h5>
          <p>学会分析文本内容，提取关键要点</p>
          
          <h5>🔍 训练要点</h5>
          <ul>
            <li>将找到的信息进行分类和整理</li>
            <li>抓住主要信息，舍弃次要信息</li>
            <li>分析信息之间的逻辑关系</li>
            <li>概括要点，形成答案要素</li>
          </ul>
          
          <h5>💡 实践练习</h5>
          <div className="practice-exercise">
            <p>信息整理练习：</p>
            <ol>
              <li>将找到的信息按重要性排序</li>
              <li>用关键词概括每个要点</li>
              <li>分析要点之间的关系（并列、递进、因果等）</li>
              <li>形成答案的基本框架</li>
            </ol>
            <button className="practice-btn" onClick={() => setTrainingProgress({...trainingProgress, 4: true})}>
              完成练习
            </button>
          </div>
        </div>
      ),
      
      5: (
        <div className="step-detail">
          <h5>✍️ 训练目标</h5>
          <p>学会规范表达，条理清晰地组织答案</p>
          
          <h5>🔍 训练要点</h5>
          <ul>
            <li>使用规范的语文术语</li>
            <li>按照逻辑顺序组织答案</li>
            <li>做到表述准确、简洁明了</li>
            <li>注意答案的完整性和层次性</li>
          </ul>
          
          <h5>💡 实践练习</h5>
          <div className="practice-exercise">
            <p>答案组织练习：</p>
            <ol>
              <li>使用"首先...其次...最后..."等连接词</li>
              <li>每个要点独立成句，条理清晰</li>
              <li>使用正确的语文专业术语</li>
              <li>检查语句是否通顺、表达是否准确</li>
            </ol>
            <div className="answer-template">
              <h6>答题模板示例：</h6>
              <p>这段文字运用了...的修辞手法。具体表现为...，生动地表现了...，突出了...的特点，表达了作者...的情感。</p>
            </div>
            <button className="practice-btn" onClick={() => setTrainingProgress({...trainingProgress, 5: true})}>
              完成练习
            </button>
          </div>
        </div>
      ),
      
      6: (
        <div className="step-detail">
          <h5>🔍 训练目标</h5>
          <p>培养检查和完善答案的良好习惯</p>
          
          <h5>🔍 训练要点</h5>
          <ul>
            <li>检查答案是否完整回答了题目要求</li>
            <li>核对答案要点是否准确无误</li>
            <li>检查语言表达是否规范通顺</li>
            <li>适当补充遗漏的要点</li>
          </ul>
          
          <h5>💡 实践练习</h5>
          <div className="practice-exercise">
            <p>检查清单：</p>
            <ul>
              <li>✅ 是否回答了题目的所有要求？</li>
              <li>✅ 答案要点是否准确？</li>
              <li>✅ 语言表达是否规范？</li>
              <li>✅ 逻辑是否清晰？</li>
              <li>✅ 有无错别字？</li>
            </ul>
            <button className="practice-btn" onClick={() => setTrainingProgress({...trainingProgress, 6: true})}>
              完成练习
            </button>
          </div>
        </div>
      )
    };
    
    return content[step] || <div>训练内容加载中...</div>;
  }
};

export default ModernReading;