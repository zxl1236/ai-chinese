// API配置文件
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // 基础端点
  base: API_BASE_URL,
  health: `${API_BASE_URL}/api/health`,
  
  // 模块相关
  modules: `${API_BASE_URL}/api/modules`,
  module: (id) => `${API_BASE_URL}/api/modules/${id}`,
  moduleContents: (id) => `${API_BASE_URL}/api/modules/${id}/contents`,
  
  // 内容相关
  contents: `${API_BASE_URL}/api/contents`,
  content: (id) => `${API_BASE_URL}/api/contents/${id}`,
  
  // 用户相关
  users: `${API_BASE_URL}/api/users`,
  user: (id) => `${API_BASE_URL}/api/users/${id}`,
  userProgress: (userId) => `${API_BASE_URL}/api/users/${userId}/progress`,
  
  // 预约相关
  bookings: `${API_BASE_URL}/api/bookings`,
  booking: (id) => `${API_BASE_URL}/api/bookings/${id}`,
  
  // AI服务相关
  aiChat: `${API_BASE_URL}/api/ai/chat`,
  aiWriting: `${API_BASE_URL}/api/ai/writing`,
  aiReading: `${API_BASE_URL}/api/ai/reading`,
  
  // 管理界面
  admin: `${API_BASE_URL}/admin`,
  adminModules: `${API_BASE_URL}/admin/modules`,
  adminContents: `${API_BASE_URL}/admin/contents`,
  adminUsers: `${API_BASE_URL}/admin/users`,
};

// API请求工具函数
export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// GET请求
export const apiGet = (url) => apiRequest(url);

// POST请求
export const apiPost = (url, data) => apiRequest(url, {
  method: 'POST',
  body: JSON.stringify(data),
});

// PUT请求
export const apiPut = (url, data) => apiRequest(url, {
  method: 'PUT',
  body: JSON.stringify(data),
});

// DELETE请求
export const apiDelete = (url) => apiRequest(url, {
  method: 'DELETE',
});

// 健康检查
export const checkApiHealth = async () => {
  try {
    const response = await apiGet(API_ENDPOINTS.health);
    return response.status === 'ok';
  } catch (error) {
    console.error('API健康检查失败:', error);
    return false;
  }
};

// 环境信息
export const getEnvironmentInfo = () => ({
  apiUrl: API_BASE_URL,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
});

export default API_ENDPOINTS;
