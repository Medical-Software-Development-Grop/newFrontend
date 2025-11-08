import React, { useMemo, useState, useEffect } from "react";
import "./ImageAnalysis.css";
import { getSmears, Smear } from "./api/smear";
import { getSampleImages, ImageInfo } from "./api/image";
import { getCellClassifications, getCellClassificationsBySampleNumber, getCellStatistics, CellClassification } from "./api/cellClassification";
import { API_BASE_URL } from "./api/config";

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

// 模拟图像数据
const imageData = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  url: `/api/images/sample-${index + 1}.jpg`
}));

interface Sample {
  id: string;
  type: string;
  patientName: string;
  sampleNumber: string;
  status: "图像已审核" | "报告已审核" | "未审核";
  patientAge?: number;
  patientGender?: string;
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
  const [colorMode, setColorMode] = useState<string>("原始");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [cellClassifications, setCellClassifications] = useState<CellClassification[]>([]);
  const [cellTreeData, setCellTreeData] = useState<CellNode[]>(cellTree);
  const [loadingCells, setLoadingCells] = useState<boolean>(false);
  const [sampleImages, setSampleImages] = useState<ImageInfo[]>([]); // 样本的上传图片
  const [loadingImages, setLoadingImages] = useState<boolean>(false);

  const selectedNode = useMemo(() => findNode(cellTreeData, selectedNodeId), [selectedNodeId, cellTreeData]);
  
  // 使用实际的样本图片数据，如果没有则使用默认的imageData
  const imageData = useMemo(() => {
    if (sampleImages.length > 0) {
      return sampleImages.map((img, index) => {
        // 构建完整的图片URL：如果URL是相对路径，需要添加API_BASE_URL前缀
        let imageUrl = img.url || img.path || '';
        
        if (!imageUrl) {
          console.warn(`图片 ${index} 没有URL或路径`);
          return {
            id: index + 1,
            url: ''
          };
        }
        
        // 如果已经是完整URL，直接使用
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          return {
            id: index + 1,
            url: imageUrl
          };
        }
        
        // 处理相对路径
        if (imageUrl.startsWith('/api/images/view/')) {
          // 如果已经包含完整路径，只需要添加API_BASE_URL前缀
          imageUrl = `${API_BASE_URL}${imageUrl}`;
        } else if (imageUrl.startsWith('/')) {
          // 如果是其他相对路径
          imageUrl = `${API_BASE_URL}${imageUrl}`;
        } else {
          // 如果是存储路径（如 users/1/S2510250025/区域图/xxx.png），需要编码并构建完整URL
          // 对路径进行编码，确保中文字符正确编码
          const encodedPath = imageUrl.split('/').map(segment => encodeURIComponent(segment)).join('/');
          imageUrl = `${API_BASE_URL}/api/images/view/${encodedPath}`;
        }
        
        console.log(`图片 ${index + 1} URL构建: 原始=${img.path || img.url}, 最终=${imageUrl}`);
        
        return {
          id: index + 1,
          url: imageUrl
        };
      });
    }
    // 如果没有上传的图片，返回空数组（而不是模拟数据）
    return [];
  }, [sampleImages]);

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

  // 加载样本的上传图片
  const loadSampleImages = async (sampleNumber: string) => {
    if (!sampleNumber) {
      setSampleImages([]);
      return;
    }
    
    setLoadingImages(true);
    try {
      console.log(`开始加载样本 ${sampleNumber} 的图片...`);
      const imagesResponse = await getSampleImages(sampleNumber);
      console.log(`样本 ${sampleNumber} 的图片API响应:`, imagesResponse);
      const images = imagesResponse.images || [];
      
      // 验证返回的图片是否属于正确的样本
      const validImages = images.filter(img => {
        const path = img.path || img.url || '';
        // 检查路径是否包含正确的样本编号
        if (path.includes(sampleNumber)) {
          return true;
        }
        console.warn(`图片路径不匹配样本编号: 路径=${path}, 样本编号=${sampleNumber}`);
        return false;
      });
      
      console.log(`样本 ${sampleNumber}: 总共 ${images.length} 张图片，有效 ${validImages.length} 张`);
      setSampleImages(validImages);
      
      // 如果有图片，重置到第一张
      if (validImages.length > 0) {
        setCurrentImageIndex(0);
        console.log(`✅ 成功加载 ${validImages.length} 张有效图片`);
      } else {
        console.warn(`⚠️ 样本 ${sampleNumber} 暂无有效的上传图片`);
        if (images.length > 0) {
          console.warn(`发现 ${images.length - validImages.length} 张图片路径不匹配`);
        }
      }
    } catch (err: any) {
      console.error(`❌ 加载样本 ${sampleNumber} 的图片失败:`, err);
      setSampleImages([]);
      // 如果加载失败，不影响其他功能，只是没有图片显示
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

        // 根据实际数据更新cellTree
        const updatedTree = updateCellTreeWithRealData(cellTree, cells);
        setCellTreeData(updatedTree);
      } catch (err: any) {
        console.error('加载细胞分类数据失败:', err);
        // 如果加载失败，清空细胞数据（不使用示例数据）
        setCellTreeData(cellTree.map(category => ({
          ...category,
          count: 0,
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
  const updateCellTreeWithRealData = (tree: CellNode[], cells: CellClassification[]): CellNode[] => {
    return tree.map(category => {
      const updatedCategory = { ...category };
      
      if (category.children) {
        updatedCategory.children = category.children.map(child => {
          // 统计该类型细胞的数量
          const cellType = child.name;
          const count = cells.filter(cell => 
            cell.model_classification_type === cellType || 
            cell.doctor_classification_category === cellType
          ).length;
          
          return {
            ...child,
            count: count > 0 ? count : child.count, // 如果有真实数据就用真实数据，否则保持原值
            imageCount: count > 0 ? count : 0
          };
        });
        
        // 更新分类的总数
        const totalCount = updatedCategory.children.reduce((sum, child) => sum + child.count, 0);
        updatedCategory.count = totalCount > 0 ? totalCount : category.count;
      }
      
      return updatedCategory;
    });
  };

  // 根据选中的细胞类型生成标注
  const getAnnotationsForSelectedCell = useMemo(() => {
    if (!selectedNode) return [];
    return baseAnnotations.map(annotation => ({
      ...annotation,
      label: selectedNode.name
    }));
  }, [selectedNode]);

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

  const handleFirstImage = () => {
    setCurrentImageIndex(0);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNextImage = () => {
    if (imageData.length > 0) {
      setCurrentImageIndex(prev => Math.min(prev + 1, imageData.length - 1));
    }
  };

  const handleLastImage = () => {
    if (imageData.length > 0) {
      setCurrentImageIndex(imageData.length - 1);
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
    const total = group.imageCount ?? group.count;
    if (!total) {
      return <div className="empty-state">暂无图像</div>;
    }

    // 获取该类型对应的实际细胞图像
    const cellsForType = cellClassifications.filter(cell => {
      const modelType = cell.model_classification_type || '';
      const doctorType = cell.doctor_classification_category || '';
      const groupName = group.name || '';
      
      // 精确匹配或包含匹配
      return modelType === groupName || 
             doctorType === groupName ||
             modelType.includes(groupName) ||
             groupName.includes(modelType);
    });
    
    console.log(`类型 "${group.name}" 匹配到 ${cellsForType.length} 个细胞`, {
      groupName: group.name,
      totalCells: cellClassifications.length,
      matchedCells: cellsForType.map(c => ({
        cell_number: c.cell_number,
        type: c.model_classification_type,
        storage_path: c.storage_path
      }))
    });

    const visible = Math.min(total, MAX_IMAGES);
    const cellsToShow = cellsForType.slice(0, visible);

    return (
      <>
        {total > visible && (
          <p className="gallery-note">展示 {visible} 张，共 {total} 张</p>
        )}
        <div className="thumb-grid">
                {cellsToShow.length > 0 ? (
            cellsToShow.map((cell, index) => {
              // 构建图片URL，添加时间戳避免缓存问题（如果需要）
              // 确保storage_path包含正确的样本编号
              let imageUrl = null;
              if (cell.storage_path) {
                // 验证storage_path是否属于当前样本
                const currentSampleNumber = selectedSample?.sampleNumber || '';
                if (currentSampleNumber && cell.storage_path.includes(currentSampleNumber)) {
                  // 对路径的每个段进行编码
                  const encodedPath = cell.storage_path.split('/').map(segment => encodeURIComponent(segment)).join('/');
                  imageUrl = `${API_BASE_URL}/api/images/view/${encodedPath}`;
                } else {
                  console.warn(`细胞 ${cell.cell_number} 的storage_path不匹配当前样本: path=${cell.storage_path}, 样本=${currentSampleNumber}`);
                }
              }
              
              return (
              <div key={`${group.id}-${cell.cell_number || cell.id || index}-${index}`} className="cell-thumb">
                {imageUrl ? (
                  <img 
                    src={imageUrl}
                    alt={`${group.name} - ${cell.cell_number}`}
                    className="cell-thumb-art"
                    loading="lazy"  // 懒加载
                    decoding="async"  // 异步解码
                    style={{ 
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                    onLoad={() => {
                      // 静默加载，不输出日志（减少控制台输出）
                    }}
                    onError={(e) => {
                      // 如果图片加载失败，显示占位符
                      const target = e.target as HTMLImageElement;
                      if (target && target.parentElement) {
                        target.style.display = 'none';
                        // 检查是否已经有占位符
                        if (!target.parentElement.querySelector('.cell-thumb-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'cell-thumb-art cell-thumb-placeholder';
                          placeholder.style.background = '#f0f0f0';
                          placeholder.style.display = 'flex';
                          placeholder.style.alignItems = 'center';
                          placeholder.style.justifyContent = 'center';
                          placeholder.style.color = '#999';
                          placeholder.style.fontSize = '12px';
                          placeholder.textContent = '加载失败';
                          target.parentElement.appendChild(placeholder);
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="cell-thumb-art" style={{ 
                    background: '#f0f0f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '12px'
                  }}>
                    无路径
                  </div>
                )}
                <span className="cell-thumb-label">
                  {cell.width && cell.height ? `${cell.width}×${cell.height}` : '193×192'}
                  {cell.cell_number && <div style={{ fontSize: '10px', color: '#999' }}>{cell.cell_number}</div>}
                </span>
              </div>
            )})
          ) : (
            // 如果没有实际图像数据，显示占位符
            Array.from({ length: visible }, (_, index) => (
              <div key={`${group.id}-placeholder-${index}`} className="cell-thumb">
                <div className="cell-thumb-art" />
                <span className="cell-thumb-label">193×192</span>
              </div>
            ))
          )}
        </div>
      </>
    );
  };

  const selectedSample = samples.find(sample => sample.id === selectedSampleId);

  // 翻页逻辑
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
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
                <button 
                  className={`header-tab ${activeTab === "标记图像" ? "active" : ""}`}
                  onClick={() => setActiveTab("标记图像")}
                >
                  标记图像
                </button>
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
                    <span className="color-mode-value">{colorMode}</span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="header-query-btn">查询</button>
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
                  <div className="region-image-container">
                    <div className="main-region-image">
                      <div className="image-viewer">
                        <div className="high-resolution-image">
                          {/* 高分辨率显微镜图像 */}
                          <div className="microscopic-field">
                            {/* 红细胞 */}
                            <div className="red-blood-cell" style={{ top: '15%', left: '10%' }}></div>
                            <div className="red-blood-cell" style={{ top: '20%', left: '20%' }}></div>
                            <div className="red-blood-cell" style={{ top: '25%', left: '30%' }}></div>
                            <div className="red-blood-cell" style={{ top: '30%', left: '40%' }}></div>
                            <div className="red-blood-cell" style={{ top: '35%', left: '50%' }}></div>
                            <div className="red-blood-cell" style={{ top: '40%', left: '60%' }}></div>
                            <div className="red-blood-cell" style={{ top: '45%', left: '70%' }}></div>
                            <div className="red-blood-cell" style={{ top: '50%', left: '80%' }}></div>
                            <div className="red-blood-cell" style={{ top: '55%', left: '85%' }}></div>
                            
                            {/* 异常细胞（紫色） */}
                            <div className="abnormal-cell" style={{ top: '25%', left: '15%' }}></div>
                            <div className="abnormal-cell" style={{ top: '35%', left: '25%' }}></div>
                            <div className="abnormal-cell" style={{ top: '45%', left: '35%' }}></div>
                            <div className="abnormal-cell" style={{ top: '55%', left: '45%' }}></div>
                            <div className="abnormal-cell" style={{ top: '65%', left: '55%' }}></div>
                            <div className="abnormal-cell" style={{ top: '75%', left: '65%' }}></div>
                            <div className="abnormal-cell" style={{ top: '85%', left: '75%' }}></div>
                            <div className="abnormal-cell" style={{ top: '15%', left: '75%' }}></div>
                            <div className="abnormal-cell" style={{ top: '5%', left: '55%' }}></div>
                            <div className="abnormal-cell" style={{ top: '95%', left: '25%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 缩略图预览 */}
                      <div className="thumbnail-preview">
                        <div className="preview-image">
                          <div className="preview-microscopic-field">
                            {/* 缩略图中的细胞 */}
                            <div className="preview-red-cell" style={{ top: '20%', left: '15%' }}></div>
                            <div className="preview-red-cell" style={{ top: '30%', left: '25%' }}></div>
                            <div className="preview-red-cell" style={{ top: '40%', left: '35%' }}></div>
                            <div className="preview-red-cell" style={{ top: '50%', left: '45%' }}></div>
                            <div className="preview-red-cell" style={{ top: '60%', left: '55%' }}></div>
                            <div className="preview-red-cell" style={{ top: '70%', left: '65%' }}></div>
                            <div className="preview-red-cell" style={{ top: '80%', left: '75%' }}></div>
                            
                            <div className="preview-abnormal-cell" style={{ top: '25%', left: '20%' }}></div>
                            <div className="preview-abnormal-cell" style={{ top: '45%', left: '40%' }}></div>
                            <div className="preview-abnormal-cell" style={{ top: '65%', left: '60%' }}></div>
                            <div className="preview-abnormal-cell" style={{ top: '85%', left: '80%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 图像控制工具 */}
                    <div className="region-image-controls">
                      <button className="control-btn" title="测量">
                        <span>📏</span>
                      </button>
                      <button className="control-btn" title="翻转">
                        <span>🔄</span>
                      </button>
                      <button className="control-btn" onClick={handleZoomOut} title="缩小">
                        <span>🔍-</span>
                      </button>
                      <span className="zoom-level">{zoomLevel}%</span>
                      <button className="control-btn" onClick={handleZoomIn} title="放大">
                        <span>🔍+</span>
                      </button>
                      <button className="control-btn" title="适应屏幕">
                        <span>⛶</span>
                      </button>
                      <button className="control-btn" title="下载">
                        <span>⬇️</span>
                      </button>
                    </div>
                    
                    {/* 图像元数据 */}
                    <div className="image-metadata">
                      <div className="metadata-item">
                        <span className="metadata-label">倍率:</span>
                        <span className="metadata-value">100</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">像素:</span>
                        <span className="metadata-value">214272*206976</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">坐标:</span>
                        <span className="metadata-value">(204651,2144)</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">当前图层大小:</span>
                        <span className="metadata-value">(1984,2352)</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">路径:</span>
                        <span className="metadata-value">F:AutolmageAnalysisData\250722144402020\100x.sdpc</span>
                      </div>
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
                        ) : imageData.length > 0 && imageData[currentImageIndex] ? (
                          <div className="microscopic-image">
                            <img
                              src={imageData[currentImageIndex].url}
                              alt={`样本图片 ${currentImageIndex + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                maxWidth: '100%',
                                maxHeight: '100%'
                              }}
                              onError={(e) => {
                                const failedUrl = imageData[currentImageIndex]?.url;
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
                                console.log('图片加载成功:', imageData[currentImageIndex]?.url);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="no-images-placeholder">
                            <div className="empty-icon">🖼️</div>
                            <div className="empty-text">该样本暂无上传的图片</div>
                            <div className="empty-hint">请在图像管理界面为该样本上传图片</div>
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
              ) : (
                <div className="cell-images-view">
                  <div className="detail-header">
                    <div className="detail-title">
                      <h1>{selectedNode?.name ?? "请选择细胞分类"}</h1>
                      <p>细胞总数：{selectedNode?.count ?? 0}</p>
                    </div>
                    <div className="detail-actions">
                      <div className="detail-tags">
                        <span className="detail-tag">姓名：{selectedSample?.patientName ?? "-"}</span>
                        <span className="detail-tag">编号：{selectedSample?.sampleNumber ?? "-"}</span>
                        <span className="detail-tag">性别：{selectedSample?.patientGender ?? "-"}</span>
                        <span className="detail-tag">年龄：{selectedSample?.patientAge ? `${selectedSample.patientAge}岁` : "-"}</span>
                        <span className="detail-tag">色彩模式：{colorMode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-body">
                    {groupsToDisplay.map(group => (
                      <section key={group.id} className="detail-section">
                        <header className="section-heading">
                          <h3>{group.name}</h3>
                          <span className="section-count">{group.count}</span>
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
  );
};

export default ImageAnalysis;

