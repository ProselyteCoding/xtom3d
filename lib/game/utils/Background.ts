import * as PIXI from 'pixi.js';
import { getGameWidth, getGameHeight } from './constants';

/**
 * 扩展 Graphics 类型以支持自定义属性
 */
interface StarGraphics extends PIXI.Graphics {
  speed?: number;
}

/**
 * Background 类
 * 
 * 创建滚动的星空背景，营造飞行的感觉
 */
export class Background {
  private container: PIXI.Container;
  private stars: StarGraphics[] = [];
  private scrollSpeed = 2;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.init();
  }

  /**
   * 初始化背景
   */
  private init(): void {
    // 创建背景容器
    const backgroundContainer = new PIXI.Container();
    this.container.addChild(backgroundContainer);

    // 创建多层星星（缩小尺寸避免与子弹混淆）
    this.createStars(50, 0.5, 0.4); // 远处的小星星
    this.createStars(30, 1, 0.6); // 中等距离的星星
    this.createStars(20, 1.5, 0.8); // 近处的星星
  }

  /**
   * 创建星星层
   * @param count - 星星数量
   * @param size - 星星大小
   * @param alpha - 星星透明度
   */
  private createStars(count: number, size: number, alpha: number): void {
    const gameWidth = getGameWidth();
    const gameHeight = getGameHeight();
    
    for (let i = 0; i < count; i++) {
      const star: StarGraphics = new PIXI.Graphics();
      star.circle(0, 0, size);
      star.fill({ color: 0xffffff, alpha });

      // 随机位置
      star.x = Math.random() * gameWidth;
      star.y = Math.random() * gameHeight;

      // 设置 zIndex 为 0（背景层）
      star.zIndex = 0;

      // 存储速度信息
      star.speed = this.scrollSpeed * (size / 2);

      this.stars.push(star);
      this.container.addChild(star);
    }
  }

  /**
   * 更新背景（每帧调用）
   * @param deltaMS - 时间增量（毫秒）
   */
  public update(deltaMS: number): void {
    const speedMultiplier = deltaMS / 16.67; // 标准化到60fps
    const gameWidth = getGameWidth();
    const gameHeight = getGameHeight();

    this.stars.forEach((star) => {
      const speed = star.speed || this.scrollSpeed;
      star.y += speed * speedMultiplier;

      // 如果星星移出屏幕底部，重置到顶部
      if (star.y > gameHeight) {
        star.y = 0;
        star.x = Math.random() * gameWidth;
      }
    });
  }

  /**
   * 销毁背景
   */
  public destroy(): void {
    this.stars.forEach((star) => star.destroy());
    this.stars = [];
  }
}
