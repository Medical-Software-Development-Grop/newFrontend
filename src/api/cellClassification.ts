import { API_BASE_URL, getAuthHeaders, handleUnauthorized } from './config';

export interface CellClassification {
  id: number;
  cell_number: string;
  sample_id: number;
  x_coordinate?: number;
  y_coordinate?: number;
  width?: number;
  height?: number;
  model_classification_type?: string;
  model_classification_confidence?: number;
  doctor_classification_category?: string;
  storage_path?: string;
  image_url?: string; // 细胞图像 URL
}

export interface CellStatistics {
  total_cells: number;
  model_classified: number;
  doctor_classified: number;
  cell_counts: Record<string, number>;
}

export interface CellClassificationUpdatePayload {
  doctor_classification_category?: string;
  model_classification_type?: string;
  major_category?: string;
  sub_category?: string;
}

// 获取样本的细胞分类列表
export const getCellClassifications = async (
  sampleId?: number,
  modelClassificationType?: string
): Promise<CellClassification[]> => {
  const params = new URLSearchParams();
  if (sampleId) params.append('sample_id', sampleId.toString());
  if (modelClassificationType) params.append('model_classification_type', modelClassificationType);
  params.append('limit', '1000'); // 获取所有细胞

  const response = await fetch(`${API_BASE_URL}/api/cell-classifications?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    throw new Error('获取细胞分类数据失败');
  }

  return response.json();
};

// 根据样本编号获取细胞分类
export const getCellClassificationsBySampleNumber = async (
  sampleNumber: string
): Promise<CellClassification[]> => {
  const response = await fetch(`${API_BASE_URL}/api/cell-classifications/sample/${sampleNumber}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    throw new Error('获取细胞分类数据失败');
  }

  return response.json();
};

// 获取样本的细胞统计信息
export const getCellStatistics = async (sampleId: number): Promise<CellStatistics> => {
  const response = await fetch(`${API_BASE_URL}/api/cell-classifications/statistics/sample/${sampleId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取细胞统计信息失败');
  }

  return response.json();
};

// 更新细胞分类（按细胞编号）
export const updateCellClassificationByNumber = async (
  cellNumber: string,
  payload: CellClassificationUpdatePayload
): Promise<CellClassification> => {
  const response = await fetch(`${API_BASE_URL}/api/cell-classifications/${encodeURIComponent(cellNumber)}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || '更新细胞分类失败');
  }

  return response.json();
};

// 获取细胞图像（根据细胞编号）
export const getCellImage = async (cellNumber: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/cell-classifications/${encodeURIComponent(cellNumber)}/image`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    const error = await response.json().catch(() => ({ detail: '获取细胞图像失败' }));
    throw new Error(error.detail || '获取细胞图像失败');
  }

  return response.blob();
};

// 获取细胞图像 URL（返回 URL 字符串而不是 Blob）
export const getCellImageUrl = (cellNumber: string): string => {
  return `${API_BASE_URL}/api/cell-classifications/${encodeURIComponent(cellNumber)}/image`;
};

// 根据样本编号获取所有细胞信息（包含 image_url）
export const getCellsBySampleNumber = async (sampleNumber: string): Promise<CellClassification[]> => {
  const response = await fetch(`${API_BASE_URL}/api/cell-classifications/sample/${encodeURIComponent(sampleNumber)}/cells`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
    const error = await response.json();
    throw new Error(error.detail || '获取细胞信息失败');
  }

  return response.json();
};
