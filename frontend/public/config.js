// 生产环境配置文件
// 这个文件会在构建时被包含到项目中
window.REACT_APP_CONFIG = {
  // 本地开发环境
  DEVELOPMENT_API_URL: 'http://localhost:5000',
  
  // 生产环境 - 暂时禁用后端连接，前端独立运行
  PRODUCTION_API_URL: null, // 设置为 null 表示不连接后端
  
  // 当前环境判断
  IS_PRODUCTION: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  
  // 前端独立运行模式
  FRONTEND_ONLY_MODE: true
};
