import React, { useState, useRef } from "react";
import "./ScanManagement.css";
import { uploadImages, batchInfer, processSamplePipeline } from "./api/image";
import { getSmears } from "./api/smear";
import { API_BASE_URL, getUploadHeaders } from "./api/config";

interface TableData {
  id: number;
  slotCode: string;
  slideType: string;
  scanMode: string;
  cellCount: string;
  focusDensity: string;
  brightness: string;
  barcodeType: string;
  imageQuality: string;
  oilApplied: string;
  scanOrder: string;
}

const ScanManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(21);
  const [selectedNavItem, setSelectedNavItem] = useState("实时扫描");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const tableData: TableData[] = [
    {
      id: 1,
      slotCode: "A01-01",
      slideType: "血涂片",
      scanMode: "自动扫描",
      cellCount: "450",
      focusDensity: "中",
      brightness: "45 / 60",
      barcodeType: "一维码",
      imageQuality: "优",
      oilApplied: "是",
      scanOrder: "01"
    },
    {
      id: 2,
      slotCode: "A01-02",
      slideType: "骨髓片",
      scanMode: "区域扫描",
      cellCount: "520",
      focusDensity: "高",
      brightness: "48 / 60",
      barcodeType: "二维码",
      imageQuality: "良",
      oilApplied: "否",
      scanOrder: "02"
    },
    {
      id: 3,
      slotCode: "A01-03",
      slideType: "血涂片",
      scanMode: "快速扫描",
      cellCount: "496",
      focusDensity: "中",
      brightness: "44 / 60",
      barcodeType: "二维码",
      imageQuality: "待复检",
      oilApplied: "是",
      scanOrder: "03"
    },
    ...Array.from({ length: 18 }, (_, index) => {
      const id = index + 4;
      const quality = index % 3 === 0 ? "优" : index % 3 === 1 ? "良" : "待复检";
      return {
        id,
        slotCode: `A02-${id.toString().padStart(2, "0")}`,
        slideType: index % 2 === 0 ? "血涂片" : "骨髓片",
        scanMode: index % 2 === 0 ? "自动扫描" : "区域扫描",
        cellCount: (480 + (index % 6) * 8).toString(),
        focusDensity: index % 2 === 0 ? "中" : "高",
        brightness: `${44 + (index % 5)} / 60`,
        barcodeType: index % 2 === 0 ? "一维码" : "二维码",
        imageQuality: quality,
        oilApplied: index % 2 === 0 ? "是" : "否",
        scanOrder: id.toString().padStart(2, "0")
      };
    })
  ];

  const totalItems = 101;
  const totalPages = Math.ceil(totalItems / pageSize);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(group => group !== groupName)
        : [...prev, groupName]
    );
  };

  const getQualityClass = (quality: string) => {
    switch (quality) {
      case "优":
        return "success";
      case "良":
        return "processing";
      case "待复检":
        return "pending";
      default:
        return "default";
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [patientFiles, setPatientFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const patientFileInputRef = useRef<HTMLInputElement>(null);
  const [sampleNumber, setSampleNumber] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'patient') => {
    const files = Array.from(event.target.files || []);
    if (type === 'image') {
      setUploadedFiles(files);
    } else {
      setPatientFiles(files);
    }
  };

  const handleUpload = async (type: 'image' | 'patient') => {
    const files = type === 'image' ? uploadedFiles : patientFiles;
    if (files.length === 0) {
      alert('请先选择文件');
      return;
    }

    try {
      if (type === 'image') {
        if (!sampleNumber) {
          alert('请先输入样本编号');
          return;
        }
        await uploadImages(sampleNumber, files);
        alert('上传成功');
        setUploadedFiles([]);
        
        // 触发自定义事件，通知其他界面刷新数据
        window.dispatchEvent(new CustomEvent('imageUploadSuccess', { 
          detail: { sampleNumber, fileCount: files.length } 
        }));
      } else {
        // 处理病人信息文件上传（Excel导入）
        // 只上传第一个文件（后端接口只接受单个文件）
        if (files.length === 0) {
          alert('请先选择文件');
          return;
        }

        const formData = new FormData();
        formData.append('file', files[0]); // 只上传第一个文件

        const response = await fetch(`${API_BASE_URL}/api/excel/import/patients`, {
          method: 'POST',
          headers: getUploadHeaders(),
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('401 Unauthorized - 请重新登录');
          }
          const error = await response.json().catch(() => ({ detail: '上传失败' }));
          throw new Error(error.detail || '上传失败');
        }

        const result = await response.json();
        
        // 显示详细的导入结果
        let message = `上传成功！`;
        if (result.created_count !== undefined && result.updated_count !== undefined) {
          message += `\n新建: ${result.created_count} 条`;
          message += `\n更新: ${result.updated_count} 条`;
        } else {
          message += `处理了 ${result.imported_count || 0} 条记录`;
        }
        if (result.error_count > 0) {
          message += `\n错误: ${result.error_count} 条`;
        }
        
        alert(message);
        setPatientFiles([]);
        
        // 如果存在错误，在控制台显示
        if (result.errors && result.errors.length > 0) {
          console.warn('导入错误:', result.errors);
        }
        
        // 触发自定义事件，通知样本列表组件刷新
        window.dispatchEvent(new CustomEvent('excelImportSuccess', { 
          detail: { importedCount: result.imported_count || 0 } 
        }));
      }
    } catch (err: any) {
      alert(err.message || '上传失败');
    }
  };

  const handleAnalysis = async () => {
    if (isAnalyzing) return;
    
    if (uploadedFiles.length === 0) {
      alert('请先上传图片');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // 模拟分析进度
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          const increment = Math.random() * 15;
          const newProgress = prev + increment;
          
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 200);

      // 调用API进行图像分析
      const result = await batchInfer(uploadedFiles);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        alert(`分析完成！共分析 ${result.total_images || uploadedFiles.length} 张图片`);
      }, 500);
    } catch (err: any) {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      alert(err.message || '分析失败');
    }
  };

  const renderContent = () => {
    if (selectedNavItem === "实时扫描") {
      return (
        <div className="realtime-scanning-container">
          <div className="upload-sections-row">
            {/* 病人信息上传 - Left Column */}
            <div className="patient-upload-section">
              <div className="upload-title">病人信息上传</div>
              
              {/* Single File Upload */}
              <div className="single-upload-section">
                <div className="file-input-container">
                  <input 
                    type="text" 
                    className="file-input" 
                    placeholder={patientFiles.length > 0 ? `${patientFiles.length} 个文件已选择` : "还未选择文件"} 
                    readOnly 
                  />
                  <input
                    type="file"
                    ref={patientFileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e, 'patient')}
                    multiple
                  />
                  <button 
                    className="upload-file-btn"
                    onClick={() => patientFileInputRef.current?.click()}
                  >
                    选择文件
                  </button>
                </div>
              </div>

              {/* 批量上传（移除） */}
            </div>

            {/* 图片上传 - Right Column */}
            <div className="image-upload-section">
              <div className="upload-title">图片上传</div>
              
              {/* Single Image Upload */}
              <div className="single-upload-section">
                <div className="file-input-container">
                  <input 
                    type="text" 
                    className="file-input" 
                    placeholder={uploadedFiles.length > 0 ? `${uploadedFiles.length} 张图片已选择` : "还未选择图片"} 
                    readOnly 
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'image')}
                    multiple
                  />
                  <button 
                    className="upload-file-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    选择图片
                  </button>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="样本编号"
                    value={sampleNumber}
                    onChange={(e) => setSampleNumber(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      width: '200px'
                    }}
                  />
                </div>
              </div>

              {/* 批量上传（移除） */}
            </div>
          </div>

          {/* 智能分析按钮 - Bottom */}
          <div className="analysis-section">
            <button 
              className={`analysis-button ${isAnalyzing ? 'analyzing' : ''}`}
              onClick={handleAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="analysis-progress">
                  <div className="progress-text">分析中... {Math.round(Math.min(analysisProgress, 100))}%</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(analysisProgress, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                '智能分析'
              )}
            </button>
          </div>
        </div>
      );
    }

    if (selectedNavItem === "玻片管理") {
      return (
        <>
          {/* Scan Information Card */}
        <div className="scan-info-card">
          <div className="scan-info-header">
            <div className="scan-info-title">
              <div className="scan-info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="scan-info-title-text">扫描信息</span>
            </div>
          </div>
          <div className="scan-info-metrics">
            <div className="metric-item">
              <span className="metric-label">需扫描玻片总数</span>
              <span className="metric-value">0</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">已扫描玻片数</span>
              <span className="metric-value">0</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">扫描失败玻片数</span>
              <span className="metric-value">0</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">当前扫描位置</span>
              <span className="metric-value"> </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">扫描模式</span>
              <span className="metric-value">自动</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">允许样本重复扫描</span>
              <span className="metric-value">不允许</span>
            </div>
          </div>
        </div>

        <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>仓号/玻片号</th>
                  <th>玻片类型</th>
                  <th>扫描方式</th>
                  <th>细胞数量</th>
                  <th>对焦密度</th>
                  <th>对焦/扫描亮度</th>
                  <th>条码类型</th>
                  <th>图形质量</th>
                  <th>是否滴油</th>
                  <th>扫描顺序</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={index === selectedRowIndex ? "highlighted" : ""}
                    onClick={() => setSelectedRowIndex(index)}
                  >
                    <td>{row.slotCode}</td>
                    <td>{row.slideType}</td>
                    <td>{row.scanMode}</td>
                    <td>{row.cellCount}</td>
                    <td>{row.focusDensity}</td>
                    <td>{row.brightness}</td>
                    <td>{row.barcodeType}</td>
                    <td>
                      <span className={`status-tag ${getQualityClass(row.imageQuality)}`}>
                        {row.imageQuality}
                      </span>
                    </td>
                    <td>{row.oilApplied}</td>
                    <td>{row.scanOrder}</td>
                    <td>
                      <button className="action-btn small">查看</button>
                      <button className="action-btn small">重新扫描</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        <div className="pagination-area">
          <div className="pagination-info">
            <span>共 {totalItems} 项数据</span>
          </div>
          <div className="pagination-controls">
            <div className="page-size-selector">
              <select
                value={pageSize}
                onChange={event => setPageSize(Number(event.target.value))}
                className="page-size-select"
              >
                <option value={10}>10 条/页</option>
                <option value={21}>21 条/页</option>
                <option value={50}>50 条/页</option>
                <option value={100}>100 条/页</option>
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
      </>
    );
    }

    // 默认返回实时扫描页面
    return (
      <div className="realtime-scanning-container">
        <div className="upload-sections-row">
          {/* 病人信息上传 - Left Column */}
          <div className="patient-upload-section">
            <div className="upload-title">病人信息上传</div>
            
            {/* Single File Upload */}
            <div className="single-upload-section">
              <div className="file-input-container">
                <input 
                  type="text" 
                  className="file-input" 
                  placeholder="还未选择文件" 
                  readOnly 
                />
                <button className="upload-file-btn">上传文件</button>
              </div>
            </div>

            {/* Batch Upload */}
            <div className="batch-upload-section">
              <div className="batch-title">批量上传病人信息</div>
              
              <div className="upload-controls">
                <button className="upload-button">
                  选择文件
                </button>
                <div className="upload-tips">
                  支持批量上传文件，文件格式不限，最多只能上传 5 份文件
                </div>
              </div>

              <div className="file-table">
                <div className="table-header">
                  <div className="header-cell">文件名</div>
                  <div className="header-cell">大小</div>
                  <div className="header-cell">状态</div>
                  <div className="header-cell">操作</div>
                </div>
                
                <div className="file-dragger">
                  <div className="dragger-text">
                    点击上方"选择文件"或将文件拖拽到此区域
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button className="cancel-button">取消上传</button>
                <button className="upload-submit-button" disabled>点击上传</button>
              </div>
            </div>
          </div>

          {/* 图片上传 - Right Column */}
          <div className="image-upload-section">
            <div className="upload-title">图片上传</div>
            
            {/* Single Image Upload */}
            <div className="single-upload-section">
              <div className="file-input-container">
                <input 
                  type="text" 
                  className="file-input" 
                  placeholder="还未选择图片" 
                  readOnly 
                />
                <button className="upload-file-btn">上传图片</button>
              </div>
            </div>

            {/* Batch Image Upload */}
            <div className="batch-upload-section">
              <div className="batch-title">批量上传图片</div>
              
              <div className="upload-controls">
                <button className="upload-button">
                  选择文件
                </button>
                <div className="upload-tips">
                  支持批量上传文件，文件格式不限，最多只能上传 5 份文件
                </div>
              </div>

              <div className="file-dragger">
                <div className="dragger-text">
                  点击上方"选择文件"或将文件拖拽到此区域
                </div>
              </div>

              <div className="button-group">
                <button className="cancel-button">取消上传</button>
                <button className="upload-submit-button" disabled>点击上传</button>
              </div>
            </div>
          </div>
        </div>

        {/* 智能分析按钮 - Bottom */}
        <div className="analysis-section">
          <button 
            className={`analysis-button ${isAnalyzing ? 'analyzing' : ''}`}
            onClick={handleAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <div className="analysis-progress">
                <div className="progress-text">分析中... {Math.round(Math.min(analysisProgress, 100))}%</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(analysisProgress, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              '智能分析'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="scan-management">
      <div className="sidebar">
        <div className="scan-title">
          <span>图像管理</span>
        </div>

        <div className="nav-group">
          <div
            className={`nav-group-header ${selectedNavItem === "实时扫描" ? "active" : ""}`}
            onClick={() => setSelectedNavItem("实时扫描")}
          >
            <div className="nav-group-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L15 7H12V13H8V7H5L10 2Z" fill="currentColor" />
              </svg>
            </div>
            <span className="nav-group-title">实时扫描</span>
          </div>
        </div>

        <div className="nav-group">
          <div
            className={`nav-group-header ${selectedNavItem === "玻片管理" ? "active" : ""}`}
            onClick={() => setSelectedNavItem("玻片管理")}
          >
            <div className="nav-group-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 5H16V15C16 15.5523 15.5523 16 15 16H5C4.44772 16 4 15.5523 4 15V5Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 4V2H13V4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="nav-group-title">玻片管理</span>
          </div>
        </div>
      </div>

      <div className="content-area">{renderContent()}</div>
    </div>
  );
};

export default ScanManagement;
