import React, { useMemo, useState, useEffect } from "react";
import "./ReportAnalysis.css";
import { getSmears, Smear } from "./api/smear";
import { getCellStatistics, CellStatistics } from "./api/cellClassification";
import { getChecklistBySampleNumber, updateChecklist, exportChecklistPDF, Checklist, CellCounts } from "./api/checklist";
import { getSmearRegions, getImageUrlByStoragePath, SmearRegionsResponse } from "./api/image";

// 将后端Smear数据转换为前端Sample格式
interface Sample {
  id: string;
  type: string;
  patientName: string;
  sampleNumber: string;
  status: "图像已审核" | "报告已审核" | "未审核";
  patientAge?: number;
  patientGender?: string;
}

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

interface CellRow {
  name: string;
  count: number;
  percent: number;
  reference: string;
  status: string;
}

interface CellSection {
  id: string;
  title: string;
  categoryName: string; // 对应检查单中的大类名称
  rows: CellRow[];
}

// 图像分析中的7个大类
const cellCategories = [
  { id: "tissue", title: "组织类细胞", categoryName: "组织类细胞" },
  { id: "neutrophil", title: "中性粒细胞系列", categoryName: "中性粒细胞系统" },
  { id: "eosinophil-basophil", title: "嗜酸、嗜碱粒", categoryName: "嗜酸、嗜碱粒" },
  { id: "erythroid", title: "幼红系列", categoryName: "幼红系列" },
  { id: "lymphocyte", title: "淋巴细胞系", categoryName: "淋巴细胞系" },
  { id: "monocyte", title: "单核细胞系", categoryName: "单核细胞系" },
  { id: "megakaryocyte", title: "巨核细胞系", categoryName: "巨核细胞系" }
];

// 子细胞名称到参考值的映射
const subCellReferenceMap: Record<string, string> = {
  // 组织类细胞
  "肥大细胞": "",
  "吞噬细胞": "",
  "破骨细胞": "",
  "退化细胞": "",
  "成骨细胞": "",
  "脂肪细胞": "",
  "内皮细胞": "",
  "纤维细胞": "",
  "其他": "",
  
  // 中性粒细胞系统
  "原始粒细胞": "0~2",
  "早幼粒细胞": "0~2",
  "中幼粒细胞": "0~8",
  "晚幼粒细胞": "0~8",
  "杆状核": "45~65",
  "分叶核": "0~5",
  
  // 嗜酸、嗜碱粒
  "嗜酸性粒细胞": "0~5",
  "嗜碱性粒细胞": "0~5",
  
  // 幼红系列
  "原始红细胞": "0~1",
  "早幼红细胞": "0~1",
  "中幼红细胞": "0~1",
  "晚幼红细胞": "0~1",
  "成熟红细胞": "~",
  
  // 淋巴细胞系
  "原始淋巴细胞": "0~1",
  "幼稚淋巴细胞": "0~1",
  "成熟淋巴细胞": "0~40",
  "异形淋巴细胞": "0~5",
  "浆细胞": "0~5",
  
  // 单核细胞系
  "原始单核细胞": "0~1",
  "幼稚单核细胞": "0~1",
  "成熟单核细胞": "0~7",
  
  // 巨核细胞系
  "原始巨核细胞": "0~1",
  "幼稚巨核细胞": "0~1",
  "颗粒型巨核细胞": "0~9",
  "产板型巨核细胞": "0~9",
  "裸核型巨核细胞": "0~9",
  "血小板": "1~100"
};

const summaryMetrics = [
  { label: "幼红系列", value: "0", category: "幼红系列" },
  { label: "巨核细胞系", value: "0", category: "巨核细胞系" },
  { label: "中性粒细胞系统", value: "0", category: "中性粒细胞系统" },
  { label: "淋巴细胞系", value: "0", category: "淋巴细胞系" },
  { label: "单核细胞系", value: "0", category: "单核细胞系" },
  { label: "组织类细胞", value: "0", category: "组织类细胞" },
  { label: "嗜酸、嗜碱粒", value: "0", category: "嗜酸、嗜碱粒" }
];

const ReportAnalysis: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("");
  const [diagnosisAnalysis, setDiagnosisAnalysis] = useState<string>(""); // 诊断分析
  const [diagnosis, setDiagnosis] = useState<string>(""); // 诊断结论
  const [reportImages, setReportImages] = useState<{
    sampleRegion: { url: string; storagePath: string } | null;
    markedRegion: { url: string; storagePath: string } | null;
  }>({
    sampleRegion: null,
    markedRegion: null
  });
  const [availableImages, setAvailableImages] = useState<{
    sampleRegions: Array<{ url: string; storagePath: string; regionNumber: string }>;
    markedRegions: Array<{ url: string; storagePath: string; regionNumber: string }>;
  }>({
    sampleRegions: [],
    markedRegions: []
  });
  const [imageLoading, setImageLoading] = useState<{
    sampleRegion: boolean;
    markedRegion: boolean;
  }>({
    sampleRegion: false,
    markedRegion: false
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [cellStatistics, setCellStatistics] = useState<CellStatistics | null>(null);
  const [checklist, setChecklist] = useState<Checklist | null>(null);

  const selectedSample = useMemo(() => samples.find(sample => sample.id === selectedSampleId), [selectedSampleId, samples]);

  // 加载样本数据（与SampleEdit和ImageAnalysis使用相同的API和逻辑）
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
      
      console.log(`报告分析界面加载了 ${sampleList.length} 条样本数据，共 ${response.total} 条`);
    } catch (err: any) {
      setError(err.message || '加载样本数据失败');
      console.error('加载样本数据失败:', err);
      setSamples([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 加载选中样本的检查单和细胞统计信息
  useEffect(() => {
    const loadChecklistAndStatistics = async () => {
      if (!selectedSampleId) return;
      
      const selectedSample = samples.find(s => s.id === selectedSampleId);
      if (!selectedSample) return;

      try {
        // 优先使用检查单获取细胞计数（包含 cell_counts 字段）
        try {
          const checklistData = await getChecklistBySampleNumber(selectedSample.sampleNumber);
          setChecklist(checklistData);
          console.log('检查单数据:', checklistData);
          console.log('细胞计数:', checklistData.cell_counts);
        } catch (checklistErr: any) {
          console.warn('获取检查单失败，尝试使用细胞统计接口:', checklistErr);
          setChecklist(null);
        }

        // 同时获取细胞统计信息（作为补充）
        try {
          const smearResponse = await getSmears({
            skip: 0,
            limit: 1000,
            sample_number: selectedSample.sampleNumber,
          });

          if (smearResponse.items.length > 0) {
            const smear = smearResponse.items[0];
            
            if (smear.id) {
              const stats = await getCellStatistics(smear.id);
              setCellStatistics(stats);
            }
          }
        } catch (statsErr: any) {
          console.warn('加载细胞统计信息失败:', statsErr);
          setCellStatistics(null);
        }

        // 加载样本区域图像
        try {
          const regionsData = await getSmearRegions(selectedSample.sampleNumber);
          console.log('区域数据:', regionsData);
          
          const sampleRegions = regionsData.regions
            .filter(region => region.storage_path)
            .map(region => ({
              url: getImageUrlByStoragePath(region.storage_path!),
              storagePath: region.storage_path!,
              regionNumber: region.region_number || ""
            }));
          
          const markedRegions = regionsData.regions
            .filter(region => region.marked_image_path)
            .map(region => ({
              url: getImageUrlByStoragePath(region.marked_image_path!),
              storagePath: region.marked_image_path!,
              regionNumber: region.region_number || ""
            }));
          
          console.log('样本区域图像数量:', sampleRegions.length);
          console.log('标记区域图像数量:', markedRegions.length);
          
          setAvailableImages({
            sampleRegions,
            markedRegions
          });
          
          // 预设第一张样本区域图像和第一张标记后的区域图像
          setReportImages({
            sampleRegion: sampleRegions.length > 0 ? {
              url: sampleRegions[0].url,
              storagePath: sampleRegions[0].storagePath
            } : null,
            markedRegion: markedRegions.length > 0 ? {
              url: markedRegions[0].url,
              storagePath: markedRegions[0].storagePath
            } : null
          });
        } catch (regionsErr: any) {
          console.warn('加载区域图像失败:', regionsErr);
          setAvailableImages({ sampleRegions: [], markedRegions: [] });
          setReportImages({ sampleRegion: null, markedRegion: null });
        }
      } catch (err: any) {
        console.error('加载数据失败:', err);
        setChecklist(null);
        setCellStatistics(null);
      }
    };

    loadChecklistAndStatistics();
  }, [selectedSampleId, samples]);

  // 组件挂载和分页变化时加载数据
  useEffect(() => {
    loadSamples();
  }, [currentPage, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // 页面可见性变化和窗口焦点变化时刷新数据
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('页面可见性变化，刷新样本数据');
          loadSamples();
        }, 500);
      }
    };
    
    const handleFocus = () => {
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
    const handleImageUploadSuccess = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('图片上传成功，刷新样本数据');
        loadSamples();
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

  // 翻页逻辑
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  const pagedSamples = samples;

  // 根据检查单的 cell_counts 更新细胞数量
  // 创建细胞名称到检查单字段的映射（新的嵌套结构）
  // 格式: { category: "大类名", subCategory: "子类名" }
  const cellNameMapping: Record<string, { category: string; subCategory: string }> = {
    // 组织类细胞
    "肥大细胞": { category: "组织类细胞", subCategory: "肥大细胞" },
    "吞噬细胞": { category: "组织类细胞", subCategory: "吞噬细胞" },
    "破骨细胞": { category: "组织类细胞", subCategory: "破骨细胞" },
    "退化细胞": { category: "组织类细胞", subCategory: "退化细胞" },
    "成骨细胞": { category: "组织类细胞", subCategory: "成骨细胞" },
    "脂肪细胞": { category: "组织类细胞", subCategory: "脂肪细胞" },
    "内皮细胞": { category: "组织类细胞", subCategory: "内皮细胞" },
    "纤维细胞": { category: "组织类细胞", subCategory: "纤维细胞" },
    
    // 中性粒细胞系统
    "原始粒细胞": { category: "中性粒细胞系统", subCategory: "原始粒细胞" },
    "早幼粒细胞": { category: "中性粒细胞系统", subCategory: "早幼粒细胞" },
    "中幼粒细胞": { category: "中性粒细胞系统", subCategory: "中幼粒细胞" },
    "晚幼粒细胞": { category: "中性粒细胞系统", subCategory: "晚幼粒细胞" },
    "杆状核中性粒细胞": { category: "中性粒细胞系统", subCategory: "杆状核" },
    "分叶核中性粒细胞": { category: "中性粒细胞系统", subCategory: "分叶核" },
    "中性粒细胞(含空泡)": { category: "中性粒细胞系统", subCategory: "分叶核" },
    
    // 嗜酸、嗜碱粒
    "嗜酸性粒细胞": { category: "嗜酸、嗜碱粒", subCategory: "嗜酸性粒细胞" },
    "嗜碱性粒细胞": { category: "嗜酸、嗜碱粒", subCategory: "嗜碱性粒细胞" },
    
    // 幼红系列
    "原始红细胞": { category: "幼红系列", subCategory: "原始红细胞" },
    "早幼红细胞": { category: "幼红系列", subCategory: "早幼红细胞" },
    "中幼红细胞": { category: "幼红系列", subCategory: "中幼红细胞" },
    "晚幼红细胞": { category: "幼红系列", subCategory: "晚幼红细胞" },
    "有核红细胞": { category: "幼红系列", subCategory: "晚幼红细胞" },
    "成熟红细胞": { category: "幼红系列", subCategory: "成熟红细胞" },
    "大红细胞": { category: "幼红系列", subCategory: "成熟红细胞" },
    "小红细胞": { category: "幼红系列", subCategory: "成熟红细胞" },
    "椭圆形和卵圆形红细胞": { category: "幼红系列", subCategory: "成熟红细胞" },
    "裂红细胞": { category: "幼红系列", subCategory: "成熟红细胞" },
    
    // 淋巴细胞系
    "原始淋巴细胞": { category: "淋巴细胞系", subCategory: "原始淋巴细胞" },
    "幼稚淋巴细胞": { category: "淋巴细胞系", subCategory: "幼稚淋巴细胞" },
    "小淋巴细胞": { category: "淋巴细胞系", subCategory: "成熟淋巴细胞" },
    "大淋巴细胞": { category: "淋巴细胞系", subCategory: "成熟淋巴细胞" },
    "反应性淋巴细胞": { category: "淋巴细胞系", subCategory: "异形淋巴细胞" },
    "浆细胞": { category: "淋巴细胞系", subCategory: "浆细胞" },
    
    // 单核细胞系
    "原始单核细胞": { category: "单核细胞系", subCategory: "原始单核细胞" },
    "幼稚单核细胞": { category: "单核细胞系", subCategory: "幼稚单核细胞" },
    "成熟单核细胞": { category: "单核细胞系", subCategory: "成熟单核细胞" },
    
    // 巨核细胞系
    "原始巨核细胞": { category: "巨核细胞系", subCategory: "原始巨核细胞" },
    "幼稚巨核细胞": { category: "巨核细胞系", subCategory: "幼稚巨核细胞" },
    "颗粒型巨核细胞": { category: "巨核细胞系", subCategory: "颗粒型巨核细胞" },
    "产板型巨核细胞": { category: "巨核细胞系", subCategory: "产板型巨核细胞" },
    "裸核型巨核细胞": { category: "巨核细胞系", subCategory: "裸核型巨核细胞" },
    "巨核细胞": { category: "巨核细胞系", subCategory: "颗粒型巨核细胞" },
    "正常血小板": { category: "巨核细胞系", subCategory: "血小板" },
    "大血小板": { category: "巨核细胞系", subCategory: "血小板" },
    "异形血小板": { category: "巨核细胞系", subCategory: "血小板" },
    "血小板聚集成簇": { category: "巨核细胞系", subCategory: "血小板" },
    
    // 其他
    "微生物": { category: "组织类细胞", subCategory: "其他" },
    "原始细胞": { category: "中性粒细胞系统", subCategory: "原始粒细胞" },
    "其他": { category: "组织类细胞", subCategory: "其他" }
  };

  // 获取细胞数量（优先使用检查单的 cell_counts - 新嵌套结构）
  const getCellCount = (cellName: string, categoryName?: string): number => {
    // 如果提供了categoryName，直接从该大类下查找子细胞
    if (categoryName && checklist?.cell_counts) {
      const categoryData = checklist.cell_counts[categoryName];
      if (categoryData && typeof categoryData === 'object' && 'sub_categories' in categoryData) {
        const subCount = categoryData.sub_categories?.[cellName];
        if (subCount !== undefined) {
          return subCount;
        }
      }
    }
    
    // 兼容旧逻辑：通过cellNameMapping查找
    const mapping = cellNameMapping[cellName];
    if (checklist?.cell_counts && mapping) {
      const categoryData = checklist.cell_counts[mapping.category];
      if (categoryData && typeof categoryData === 'object' && 'sub_categories' in categoryData) {
        const subCount = categoryData.sub_categories?.[mapping.subCategory];
        if (subCount !== undefined) {
          return subCount;
        }
      }
    }
    
    // 如果没有检查单数据，尝试从 cellStatistics 获取（兼容旧格式）
    if (cellStatistics?.cell_counts) {
      // 旧格式是扁平的 key-value
      const flatKey = cellName.toLowerCase().replace(/[()（）]/g, '').replace(/\s+/g, '_');
      if (cellStatistics.cell_counts[flatKey] !== undefined) {
        return cellStatistics.cell_counts[flatKey];
      }
    }
    
    return 0;
  };

  // 计算总细胞数（优先使用 total_cells 字段）
  const totalCells = useMemo(() => {
    // 优先使用检查单的 total_cells 字段
    if (checklist?.total_cells !== undefined) {
      return checklist.total_cells;
    }
    // 其次使用 cell_counts.total
    if (checklist?.cell_counts?.total !== undefined && typeof checklist.cell_counts.total === 'number') {
      return checklist.cell_counts.total;
    }
    // 兼容旧的 cellStatistics
    if (cellStatistics?.total_cells) {
      return cellStatistics.total_cells;
    }
    return 0;
  }, [checklist, cellStatistics]);

  // 获取大类的细胞总数
  const getCategoryCount = (categoryName: string): number => {
    if (checklist?.cell_counts) {
      const categoryData = checklist.cell_counts[categoryName];
      if (categoryData && typeof categoryData === 'object' && 'count' in categoryData) {
        return categoryData.count;
      }
    }
    return 0;
  };

  // 动态生成cellSections，基于检查单数据
  const cellSections: CellSection[] = useMemo(() => {
    const getSubCells = (categoryName: string): CellRow[] => {
      if (!checklist?.cell_counts) {
        return [];
      }

      const categoryData = checklist.cell_counts[categoryName];
      if (!categoryData || typeof categoryData !== 'object' || !('sub_categories' in categoryData)) {
        return [];
      }

      const subCategories = categoryData.sub_categories;
      if (!subCategories) {
        return [];
      }

      return Object.entries(subCategories).map(([subCellName, count]) => {
        const percentValue = totalCells > 0 ? (count / totalCells) * 100 : 0;
        const reference = subCellReferenceMap[subCellName] || "";
        
        return {
          name: subCellName,
          count: count,
          percent: percentValue,
          reference: reference,
          status: ""
        };
      }).filter(row => row.count > 0 || row.name !== "其他"); // 过滤掉数量为0的"其他"细胞
    };

    return cellCategories.map(category => ({
      id: category.id,
      title: category.title,
      categoryName: category.categoryName,
      rows: getSubCells(category.categoryName)
    }));
  }, [checklist, totalCells]);

  // 计算各系统的细胞数量（使用新的大类映射）
  const getSystemCellCount = (sectionId: string): number => {
    // 前端 section ID 到后端大类名称的映射
    const sectionToCategoryMapping: Record<string, string> = {
      "red": "幼红系列",
      "lymphocyte": "淋巴细胞系",
      "megakaryocyte": "巨核细胞系",
      "granular": "中性粒细胞系统",
      "primitive": "中性粒细胞系统", // 原始细胞归入中性粒细胞系统
      "monocyte": "单核细胞系",
      "other": "组织类细胞"
    };
    
    const categoryName = sectionToCategoryMapping[sectionId];
    if (categoryName) {
      return getCategoryCount(categoryName);
    }
    
    // 兼容旧逻辑：如果没有大类数据，则累加子类
    const section = cellSections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    return section.rows.reduce((sum, row) => {
      return sum + getCellCount(row.name);
    }, 0);
  };

  // 当页面大小改变时，调整当前页面
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
    setCurrentPage(prev => Math.min(prev, maxPage));
  }, [pageSize, totalCount]);

  // 报告确认：保存诊断分析、诊断结论和图像路径
  const handleConfirmReport = async () => {
    if (!checklist || !checklist.id) {
      alert('请先选择样本并加载检查单数据');
      return;
    }

    if (!selectedSample) {
      alert('请先选择样本');
      return;
    }

    try {
      // 将诊断分析和诊断结论合并保存到report_analysis字段
      // 格式：诊断分析\n\n诊断结论
      const reportContent = diagnosisAnalysis 
        ? (diagnosis ? `${diagnosisAnalysis}\n\n诊断结论：${diagnosis}` : diagnosisAnalysis)
        : (diagnosis ? `诊断结论：${diagnosis}` : '');
      
      const updateData: Partial<Checklist> = {
        report_analysis: reportContent || undefined,
        typical_figure_1_path: reportImages.sampleRegion?.storagePath || undefined,
        typical_figure_2_path: reportImages.markedRegion?.storagePath || undefined,
        report_date: new Date().toISOString().split('T')[0], // 报告日期
      };

      // 如果后端支持单独的诊断结论字段，可以添加
      // 这里暂时将诊断结论和诊断分析合并，或者使用report_analysis存储诊断分析，诊断结论需要后端支持新字段
      
      await updateChecklist(checklist.id, updateData);
      alert('报告确认成功！');
      
      // 重新加载检查单数据
      const updatedChecklist = await getChecklistBySampleNumber(selectedSample.sampleNumber);
      setChecklist(updatedChecklist);
    } catch (err: any) {
      console.error('报告确认失败:', err);
      alert(`报告确认失败: ${err.message || '未知错误'}`);
    }
  };

  // PDF导出功能 - 通过后端LaTeX生成
  const handleExportPDF = async () => {
    if (!selectedSample || !checklist || !checklist.checklist_number) {
      alert('请先选择样本并加载检查单数据');
      return;
    }

    try {
      // 调用后端API生成PDF
      const pdfBlob = await exportChecklistPDF(checklist.checklist_number);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const reportDate = checklist.report_date || new Date().toISOString().split('T')[0];
      link.download = `细胞形态学报告_${selectedSample.sampleNumber}_${reportDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF导出失败:', err);
      alert(`PDF导出失败: ${err.message || '未知错误'}`);
    }
  };

  const getStatusClass = (status: Sample["status"]): string => {
    switch (status) {
      case "图像已审核":
        return "status-success";
      case "报告已审核":
        return "status-info";
      default:
        return "status-pending";
    }
  };

  // 解析参考值字符串，返回最小值和最大值
  const parseReference = (reference: string): { min: number | null; max: number | null } => {
    if (!reference || reference.trim() === "" || reference === "~") {
      return { min: null, max: null };
    }

    // 处理 "0~10", "45~65" 等格式
    const rangeMatch = reference.match(/^(\d+(?:\.\d+)?)~(\d+(?:\.\d+)?)$/);
    if (rangeMatch) {
      return {
        min: parseFloat(rangeMatch[1]),
        max: parseFloat(rangeMatch[2])
      };
    }

    // 处理只有上限的情况，如 "~10"
    const maxOnlyMatch = reference.match(/^~(\d+(?:\.\d+)?)$/);
    if (maxOnlyMatch) {
      return {
        min: null,
        max: parseFloat(maxOnlyMatch[1])
      };
    }

    // 处理只有下限的情况，如 "10~"
    const minOnlyMatch = reference.match(/^(\d+(?:\.\d+)?)~$/);
    if (minOnlyMatch) {
      return {
        min: parseFloat(minOnlyMatch[1]),
        max: null
      };
    }

    return { min: null, max: null };
  };

  // 根据百分比值和参考值返回箭头状态
  const getArrowStatus = (percent: number, reference: string): "up" | "down" | null => {
    const { min, max } = parseReference(reference);
    
    // 如果没有参考值，不显示箭头
    if (min === null && max === null) {
      return null;
    }

    // 如果超过上限，显示向上箭头
    if (max !== null && percent > max) {
      return "up";
    }

    // 如果低于下限，显示向下箭头
    if (min !== null && percent < min) {
      return "down";
    }

    // 在范围内，不显示箭头
    return null;
  };

  return (
    <div className="report-analysis-page">
      <div className="report-analysis-layout">
        <aside className="sample-column report-sample-column">
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
                ) : pagedSamples.length === 0 ? (
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
                  pagedSamples.map(sample => (
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
              <span>共 {totalCount} 项数据，当前显示 {pagedSamples.length} 条</span>
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

        <main className="report-main">
          <section className="summary-card">
            <div className="summary-info">
              <span>姓名：{selectedSample?.patientName ?? "-"}</span>
              <span>性别：{selectedSample?.patientGender ?? "-"}</span>
              <span>年龄：{selectedSample?.patientAge ? `${selectedSample.patientAge}岁` : "-"}</span>
            </div>
            <div className="summary-metrics">
              <div className="metric metric-total">
                <span className="metric-label">细胞总数</span>
                <span className="metric-value">{totalCells}</span>
              </div>
              {summaryMetrics.map(metric => {
                // 直接使用大类名称获取统计数
                const categoryCount = getCategoryCount(metric.category);
                
                return (
                  <div key={metric.label} className="metric">
                    <span className="metric-label">{metric.label}</span>
                    <span className="metric-value">{categoryCount}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="cell-section-grid">
            {cellSections.map(section => {
              const categoryCount = getCategoryCount(section.categoryName);
              const categoryPercent = totalCells > 0 ? ((categoryCount / totalCells) * 100).toFixed(1) : "0";
              
              return (
                <div key={section.id} className="cell-card">
                  <div className="cell-table-wrapper">
                    <table className="cell-table">
                      <thead>
                        <tr>
                          <th className="cell-section-title" colSpan={5}>
                            {section.title} (总数: {categoryCount}, 占比: {categoryPercent}%)
                          </th>
                        </tr>
                        <tr>
                          <th>细胞名称</th>
                          <th>数量</th>
                          <th>百分比</th>
                          <th>参考值</th>
                          <th>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af' }}>
                              暂无数据
                            </td>
                          </tr>
                        ) : (
                          section.rows.map(row => {
                            const arrowStatus = getArrowStatus(row.percent, row.reference);
                            return (
                              <tr key={row.name}>
                                <td>{row.name}</td>
                                <td>{row.count}</td>
                                <td>{row.percent.toFixed(1)}%</td>
                                <td>{row.reference || "-"}</td>
                                <td>
                                  {arrowStatus === "up" && (
                                    <span className="arrow-indicator arrow-up" title="超过参考值上限">↑</span>
                                  )}
                                  {arrowStatus === "down" && (
                                    <span className="arrow-indicator arrow-down" title="低于参考值下限">↓</span>
                                  )}
                                  {arrowStatus === null && <span>-</span>}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </section>

          {/* 底部提示仅在需要时显示；默认隐藏以避免误导 */}
        </main>

        <aside className="report-sidebar">
          <div className="sidebar-card">
            <h3>诊断分析</h3>
            <textarea
              value={diagnosisAnalysis}
              onChange={event => setDiagnosisAnalysis(event.target.value)}
              placeholder="请输入诊断分析"
            />
          </div>

          <div className="sidebar-card">
            <h3>诊断结论</h3>
            <textarea
              value={diagnosis}
              onChange={event => setDiagnosis(event.target.value)}
              placeholder="请输入诊断结论"
            />
          </div>

          <div className="sidebar-card image-uploader">
            <div className="upload-section">
              <h3>样本区域图像</h3>
              {reportImages.sampleRegion ? (
                <div className="image-preview-container">
                  {imageLoading.sampleRegion && (
                    <div className="image-loading">加载中...</div>
                  )}
                  <img 
                    src={reportImages.sampleRegion.url} 
                    alt="样本区域图像" 
                    className="preview-image"
                    onLoad={() => setImageLoading(prev => ({ ...prev, sampleRegion: false }))}
                    onError={() => {
                      setImageLoading(prev => ({ ...prev, sampleRegion: false }));
                      console.error('图片加载失败:', reportImages.sampleRegion?.url);
                    }}
                    style={{ display: imageLoading.sampleRegion ? 'none' : 'block' }}
                  />
                  <div className="image-controls">
                    <button 
                      type="button" 
                      className="change-image-btn"
                      onClick={() => {
                        // 切换到下一张图片
                        const currentIndex = availableImages.sampleRegions.findIndex(
                          img => img.storagePath === reportImages.sampleRegion?.storagePath
                        );
                        console.log('当前图片索引:', currentIndex, '总数量:', availableImages.sampleRegions.length);
                        const nextIndex = currentIndex >= 0 && currentIndex < availableImages.sampleRegions.length - 1
                          ? currentIndex + 1
                          : 0; // 循环到第一张
                        console.log('下一张图片索引:', nextIndex);
                        if (availableImages.sampleRegions[nextIndex]) {
                          setImageLoading(prev => ({ ...prev, sampleRegion: true }));
                          setReportImages(prev => ({
                            ...prev,
                            sampleRegion: {
                              url: availableImages.sampleRegions[nextIndex].url,
                              storagePath: availableImages.sampleRegions[nextIndex].storagePath
                            }
                          }));
                        }
                      }}
                      disabled={availableImages.sampleRegions.length <= 1}
                      title={availableImages.sampleRegions.length <= 1 ? '只有一张图片，无法切换' : `点击切换到下一张（共${availableImages.sampleRegions.length}张）`}
                    >
                      切换图片 ({availableImages.sampleRegions.length}张)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-tile">暂无图片</div>
              )}
            </div>
            <div className="upload-section">
              <h3>标记后的区域图像</h3>
              {reportImages.markedRegion ? (
                <div className="image-preview-container">
                  {imageLoading.markedRegion && (
                    <div className="image-loading">加载中...</div>
                  )}
                  <img 
                    src={reportImages.markedRegion.url} 
                    alt="标记后的区域图像" 
                    className="preview-image"
                    onLoad={() => setImageLoading(prev => ({ ...prev, markedRegion: false }))}
                    onError={() => {
                      setImageLoading(prev => ({ ...prev, markedRegion: false }));
                      console.error('图片加载失败:', reportImages.markedRegion?.url);
                    }}
                    style={{ display: imageLoading.markedRegion ? 'none' : 'block' }}
                  />
                  <div className="image-controls">
                    <button 
                      type="button" 
                      className="change-image-btn"
                      onClick={() => {
                        // 切换到下一张图片
                        const currentIndex = availableImages.markedRegions.findIndex(
                          img => img.storagePath === reportImages.markedRegion?.storagePath
                        );
                        console.log('当前标记图片索引:', currentIndex, '总数量:', availableImages.markedRegions.length);
                        const nextIndex = currentIndex >= 0 && currentIndex < availableImages.markedRegions.length - 1
                          ? currentIndex + 1
                          : 0; // 循环到第一张
                        console.log('下一张标记图片索引:', nextIndex);
                        if (availableImages.markedRegions[nextIndex]) {
                          setImageLoading(prev => ({ ...prev, markedRegion: true }));
                          setReportImages(prev => ({
                            ...prev,
                            markedRegion: {
                              url: availableImages.markedRegions[nextIndex].url,
                              storagePath: availableImages.markedRegions[nextIndex].storagePath
                            }
                          }));
                        }
                      }}
                      disabled={availableImages.markedRegions.length <= 1}
                      title={availableImages.markedRegions.length <= 1 ? '只有一张图片，无法切换' : `点击切换到下一张（共${availableImages.markedRegions.length}张）`}
                    >
                      切换图片 ({availableImages.markedRegions.length}张)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-tile">暂无图片</div>
              )}
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="confirm-btn" onClick={handleConfirmReport}>报告确认</button>
            <button className="export-btn" onClick={handleExportPDF}>报告导出</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReportAnalysis;

