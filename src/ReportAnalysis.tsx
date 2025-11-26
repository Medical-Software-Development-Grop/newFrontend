import React, { useMemo, useState, useEffect } from "react";
import "./ReportAnalysis.css";
import { getSmears, Smear } from "./api/smear";
import { getCellStatistics, CellStatistics } from "./api/cellClassification";
import { getChecklistBySampleNumber, Checklist, CellCounts } from "./api/checklist";

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
  count: string;
  percent: string;
  reference: string;
  status: string;
}

interface CellSection {
  id: string;
  title: string;
  rows: CellRow[];
}


const cellSections: CellSection[] = [
  {
    id: "red",
    title: "红细胞系统",
    rows: [
      { name: "微生物", count: "0", percent: "0%", reference: "1~2", status: "" },
      { name: "成熟红细胞", count: "0", percent: "0%", reference: "~", status: "" },
      { name: "大红细胞", count: "0", percent: "0%", reference: "0~10", status: "" },
      { name: "小红细胞", count: "0", percent: "0%", reference: "0~4", status: "" },
      { name: "椭圆形和卵圆形红细胞", count: "0", percent: "0%", reference: "0~1", status: "" },
      { name: "裂红细胞", count: "0", percent: "0%", reference: "0~1", status: "" },
      { name: "有核红细胞", count: "0", percent: "0%", reference: "0~1", status: "" }
    ]
  },
  {
    id: "lymphocyte",
    title: "淋巴细胞系统",
    rows: [
      { name: "小淋巴细胞", count: "0", percent: "0%", reference: "0~40", status: "" },
      { name: "大淋巴细胞", count: "0", percent: "0%", reference: "0~5", status: "" },
      { name: "反应性淋巴细胞", count: "0", percent: "0%", reference: "0~5", status: "" },
      { name: "浆细胞", count: "0", percent: "0%", reference: "0~5", status: "" }
    ]
  },
  {
    id: "megakaryocyte",
    title: "巨核细胞及血小板",
    rows: [
      { name: "正常血小板", count: "0", percent: "0%", reference: "1~100", status: "" },
      { name: "大血小板", count: "0", percent: "0%", reference: "0~9", status: "" },
      { name: "异形血小板", count: "0", percent: "0%", reference: "0~9", status: "" },
      { name: "血小板聚集成簇", count: "0", percent: "0%", reference: "0~9", status: "" },
      { name: "巨核细胞", count: "0", percent: "0%", reference: "0~9", status: "" }
    ]
  },
  {
    id: "granular",
    title: "粒细胞系统",
    rows: [
      { name: "早幼粒细胞", count: "0", percent: "0%", reference: "0~2", status: "" },
      { name: "中幼粒细胞", count: "0", percent: "0%", reference: "0~8", status: "" },
      { name: "杆状核中性粒细胞", count: "0", percent: "0%", reference: "45~65", status: "" },
      { name: "分叶核中性粒细胞", count: "0", percent: "0%", reference: "0~5", status: "" },
      { name: "嗜酸性粒细胞", count: "0", percent: "0%", reference: "0~5", status: "" },
      { name: "嗜碱性粒细胞", count: "0", percent: "0%", reference: "0~5", status: "" },
      { name: "中性粒细胞(含空泡)", count: "0", percent: "0%", reference: "0~5", status: "" }
    ]
  },
  {
    id: "primitive",
    title: "原始细胞系统",
    rows: [
      { name: "原始细胞", count: "0", percent: "0%", reference: "", status: "" }
    ]
  },
  {
    id: "monocyte",
    title: "单核细胞系统",
    rows: [
      { name: "成熟单核细胞", count: "0", percent: "0%", reference: "0~7", status: "" }
    ]
  },
  {
    id: "other",
    title: "其他细胞",
    rows: [
      { name: "其他", count: "0", percent: "0%", reference: "", status: "" }
    ]
  }
];

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
  const [conclusionTemplate, setConclusionTemplate] = useState<string>("请选择模板");
  const [remarkTemplate, setRemarkTemplate] = useState<string>("请选择模板");
  const [diagnosis, setDiagnosis] = useState<string>("");
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
  const getCellCount = (cellName: string): number => {
    const mapping = cellNameMapping[cellName];
    
    // 尝试从检查单的新嵌套结构获取
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
            {cellSections.map(section => (
              <div key={section.id} className="cell-card">
                <div className="cell-table-wrapper">
                  <table className="cell-table">
                    <thead>
                      <tr>
                        <th className="cell-section-title">{section.title}</th>
                        <th>数量</th>
                        <th>百分比</th>
                        <th>参考值</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map(row => {
                        const cellCount = getCellCount(row.name);
                        const percent = totalCells > 0 ? ((cellCount / totalCells) * 100).toFixed(1) : "0";
                        return (
                          <tr key={row.name}>
                            <td>{row.name}</td>
                            <td>{cellCount}</td>
                            <td>{percent}%</td>
                            <td>{row.reference}</td>
                            <td>{row.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          {/* 底部提示仅在需要时显示；默认隐藏以避免误导 */}
        </main>

        <aside className="report-sidebar">
          <div className="sidebar-card">
            <h3>结论模板</h3>
            <select value={conclusionTemplate} onChange={event => setConclusionTemplate(event.target.value)}>
              <option value="请选择模板">请选择模板</option>
              <option value="模板A">模板A</option>
              <option value="模板B">模板B</option>
              <option value="模板C">模板C</option>
            </select>
            <h3>结论模板</h3>
            <textarea
              value={remarkTemplate}
              onChange={event => setRemarkTemplate(event.target.value)}
              placeholder="请输入结论模板"
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
              <h3>红细胞报告图像</h3>
              <button type="button" className="upload-tile">点击上传图片</button>
            </div>
            <div className="upload-section">
              <h3>血小板报告图像</h3>
              <button type="button" className="upload-tile">点击上传图片</button>
            </div>
            <div className="upload-section">
              <h3>镜下所见</h3>
              <button type="button" className="upload-tile">点击上传图片</button>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="confirm-btn">报告确认</button>
            <button className="export-btn">报告导出</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReportAnalysis;

