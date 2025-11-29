import { API_BASE_URL, getUploadHeaders, handleUnauthorized } from './config';

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
  marked_images?: ImageInfo[];
}

export interface SmearRegion {
  region_number: string;
  storage_path?: string;
  url?: string;
  marked_image_path?: string;
  marked_image_url?: string;  // 标记图像的完整URL，可直接使用
  width?: number;
  height?: number;
  x_coordinate?: number;
  y_coordinate?: number;
  created_at?: string;
  [key: string]: any;
}

export interface SmearRegionsResponse {
  sample_number: string;
  regions: SmearRegion[];
  count: number;
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
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
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
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
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
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
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
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
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
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
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
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('401 Unauthorized - 请重新登录');
    }
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

// 获取样本的区域数据（包含标记图像路径）
export const getSmearRegions = async (sampleNumber: string): Promise<SmearRegionsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/smears/${encodeURIComponent(sampleNumber)}/regions`, {
      method: 'GET',
      headers: getUploadHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('401 Unauthorized - 请重新登录');
      }
      // 如果接口不存在，返回空响应而不是抛出错误
      if (response.status === 404) {
        console.warn(`获取样本 ${sampleNumber} 的区域数据失败: 接口不存在 (404)`);
        return {
          sample_number: sampleNumber,
          regions: [],
          count: 0
        };
      }
      const error = await response.json().catch(() => ({ detail: '获取区域数据失败' }));
      console.error(`获取区域数据失败 (${response.status}):`, error);
      // 对于其他错误，返回空响应而不是抛出错误，避免阻塞图片加载
      return {
        sample_number: sampleNumber,
        regions: [],
        count: 0
      };
    }

    const data = await response.json();
    
    // 处理返回的数据结构：可能是 { sample_number, regions, count } 或直接是数组
    if (data.regions && Array.isArray(data.regions)) {
      // 新格式：{ sample_number, regions: [...], count }
      console.log(`成功获取样本 ${sampleNumber} 的区域数据:`, data);
      return {
        sample_number: data.sample_number || sampleNumber,
        regions: data.regions,
        count: data.count || data.regions.length
      };
    } else if (Array.isArray(data)) {
      // 旧格式：直接返回数组
      console.log(`成功获取样本 ${sampleNumber} 的区域数据（旧格式）:`, data);
      return {
        sample_number: sampleNumber,
        regions: data,
        count: data.length
      };
    } else {
      // 其他格式
      console.warn(`未知的数据格式:`, data);
      return {
        sample_number: sampleNumber,
        regions: [],
        count: 0
      };
    }
  } catch (err: any) {
    console.error(`获取样本 ${sampleNumber} 的区域数据时发生错误:`, err);
    // 捕获所有错误，返回空响应，避免阻塞图片加载
    return {
      sample_number: sampleNumber,
      regions: [],
      count: 0
    };
  }
};
