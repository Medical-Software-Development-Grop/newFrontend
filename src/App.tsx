import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import Login from './Login';
import MainInterface from './MainInterface';
import { getToken, removeToken } from './api/config';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查是否已有token
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
    }

    // 监听401未授权事件，自动跳转到登录页面
    const handleUnauthorized = () => {
      setIsLoggedIn(false);
      removeToken();
    };

    window.addEventListener('unauthorized', handleUnauthorized);

    // 清理事件监听器
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    // 登录成功后显示加载页面
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
    }, 1500); // 1.5秒加载后进入医疗软件界面
  };

  return (
    <div className="App">
      {isLoading ? (
        <Loading />
      ) : !isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <MainInterface onLogout={() => {
          setIsLoggedIn(false);
          removeToken();
        }} />
      )}
    </div>
  );
}

export default App;
