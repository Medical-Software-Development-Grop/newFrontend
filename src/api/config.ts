  // API配置文件
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Token管理
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

// 处理401错误 - 清除token并触发登出事件
export const handleUnauthorized = (): void => {
  removeToken();
  // 触发自定义事件，通知App组件需要跳转到登录页面
  window.dispatchEvent(new CustomEvent('unauthorized', { 
    detail: { message: '401 Unauthorized - 请重新登录' } 
  }));
};

// 统一的响应处理函数，自动处理401错误
export const handleResponse = async (response: Response): Promise<Response> => {
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('401 Unauthorized - 请重新登录');
  }
  return response;
};

// 获取认证头
export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// 获取文件上传头
export const getUploadHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

