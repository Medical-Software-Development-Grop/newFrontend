import React, { useState } from 'react';
import './Login.css';
import { login } from './api/auth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      await login({ doctor_number: username, password });
      onLogin();
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      {/* 左侧区域 - 3D图标和背景 */}
      <div className="login-left-section">
        {/* Union渐变背景 */}
        <div className="union-gradient"></div>
        {/* 网格背景 */}
        <div className="grid-background">
          <div className="grid-union"></div>
          <div className="grid-lines">
            {/* 垂直网格线 */}
            <div className="grid-line-vertical grid-line-v1"></div>
            <div className="grid-line-vertical grid-line-v2"></div>
            <div className="grid-line-vertical grid-line-v3"></div>
            <div className="grid-line-vertical grid-line-v4"></div>
            <div className="grid-line-vertical grid-line-v5"></div>
            <div className="grid-line-vertical grid-line-v6"></div>
            <div className="grid-line-vertical grid-line-v7"></div>
            <div className="grid-line-vertical grid-line-v8"></div>
            <div className="grid-line-vertical grid-line-v9"></div>
            {/* 水平网格线 */}
            <div className="grid-line-horizontal grid-line-h1"></div>
            <div className="grid-line-horizontal grid-line-h2"></div>
            <div className="grid-line-horizontal grid-line-h3"></div>
            <div className="grid-line-horizontal grid-line-h4"></div>
            <div className="grid-line-horizontal grid-line-h5"></div>
            <div className="grid-line-horizontal grid-line-h6"></div>
            <div className="grid-line-horizontal grid-line-h7"></div>
            <div className="grid-line-horizontal grid-line-h8"></div>
            <div className="grid-line-horizontal grid-line-h9"></div>
          </div>
        </div>
        {/* 3D电脑图标 */}
        <div className="computer-3d-icon"></div>
        {/* 装饰方块 */}
        <div className="decor-square-lg" />
        <div className="decor-square-sm" />
      </div>
      
      {/* 右侧区域 - 登录表单 */}
      <div className="login-right-section">
        {/* 系统标题 */}
        <div className="system-title">
          <div className="system-title-chinese">骨髓血细胞智能分析系统</div>
          <div className="system-title-english">Intelligent Analysis System for Bone Marrow Blood Cells</div>
        </div>
        
        <div className="login-form-wrapper">
          {/* 登录表单区域 */}
          <div className="login-form-area">
            <h2 className="welcome-title">欢迎登录</h2>
            
            <form className="login-form" onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="username" className="input-label">登录名</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="13.5" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.75 7.5C8.82107 7.5 10.5 5.82107 10.5 3.75C10.5 1.67893 8.82107 0 6.75 0C4.67893 0 3 1.67893 3 3.75C3 5.82107 4.67893 7.5 6.75 7.5ZM6.75 9.375C4.50563 9.375 0 10.5019 0 12.75V15H13.5V12.75C13.5 10.5019 9.00563 9.375 6.75 9.375Z" fill="rgba(0, 0, 0, 0.4)"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    className="login-input"
                    placeholder="请输入账号"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="password" className="input-label">密码</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.25 6.75H13.5V4.5C13.5 2.01562 11.4844 0 9 0C6.51562 0 4.5 2.01562 4.5 4.5V6.75H3.75C2.92969 6.75 2.25 7.42969 2.25 8.25V15.75C2.25 16.5703 2.92969 17.25 3.75 17.25H14.25C15.0703 17.25 15.75 16.5703 15.75 15.75V8.25C15.75 7.42969 15.0703 6.75 14.25 6.75ZM6 4.5C6 2.84375 7.34375 1.5 9 1.5C10.6562 1.5 12 2.84375 12 4.5V6.75H6V4.5Z" fill="rgba(0, 0, 0, 0.4)"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="login-input"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 8C2.5 5 5 3 8 3C11 3 13.5 5 15 8C13.5 11 11 13 8 13C5 13 2.5 11 1 8Z" stroke="#4E5969" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8" cy="8" r="2.5" stroke="#4E5969" strokeWidth="1.33"/>
                        <circle cx="8" cy="8" r="1" fill="#4E5969"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 8C2.5 5 5 3 8 3C11 3 13.5 5 15 8C13.5 11 11 13 8 13C5 13 2.5 11 1 8Z" stroke="#4E5969" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8" cy="8" r="2.5" stroke="#4E5969" strokeWidth="1.33"/>
                        <path d="M2 2L14 14" stroke="#4E5969" strokeWidth="1.33" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="login-error" style={{ 
                  color: '#ff4d4f', 
                  marginBottom: '16px', 
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? '登录中...' : '登 录'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;