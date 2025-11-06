import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
