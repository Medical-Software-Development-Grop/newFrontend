import React, { useState } from 'react';
import SampleEdit from './SampleEdit';
import ScanManagement from './ScanManagement';
import ImageAnalysis from './ImageAnalysis';
import ReportAnalysis from './ReportAnalysis';
import './MainInterface.css';

interface MainInterfaceProps {
  onLogout?: () => void;
}

const MainInterface: React.FC<MainInterfaceProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('样本');

  const tabs = [
    { key: '样本', label: '样本' },
    { key: '图像管理', label: '图像管理' },
    { key: '图像分析', label: '图像分析' },
    { key: '报告分析', label: '报告分析' }
  ];

  const renderTabIcon = (key: string) => {
    const commonProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" };
    const stroke = "#2563eb";
    switch (key) {
      case '样本':
        return (
          <svg {...commonProps}>
            <path d="M6 3h12M6 8h12M6 13h12M6 18h12" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case '图像管理':
        return (
          <svg {...commonProps}>
            <rect x="4" y="4" width="16" height="16" rx="2" stroke={stroke} strokeWidth="2"/>
            <path d="M7 15l3-3 3 3 4-4" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '图像分析':
        return (
          <svg {...commonProps}>
            <circle cx="11" cy="11" r="6" stroke={stroke} strokeWidth="2"/>
            <path d="M16 16l4 4" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case '报告分析':
      default:
        return (
          <svg {...commonProps}>
            <path d="M8 4h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke={stroke} strokeWidth="2" fill="none"/>
            <path d="M12 12h6M12 16h6M8 12h2M8 16h2" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };



  return (
    <div className="main-interface">
      {/* 顶部标题栏 */}
      <div className="top-header">
        <div className="system-title">
          <span className="title-text">骨髓血细胞智能分析系统</span>
        </div>
        
        {/* 标签页导航 - 放在中间 */}
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-icon">{renderTabIcon(tab.key)}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="header-actions">
          <div className="header-icons">
            <div className="icon-item help-icon">
              <span className="icon">❓</span>
            </div>
            <div className="user-section">
              <div className="user-info">
                <span className="user-avatar">👤</span>
                <div className="user-details">
                  <span className="username">管理员</span>
                  <span className="chevron-down">▼</span>
                </div>
              </div>
              <div className="icon-item setting-icon">
                <span className="icon">⚙</span>
              </div>
            </div>
          </div>
          <div className="notification-badge">2</div>
          {onLogout && (
            <button 
              onClick={onLogout}
              style={{
                marginLeft: '16px',
                padding: '4px 12px',
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              退出登录
            </button>
          )}
        </div>
      </div>

        {/* 内容包装器 */}
        <div className="content-wrapper">
          {activeTab === '样本' && <SampleEdit />}
          {activeTab === '图像管理' && <ScanManagement />}
          {activeTab === '图像分析' && <ImageAnalysis />}
          {activeTab === '报告分析' && <ReportAnalysis />}
        </div>
    </div>
  );
};

export default MainInterface;
