import React from 'react';
import './Loading.css';

const Loading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="login2-frame">
        <div className="background-image">
          {/* 背景图片区域 */}
        </div>
        <div className="white-rectangle">
          {/* 白色底部区域 */}
        </div>
      </div>
      <div className="loading-text">
        正在初始化系统，请稍等......
      </div>
    </div>
  );
};

export default Loading;