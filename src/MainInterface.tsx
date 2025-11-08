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
    { key: '样本', label: '样本', icon: '🧪' },
    { key: '图像管理', label: '图像管理', icon: '📊' },
    { key: '图像分析', label: '图像分析', icon: '🔬' },
    { key: '报告分析', label: '报告分析', icon: '📋' }
  ];



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
              <span className="tab-icon">{tab.icon}</span>
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
