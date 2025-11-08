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
  image_count: number;
  images: ImageInfo[];
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

// 获取样本的所有图片
export const getSampleImages = async (sampleNumber: string): Promise<SampleImagesResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/images/sample/${sampleNumber}`, {
    method: 'GET',
    headers: getUploadHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取图片列表失败');
  }

  return response.json();
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

