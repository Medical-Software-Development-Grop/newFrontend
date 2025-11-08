import { API_BASE_URL, getAuthHeaders } from './config';

export interface User {
  id: number;
  doctor_number: string;
  name: string;
  role: string;
}

// 获取用户列表（用于下拉选择）
export const getUsers = async (role?: string): Promise<User[]> => {
  const params = new URLSearchParams();
  if (role) params.append('role', role);

  try {
    // 移除末尾的问号（如果没有参数）
    const url = `${API_BASE_URL}/api/users${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      // 如果认证失败或服务器错误，返回空数组而不是抛出错误
      if (response.status === 401 || response.status === 403 || response.status === 500) {
        console.warn(`获取用户列表失败 (${response.status})，返回空列表`);
        return [];
      }
      throw new Error(`获取用户列表失败: ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    console.error('获取用户列表时发生错误:', err);
    // 如果网络错误或CORS错误，返回空数组而不是抛出错误，避免阻塞页面
    return [];
  }
};

