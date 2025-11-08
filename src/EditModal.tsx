import React, { useState, useEffect } from 'react';
import './EditModal.css';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  users?: Array<{ id: number; name: string; role: string }>;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData, users = [] }) => {
  const [formData, setFormData] = useState({
    sampleNumber: '1200542',
    patientName: '张三',
    patientGender: '男',
    patientAge: '60',
    ageType: '岁',
    admissionNumber: '',
    patientNumber: '',
    bedNumber: '',
    department: '检验科1',
    doctor: '',
    sampleType: '血涂片',
    scanMethod: '区域扫描',
    markStatus: '已标记',
    reviewStatus: '已审核',
    reviewDoctor: '',
    submissionDate: '',
    startDate: '',
    endDate: ''
  });

  const [activeTab, setActiveTab] = useState('患者信息');

  // Sample data for the table
  const [sampleData] = useState([
    {
      id: 1,
      scanMethod: '区域扫描',
      markStatus: '已标记',
      sampleType: '血涂本',
      submissionDate: '2025年9月23日',
      patientName: '张三',
      sampleNumber: '250725114944020',
      reviewStatus: '图像已审核'
    },
    {
      id: 2,
      scanMethod: '区域扫描',
      markStatus: '已标记',
      sampleType: '血涂本',
      submissionDate: '2025年9月23日',
      patientName: '李四',
      sampleNumber: '250725114944020',
      reviewStatus: '图像已审核'
    },
    {
      id: 3,
      scanMethod: '区域扫描',
      markStatus: '已标记',
      sampleType: '血涂本',
      submissionDate: '2025年9月23日',
      patientName: '王五',
      sampleNumber: '250725114944020',
      reviewStatus: '图像已审核'
    },
    {
      id: 4,
      scanMethod: '区域扫描',
      markStatus: '已标记',
      sampleType: '血涂本',
      submissionDate: '2025年9月23日',
      patientName: '李四',
      sampleNumber: '250725114944020',
      reviewStatus: '报告已审核'
    },
    {
      id: 5,
      scanMethod: '区域扫描',
      markStatus: '已标记',
      sampleType: '血涂本',
      submissionDate: '2025年9月23日',
      patientName: '李四',
      sampleNumber: '250725114944020',
      reviewStatus: '未审核'
    }
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        sampleNumber: initialData.sampleNumber || '',
        patientName: initialData.patientName || '',
        patientGender: initialData.patientGender || '',
        patientAge: initialData.patientAge || '',
        ageType: initialData.ageType || '岁',
        admissionNumber: initialData.admissionNumber || '',
        patientNumber: initialData.patientNumber || '',
        bedNumber: initialData.bedNumber || '',
        department: initialData.department || '检验科',
        doctor: initialData.doctor || '',
        sampleType: initialData.sampleType || '血涂本',
        scanMethod: initialData.scanMethod || '常规扫描',
        markStatus: initialData.markStatus || '未标记',
        reviewStatus: initialData.reviewStatus || '未审核',
        reviewDoctor: initialData.reviewDoctor || '',
        submissionDate: initialData.submissionDate || '',
        startDate: '',
        endDate: ''
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case '图像已审核':
        return <span className="status-tag success">图像已审核</span>;
      case '报告已审核':
        return <span className="status-tag info">报告已审核</span>;
      case '未审核':
        return <span className="status-tag default">未审核</span>;
      default:
        return <span className="status-tag default">{status}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <div className="section-icon">📋</div>
            <h3 className="modal-title">基本信息</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <div 
            className={`tab-item ${activeTab === '患者信息' ? 'active' : ''}`}
            onClick={() => setActiveTab('患者信息')}
          >
            患者信息
          </div>
          <div 
            className={`tab-item ${activeTab === '医生信息' ? 'active' : ''}`}
            onClick={() => setActiveTab('医生信息')}
          >
            医生信息
          </div>
        </div>

        {/* Main Content */}
        <div className="modal-content">
          {activeTab === '患者信息' && (
            <div className="patient-info-section">
              {/* Read-only info section */}
              <div className="readonly-info">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">扫描方式</span>
                    <span className="info-value">{formData.scanMethod}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">标记状态</span>
                    <span className="info-value">{formData.markStatus}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">样本类型</span>
                    <span className="info-value">{formData.sampleType}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">审核状态</span>
                    <span className="info-value">{formData.reviewStatus}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">样本标号</span>
                    <span className="info-value">{formData.sampleNumber}</span>
                  </div>
                </div>
              </div>

              {/* Editable patient details */}
              <div className="editable-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">序号</label>
                    <input type="text" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">患者姓名</label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => handleInputChange('patientName', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">患者编号</label>
                    <input type="text" className="form-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">患者性别</label>
                    <select
                      value={formData.patientGender}
                      onChange={(e) => handleInputChange('patientGender', e.target.value)}
                      className="form-select"
                    >
                      <option value="">请选择</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">患者年龄</label>
                    <input
                      type="text"
                      value={formData.patientAge}
                      onChange={(e) => handleInputChange('patientAge', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">年龄类别</label>
                    <select
                      value={formData.ageType}
                      onChange={(e) => handleInputChange('ageType', e.target.value)}
                      className="form-select"
                    >
                      <option value="">请选择</option>
                      <option value="岁">岁</option>
                      <option value="月">月</option>
                      <option value="天">天</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">住院号</label>
                    <input
                      type="text"
                      value={formData.admissionNumber}
                      onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">送检科室</label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="form-select"
                    >
                      <option value="">请选择</option>
                      <option value="检验科1">检验科1</option>
                      <option value="血液科">血液科</option>
                      <option value="急诊科">急诊科</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === '医生信息' && (
            <div className="doctor-info-section">
              {/* Read-only info section */}
              <div className="readonly-info">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">扫描方式</span>
                    <span className="info-value">{formData.scanMethod}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">标记状态</span>
                    <span className="info-value">{formData.markStatus}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">样本类型</span>
                    <span className="info-value">{formData.sampleType}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">审核状态</span>
                    <span className="info-value">{formData.reviewStatus}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">样本标号</span>
                    <span className="info-value">{formData.sampleNumber}</span>
                  </div>
                </div>
              </div>

              {/* Editable doctor details */}
              <div className="editable-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">检验医生</label>
                    <select
                      value={formData.doctor}
                      onChange={(e) => handleInputChange('doctor', e.target.value)}
                      className="form-select"
                    >
                      <option value="">请选择</option>
                      {users.map(user => (
                        <option key={user.id} value={user.name}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">审核医生</label>
                    <select
                      value={formData.reviewDoctor}
                      onChange={(e) => handleInputChange('reviewDoctor', e.target.value)}
                      className="form-select"
                    >
                      <option value="">请选择</option>
                      {users.map(user => (
                        <option key={user.id} value={user.name}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleCancel}>
            取消
          </button>
          <button className="btn-save" onClick={handleSave}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
