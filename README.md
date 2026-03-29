# MarkFlow

一款具有原生 macOS 风格的极简 Markdown 编辑器。为追求无干扰写作体验和结构化文档管理的写作者和知识工作者打造。

![版本](https://img.shields.io/badge/version-0.1.1-blue)
![许可证](https://img.shields.io/badge/license-MIT-green)

## 功能特点

- **分屏视图** — 编辑器和预览区并排显示，比例可调（20%-80%）
- **Markdown 语法高亮** — 基于 CodeMirror 6 实现
- **滚动同步** — 编辑器和预览区滚动联动
- **文件树** — 使用 IndexedDB 本地存储，支持文件夹组织文档
- **主题支持** — 浅色/深色模式，跟随系统偏好或手动切换

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **编辑器**: CodeMirror 6
- **Markdown 解析**: markdown-it
- **样式**: 纯 CSS + CSS 变量

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产环境构建
npm run build
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + S` | 保存 |
| `Cmd/Ctrl + B` | 加粗 |
| `Cmd/Ctrl + I` | 斜体 |
| `Cmd/Ctrl + F` | 查找/替换 |
| `Cmd/Ctrl + K` | 插入链接 |
| `Cmd/Ctrl + Shift + K` | 插入代码块 |
| `Cmd/Ctrl + B` | 切换侧边栏 |

## 项目结构

```
src/
├── components/     # React 组件
├── hooks/          # 自定义 React Hooks
├── stores/         # IndexedDB 数据存储层
├── styles/         # 全局 CSS 样式
└── main.tsx        # 入口文件
```

## 版本更新历史

### v0.1.1 (2026-03-29)
- 新增 IndexedDB 存储层
  - 实现文件 CRUD 操作
  - 实现文件夹 CRUD 操作（含递归删除）
  - 实现设置持久化存储
  - 新增 `stores` 模块，统一数据管理接口
- README 翻译为中文

### v0.1.0 (2026-03-29)
- 初始版本
- 分屏编辑/预览布局
- CodeMirror 6 编辑器集成
- markdown-it 渲染支持
- 浅色/深色主题切换
- 滚动同步功能
- 工具栏格式化按钮

## 许可证

MIT
