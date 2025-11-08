# 骨髓血细胞智能分析系统

这是一个基于React和TypeScript开发的骨髓血细胞智能分析系统前端应用。

## 🚀 项目特点

- **React + TypeScript**: 使用现代React开发模式和TypeScript类型安全
- **响应式设计**: 支持多种设备和屏幕尺寸
- **现代UI**: 美观的用户界面设计
- **组件化开发**: 模块化的组件架构
- **开发友好**: 支持热重载和开发者工具

## 📦 安装依赖

```bash
npm install
```

## 🛠️ 开发模式

启动React开发服务器：

```bash
npm start
```

应用将在 http://localhost:3000 上运行，支持热重载。

## 🏗️ 构建生产版本

构建生产版本：

```bash
npm run build
```

构建后的文件会在 `build` 目录中。

## 📁 项目结构

```
medical-software/
├── public/
│   ├── index.html       # HTML模板
│   ├── manifest.json    # Web应用清单
│   └── ...
├── src/
│   ├── App.tsx          # 主应用组件
│   ├── Login.tsx        # 登录页面组件
│   ├── Login.css        # 登录页面样式
│   ├── index.tsx        # 应用入口
│   └── ...
├── package.json         # 项目配置和依赖
└── README.md
```

## 🔧 主要文件说明

### `src/App.tsx`
React主组件，负责应用的整体结构和路由。

### `src/Login.tsx`
登录页面组件，包含：
- 系统标题和介绍
- 3D电脑插图动画
- 用户登录表单
- 响应式布局

### `src/Login.css`
登录页面的样式文件，包含：
- 响应式布局样式
- 3D动画效果
- 现代UI组件样式

## 🎯 功能特性

### 1. 登录系统
- 用户名和密码登录
- 表单验证
- 现代化UI设计

### 2. 响应式设计
- 支持桌面端和移动端
- 自适应布局
- 优化的用户体验

### 3. 3D视觉效果
- CSS 3D变换
- 动画效果
- 现代化视觉设计

## 📚 技术栈

- **React 19**: 前端框架
- **TypeScript**: 类型安全的JavaScript
- **CSS3**: 样式和动画
- **Create React App**: 项目脚手架

## 🔍 常用命令

```bash
# 启动开发服务器
npm start

# 构建生产版本
npm run build

# 运行测试
npm test

# 弹出配置（不可逆）
npm run eject
```

## 🐛 故障排除

### 问题：开发服务器无法启动
- 确保已安装所有依赖：`npm install`
- 检查Node.js版本是否兼容
- 检查端口3000是否被占用

### 问题：样式显示异常
- 清除浏览器缓存
- 检查CSS文件是否正确导入
- 查看开发者工具中的错误信息

## 📄 许可证

MIT License
