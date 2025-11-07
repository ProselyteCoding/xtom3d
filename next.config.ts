import type { NextConfig } from "next";

// 只在生产环境使用 basePath（GitHub Pages）
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // 静态导出配置
  output: 'export',
  
  // GitHub Pages 部署配置（仅生产环境）
  basePath: isProd ? '/xtom3d' : '',
  assetPrefix: isProd ? '/xtom3d' : '',
  
  // 图片优化配置（静态导出时需要）
  images: {
    unoptimized: true,
  },
  
  // 支持 SCSS
  sassOptions: {
    implementation: 'sass',
  },
  
  // Turbopack 配置（Next.js 16+ 默认使用 Turbopack）
  turbopack: {
    // 空配置以消除警告，PixiJS 在 Turbopack 下通常可以正常工作
  },
};

export default nextConfig;
