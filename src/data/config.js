/**
 * 应用配置文件
 * 包含应用的各种配置信息
 */
const AppConfig = {
  // 应用基本信息
  app: {
    name: 'AI语文学习助手',
    version: '1.0.0',
    description: '智能化语文学习平台，提供个性化学习方案',
    author: '开发团队'
  },

  // API配置
  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://api.ai-yuwen.com' 
      : 'http://localhost:3000',
    timeout: 10000,
    retryTimes: 3
  },

  // 功能开关
  features: {
    aiRecommendation: true,
    voiceRecognition: false,
    darkMode: true,
    offlineMode: false,
    analytics: true
  },

  // 学习模块配置
  modules: {
    reading: {
      name: '现代文阅读',
      icon: '📖',
      enabled: true,
      subModules: ['题目练习', '文章解析', '训练记录', '题库管理']
    },
    writing: {
      name: '写作训练',
      icon: '✍️',
      enabled: true,
      subModules: ['记叙文', '议论文', '应用文', '材料作文']
    },
    poetry: {
      name: '古诗文',
      icon: '🏛️',
      enabled: true,
      subModules: ['诗词鉴赏', '文言文翻译', '背诵默写']
    },
    grammar: {
      name: '语法基础',
      icon: '📝',
      enabled: true,
      subModules: ['字词基础', '语言规范', '修辞手法']
    }
  },

  // 用户等级配置
  userLevels: [
    { level: 1, name: '初学者', minScore: 0, maxScore: 59, color: '#f44336' },
    { level: 2, name: '入门', minScore: 60, maxScore: 69, color: '#ff9800' },
    { level: 3, name: '中级', minScore: 70, maxScore: 79, color: '#2196f3' },
    { level: 4, name: '良好', minScore: 80, maxScore: 89, color: '#4caf50' },
    { level: 5, name: '优秀', minScore: 90, maxScore: 100, color: '#9c27b0' }
  ],

  // 本地存储键名
  storage: {
    userProfile: 'ai_yuwen_user_profile',
    studyProgress: 'ai_yuwen_study_progress',
    settings: 'ai_yuwen_settings',
    questionHistory: 'ai_yuwen_question_history',
    errorQuestions: 'ai_yuwen_error_questions'
  },

  // 默认设置
  defaultSettings: {
    theme: 'light',
    fontSize: 'medium',
    autoSave: true,
    soundEffects: true,
    notifications: true,
    studyReminder: true,
    dailyGoal: 30 // 分钟
  },

  // 题目类型配置
  questionTypes: {
    single: { name: '单选题', icon: '🔘' },
    multiple: { name: '多选题', icon: '☑️' },
    short: { name: '简答题', icon: '📝' },
    essay: { name: '作文题', icon: '📄' },
    reading: { name: '阅读理解', icon: '📖' }
  },

  // 难度等级
  difficultyLevels: {
    easy: { name: '简单', color: '#4caf50', score: 1 },
    medium: { name: '中等', color: '#ff9800', score: 2 },
    hard: { name: '困难', color: '#f44336', score: 3 }
  },

  // 动画配置
  animations: {
    pageTransition: 300,
    cardHover: 200,
    buttonClick: 150,
    progressBar: 500
  },

  // 响应式断点
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
} else {
  window.AppConfig = AppConfig;
}