import React, { useMemo, useState, useEffect } from "react";
import "./ReportAnalysis.css";
import { getSmears, Smear } from "./api/smear";
import { getCellStatistics, CellStatistics } from "./api/cellClassification";

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
  { label: "红细胞系统", value: "0" },
  { label: "巨核细胞及血小板", value: "0" },
  { label: "粒细胞系统", value: "0" },
  { label: "单核细胞系统", value: "0" },
  { label: "原始细胞系统", value: "0" },
  { label: "其他细胞", value: "0" }
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

  // 加载选中样本的细胞统计信息
  useEffect(() => {
    const loadCellStatistics = async () => {
      if (!selectedSampleId) return;
      
      const selectedSample = samples.find(s => s.id === selectedSampleId);
      if (!selectedSample) return;

      try {
        // 获取样本的完整信息
        const smearResponse = await getSmears({
          skip: 0,
          limit: 1000,
          sample_number: selectedSample.sampleNumber,
        });

        if (smearResponse.items.length === 0) {
          setCellStatistics(null);
          return;
        }

        const smear = smearResponse.items[0];
        
        // 确保smear.id存在
        if (!smear.id) {
          console.warn(`样本 ${selectedSample.sampleNumber} 没有id字段，无法加载细胞统计数据`);
          setCellStatistics(null);
          return;
        }
        
        const stats = await getCellStatistics(smear.id);
        setCellStatistics(stats);
      } catch (err: any) {
        console.error('加载细胞统计信息失败:', err);
        setCellStatistics(null);
      }
    };

    loadCellStatistics();
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
                <span className="metric-value">{cellStatistics?.total_cells ?? 0}</span>
              </div>
              {summaryMetrics.map(metric => {
                // 根据细胞统计数据更新指标值（这里简化处理，实际可能需要根据cell_counts映射）
                const cellCount = cellStatistics?.cell_counts ? 
                  Object.values(cellStatistics.cell_counts).reduce((sum: number, count: number) => sum + count, 0) / 6 : 
                  0;
                return (
                  <div key={metric.label} className="metric">
                    <span className="metric-label">{metric.label}</span>
                    <span className="metric-value">{cellStatistics ? Math.round(cellCount) : "0"}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="cell-section-grid">
            {cellSections.map(section => (
              <div key={section.id} className="cell-card">
                <header className="cell-card-header">
                  <h3>{section.title}</h3>
                </header>
                <div className="cell-table-wrapper">
                  <table className="cell-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>数量</th>
                        <th>百分比</th>
                        <th>参考值</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map(row => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>{row.count}</td>
                          <td>{row.percent}</td>
                          <td>{row.reference}</td>
                          <td>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <div className="report-footer-note">定位相机初始化失败</div>
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

