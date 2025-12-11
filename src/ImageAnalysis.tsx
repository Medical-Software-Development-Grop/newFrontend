import React, { useMemo, useState, useEffect } from "react";
import "./ImageAnalysis.css";
import { getSmears, Smear } from "./api/smear";
import { getSampleImages, ImageInfo, deleteSampleImage, getSmearRegions, getImageUrlByStoragePath } from "./api/image";
import { getCellClassificationsBySampleNumber, CellClassification, updateCellClassificationByNumber } from "./api/cellClassification";
import { API_BASE_URL, getToken } from "./api/config";

interface CellNode {
  id: string;
  name: string;
  count: number;
  imageCount?: number;
  children?: CellNode[];
}


const cellTree: CellNode[] = [
  {
    id: "tissue",
    name: "组织类细胞",
    count: 490,
    children: [
      { id: "mast-cell", name: "肥大细胞", count: 490, imageCount: 0 },
      { id: "phagocyte", name: "吞噬细胞", count: 490, imageCount: 0 },
      { id: "endothelial", name: "内皮细胞", count: 490, imageCount: 0 },
      { id: "smear-cell", name: "涂抹细胞", count: 490, imageCount: 0 },
      { id: "mitotic", name: "分裂相", count: 490, imageCount: 0 },
      { id: "degenerate", name: "退化细胞", count: 490, imageCount: 0 },
      { id: "normal-plasma", name: "正常浆细胞", count: 490, imageCount: 0 },
      { id: "abnormal-plasma", name: "异常浆细胞", count: 490, imageCount: 0 },
      { id: "metastatic-cancer", name: "转移癌细胞", count: 490, imageCount: 0 }
    ]
  },
  {
    id: "neutrophil",
    name: "中性粒细胞系列",
    count: 490,
    children: [
      { id: "primitive-granulocyte", name: "原始粒细胞", count: 490, imageCount: 0 },
      { id: "promyelocyte", name: "早幼粒细胞", count: 490, imageCount: 0 },
      { id: "myelocyte", name: "中幼粒细胞", count: 490, imageCount: 0 },
      { id: "metamyelocyte", name: "晚幼粒细胞", count: 490, imageCount: 0 },
      { id: "band-neutrophil", name: "杆状核粒细胞", count: 490, imageCount: 0 },
      { id: "segmented-neutrophil", name: "分叶核粒细胞", count: 490, imageCount: 0 },
      { id: "hypersegmented-neutrophil", name: "过分叶粒细胞", count: 490, imageCount: 0 },
      { id: "pathological-granulocyte", name: "病态粒细胞", count: 490, imageCount: 0 },
      { id: "abnormal-promyelocyte", name: "异常早幼粒细胞", count: 490, imageCount: 0 }
    ]
  },
  {
    id: "eosinophil-basophil",
    name: "嗜酸、嗜碱粒",
    count: 490,
    children: [
      { id: "eosinophilic-myelocyte", name: "嗜酸中幼粒细胞", count: 490, imageCount: 0 },
      { id: "eosinophilic-metamyelocyte", name: "嗜酸晚幼粒细胞", count: 490, imageCount: 0 },
      { id: "eosinophilic-band", name: "嗜酸杆状核", count: 490, imageCount: 0 },
      { id: "eosinophilic-segmented", name: "嗜酸分叶核", count: 490, imageCount: 0 },
      { id: "basophilic-myelocyte", name: "嗜碱中幼粒细胞", count: 490, imageCount: 0 },
      { id: "basophilic-metamyelocyte", name: "嗜碱晚幼粒细胞", count: 490, imageCount: 0 },
      { id: "basophilic-band", name: "嗜碱杆状核", count: 490, imageCount: 0 },
      { id: "basophilic-segmented", name: "嗜碱分叶核", count: 490, imageCount: 0 },
      { id: "abnormal-eosinophil", name: "异常嗜酸粒细胞", count: 490, imageCount: 0 }
    ]
  },
  {
    id: "erythroid",
    name: "幼红系列",
    count: 490,
    children: [
      { id: "primitive-erythrocyte", name: "原始红细胞", count: 490, imageCount: 0 },
      { id: "early-erythrocyte", name: "早幼红细胞", count: 490, imageCount: 0 },
      { id: "late-erythrocyte", name: "晚幼红细胞", count: 490, imageCount: 0 },
      { id: "giant-early-erythrocyte", name: "巨早幼红", count: 490, imageCount: 0 },
      { id: "giant-intermediate-erythrocyte", name: "巨中幼红", count: 490, imageCount: 0 },
      { id: "giant-late-erythrocyte", name: "巨晚幼红", count: 490, imageCount: 0 },
      { id: "other-pathological-erythrocyte", name: "其他病态幼红", count: 490, imageCount: 0 }
    ]
  },
  {
    id: "lymphocyte",
    name: "淋巴细胞系",
    count: 490,
    children: [
      { id: "primitive-lymphocyte", name: "原始淋巴细胞", count: 490, imageCount: 0 },
      { id: "immature-lymphocyte", name: "幼稚淋巴细胞", count: 490, imageCount: 0 },
      { id: "mature-lymphocyte", name: "成熟淋巴细胞", count: 490, imageCount: 0 },
      { id: "reactive-lymphocyte", name: "反应性淋巴细胞", count: 490, imageCount: 0 },
      { id: "lymphoma-cell", name: "淋巴瘤细胞", count: 490, imageCount: 0 }
    ]
  },
  {
    id: "monocyte",
    name: "单核细胞系",
    count: 490,
    children: [
      { id: "primitive-monocyte", name: "原始单核细胞", count: 490, imageCount: 0 },
      { id: "immature-monocyte", name: "幼稚单核细胞", count: 490, imageCount: 0 },
      { id: "mature-monocyte", name: "成熟单核细胞", count: 490, imageCount: 0 },
      { id: "abnormal-monocyte", name: "异常单核细胞", count: 490, imageCount: 0 }
    ]
  },
  {
    id: "megakaryocyte",
    name: "巨核细胞系",
    count: 490,
    children: [
      { id: "primitive-megakaryocyte", name: "原始巨核细胞", count: 490, imageCount: 0 },
      { id: "immature-megakaryocyte", name: "幼稚巨核细胞", count: 490, imageCount: 0 },
      { id: "granular-megakaryocyte", name: "颗粒巨核细胞", count: 490, imageCount: 0 },
      { id: "naked-nucleus-megakaryocyte", name: "裸核巨核细胞", count: 490, imageCount: 0 }
    ]
  }
];

const findNode = (nodes: CellNode[], targetId: string): CellNode | undefined => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, targetId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

const MAX_IMAGES = 72;

// 模拟标注数据 - 基础位置信息
const baseAnnotations = [
  { id: 1, x: 120, y: 80, width: 60, height: 40 },
  { id: 2, x: 200, y: 150, width: 50, height: 35 },
  { id: 3, x: 300, y: 100, width: 55, height: 45 },
  { id: 4, x: 150, y: 250, width: 45, height: 30 },
  { id: 5, x: 400, y: 180, width: 60, height: 50 },
  { id: 6, x: 80, y: 300, width: 50, height: 40 },
  { id: 7, x: 350, y: 320, width: 55, height: 35 },
  { id: 8, x: 250, y: 400, width: 45, height: 30 },
  { id: 9, x: 100, y: 450, width: 60, height: 40 },
  { id: 10, x: 450, y: 450, width: 50, height: 35 },
  { id: 11, x: 180, y: 500, width: 55, height: 45 }
];


interface Sample {
  id: string;
  type: string;
  patientName: string;
  sampleNumber: string;
  status: "图像已审核" | "报告已审核" | "未审核";
  patientAge?: number;
  patientGender?: string;
}

interface SampleImageItem {
  id: number;
  url: string;
  storagePath: string;
  rawPath: string;
}

// 将后端Smear数据转换为前端Sample格式
const convertSmearToSample = (smear: Smear): Sample => {
  return {
    id: smear.id?.toString() || smear.sample_number || "",
    type: smear.type || "血涂本",
    patientName: smear.patient?.name || "未知",
    sampleNumber: smear.sample_number,
    status: (smear.status === "图像已审核" || smear.status === "报告已审核" || smear.status === "未审核") 
      ? smear.status 
      : "未审核",
    patientAge: smear.patient?.age,
    patientGender: smear.patient?.gender
  };
};

const ImageAnalysis: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["megakaryocyte"]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("primitive-megakaryocyte");
  const [activeTab, setActiveTab] = useState<string>("细胞图像");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [cellClassifications, setCellClassifications] = useState<CellClassification[]>([]);
  const [cellTreeData, setCellTreeData] = useState<CellNode[]>(cellTree);
  const [loadingCells, setLoadingCells] = useState<boolean>(false);
  const [regionImages, setRegionImages] = useState<ImageInfo[]>([]);
  const [cellImages, setCellImages] = useState<ImageInfo[]>([]);
  const [markedImages, setMarkedImages] = useState<ImageInfo[]>([]);
  const [loadingImages, setLoadingImages] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title?: string; description?: string; cell?: CellClassification } | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState<boolean>(false);
  const [isReviewReady, setIsReviewReady] = useState<boolean>(false);
  const [showClassifyEditor, setShowClassifyEditor] = useState<boolean>(false);
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedSub, setSelectedSub] = useState<string>("");

  const apiBaseUrl = useMemo(() => {
    try {
      return new URL(API_BASE_URL);
    } catch (error) {
      console.error("API_BASE_URL 无效，无法解析为URL:", API_BASE_URL, error);
      return null;
    }
  }, []);

  const selectedNode = useMemo(() => findNode(cellTreeData, selectedNodeId), [selectedNodeId, cellTreeData]);
  
  const authToken = getToken();

  // 使用实际的样本图片数据，如果没有则返回空数组（用于区域图像）
  const imageData = useMemo<SampleImageItem[]>(() => {
    if (!regionImages || regionImages.length === 0) {
      return [];
    }

    return regionImages.map((img, index) => {
      const rawSource = img.url || img.path || "";
      let storagePath = img.path || "";

      if (!rawSource) {
        console.warn(`图片 ${index + 1} 缺少URL或路径`);
        return {
          id: index + 1,
          url: "",
          storagePath,
          rawPath: rawSource
        };
      }

      if (!storagePath) {
        if (rawSource.startsWith(`${API_BASE_URL}/api/images/view/`)) {
          storagePath = rawSource.replace(`${API_BASE_URL}/api/images/view/`, "");
        } else if (rawSource.startsWith("/api/images/view/")) {
          storagePath = rawSource.replace("/api/images/view/", "");
        } else {
          storagePath = rawSource;
        }
      }

      try {
        storagePath = decodeURIComponent(storagePath);
      } catch (error) {
        console.warn("存储路径解码失败:", { storagePath, error });
      }
      storagePath = storagePath.replace(/^\/+/, "");

      let finalUrl = rawSource;

      if (rawSource.startsWith("http://") || rawSource.startsWith("https://")) {
        finalUrl = rawSource;
      } else if (rawSource.startsWith("/api/images/view/")) {
        finalUrl = `${API_BASE_URL}${rawSource}`;
      } else if (rawSource.startsWith("/")) {
        finalUrl = `${API_BASE_URL}${rawSource}`;
      } else {
        const encodedPath = rawSource
          .split("/")
          .map(segment => encodeURIComponent(segment))
          .join("/");
        finalUrl = `${API_BASE_URL}/api/images/view/${encodedPath}`;
      }

      try {
        const urlObj = new URL(finalUrl);
        if (authToken && apiBaseUrl && urlObj.origin === apiBaseUrl.origin && !urlObj.searchParams.has("token")) {
          urlObj.searchParams.set("token", authToken);
        }
        finalUrl = urlObj.toString();
      } catch (error) {
        console.error("图片URL构建失败:", { rawSource, error });
      }

      console.log(`图片 ${index + 1} URL构建: 原始=${img.path || img.url}, 最终=${finalUrl}`);

      return {
        id: index + 1,
        url: finalUrl,
        storagePath,
        rawPath: rawSource
      };
    });
  }, [regionImages, apiBaseUrl, authToken]);

  // 标记图像数据（用于标记图像标签页）
  const markedImageData = useMemo<SampleImageItem[]>(() => {
    if (!markedImages || markedImages.length === 0) {
      return [];
    }

    return markedImages.map((img, index) => {
      const rawSource = img.url || img.path || "";
      let storagePath = img.path || "";

      if (!rawSource) {
        console.warn(`标记图片 ${index + 1} 缺少URL或路径`);
        return {
          id: index + 1,
          url: "",
          storagePath,
          rawPath: rawSource
        };
      }

      if (!storagePath) {
        if (rawSource.startsWith(`${API_BASE_URL}/api/images/view/`)) {
          storagePath = rawSource.replace(`${API_BASE_URL}/api/images/view/`, "");
        } else if (rawSource.startsWith("/api/images/view/")) {
          storagePath = rawSource.replace("/api/images/view/", "");
        } else {
          storagePath = rawSource;
        }
      }

      try {
        storagePath = decodeURIComponent(storagePath);
      } catch (error) {
        console.warn("标记图像存储路径解码失败:", { storagePath, error });
      }
      storagePath = storagePath.replace(/^\/+/, "");

      let finalUrl = rawSource;

      if (rawSource.startsWith("http://") || rawSource.startsWith("https://")) {
        finalUrl = rawSource;
      } else if (rawSource.startsWith("/api/images/view/")) {
        finalUrl = `${API_BASE_URL}${rawSource}`;
      } else if (rawSource.startsWith("/")) {
        finalUrl = `${API_BASE_URL}${rawSource}`;
      } else {
        const encodedPath = rawSource
          .split("/")
          .map(segment => encodeURIComponent(segment))
          .join("/");
        finalUrl = `${API_BASE_URL}/api/images/view/${encodedPath}`;
      }

      try {
        const urlObj = new URL(finalUrl);
        if (authToken && apiBaseUrl && urlObj.origin === apiBaseUrl.origin && !urlObj.searchParams.has("token")) {
          urlObj.searchParams.set("token", authToken);
        }
        finalUrl = urlObj.toString();
      } catch (error) {
        console.error("标记图像URL构建失败:", { rawSource, error });
      }

      console.log(`标记图片 ${index + 1} URL构建: 原始=${img.path || img.url}, 最终=${finalUrl}`);

      return {
        id: index + 1,
        url: finalUrl,
        storagePath,
        rawPath: rawSource
      };
    });
  }, [markedImages, apiBaseUrl, authToken]);

  // 加载样本数据（与SampleEdit使用相同的API和逻辑）
  const loadSamples = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSmears({
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      });
      
      console.log('API返回的原始数据:', response);
      console.log('items数量:', response.items?.length || 0);
      
      if (!response.items || !Array.isArray(response.items)) {
        console.error('API返回的数据格式错误:', response);
        setError('API返回的数据格式不正确');
        setSamples([]);
        setTotalCount(0);
        return;
      }
      
      const sampleList = response.items.map((smear, index) => {
        try {
          const sample = convertSmearToSample(smear);
          console.log(`转换样本 ${index + 1}:`, { smear, sample });
          return sample;
        } catch (err: any) {
          console.error(`转换样本 ${index + 1} 失败:`, err, smear);
          // 返回一个有效的样本对象，避免整个列表失败
          return {
            id: smear.sample_number || `error-${index}`,
            type: smear.type || "血涂本",
            patientName: smear.patient?.name || "未知",
            sampleNumber: smear.sample_number || "",
            status: "未审核" as const,
            patientAge: smear.patient?.age,
            patientGender: smear.patient?.gender
          };
        }
      });
      
      setSamples(sampleList);
      setTotalCount(response.total || 0);
      
      // 如果没有选中的样本，选中第一个
      if (sampleList.length > 0 && !selectedSampleId) {
        setSelectedSampleId(sampleList[0].id);
      }
      
      // 如果之前选中的样本不在当前列表中，重新选中第一个
      if (sampleList.length > 0 && selectedSampleId) {
        const selectedExists = sampleList.some(s => s.id === selectedSampleId);
        if (!selectedExists) {
          setSelectedSampleId(sampleList[0].id);
        }
      }
      
      console.log(`图像分析界面加载了 ${sampleList.length} 条样本数据，共 ${response.total} 条`);
    } catch (err: any) {
      setError(err.message || '加载样本数据失败');
      console.error('加载样本数据失败:', err);
      // 加载失败时不设置示例数据，保持空列表
      setSamples([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载和分页变化时加载数据
  useEffect(() => {
    loadSamples();
  }, [currentPage, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // 页面可见性变化和窗口焦点变化时刷新数据（当从其他界面返回时）
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 延迟一下再刷新，避免频繁请求
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('页面可见性变化，刷新样本数据');
          loadSamples();
        }, 500);
      }
    };
    
    const handleFocus = () => {
      // 延迟一下再刷新，避免频繁请求
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('窗口获得焦点，刷新样本数据');
        loadSamples();
      }, 500);
    };
    
    // 监听Excel导入成功事件（从图像管理界面触发）
    const handleExcelImportSuccess = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Excel导入成功，刷新样本数据');
        loadSamples();
      }, 500);
    };
    
    // 监听图片上传成功事件（从图像管理界面触发）
    const handleImageUploadSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const sampleNumber = customEvent.detail?.sampleNumber;
      
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('图片上传成功，刷新样本数据', { sampleNumber });
        loadSamples();
        
        // 如果上传的图片属于当前选中的样本，刷新图片列表
        if (selectedSampleId && sampleNumber) {
          const selectedSample = samples.find(s => s.id === selectedSampleId);
          if (selectedSample && selectedSample.sampleNumber === sampleNumber) {
            console.log(`刷新样本 ${sampleNumber} 的图片列表`);
            loadSampleImages(sampleNumber);
          }
        }
      }, 500);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('excelImportSuccess', handleExcelImportSuccess);
    window.addEventListener('imageUploadSuccess', handleImageUploadSuccess);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('excelImportSuccess', handleExcelImportSuccess);
      window.removeEventListener('imageUploadSuccess', handleImageUploadSuccess);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 当页面大小改变时，调整当前页面
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
    setCurrentPage(prev => Math.min(prev, maxPage));
  }, [pageSize, totalCount]);

  // 当切换标签页时，重置图像索引
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeTab]);

  // 加载样本的上传图片
  const loadSampleImages = async (sampleNumber: string) => {
    if (!sampleNumber) {
      setRegionImages([]);
      setCellImages([]);
      setMarkedImages([]);
      return;
    }

    setLoadingImages(true);
    try {
      console.log(`开始加载样本 ${sampleNumber} 的图片...`);
      
      // 并行获取图片数据和区域数据
      const [imagesResponse, regionsResponse] = await Promise.all([
        getSampleImages(sampleNumber),
        getSmearRegions(sampleNumber) // 返回 SmearRegionsResponse 对象
      ]);
      
      console.log(`样本 ${sampleNumber} 的图片API响应:`, imagesResponse);
      console.log(`样本 ${sampleNumber} 的区域数据响应:`, regionsResponse);

      // 从区域数据中提取标记图像（优先使用 marked_image_url，如果没有则从 marked_image_path 构建）
      const markedImagePaths: ImageInfo[] = [];
      const regions = regionsResponse.regions || [];
      
      if (regions.length > 0) {
        console.log(`找到 ${regions.length} 个区域记录`);
        regions.forEach((region: any, index: number) => {
          console.log(`区域 ${index + 1}:`, region);
          
          // 优先使用 marked_image_url（API已提供完整URL）
          if (region.marked_image_url) {
            console.log(`找到标记图像URL: ${region.marked_image_url}`);
            markedImagePaths.push({
              path: region.marked_image_path || region.marked_image_url,
              url: region.marked_image_url
            });
          } 
          // 如果没有 marked_image_url，但有 marked_image_path，则构建URL
          else if (region.marked_image_path) {
            const markedPath = region.marked_image_path;
            console.log(`找到标记图像路径，构建URL: ${markedPath}`);
            const markedUrl = getImageUrlByStoragePath(markedPath);
            markedImagePaths.push({
              path: markedPath,
              url: markedUrl
            });
          } else {
            console.log(`区域 ${index + 1} (${region.region_number}) 没有标记图像`);
          }
        });
        console.log(`从区域数据中提取了 ${markedImagePaths.length} 个标记图像`);
      } else {
        console.warn(`区域数据为空:`, regionsResponse);
      }

      const markedImagesResponse =
        (imagesResponse as typeof imagesResponse & { marked_images?: ImageInfo[] }).marked_images;
      const rawMarkedImages = Array.isArray(markedImagesResponse)
        ? [...markedImagesResponse]
        : [];
      
      // 合并从API返回的标记图像和从区域数据获取的标记图像
      const allMarkedImages = [...rawMarkedImages];
      if (markedImagePaths.length > 0) {
        // 避免重复添加
        markedImagePaths.forEach(markedImg => {
          const exists = allMarkedImages.some(img => 
            img.path === markedImg.path || img.url === markedImg.url
          );
          if (!exists) {
            allMarkedImages.push(markedImg);
          }
        });
      }

      const rawRegionImages =
        imagesResponse.region_images ??
        imagesResponse.images ??
        [];
      const rawCellImages =
        imagesResponse.cell_images ??
        [];

      // 将标记图像添加到区域图像列表中（用于在区域图像标签页显示）
      let regionImagesFromApi: ImageInfo[] = [];
      if (Array.isArray(rawRegionImages)) {
        regionImagesFromApi = [...rawRegionImages];
      }
      
      // 将标记图像也添加到区域图像列表中
      if (allMarkedImages.length > 0) {
        allMarkedImages.forEach(markedImg => {
          const exists = regionImagesFromApi.some(img => 
            img.path === markedImg.path || img.url === markedImg.url
          );
          if (!exists) {
            regionImagesFromApi.push(markedImg);
          }
        });
      }
      
      let cellImagesFromApi = Array.isArray(rawCellImages) ? [...rawCellImages] : [];

      if ((!cellImagesFromApi || cellImagesFromApi.length === 0) && regionImagesFromApi.length > 0) {
        const derivedCellImages: ImageInfo[] = [];
        const derivedRegionImages: ImageInfo[] = [];

        regionImagesFromApi.forEach(img => {
          const path = (img.path || img.url || "").replace(/\\/g, "/");
          if (path.includes("单细胞图")) {
            derivedCellImages.push(img);
          } else if (path) {
            derivedRegionImages.push(img);
          }
        });

        if (derivedCellImages.length > 0) {
          console.info(
            `从旧版API返回的 ${regionImagesFromApi.length} 张图片中推断出 ${derivedCellImages.length} 张单细胞图像`
          );
        }

        cellImagesFromApi = derivedCellImages;
        regionImagesFromApi = derivedRegionImages.length > 0 ? derivedRegionImages : regionImagesFromApi;
      }

      const sanitizedSampleNumber = sampleNumber.trim();
      const filterBySample = (items: ImageInfo[]) => {
        const filtered = items.filter(img => {
          const path = img.path || img.url || "";
          if (!path) {
            return false;
          }
          if (!sanitizedSampleNumber) {
            return true;
          }
          if (path.includes(sanitizedSampleNumber)) {
            return true;
          }
          console.warn(`图片路径不匹配样本编号: 路径=${path}, 样本编号=${sanitizedSampleNumber}`);
          return false;
        });

        if (filtered.length === 0 && items.length > 0) {
          console.warn(
            `筛选后没有图片，但原始列表有 ${items.length} 张，返回未筛选列表作为回退`
          );
          return items;
        }

        return filtered;
      };

      const validRegionImages = filterBySample(regionImagesFromApi);
      const validCellImages = filterBySample(cellImagesFromApi);
      
      // 标记图像不需要按样本编号过滤，因为它们是从SmearRegionTable获取的，已经属于当前样本
      // 只需要过滤掉空路径的
      const validMarkedImages = allMarkedImages.filter(img => {
        const path = img.path || img.url || "";
        if (!path) {
          return false;
        }
        return true;
      });
      
      console.log(`标记图像处理: 原始=${allMarkedImages.length} 张, 有效=${validMarkedImages.length} 张`);

      setRegionImages(validRegionImages);
      setCellImages(validCellImages);
      setMarkedImages(validMarkedImages);

      if (validRegionImages.length > 0) {
        setCurrentImageIndex(0);
        console.log(`✅ 区域图：共 ${regionImagesFromApi.length} 张，展示 ${validRegionImages.length} 张`);
      } else {
        console.warn(`⚠️ 样本 ${sampleNumber} 暂无有效区域图`);
      }

      if (validMarkedImages.length > 0) {
        console.log(`✅ 标记图：共 ${allMarkedImages.length} 张，展示 ${validMarkedImages.length} 张`);
        console.log(`标记图像详情:`, validMarkedImages.map(img => ({ path: img.path, url: img.url })));
      } else {
        console.warn(`⚠️ 样本 ${sampleNumber} 暂无有效标记图`);
        console.log(`调试信息: regionsResponse=${JSON.stringify(regionsResponse)}, markedImagePaths=${markedImagePaths.length}, allMarkedImages=${allMarkedImages.length}`);
      }

      if (validCellImages.length === 0 && cellImagesFromApi.length > 0) {
        console.warn(`⚠️ 共有 ${cellImagesFromApi.length} 张单细胞图，但路径不匹配样本编号`);
      }
    } catch (err: any) {
      console.error(`❌ 加载样本 ${sampleNumber} 的图片失败:`, err);
      setRegionImages([]);
      setCellImages([]);
      setMarkedImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  // 当选中样本改变时，加载该样本的细胞分类数据和上传图片
  useEffect(() => {
    const loadCellData = async () => {
      if (!selectedSampleId) return;
      
      const selectedSample = samples.find(s => s.id === selectedSampleId);
      if (!selectedSample) return;

      // 同时加载细胞分类数据和样本图片
      setLoadingCells(true);
      loadSampleImages(selectedSample.sampleNumber);
      
      try {
        // 获取样本的完整信息（包含sample_id）
        const smearResponse = await getSmears({
          skip: 0,
          limit: 1000,
          sample_number: selectedSample.sampleNumber,
        });

        if (smearResponse.items.length === 0) {
          // 如果没有找到样本，清空细胞数据但不使用示例数据
        setCellTreeData(cellTree.map(category => ({
          ...category,
          count: 0,
          imageCount: 0,
          children: category.children?.map(child => ({ ...child, count: 0, imageCount: 0 })) || []
        })));
          setCellClassifications([]);
          console.warn(`未找到样本 ${selectedSample.sampleNumber} 的细胞分类数据`);
          return;
        }

        const smear = smearResponse.items[0];
        
        // 确保smear.id存在
        if (!smear.id) {
          console.warn(`样本 ${selectedSample.sampleNumber} 没有id字段，无法加载细胞分类数据`);
          setCellTreeData(cellTree.map(category => ({
            ...category,
            count: 0,
            children: category.children?.map(child => ({ ...child, count: 0, imageCount: 0 })) || []
          })));
          setCellClassifications([]);
          return;
        }
        
        // 获取细胞分类数据（使用sample_number而不是id）
        console.log(`开始加载样本 ${selectedSample.sampleNumber} 的细胞分类数据...`);
        const cells = await getCellClassificationsBySampleNumber(selectedSample.sampleNumber);
        console.log(`样本 ${selectedSample.sampleNumber} 的细胞分类数据:`, {
          total: cells.length,
          cells: cells.map(c => ({
            cell_number: c.cell_number,
            model_type: c.model_classification_type,
            doctor_type: c.doctor_classification_category,
            storage_path: c.storage_path,
            has_path: !!c.storage_path
          }))
        });
      setCellClassifications(cells);

      const updatedTree = updateCellTreeWithRealData(cellTree, cells);
      setCellTreeData(updatedTree);
    } catch (err: any) {
        console.error('加载细胞分类数据失败:', err);
        // 如果加载失败，清空细胞数据（不使用示例数据）
        setCellTreeData(cellTree.map(category => ({
          ...category,
          count: 0,
          imageCount: 0,
          children: category.children?.map(child => ({ ...child, count: 0, imageCount: 0 })) || []
        })));
        setCellClassifications([]);
      } finally {
        setLoadingCells(false);
      }
    };

    loadCellData();
  }, [selectedSampleId, samples]);

  // 根据实际细胞分类数据更新cellTree
  const updateCellTreeWithRealData = (
    tree: CellNode[],
    cells: CellClassification[]
  ): CellNode[] => {
    const countsMap = new Map<string, number>();

    cells.forEach(cell => {
      const doctorType = (cell.doctor_classification_category || "").trim();
      const modelType = (cell.model_classification_type || "").trim();
      const effectiveType = doctorType || modelType;
      if (effectiveType) {
        const previous = countsMap.get(effectiveType) ?? 0;
        countsMap.set(effectiveType, previous + 1);
      }
    });

    const buildNode = (node: CellNode): CellNode => {
      const clonedNode: CellNode = {
        ...node,
        children: node.children ? node.children.map(buildNode) : undefined
      };

      const ownCount = countsMap.get(node.name) ?? 0;
      const childrenTotal = clonedNode.children?.reduce(
        (sum, child) => sum + (child.imageCount ?? child.count ?? 0),
        0
      ) ?? 0;

      const total = ownCount + childrenTotal;

      clonedNode.count = total;
      clonedNode.imageCount = total;
      clonedNode.count = total;

      return clonedNode;
    };

    return tree.map(buildNode);
  };


  const groupsToDisplay = useMemo<CellNode[]>(() => {
    if (!selectedNode) {
      return [];
    }
    if (selectedNode.children && selectedNode.children.length > 0) {
      return selectedNode.children;
    }
    return [selectedNode];
  }, [selectedNode]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev =>
      prev.includes(id) ? prev.filter(nodeId => nodeId !== id) : [...prev, id]
    );
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 400));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };

  // 根据当前标签页获取正确的图像数据
  const getCurrentImageData = () => {
    if (activeTab === "标记图像") {
      return markedImageData;
    } else if (activeTab === "区域图像") {
      return imageData;
    }
    return imageData; // 默认使用区域图像数据
  };

  const handleFirstImage = () => {
    setCurrentImageIndex(0);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNextImage = () => {
    const currentData = getCurrentImageData();
    if (currentData.length > 0) {
      setCurrentImageIndex(prev => Math.min(prev + 1, currentData.length - 1));
    }
  };

  const handleLastImage = () => {
    const currentData = getCurrentImageData();
    if (currentData.length > 0) {
      setCurrentImageIndex(currentData.length - 1);
    }
  };

  const renderTreeNode = (node: CellNode): React.ReactElement => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expandedNodes.includes(node.id);
    const isSelected = selectedNodeId === node.id;

    return (
      <div key={node.id} className={`tree-node ${isSelected ? "selected" : ""}`}>
        <div className="node-header" onClick={() => setSelectedNodeId(node.id)}>
          {hasChildren ? (
            <button
              type="button"
              className={`node-toggle ${isExpanded ? "open" : ""}`}
              onClick={event => {
                event.stopPropagation();
                toggleNode(node.id);
              }}
              aria-label={isExpanded ? "收起" : "展开"}
            >
              {isExpanded ? "▾" : "▸"}
            </button>
          ) : (
            <span className="node-spacer" />
          )}
          <div className="node-main">
            <span className="node-name">{node.name}</span>
            <span className="node-count">{node.count}</span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="node-children">
            {node.children!.map(renderTreeNode)}
          </div>
        )}
      </div>
    );
  };

  const renderImages = (group: CellNode) => {
    const groupName = (group.name || "").trim();
    const cellsForType = cellClassifications.filter(cell => {
      const doctorType = (cell.doctor_classification_category || "").trim();
      const modelType = (cell.model_classification_type || "").trim();
      const effectiveType = doctorType || modelType;
      return effectiveType === groupName;
    });

    const total = cellsForType.length;

    if (total === 0) {
      return <div className="empty-state">暂无图像</div>;
    }

    const visibleCount = Math.min(total, MAX_IMAGES);
    const cellsToShow = cellsForType.slice(0, visibleCount);

    console.log(`类型 "${groupName}" 匹配到 ${total} 个细胞`, {
      groupName,
      totalCells: cellClassifications.length,
      matchedCells: cellsForType.map(c => ({
        cell_number: c.cell_number,
        type: c.model_classification_type,
        storage_path: c.storage_path
      }))
    });

    return (
      <>
        {total > visibleCount && (
          <p className="gallery-note">展示 {visibleCount} 张，共 {total} 张</p>
        )}
        <div className="thumb-grid">
          {cellsToShow.map((cell, index) => {
            const currentSampleNumber = selectedSample?.sampleNumber || "";
            let imageUrl: string | null = null;

            if (cell.storage_path) {
              const normalizedPath = cell.storage_path.replace(/^\/+/, "");
              if (!currentSampleNumber || normalizedPath.includes(currentSampleNumber)) {
                const encodedPath = normalizedPath
                  .split("/")
                  .map(segment => encodeURIComponent(segment))
                  .join("/");
                let candidateUrl = `${API_BASE_URL}/api/images/view/${encodedPath}`;

                if (authToken && apiBaseUrl) {
                  try {
                    const urlObj = new URL(candidateUrl);
                    if (urlObj.origin === apiBaseUrl.origin && !urlObj.searchParams.has("token")) {
                      urlObj.searchParams.set("token", authToken);
                    }
                    candidateUrl = urlObj.toString();
                  } catch (error) {
                    console.error("细胞图像URL构建失败:", { storagePath: cell.storage_path, error });
                  }
                }

                imageUrl = candidateUrl;
              } else {
                console.warn(`细胞 ${cell.cell_number} 的storage_path不匹配当前样本: path=${cell.storage_path}, 样本=${currentSampleNumber}`);
              }
            }

            const canPreview = Boolean(imageUrl);
            const handlePreview = () => {
              if (!imageUrl) return;
              const infoParts = [
                cell.cell_number ? `细胞编号：${cell.cell_number}` : null,
                cell.width && cell.height ? `尺寸：${cell.width}×${cell.height}` : null
              ].filter(Boolean);

              setPreviewImage({
                url: imageUrl,
                title: groupName,
                description: infoParts.join(" ｜ "),
                cell
              });
            };

            return (
              <div
                key={`${group.id}-${cell.cell_number || cell.id || index}-${index}`}
                className={`cell-thumb ${canPreview ? "clickable" : ""}`}
                onClick={canPreview ? handlePreview : undefined}
                onKeyDown={canPreview ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handlePreview();
                  }
                } : undefined}
                role={canPreview ? "button" : undefined}
                tabIndex={canPreview ? 0 : -1}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${groupName} - ${cell.cell_number || index + 1}`}
                    className="cell-thumb-art"
                    loading="lazy"
                    decoding="async"
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%"
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target && target.parentElement) {
                        target.style.display = "none";
                        if (!target.parentElement.querySelector(".cell-thumb-placeholder")) {
                          const placeholder = document.createElement("div");
                          placeholder.className = "cell-thumb-art cell-thumb-placeholder";
                          placeholder.style.background = "#f0f0f0";
                          placeholder.style.display = "flex";
                          placeholder.style.alignItems = "center";
                          placeholder.style.justifyContent = "center";
                          placeholder.style.color = "#999";
                          placeholder.style.fontSize = "12px";
                          placeholder.textContent = "加载失败";
                          target.parentElement.appendChild(placeholder);
                        }
                      }
                    }}
                  />
                ) : (
                  <div
                    className="cell-thumb-art"
                    style={{
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: "12px"
                    }}
                  >
                    无路径
                  </div>
                )}
                <span className="cell-thumb-label">
                  {cell.width && cell.height ? `${cell.width}×${cell.height}` : "193×192"}
                  {cell.cell_number && <div style={{ fontSize: "10px", color: "#999" }}>{cell.cell_number}</div>}
                </span>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const selectedSample = samples.find(sample => sample.id === selectedSampleId);

  const handleDeleteCurrentImage = async () => {
    if (isDeletingImage) {
      return;
    }

    if (!selectedSample) {
      window.alert("请先选择样本");
      return;
    }

    if (imageData.length === 0 || currentImageIndex < 0) {
      window.alert("当前没有可删除的图片");
      return;
    }

    const currentImage = imageData[currentImageIndex];

    let storagePath =
      currentImage?.storagePath ||
      currentImage?.rawPath ||
      "";

    if (!storagePath) {
      window.alert("当前图片缺少有效路径，无法删除");
      return;
    }

    if (storagePath.startsWith(`${API_BASE_URL}/api/images/view/`)) {
      storagePath = storagePath.replace(`${API_BASE_URL}/api/images/view/`, "");
    } else if (storagePath.startsWith("/api/images/view/")) {
      storagePath = storagePath.replace("/api/images/view/", "");
    }

    storagePath = storagePath.replace(/^\/+/, "");

    if (!storagePath) {
      window.alert("当前图片缺少有效路径，无法删除");
      return;
    }

    if (!window.confirm("确定要删除当前图片吗？删除后无法恢复。")) {
      return;
    }

    try {
      setIsDeletingImage(true);
      setPreviewImage(null);
      await deleteSampleImage(storagePath);
      await loadSampleImages(selectedSample.sampleNumber);
      setCurrentImageIndex(0);
      window.alert("图片已删除");
      console.info(`图片已删除: ${storagePath}`);
    } catch (error: any) {
      console.error("删除图片失败:", error);
      window.alert(error?.message ?? "删除图片失败");
    } finally {
      setIsDeletingImage(false);
    }
  };

  // 翻页逻辑
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
      <div className="image-analysis">
        <div className="analysis-container">
        <aside className="sample-column">
          <div className="sample-column-header">
            <h2>样本列表</h2>
            <button 
              className="refresh-btn" 
              onClick={() => loadSamples()}
              title="刷新数据"
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                marginLeft: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 刷新
            </button>
          </div>
          <div className="sample-table-panel">
            <div className="sample-table-container">
              <table className="sample-data-table">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>患者姓名</th>
                  <th>样本编号</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <div className="empty-text">加载中...</div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <div className="empty-icon">⚠️</div>
                        <div className="empty-text">{error}</div>
                      </div>
                    </td>
                  </tr>
                ) : samples.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <div className="empty-text">暂无样本数据</div>
                        <div className="empty-hint">请先添加样本或检查数据源</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  samples.map(sample => (
                    <tr
                      key={sample.id}
                      className={selectedSampleId === sample.id ? "active" : ""}
                      onClick={() => setSelectedSampleId(sample.id)}
                    >
                      <td>{sample.type}</td>
                      <td>{sample.patientName}</td>
                      <td>{sample.sampleNumber}</td>
                      <td>
                        <span
                          className={`status-tag ${
                            sample.status === "图像已审核"
                              ? "status-success"
                              : sample.status === "报告已审核"
                              ? "status-info"
                              : "status-pending"
                          }`}
                        >
                          {sample.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
          </div>
          
          {/* 翻页控件 */}
          <div className="pagination-area">
            <div className="pagination-info">
              <span>共 {totalCount} 项数据</span>
            </div>
            <div className="pagination-controls">
              <div className="page-size-selector">
                <select
                  value={pageSize}
                  onChange={event => setPageSize(Number(event.target.value))}
                  className="page-size-select"
                >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                  <option value={50}>50 条/页</option>
                </select>
              </div>
              <div className="page-buttons">
                <button
                  className="page-btn prev-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  上一页
                </button>
                {[1, 2, 3].map(page => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <span className="page-ellipsis">...</span>
                <button
                  className={`page-btn ${currentPage === totalPages ? "active" : ""}`}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
                <button
                  className="page-btn next-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="right-side-container">
          {/* Right Side Header */}
          <div className="right-side-header">
            <div className="header-left">
              <div className="header-title">
                <h3>标记项目</h3>
              </div>
              
            <div className="header-tabs">
              <button 
                className={`header-tab ${activeTab === "细胞图像" ? "active" : ""}`}
                onClick={() => setActiveTab("细胞图像")}
              >
                细胞图像
              </button>
              <span className="tab-counter">{cellImages.length}</span>
              <button 
                className={`header-tab ${activeTab === "标记图像" ? "active" : ""}`}
                onClick={() => setActiveTab("标记图像")}
              >
                标记图像
              </button>
              <span className="tab-counter">{markedImages.length}</span>
              <button 
                className={`header-tab ${activeTab === "区域图像" ? "active" : ""}`}
                onClick={() => setActiveTab("区域图像")}
              >
                区域图像
              </button>
            </div>
            </div>
            
            <div className="header-divider"></div>
            
            <div className="header-info">
              <div className="patient-info">
                <div className="info-group">
                  <span className="info-label">姓名:</span>
                  <span className="info-value">{selectedSample?.patientName || "-"}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">性别:</span>
                  <span className="info-value">{selectedSample?.patientGender || "-"}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">年龄:</span>
                  <span className="info-value">{selectedSample?.patientAge ? `${selectedSample.patientAge}岁` : "-"}</span>
                </div>
              </div>
              
              <div className="header-controls">
                <div className="color-mode-selector">
                  <span className="color-mode-label">色彩模式</span>
                  <div className="color-mode-dropdown">
                    <span className="color-mode-value">原始</span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              className="header-query-btn"
              disabled={!isReviewReady}
              style={{
                opacity: isReviewReady ? 1 : 0.7,
                cursor: isReviewReady ? 'pointer' : 'not-allowed',
                background: isReviewReady
                  ? 'linear-gradient(135deg, #34d399, #10b981)'
                  : undefined,
                color: isReviewReady ? '#053b2e' : undefined,
                borderColor: isReviewReady ? '#34d399' : undefined,
                boxShadow: isReviewReady
                  ? '0 8px 18px rgba(16,185,129,0.28)'
                  : undefined
              }}
              onClick={() => {
                setIsReviewReady(false);
              }}
            >
              完成审核
            </button>
          </div>

          <div className="right-content">
            <aside className="analysis-sidebar">
          <div className="category-tree">
            {loadingCells ? (
              <div className="loading-state">加载细胞数据中...</div>
            ) : (
              cellTreeData.map(renderTreeNode)
            )}
          </div>
          <div className="sidebar-footer">
            <div className="footer-item"><span className="status-dot pending" /> 未审核 0</div>
            <div className="footer-item"><span className="status-dot archived" /> 已删除 0</div>
          </div>
        </aside>

            <main className="analysis-main">
              {activeTab === "区域图像" ? (
                <div className="region-images-view">
                  <div className="image-viewer-container">
                    <div className="main-image-container">
                      <div className="image-wrapper" style={{ transform: `scale(${zoomLevel / 100})` }}>
                        {loadingImages ? (
                          <div className="loading-placeholder">
                            <div className="loading-text">加载图片中...</div>
                          </div>
                        ) : imageData.length > 0 && imageData[currentImageIndex] ? (
                          <div className="microscopic-image">
                            <img
                              src={imageData[currentImageIndex].url}
                              alt={`区域图片 ${currentImageIndex + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                maxWidth: '100%',
                                maxHeight: '100%'
                              }}
                              onError={(e) => {
                                const failedUrl = imageData[currentImageIndex]?.url;
                                console.error('区域图片加载失败:', failedUrl);
                                console.error('错误详情: 可能的原因 - 1) 图片不存在 2) 权限问题(403) 3) 服务器错误(500) 4) URL编码问题');
                                
                                const target = e.target as HTMLImageElement;
                                if (target) {
                                  target.style.display = 'none';
                                  // 显示占位符
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'image-placeholder';
                                  placeholder.innerHTML = `
                                    <div style="text-align: center; padding: 20px;">
                                      <div style="font-size: 48px; margin-bottom: 10px;">🖼️</div>
                                      <div style="color: #999;">图片加载失败</div>
                                      <div style="font-size: 12px; color: #ccc; margin-top: 5px;">${failedUrl || '未知URL'}</div>
                                    </div>
                                  `;
                                  placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 200px; background: #f5f5f5; border: 1px dashed #ddd;';
                                  if (target.parentElement) {
                                    target.parentElement.appendChild(placeholder);
                                  }
                                }
                              }}
                              onLoad={() => {
                                console.log('区域图片加载成功:', imageData[currentImageIndex]?.url);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="no-images-placeholder">
                            <div className="empty-icon">🖼️</div>
                            <div className="empty-text">该样本暂无区域图像</div>
                            <div className="empty-hint">区域图像将从API获取</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 图像控制栏 */}
                    <div className="image-controls">
                      <button className="control-btn" title="提醒">
                        <span>🔔</span>
                      </button>
                      <button className="control-btn" title="测量">
                        <span>📏</span>
                      </button>
                      <button className="control-btn" onClick={handleZoomOut} title="缩小">
                        <span>🔍-</span>
                      </button>
                      <span className="zoom-level">{zoomLevel}%</span>
                      <button className="control-btn" onClick={handleZoomIn} title="放大">
                        <span>🔍+</span>
                      </button>
                      <button
                        className="control-btn"
                        title={isDeletingImage ? "正在删除..." : "删除当前图片"}
                        onClick={handleDeleteCurrentImage}
                        disabled={isDeletingImage || imageData.length === 0}
                        aria-label="删除当前图片"
                      >
                        <span>{isDeletingImage ? "⏳" : "🗑️"}</span>
                      </button>
                      <button className="control-btn" title="全屏">
                        <span>⛶</span>
                      </button>
                      <button className="control-btn" title="下载">
                        <span>⬇️</span>
                      </button>
                    </div>
                    
                    {/* 缩略图导航 */}
                    <div className="thumbnail-carousel">
                      <button className="carousel-nav left">‹</button>
                      <div className="thumbnail-strip">
                        {imageData.length > 0 ? (
                          imageData.map((image, index) => (
                            <div
                              key={image.id || index}
                              className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img
                                src={image.url}
                                alt={`缩略图 ${index + 1}`}
                                className="thumbnail-image"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target) {
                                    target.style.display = 'none';
                                    target.parentElement?.classList.add('thumbnail-error');
                                  }
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="no-thumbnails">暂无图片</div>
                        )}
                      </div>
                      <button className="carousel-nav right">›</button>
                    </div>
                    
                    {/* 导航按钮 */}
                    <div className="image-navigation">
                      <button 
                        className={`nav-btn ${currentImageIndex === 0 ? 'active' : ''}`}
                        onClick={handleFirstImage}
                        disabled={imageData.length === 0}
                      >
                        第一张
                      </button>
                      <button 
                        className={`nav-btn ${currentImageIndex === 0 ? 'disabled' : ''}`}
                        onClick={handlePreviousImage}
                        disabled={currentImageIndex === 0 || imageData.length === 0}
                      >
                        上一张
                      </button>
                      <button 
                        className={`nav-btn ${currentImageIndex === (imageData.length - 1) ? 'disabled' : ''}`}
                        onClick={handleNextImage}
                        disabled={currentImageIndex === (imageData.length - 1) || imageData.length === 0}
                      >
                        下一张
                      </button>
                      <button 
                        className={`nav-btn ${currentImageIndex === (imageData.length - 1) ? 'active' : ''}`}
                        onClick={handleLastImage}
                        disabled={imageData.length === 0}
                      >
                        最后一张
                      </button>
                      <span className="image-count">
                        {imageData.length > 0 
                          ? `共${imageData.length}张，当前第${currentImageIndex + 1}张`
                          : '暂无图片'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : activeTab === "标记图像" ? (
                <div className="marked-images-view">
                  <div className="image-viewer-container">
                    <div className="main-image-container">
                      <div className="image-wrapper" style={{ transform: `scale(${zoomLevel / 100})` }}>
                        {loadingImages ? (
                          <div className="loading-placeholder">
                            <div className="loading-text">加载图片中...</div>
                          </div>
                        ) : markedImageData.length > 0 && markedImageData[currentImageIndex] ? (
                          <div className="microscopic-image">
                            <img
                              src={markedImageData[currentImageIndex].url}
                              alt={`标记图片 ${currentImageIndex + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                maxWidth: '100%',
                                maxHeight: '100%'
                              }}
                              onError={(e) => {
                                const failedUrl = markedImageData[currentImageIndex]?.url;
                                console.error('图片加载失败:', failedUrl);
                                console.error('错误详情: 可能的原因 - 1) 图片不存在 2) 权限问题(403) 3) 服务器错误(500) 4) URL编码问题');
                                
                                const target = e.target as HTMLImageElement;
                                if (target) {
                                  target.style.display = 'none';
                                  // 显示占位符
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'image-placeholder';
                                  placeholder.innerHTML = `
                                    <div style="text-align: center; padding: 20px;">
                                      <div style="font-size: 48px; margin-bottom: 10px;">🖼️</div>
                                      <div style="color: #999;">图片加载失败</div>
                                      <div style="font-size: 12px; color: #ccc; margin-top: 5px;">${failedUrl || '未知URL'}</div>
                                    </div>
                                  `;
                                  placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 200px; background: #f5f5f5; border: 1px dashed #ddd;';
                                  if (target.parentElement) {
                                    target.parentElement.appendChild(placeholder);
                                  }
                                }
                              }}
                              onLoad={() => {
                                console.log('标记图片加载成功:', markedImageData[currentImageIndex]?.url);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="no-images-placeholder">
                            <div className="empty-icon">🖼️</div>
                            <div className="empty-text">该样本暂无标记图像</div>
                            <div className="empty-hint">标记图像将从SmearRegionTable.marked_image_path字段获取</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 图像控制栏 */}
                    <div className="image-controls">
                      <button className="control-btn" title="提醒">
                        <span>🔔</span>
                      </button>
                      <button className="control-btn" title="测量">
                        <span>📏</span>
                      </button>
                      <button className="control-btn" onClick={handleZoomOut} title="缩小">
                        <span>🔍-</span>
                      </button>
                      <span className="zoom-level">{zoomLevel}%</span>
                      <button className="control-btn" onClick={handleZoomIn} title="放大">
                        <span>🔍+</span>
                      </button>
                      <button
                        className="control-btn"
                        title={isDeletingImage ? "正在删除..." : "删除当前图片"}
                        onClick={handleDeleteCurrentImage}
                        disabled={isDeletingImage || markedImageData.length === 0}
                        aria-label="删除当前图片"
                      >
                        <span>{isDeletingImage ? "⏳" : "🗑️"}</span>
                      </button>
                      <button className="control-btn" title="全屏">
                        <span>⛶</span>
                      </button>
                      <button className="control-btn" title="下载">
                        <span>⬇️</span>
                      </button>
                    </div>
                    
                    {/* 缩略图导航 */}
                    <div className="thumbnail-carousel">
                      <button className="carousel-nav left">‹</button>
                      <div className="thumbnail-strip">
                        {markedImageData.length > 0 ? (
                          markedImageData.map((image, index) => (
                            <div
                              key={image.id || index}
                              className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img
                                src={image.url}
                                alt={`缩略图 ${index + 1}`}
                                className="thumbnail-image"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target) {
                                    target.style.display = 'none';
                                    target.parentElement?.classList.add('thumbnail-error');
                                  }
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="no-thumbnails">暂无图片</div>
                        )}
                      </div>
                      <button className="carousel-nav right">›</button>
                    </div>
                    
                    {/* 导航按钮 */}
                    <div className="image-navigation">
                      <button 
                        className={`nav-btn ${currentImageIndex === 0 ? 'active' : ''}`}
                        onClick={handleFirstImage}
                        disabled={markedImageData.length === 0}
                      >
                        第一张
                      </button>
                      <button 
                        className={`nav-btn ${currentImageIndex === 0 ? 'disabled' : ''}`}
                        onClick={handlePreviousImage}
                        disabled={currentImageIndex === 0 || markedImageData.length === 0}
                      >
                        上一张
                      </button>
                      <button 
                        className={`nav-btn ${currentImageIndex === (markedImageData.length - 1) ? 'disabled' : ''}`}
                        onClick={handleNextImage}
                        disabled={currentImageIndex === (markedImageData.length - 1) || markedImageData.length === 0}
                      >
                        下一张
                      </button>
                      <button 
                        className={`nav-btn ${currentImageIndex === (markedImageData.length - 1) ? 'active' : ''}`}
                        onClick={handleLastImage}
                        disabled={markedImageData.length === 0}
                      >
                        最后一张
                      </button>
                      <span className="image-count">
                        {markedImageData.length > 0 
                          ? `共${markedImageData.length}张，当前第${currentImageIndex + 1}张`
                          : '暂无图片'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cell-images-view">
                  <div className="detail-header">
                    <div className="detail-title">
                      <h1>{selectedNode?.name ?? "请选择细胞分类"}</h1>
                      <p>细胞总数：{selectedNode?.imageCount ?? selectedNode?.count ?? 0}</p>
                    </div>
                    <div className="detail-actions"></div>
                  </div>

                  <div className="detail-body">
                    {groupsToDisplay.map(group => (
                      <section key={group.id} className="detail-section">
                        <header className="section-heading">
                          <h3>{group.name}</h3>
                          <span className="section-count">{group.imageCount ?? group.count ?? 0}</span>
                        </header>
                        {renderImages(group)}
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
        </div>
      </div>

      {previewImage && (
        <div
          className="image-preview-modal-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="image-preview-modal"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setPreviewImage(null)}
              aria-label="关闭预览"
            >
              ×
            </button>
            <div className="image-preview-content">
              <img
                src={previewImage.url}
                alt={previewImage.title ?? "细胞图像"}
              />
            </div>
            {(previewImage.title || previewImage.description) && (
              <div className="image-preview-footer">
                {previewImage.title && <h4>{previewImage.title}</h4>}
                {previewImage.description && <p>{previewImage.description}</p>}
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => {
                      // 预填选项
                      const defaultMajor = cellTree[0]?.name || "";
                      setSelectedMajor(defaultMajor);
                      const defaultSub = cellTree[0]?.children?.[0]?.name || "";
                      setSelectedSub(defaultSub);
                      setShowClassifyEditor(true);
                    }}
                    style={{ color: '#2563eb' }}
                  >
                    修改细胞分类
                  </button>
                </div>
                {showClassifyEditor && previewImage?.cell && (
                  <div style={{ marginTop: 14, borderTop: '1px dashed #e5e7eb', paddingTop: 14 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>细胞系</label>
                        <select
                          value={selectedMajor}
                          onChange={(e) => {
                            const major = e.target.value;
                            setSelectedMajor(major);
                            const firstSub = cellTree.find(c => c.name === major)?.children?.[0]?.name || "";
                            setSelectedSub(firstSub);
                          }}
                          style={{ width: '100%', height: 40, borderRadius: 10, padding: '0 10px', border: '1px solid #d1d5db' }}
                        >
                          {cellTree.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>细胞亚型</label>
                        <select
                          value={selectedSub}
                          onChange={(e) => setSelectedSub(e.target.value)}
                          style={{ width: '100%', height: 40, borderRadius: 10, padding: '0 10px', border: '1px solid #d1d5db' }}
                        >
                          {cellTree.find(c => c.name === selectedMajor)?.children?.map(sub => (
                            <option key={sub.id} value={sub.name}>{sub.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => setShowClassifyEditor(false)}
                        style={{ height: 40, padding: '0 16px', borderRadius: 10, fontWeight: 600, color: '#2563eb' }}
                      >
                        放弃修改
                      </button>
                      <button
                        type="button"
                        className="action-btn primary"
                        onClick={async () => {
                          try {
                            const cellNumber = previewImage?.cell?.cell_number;
                            if (cellNumber) {
                              await updateCellClassificationByNumber(cellNumber, {
                                doctor_classification_category: selectedSub,
                                major_category: selectedMajor,
                                sub_category: selectedSub
                              });
                            }
                            setIsReviewReady(true);
                            setShowClassifyEditor(false);
                            // 同步前端树计数：刷新分类数据
                            if (selectedSampleId) {
                              const sample = samples.find(s => s.id === selectedSampleId);
                              if (sample) {
                                const cells = await getCellClassificationsBySampleNumber(sample.sampleNumber);
                                setCellClassifications(cells);
                                const updatedTree = updateCellTreeWithRealData(cellTree, cells);
                                setCellTreeData(updatedTree);
                              }
                            }
                            alert('细胞分类已更新');
                          } catch (err: any) {
                            alert(err.message || '更新失败');
                          }
                        }}
                        style={{ height: 40, padding: '0 18px', borderRadius: 10, fontWeight: 700 }}
                      >
                        确认修改
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageAnalysis;

