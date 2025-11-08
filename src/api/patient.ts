import { API_BASE_URL, getAuthHeaders } from './config';

export interface Patient {
  id: number;
  patient_number: string;
  name: string;
  age: number;
  gender: string;
  hospitalization_number: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientUpdate {
  name?: string;
  age?: number;
  gender?: string;
  hospitalization_number?: string;
}

// 获取病人列表
export const getPatients = async (search?: string): Promise<Patient[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE_URL}/api/patients?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取病人列表失败');
  }

  return response.json();
};

// 获取单个病人
export const getPatient = async (id: number): Promise<Patient> => {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取病人信息失败');
  }

  return response.json();
};

// 更新病人信息
export const updatePatient = async (id: number, patientData: PatientUpdate): Promise<Patient> => {
  // 过滤掉undefined值
  const cleanData: any = {};
  Object.keys(patientData).forEach(key => {
    if (patientData[key as keyof PatientUpdate] !== undefined) {
      cleanData[key] = patientData[key as keyof PatientUpdate];
    }
  });

  // 如果没有有效数据，直接返回
  if (Object.keys(cleanData).length === 0) {
    return getPatient(id);
  }

  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cleanData),
  });

  if (!response.ok) {
    let errorMessage = '更新病人信息失败';
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || '更新病人信息失败';
      
      // 422错误通常是验证错误
      if (response.status === 422 && error.detail && Array.isArray(error.detail)) {
        const validationErrors = error.detail.map((err: any) => 
          `${err.loc?.join('.')}: ${err.msg}`
        ).join(', ');
        errorMessage = `数据验证失败: ${validationErrors}`;
      }
    } catch (e) {
      errorMessage = `更新病人信息失败 (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// 创建病人
export const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> => {
  const response = await fetch(`${API_BASE_URL}/api/patients`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '创建病人失败');
  }

  return response.json();
};

