import { API_BASE_URL, getUploadHeaders } from './config';

export interface ImageUploadResponse {
  message: string;
  success_count: number;
  error_count: number;
  results: Array<{
    filename: string;
    success: boolean;
    message?: string;
  }>;
}

export interface ImageInfo {
  path: string;
  url: string;
  thumbnails?: {
    small?: string;
    medium?: string;
    large?: string;
  };
}

export interface SampleImagesResponse {
  sample_number: string;
  total_images: number;
  region_images: ImageInfo[];
  cell_images: ImageInfo[];
  image_count?: number;
  images?: ImageInfo[];
  user_id?: number;
  user_role?: string;
}

// 批量上传图片
export const uploadImages = async (
  sampleNumber: string,
  files: File[],
  imageType: string = 'original',
  quality: string = 'high'
): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('sample_number', sampleNumber);
  formData.append('image_type', imageType);
  formData.append('quality', quality);
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}/api/images/upload/batch`, {
    method: 'POST',
    headers: getUploadHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '上传图片失败');
  }

  return response.json();
};

// 获取样本的所有图片（返回包含 url 字段的区域图片）
export const getSampleImages = async (sampleNumber: string): Promise<SampleImagesResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/images/sample/${encodeURIComponent(sampleNumber)}`, {
    method: 'GET',
    headers: getUploadHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '获取图片列表失败' }));
    throw new Error(error.detail || '获取图片列表失败');
  }

  return response.json();
};

// 根据存储路径查看图片
export const getImageByStoragePath = async (storagePath: string): Promise<Blob> => {
  // 对路径进行编码，处理特殊字符
  const encodedPath = encodeURIComponent(storagePath);
  const response = await fetch(`${API_BASE_URL}/api/images/view/${encodedPath}`, {
    method: 'GET',
    headers: getUploadHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '获取图片失败' }));
    throw new Error(error.detail || '获取图片失败');
  }

  return response.blob();
};

// 获取图片 URL（返回 URL 字符串而不是 Blob）
export const getImageUrlByStoragePath = (storagePath: string): string => {
  const encodedPath = encodeURIComponent(storagePath);
  return `${API_BASE_URL}/api/images/view/${encodedPath}`;
};

// 批量推理接口
export const batchInfer = async (files: File[]): Promise<any> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}/api/images/infer/batch`, {
    method: 'POST',
    headers: getUploadHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '图像分析失败');
  }

  return response.json();
};

// 端到端样本处理管线
export const processSamplePipeline = async (
  sampleNumber: string,
  patientData: any,
  smearData: any,
  files: File[]
): Promise<any> => {
  const formData = new FormData();
  formData.append('patient_data', JSON.stringify(patientData));
  formData.append('smear_data', JSON.stringify(smearData));
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}/api/images/pipeline/sample/${sampleNumber}`, {
    method: 'POST',
    headers: getUploadHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '样本处理失败');
  }

  return response.json();
};


export const deleteSampleImage = async (storagePath: string): Promise<void> => {
  if (!storagePath) {
    throw new Error("无效的图片路径");
  }

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const response = await fetch(`${API_BASE_URL}/api/images/view/${encodedPath}`, {
    method: "DELETE",
    headers: getUploadHeaders(),
  });

  if (!response.ok) {
    let errorDetail = "删除图片失败";
    try {
      const error = await response.json();
      errorDetail = error.detail || errorDetail;
    } catch (err) {
      // ignore parse errors
    }
    throw new Error(errorDetail);
  }
};
