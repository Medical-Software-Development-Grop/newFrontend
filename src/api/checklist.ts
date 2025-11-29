import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './config';

// 细胞子类别计数
export interface CellSubCategories {
  [subCategory: string]: number;
}

// 细胞大类统计
export interface CellCategoryCount {
  count: number;
  sub_categories: CellSubCategories;
}

// 细胞统计数据（新的嵌套结构）
export interface CellCounts {
  "组织类细胞"?: CellCategoryCount;
  "中性粒细胞系统"?: CellCategoryCount;
  "嗜酸、嗜碱粒"?: CellCategoryCount;
  "幼红系列"?: CellCategoryCount;
  "淋巴细胞系"?: CellCategoryCount;
  "单核细胞系"?: CellCategoryCount;
  "巨核细胞系"?: CellCategoryCount;
  total?: number;
  [key: string]: CellCategoryCount | number | undefined;
}

export interface Checklist {
  id?: number;
  checklist_number: string;
  patient_number?: string;
  sample_number?: string;
  reviewing_doctor_number?: string;
  report_analysis?: string;
  typical_figure_1_path?: string;
  typical_figure_2_path?: string;
  check_time?: string;
  marking_status: string;
  report_date?: string;
  cell_counts?: CellCounts; // 新的嵌套细胞统计结构
  total_cells?: number; // 细胞总数
  created_at?: string;
  updated_at?: string;
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
}

// 更新细胞统计数据的请求体
export interface ChecklistCellCountsUpdate {
  cell_counts: CellCounts;
}

// 获取检查单列表
export const getChecklists = async (filters: ChecklistFilters = {}): Promise<ChecklistListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.patient_id) params.append('patient_id', filters.patient_id.toString());
  if (filters.sample_id) params.append('sample_id', filters.sample_id.toString());

  const response = await fetch(`${API_BASE_URL}/api/checklists?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    throw new Error('获取检查单列表失败');
  }

  const data = await response.json();
  return {
    items: Array.isArray(data) ? data : [],
    total: Array.isArray(data) ? data.length : 0,
  };
};

// 根据检查单编号获取检查单详情
export const getChecklistByNumber = async (checklistNumber: string): Promise<Checklist> => {
  const response = await fetch(`${API_BASE_URL}/api/checklists/${encodeURIComponent(checklistNumber)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    const error = await response.json().catch(() => ({ detail: '获取检查单失败' }));
    throw new Error(error.detail || '获取检查单失败');
  }

  return response.json();
};

// 从样本生成检查单（使用样本编号）
export const createChecklistFromSample = async (
  sampleNumber: string,
  reviewingDoctorNumber?: string
): Promise<Checklist> => {
  const params = new URLSearchParams();
  if (reviewingDoctorNumber) {
    params.append('reviewing_doctor_number', reviewingDoctorNumber);
  }

  const response = await fetch(`${API_BASE_URL}/api/checklists/from-sample/${encodeURIComponent(sampleNumber)}?${params.toString()}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
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
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    const error = await response.json();
    throw new Error(error.detail || '更新检查单失败');
  }

  return response.json();
};

// 审核检查单
export const reviewChecklist = async (
  checklistNumber: string,
  reviewData: {
    report_analysis?: string;
    report_date?: string;
    marking_status?: string;
  }
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/checklists/${encodeURIComponent(checklistNumber)}/review`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    const error = await response.json().catch(() => ({ detail: '审核失败' }));
    throw new Error(error.detail || '审核失败');
  }
};

// 更新检查单的细胞统计数据
export const updateChecklistCellCounts = async (
  checklistNumber: string,
  cellCounts: CellCounts
): Promise<Checklist> => {
  const response = await fetch(`${API_BASE_URL}/api/checklists/${encodeURIComponent(checklistNumber)}/cell-counts`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cell_counts: cellCounts }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    const error = await response.json().catch(() => ({ detail: '更新细胞统计失败' }));
    throw new Error(error.detail || '更新细胞统计失败');
  }

  return response.json();
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

