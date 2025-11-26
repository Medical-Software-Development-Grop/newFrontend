import { API_BASE_URL, getAuthHeaders } from './config';

export interface Checklist {
  id: number;
  checklist_number: string;
  patient_id: number;
  sample_id: number;
  reviewing_doctor_id?: number;
  report_analysis?: string;
  review_status: string;
  marking_status: string;
  report_date?: string;
  cell_counts?: Record<string, number>; // 细胞计数信息
}

export interface ChecklistListResponse {
  items: Checklist[];
  total: number;
}

export interface ChecklistFilters {
  skip?: number;
  limit?: number;
  patient_id?: number;
  sample_id?: number;
  review_status?: string;
}

// 获取检查单列表
export const getChecklists = async (filters: ChecklistFilters = {}): Promise<ChecklistListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.patient_id) params.append('patient_id', filters.patient_id.toString());
  if (filters.sample_id) params.append('sample_id', filters.sample_id.toString());
  if (filters.review_status) params.append('review_status', filters.review_status);

  const response = await fetch(`${API_BASE_URL}/api/checklists?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取检查单列表失败');
  }

  const data = await response.json();
  return {
    items: Array.isArray(data) ? data : [],
    total: Array.isArray(data) ? data.length : 0,
  };
};

// 获取单个检查单
export const getChecklist = async (id: number): Promise<Checklist> => {
  const response = await fetch(`${API_BASE_URL}/api/checklists/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取检查单失败');
  }

  return response.json();
};

// 从样本生成检查单
export const createChecklistFromSample = async (
  sampleId: number,
  reviewingDoctorId?: number
): Promise<any> => {
  const params = new URLSearchParams();
  if (reviewingDoctorId) {
    params.append('reviewing_doctor_id', reviewingDoctorId.toString());
  }

  const response = await fetch(`${API_BASE_URL}/api/checklists/from-sample/${sampleId}?${params.toString()}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '生成检查单失败');
  }

  return response.json();
};

// 更新检查单
export const updateChecklist = async (id: number, checklistData: Partial<Checklist>): Promise<Checklist> => {
  const response = await fetch(`${API_BASE_URL}/api/checklists/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(checklistData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '更新检查单失败');
  }

  return response.json();
};

// 审核检查单
export const reviewChecklist = async (
  id: number,
  reviewData: {
    review_status: string;
    report_analysis?: string;
    report_date?: string;
  }
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/checklists/${id}/review`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '审核失败');
  }
};

// 根据样本编号获取检查单（包含 cell_counts 字段）
export const getChecklistBySampleNumber = async (sampleNumber: string): Promise<Checklist> => {
  const response = await fetch(`${API_BASE_URL}/api/checklists/sample/${encodeURIComponent(sampleNumber)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '获取检查单失败');
  }

  return response.json();
};

