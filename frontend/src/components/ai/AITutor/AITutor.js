import React, { useState } from 'react';
import './AITutor.css';

const AITutor = ({ user, onBack }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 训练记录数据
  const [trainingHistory] = useState([
    {
      id: 1,
      title: '《江上》阅读训练',
      date: '今天',
      time: '14:30',
      progress: 67,
      status: 'in-progress',
      steps: { completed: 4, total: 6 }
    },
    {
      id: 2,
      title: '散文阅读理解',
      date: '昨天',
      time: '16:45',
      score: 85,
      status: 'completed',
      level: 'excellent'
    },
    {
      id: 3,
      title: '议论文结构分析',
      date: '3天前',
      time: '10:20',
      score: 78,
      status: 'completed',
      level: 'good'
    }
  ]);

  // 陪练模式配置
  const tutorModes = [
    {
      id: 'reading-guidance',
      title: '六步法训练',
      description: '系统化的阅读方法训练',
      icon: '📖',
      features: ['分步指导', '公式训练', '实时反馈'],
      badge: '推荐',
      available: true
    },
    {
      id: 'ai-chat',
      title: 'AI智能问答',
      description: '随时提问，即时解答',
      icon: '🤖',
      features: ['24小时在线', '智能分析', '个性化建议'],
      badge: null,
      available: true
    },
    {
      id: 'human-tutor',
      title: '真人陪练',
      description: '专业老师一对一指导',
      icon: '👩‍🏫',
      features: ['专业指导', '深度交流', '定制方案'],
      badge: null,
      available: false,
      status: '离线'
    }
  ];

  // 六步法训练步骤
  const sixStepsMethod = [
    {
      step: 1,
      title: '初读感知',
      description: '快速浏览全文，了解大致内容',
      guidance: '请用1-2分钟快速浏览文章，不要过分关注细节，重点把握文章的主要内容和结构。'
    },
    {
      step: 2,
      title: '审题析题',
      description: '仔细分析题目要求',
      guidance: '仔细阅读每个题目，理解题目要求，确定答题的方向和重点。'
    },
    {
      step: 3,
      title: '定向阅读',
      description: '带着问题重读文章',
      guidance: '根据题目要求，有针对性地重新阅读文章相关部分，寻找答案线索。'
    },
    {
      step: 4,
      title: '筛选信息',
      description: '从文中筛选关键信息',
      guidance: '从文章中筛选出与题目相关的关键信息，进行整理和归纳。'
    },
    {
      step: 5,
      title: '整合答案',
      description: '组织语言，形成答案',
      guidance: '将筛选出的信息进行整合，用准确、简洁的语言组织答案。'
    },
    {
      step: 6,
      title: '检查完善',
      description: '检查答案，进行完善',
      guidance: '检查答案是否完整、准确，是否回答了题目的所有要求。'
    }
  ];

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    
    if (mode.id === 'reading-guidance') {
      startReadingGuidance();
    } else if (mode.id === 'ai-chat') {
      startAIChat();
    } else if (mode.id === 'human-tutor') {
      alert('真人陪练功能开发中，敬请期待！');
    }
  };

  const startReadingGuidance = () => {
    setCurrentTraining({
      type: 'six-steps',
      currentStep: 0,
      article: {
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
          '文中"子胥身不由己地向芦苇丛中走去"，"身不由己"说明了什么？',
          '文中子胥为什么要把剑送给渔夫？',
          '请结合文章内容，分析子胥这一人物形象的特点。'
        ]
      }
    });
  };

  const startAIChat = () => {
    setChatMessages([
      {
        type: 'ai',
        content: '你好！我是你的AI语文学习助手。有什么语文学习问题可以问我，比如：\n\n• 如何提高阅读理解能力？\n• 写作技巧和方法\n• 古诗文理解和鉴赏\n• 修辞手法的运用\n• 文学常识\n\n请告诉我你想了解什么吧！',
        timestamp: new Date()
      }
    ]);
  };

  const nextStep = () => {
    if (currentTraining && currentTraining.currentStep < sixStepsMethod.length - 1) {
      setCurrentTraining(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    }
  };

  const prevStep = () => {
    if (currentTraining && currentTraining.currentStep > 0) {
      setCurrentTraining(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage);
      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (message) => {
    const responses = {
      '阅读理解': '阅读理解的关键是：\n1. 先通读全文，把握主旨\n2. 仔细审题，明确要求\n3. 定位信息，找到关键句段\n4. 分析归纳，组织答案\n5. 检查完善，确保准确',
      '写作': '写作要注意：\n1. 审题立意要准确\n2. 结构要清晰完整\n3. 语言要生动准确\n4. 详略要得当\n5. 结尾要点题升华',
      '古诗文': '古诗文学习建议：\n1. 熟读背诵，培养语感\n2. 了解背景，把握情感\n3. 掌握典故，理解内涵\n4. 分析手法，欣赏技巧\n5. 联系现实，感悟人生',
      '默认': '这是一个很好的问题！语文学习需要多读、多写、多思考。具体来说：\n\n• 培养良好的阅读习惯\n• 积累丰富的词汇和表达\n• 练习各种文体的写作\n• 关注文学作品的情感和思想\n\n还有什么具体问题吗？'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    return responses['默认'];
  };

  const backToModeSelection = () => {
    setSelectedMode(null);
    setCurrentTraining(null);
    setChatMessages([]);
  };

  return (
    <div className="ai-tutor">
      {/* 返回按钮 */}
      <button className="back-button" onClick={onBack}>
        ← 返回
      </button>

      {/* 页面标题 */}
      <div className="page-header">
        <h1>👨‍🏫 AI智能陪练</h1>
        <p>个性化阅读训练指导</p>
      </div>

      {!selectedMode && (
        <>
          {/* 陪练模式选择 */}
          <div className="tutor-mode-selection">
            <div className="section-title">🎯 选择陪练模式</div>
            <div className="mode-cards">
              {tutorModes.map(mode => (
                <div 
                  key={mode.id}
                  className={`mode-card ${mode.badge ? 'recommended' : ''} ${!mode.available ? 'disabled' : ''}`}
                  onClick={() => mode.available && handleModeSelect(mode)}
                >
                  <div className="mode-header">
                    <div className="mode-icon">{mode.icon}</div>
                    {mode.badge && <div className="mode-badge">{mode.badge}</div>}
                    {!mode.available && mode.status && (
                      <div className="tutor-status offline">{mode.status}</div>
                    )}
                  </div>
                  <div className="mode-content">
                    <h3>{mode.title}</h3>
                    <p>{mode.description}</p>
                    <div className="mode-features">
                      {mode.features.map((feature, index) => (
                        <span key={index} className="feature">✓ {feature}</span>
                      ))}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={`mode-btn ${mode.id === 'reading-guidance' ? 'primary' : mode.id === 'ai-chat' ? 'secondary' : 'tertiary'}`}
                    disabled={!mode.available}
                  >
                    {mode.id === 'reading-guidance' ? '开始训练' : 
                     mode.id === 'ai-chat' ? '立即体验' : '预约陪练'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 训练记录 */}
          <div className="training-history">
            <div className="section-title">📊 训练记录</div>
            <div className="history-cards">
              {trainingHistory.map(record => (
                <div key={record.id} className={`history-card ${record.status}`}>
                  <div className="history-header">
                    <div className="history-date">{record.date}</div>
                    <div className="history-time">{record.time}</div>
                  </div>
                  <div className="history-content">
                    <div className="history-title">{record.title}</div>
                    {record.status === 'in-progress' ? (
                      <div className="history-progress">
                        <span className="progress-text">
                          完成 {record.steps.completed}/{record.steps.total} 步
                        </span>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${record.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="history-score">
                        <span className="score-text">得分: {record.score}分</span>
                        <span className={`score-badge ${record.level}`}>
                          {record.level === 'excellent' ? '优秀' : '良好'}
                        </span>
                      </div>
                    )}
                  </div>
                  <button 
                    type="button" 
                    className={record.status === 'in-progress' ? 'continue-btn' : 'review-btn'}
                  >
                    {record.status === 'in-progress' ? '继续训练' : '查看详情'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 六步法训练界面 */}
      {selectedMode?.id === 'reading-guidance' && currentTraining?.type === 'six-steps' && (
        <div className="six-steps-training">
          <div className="training-header">
            <button className="back-to-modes" onClick={backToModeSelection}>
              ← 返回模式选择
            </button>
            <h2>六步法训练</h2>
            <div className="step-indicator">
              第 {currentTraining.currentStep + 1} 步 / 共 {sixStepsMethod.length} 步
            </div>
          </div>

          <div className="training-content">
            <div className="article-area">
              <h3>{currentTraining.article.title}</h3>
              <p className="author">作者：{currentTraining.article.author}</p>
              <div className="article-text">
                {currentTraining.article.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="guidance-area">
              <div className="current-step">
                <h3>
                  步骤 {sixStepsMethod[currentTraining.currentStep].step}: 
                  {sixStepsMethod[currentTraining.currentStep].title}
                </h3>
                <p className="step-description">
                  {sixStepsMethod[currentTraining.currentStep].description}
                </p>
                <div className="step-guidance">
                  {sixStepsMethod[currentTraining.currentStep].guidance}
                </div>
              </div>

              <div className="step-actions">
                <button 
                  onClick={prevStep}
                  disabled={currentTraining.currentStep === 0}
                  className="step-btn secondary"
                >
                  上一步
                </button>
                <button 
                  onClick={nextStep}
                  disabled={currentTraining.currentStep === sixStepsMethod.length - 1}
                  className="step-btn primary"
                >
                  下一步
                </button>
              </div>

              {currentTraining.currentStep === sixStepsMethod.length - 1 && (
                <div className="training-complete">
                  <h4>🎉 训练完成！</h4>
                  <p>恭喜你完成了六步法训练，现在可以尝试回答文章的问题了。</p>
                  <div className="questions-preview">
                    <h5>练习题目：</h5>
                    <ol>
                      {currentTraining.article.questions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI聊天界面 */}
      {selectedMode?.id === 'ai-chat' && (
        <div className="ai-chat-interface">
          <div className="chat-header">
            <button className="back-to-modes" onClick={backToModeSelection}>
              ← 返回模式选择
            </button>
            <h2>🤖 AI智能问答</h2>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  <div className="message-content">
                    {message.content.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex}>{line}</div>
                    ))}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message ai loading">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-area">
              <div className="input-container">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="输入您的问题..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} disabled={!inputMessage.trim() || isLoading}>
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITutor;
