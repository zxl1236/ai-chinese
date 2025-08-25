import React, { useState, useEffect, useRef } from 'react';
import EnhancedAnnotationTool from '../EnhancedAnnotationTool';
import './AdvancedReadingTraining.css';

const AdvancedReadingTraining = ({ article, questions, onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepProgress, setStepProgress] = useState(new Map());
  const [totalTime, setTotalTime] = useState(0);
  const [stepTimes, setStepTimes] = useState(new Map());
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);
  const [annotations, setAnnotations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentStepStartTime, setCurrentStepStartTime] = useState(null);

  const timerRef = useRef(null);

  // 六步法配置
  const steps = [
    {
      id: 1,
      name: '读',
      title: '第一步：通读文章和题目',
      description: '先读题目，再读文章，最后重读问题',
      estimatedTime: 8, // 分钟
      icon: '📖',
      color: '#4caf50',
      tasks: [
        '快速浏览所有题目，标记关键词',
        '通读文章，把握整体内容',
        '带着问题重读，建立联系'
      ]
    },
    {
      id: 2,
      name: '解读文本',
      title: '第二步：判断文体并解读',
      description: '识别文体特点，选择对应的解读方法',
      estimatedTime: 10,
      icon: '🔍',
      color: '#2196f3',
      tasks: [
        '判断文章体裁类型',
        '分析文章结构层次',
        '标记重要信息和表达方式'
      ]
    },
    {
      id: 3,
      name: '归纳中心',
      title: '第三步：概括文章中心',
      description: '运用简括和详括方法提取文章主旨',
      estimatedTime: 8,
      icon: '🎯',
      color: '#ff9800',
      tasks: [
        '提取关键词和核心信息',
        '概括主要内容',
        '归纳中心思想和主题'
      ]
    },
    {
      id: 4,
      name: '认真审题',
      title: '第四步：深度理解题目',
      description: '培养阅读认真度、理解度、感悟度、拓展能力',
      estimatedTime: 6,
      icon: '❓',
      color: '#9c27b0',
      tasks: [
        '分析题目类型和考查重点',
        '圈出题目中的关键信息',
        '确定答题思路和方向'
      ]
    },
    {
      id: 5,
      name: '根据文章意境答题',
      title: '第五步：结合文章内容分点答题',
      description: '基于文章内容，分类分点组织答案',
      estimatedTime: 20,
      icon: '✍️',
      color: '#f44336',
      tasks: [
        '定位答题相关内容',
        '运用答题公式组织语言',
        '分点作答，条理清晰'
      ]
    },
    {
      id: 6,
      name: '检查修正',
      title: '第六步：检查和完善答案',
      description: '检查答案完整性和准确性，进行必要修正',
      estimatedTime: 6,
      icon: '✅',
      color: '#607d8b',
      tasks: [
        '检查答案的完整性',
        '验证答案的准确性',
        '优化表达的规范性'
      ]
    }
  ];

  // 开始训练
  const startTraining = () => {
    setIsTrainingActive(true);
    setCurrentStep(1);
    setCurrentStepStartTime(Date.now());
    startTimer();
  };

  // 开始计时
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);
  };

  // 停止计时
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 完成当前步骤
  const completeCurrentStep = () => {
    if (currentStepStartTime) {
      const stepDuration = Math.floor((Date.now() - currentStepStartTime) / 1000);
      setStepTimes(prev => new Map(prev).set(currentStep, stepDuration));
    }

    setStepProgress(prev => new Map(prev).set(currentStep, {
      completed: true,
      timestamp: Date.now(),
      annotations: [...annotations],
      notes: [...notes]
    }));

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      setCurrentStepStartTime(Date.now());
    } else {
      completeTraining();
    }
  };

  // 完成训练
  const completeTraining = () => {
    stopTimer();
    setIsTrainingActive(false);
    
    const completionData = {
      totalTime,
      stepTimes: Object.fromEntries(stepTimes),
      stepProgress: Object.fromEntries(stepProgress),
      annotations,
      notes,
      article: article.title,
      timestamp: new Date().toISOString()
    };

    onComplete && onComplete(completionData);
  };

  // 跳转到指定步骤
  const goToStep = (stepId) => {
    if (stepId <= currentStep || stepProgress.has(stepId)) {
      setCurrentStep(stepId);
      setCurrentStepStartTime(Date.now());
    }
  };

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 处理标记变化
  const handleAnnotationChange = (newAnnotations) => {
    setAnnotations(newAnnotations);
  };

  // 获取当前步骤
  const getCurrentStep = () => steps.find(step => step.id === currentStep);

  // 获取步骤状态
  const getStepStatus = (stepId) => {
    if (stepProgress.has(stepId)) return 'completed';
    if (stepId === currentStep && isTrainingActive) return 'active';
    if (stepId < currentStep) return 'available';
    return 'locked';
  };

  // 计算进度百分比
  const getProgressPercentage = () => {
    const completedSteps = Array.from(stepProgress.keys()).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // 渲染步骤指导
  const renderStepGuidance = () => {
    const step = getCurrentStep();
    if (!step) return null;

    return (
      <div className="step-guidance">
        <div className="guidance-header">
          <div className="step-icon" style={{ color: step.color }}>
            {step.icon}
          </div>
          <div className="step-info">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <div className="estimated-time">
              预计用时：{step.estimatedTime}分钟
            </div>
          </div>
        </div>

        <div className="step-tasks">
          <h4>本步骤任务：</h4>
          <ul>
            {step.tasks.map((task, index) => (
              <li key={index}>{task}</li>
            ))}
          </ul>
        </div>

        <div className="guidance-actions">
          <button 
            className="complete-step-btn"
            onClick={completeCurrentStep}
            style={{ backgroundColor: step.color }}
          >
            完成第{currentStep}步 →
          </button>
          {currentStep > 1 && (
            <button 
              className="prev-step-btn"
              onClick={() => goToStep(currentStep - 1)}
            >
              ← 上一步
            </button>
          )}
        </div>
      </div>
    );
  };

  // 渲染训练总结
  const renderTrainingSummary = () => {
    if (isTrainingActive || stepProgress.size === 0) return null;

    const completedSteps = Array.from(stepProgress.entries());
    const averageTime = Math.round(totalTime / completedSteps.length);

    return (
      <div className="training-summary">
        <div className="summary-header">
          <h3>🎉 训练完成</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{formatTime(totalTime)}</span>
              <span className="stat-label">总用时</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{completedSteps.length}</span>
              <span className="stat-label">完成步骤</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{annotations.length}</span>
              <span className="stat-label">标记数量</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{notes.length}</span>
              <span className="stat-label">笔记数量</span>
            </div>
          </div>
        </div>

        <div className="step-time-analysis">
          <h4>各步骤用时分析：</h4>
          <div className="time-chart">
            {steps.map(step => {
              const actualTime = stepTimes.get(step.id) || 0;
              const estimatedTime = step.estimatedTime * 60;
              const efficiency = estimatedTime > 0 ? Math.round((estimatedTime / actualTime) * 100) : 0;
              
              return (
                <div key={step.id} className="time-item">
                  <div className="step-name">{step.name}</div>
                  <div className="time-comparison">
                    <span className="actual-time">{formatTime(actualTime)}</span>
                    <span className="vs">vs</span>
                    <span className="estimated-time">{formatTime(estimatedTime)}</span>
                  </div>
                  <div className={`efficiency ${efficiency >= 100 ? 'good' : 'needs-improvement'}`}>
                    {efficiency >= 100 ? '✅' : '⚠️'} {efficiency >= 100 ? '高效' : '需提升'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="learning-suggestions">
          <h4>个性化建议：</h4>
          <ul>
            {stepTimes.get(1) > 600 && (
              <li>第一步阅读时间较长，建议提高阅读速度，注重整体把握</li>
            )}
            {stepTimes.get(4) < 300 && (
              <li>审题时间偏短，建议更仔细地分析题目要求</li>
            )}
            {annotations.length < 5 && (
              <li>标记数量较少，建议更积极地使用圈点读题功能</li>
            )}
            {notes.length === 0 && (
              <li>没有添加笔记，建议记录自己的思考过程</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="advanced-reading-training">
      {/* 训练状态栏 */}
      <div className="training-status-bar">
        <div className="training-info">
          <h2>🎓 圣博六步法阅读训练</h2>
          <div className="training-meta">
            <span>文章：{article.title}</span>
            <span>用时：{formatTime(totalTime)}</span>
            <span>进度：{getProgressPercentage()}%</span>
          </div>
        </div>
        
        {!isTrainingActive && stepProgress.size === 0 && (
          <button className="start-training-btn" onClick={startTraining}>
            🚀 开始训练
          </button>
        )}
      </div>

      {/* 步骤进度指示器 */}
      <div className="steps-progress">
        {steps.map(step => {
          const status = getStepStatus(step.id);
          const stepTime = stepTimes.get(step.id);
          
          return (
            <div 
              key={step.id} 
              className={`step-indicator ${status}`}
              onClick={() => goToStep(step.id)}
              style={status === 'active' ? { borderColor: step.color } : {}}
            >
              <div className="step-number" style={status === 'active' ? { backgroundColor: step.color } : {}}>
                {status === 'completed' ? '✓' : step.id}
              </div>
              <div className="step-label">
                <div className="step-name">{step.name}</div>
                <div className="step-time">
                  {stepTime ? formatTime(stepTime) : `${step.estimatedTime}min`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 主要内容区域 */}
      <div className="training-content">
        {/* 步骤指导面板 */}
        {isTrainingActive && showGuidance && (
          <div className="guidance-panel">
            {renderStepGuidance()}
            <button 
              className="toggle-guidance"
              onClick={() => setShowGuidance(false)}
            >
              收起指导
            </button>
          </div>
        )}

        {/* 隐藏指导的情况下显示简化信息 */}
        {isTrainingActive && !showGuidance && (
          <div className="minimal-guidance">
            <div className="current-step-info">
              <span className="step-icon">{getCurrentStep()?.icon}</span>
              <span className="step-title">{getCurrentStep()?.title}</span>
            </div>
            <button 
              className="show-guidance"
              onClick={() => setShowGuidance(true)}
            >
              显示指导
            </button>
          </div>
        )}

        {/* 文章阅读区域 */}
        <div className="article-reading-area">
          <EnhancedAnnotationTool
            article={article}
            questions={questions}
            onAnnotationChange={handleAnnotationChange}
            mode="training"
          />
        </div>

        {/* 训练总结 */}
        {renderTrainingSummary()}
      </div>

      {/* 实时统计面板 */}
      {isTrainingActive && (
        <div className="live-stats">
          <div className="stat-item">
            <span className="stat-label">当前步骤</span>
            <span className="stat-value">{currentStep}/6</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">已用时间</span>
            <span className="stat-value">{formatTime(totalTime)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">标记数</span>
            <span className="stat-value">{annotations.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReadingTraining;
