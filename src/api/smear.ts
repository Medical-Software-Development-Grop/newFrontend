import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './config';

export interface Smear {
  id: number;
  sample_number: string;
  patient_id: number;
  type: string;
  scanner?: string;
  status: string;
  submission_time?: string;
  inspection_doctor_id?: number;
  inspection_doctor?: {
    id: number;
    name: string;
    doctor_number?: string;
    role: string;
  } | null;
  patient?: {
    id: number;
    name: string;
    age?: number;
    gender?: string;
    patient_number: string;
    hospitalization_number?: string;
    bed_number?: string;
    department?: string;
  };
}

export interface SmearListResponse {
  items: Smear[];
  total: number;
}

export interface SmearFilters {
  skip?: number;
  limit?: number;
  patient_id?: number;
  type?: string;
  sample_number?: string;
  patient_name?: string;
  search?: string;
  hospitalization_number?: string;
  patient_age?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  inspection_doctor_name?: string;
}

// 获取样本列表
export const getSmears = async (filters: SmearFilters = {}): Promise<SmearListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.patient_id) params.append('patient_id', filters.patient_id.toString());
  if (filters.type) params.append('type', filters.type);
  if (filters.sample_number) params.append('sample_number', filters.sample_number);
  if (filters.patient_name) params.append('search', filters.patient_name);
  if (filters.search) params.append('search', filters.search);
  if (filters.hospitalization_number) params.append('hospitalization_number', filters.hospitalization_number);
  if (filters.patient_age !== undefined) params.append('patient_age', filters.patient_age.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.inspection_doctor_name) params.append('inspection_doctor_name', filters.inspection_doctor_name);

  const response = await fetch(`${API_BASE_URL}/api/smears?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    const error = await response.json().catch(() => ({ detail: '获取样本列表失败' }));
    throw new Error(error.detail || '获取样本列表失败');
  }

  const data = await response.json();
  
  // 处理新的响应格式：包含items和total
  if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
    return {
      items: Array.isArray(data.items) ? data.items : [],
      total: typeof data.total === 'number' ? data.total : 0,
    };
  }
  
  // 兼容旧格式：直接返回数组
  const items = Array.isArray(data) ? data : [];
  
  return {
    items: items,
    total: items.length,
  };
};

// 获取单个样本
// 注意：后端API使用sample_number（字符串）作为标识符，不是id
export const getSmear = async (sampleNumberOrId: string | number): Promise<Smear> => {
  // 如果传入的是数字（可能是旧代码），我们需要先找到对应的sample_number
  // 但更好的做法是直接传入sample_number
  const identifier = typeof sampleNumberOrId === 'string' 
    ? sampleNumberOrId 
    : sampleNumberOrId.toString();
  
  const response = await fetch(`${API_BASE_URL}/api/smears/${encodeURIComponent(identifier)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '获取样本信息失败');
  }

  return response.json();
};

// 创建样本
export const createSmear = async (smearData: Partial<Smear>): Promise<Smear> => {
  const response = await fetch(`${API_BASE_URL}/api/smears`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(smearData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '创建样本失败');
  }

  return response.json();
};

// 更新样本
// 注意：后端API使用sample_number（字符串）作为标识符，不是id
export const updateSmear = async (sampleNumberOrId: string | number, smearData: Partial<Smear>): Promise<Smear> => {
  try {
    // 如果传入的是数字（可能是旧代码），转换为字符串
    // 后端API期望sample_number（字符串）
    const identifier = typeof sampleNumberOrId === 'string' 
      ? sampleNumberOrId 
      : sampleNumberOrId.toString();
    
    const response = await fetch(`${API_BASE_URL}/api/smears/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(smearData),
    });

    if (!response.ok) {
      let errorMessage = '更新样本失败';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || '更新样本失败';
        
        // 422错误通常是验证错误
        if (response.status === 422 && error.detail && Array.isArray(error.detail)) {
          const validationErrors = error.detail.map((err: any) => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join(', ');
          errorMessage = `数据验证失败: ${validationErrors}`;
        }
      } catch (e) {
        // 如果无法解析错误响应
        if (response.status === 0) {
          errorMessage = '无法连接到后端服务，请确认后端服务已启动（http://localhost:8000）';
        } else {
          errorMessage = `更新样本失败 (${response.status})`;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (err: any) {
    // 网络错误或CORS错误
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('无法连接到后端服务，请确认：1) 后端服务已启动（http://localhost:8000）2) CORS配置正确');
    }
    throw err;
  }
};

// 删除样本
// 删除样本
// 注意：后端API使用sample_number（字符串）作为标识符，不是id
export const deleteSmear = async (sampleNumberOrId: string | number): Promise<void> => {
  // 如果传入的是数字（可能是旧代码），转换为字符串
  const identifier = typeof sampleNumberOrId === 'string' 
    ? sampleNumberOrId 
    : sampleNumberOrId.toString();
  
  const response = await fetch(`${API_BASE_URL}/api/smears/${encodeURIComponent(identifier)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || '删除样本失败');
  }
};

