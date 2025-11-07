# GitHub Pages 部署指南

## 项目配置

已配置项目以支持 GitHub Pages 静态部署：

### 1. Next.js 配置 (next.config.ts)
```typescript
{
  output: 'export',           // 静态导出
  basePath: '/xtom3d',       // GitHub Pages 子路径
  assetPrefix: '/xtom3d/',   // 资源路径前缀
  images: { unoptimized: true } // 禁用图片优化
}
```

### 2. 仓库地址
- GitHub: https://github.com/Weixhne/xtom3d
- 部署URL: https://weixhne.github.io/xtom3d/

## 手动部署步骤

### 方法一：使用 GitHub Actions（推荐）

1. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **推送代码**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **自动部署**
   - GitHub Actions 会自动构建并部署
   - 查看 Actions 标签页查看部署状态
   - 部署完成后访问: https://weixhne.github.io/xtom3d/

### 方法二：手动部署 out 文件夹

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署 out 文件夹**
   ```bash
   cd out
   git init
   git add -A
   git commit -m 'deploy'
   git push -f https://github.com/Weixhne/xtom3d.git main:gh-pages
   ```

3. **配置 GitHub Pages**
   - Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages" 和 "/ (root)"

## 本地测试

1. **构建项目**
   ```bash
   npm run build
   ```

2. **启动本地服务器测试**
   ```bash
   npx serve out
   ```
   
   或使用 Python:
   ```bash
   cd out
   python -m http.server 8000
   ```

3. **访问** http://localhost:8000/xtom3d/

## 更新部署

每次修改代码后：

```bash
# 提交代码
git add .
git commit -m "Update game"
git push origin main

# GitHub Actions 会自动重新部署
```

## 故障排除

### 资源 404 错误
- 确保 basePath 和 assetPrefix 配置正确
- 检查 public 文件夹中的资源是否存在

### 样式或脚本未加载
- 清除浏览器缓存
- 检查浏览器控制台的错误信息

### 构建失败
- 运行 `npm install` 确保依赖安装完整
- 检查 TypeScript 错误

## 文件夹结构

```
xtom3d/
├── out/                    # 构建输出（静态文件）
│   ├── index.html
│   ├── _next/             # Next.js 资源
│   └── assets/            # 游戏资源
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions 配置
└── public/
    ├── assets/            # 游戏素材（图片、音效）
    └── .nojekyll          # GitHub Pages 配置
```

## 注意事项

1. **basePath** 必须与仓库名称匹配
2. 确保 `public/.nojekyll` 文件存在
3. GitHub Pages 有 1GB 大小限制
4. 部署通常需要 1-5 分钟生效
