import { API_BASE_URL, setToken, removeToken, handleUnauthorized } from './config';

export interface LoginRequest {
  doctor_number: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user_info: {
    id: number;
    doctor_number: string;
    name: string;
    role: string;
  };
}

export interface UserInfo {
  id: number;
  doctor_number: string;
  name: string;
  role: string;
}

// 用户登录
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let errorMessage = '登录失败';
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || '登录失败';
      
      // 422错误通常是验证错误，显示详细错误信息
      if (response.status === 422) {
        if (error.detail && Array.isArray(error.detail)) {
          const validationErrors = error.detail.map((err: any) => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join(', ');
          errorMessage = `数据验证失败: ${validationErrors}`;
        }
      }
    } catch (e) {
      // 如果无法解析错误响应，使用默认消息
      errorMessage = `登录失败 (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // 保存token (支持不同的响应格式)
  const token = data.access_token || data.token;
  if (token) {
    setToken(token);
  }
  
  // 返回统一格式
  return {
    access_token: token,
    user_info: data.user_info || data.user || {
      id: data.user?.id || 0,
      doctor_number: credentials.doctor_number,
      name: data.user?.name || '',
      role: data.user?.role || 'user'
    }
  };
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<UserInfo> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('未登录');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    removeToken();
    throw new Error('获取用户信息失败');
  }

  return response.json();
};

// 用户登出
export const logout = (): void => {
  removeToken();
};

