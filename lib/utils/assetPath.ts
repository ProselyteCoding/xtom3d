/**
 * 获取资源文件的完整路径
 * 在生产环境会自动添加 basePath 前缀
 */
export function getAssetPath(path: string): string {
  // 如果是开发环境，直接返回原路径
  if (process.env.NODE_ENV !== 'production') {
    return path;
  }
  
  // 生产环境添加 /xtom3d 前缀
  const basePath = '/xtom3d';
  
  // 如果路径已经包含 basePath，直接返回
  if (path.startsWith(basePath)) {
    return path;
  }
  
  // 添加 basePath
  return `${basePath}${path}`;
}
