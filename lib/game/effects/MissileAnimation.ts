import * as PIXI from 'pixi.js';
import { getGameWidth, getGameHeight } from '../utils/constants';

/**
 * 导弹动画效果
 * 当玩家使用东风5C时，从屏幕侧面滑过一个大型导弹图片
 */
export class MissileAnimation {
  private sprite?: PIXI.Sprite;
  private container: PIXI.Container;
  private active = false;
  private speed = 1500; // 飞行速度（像素/秒）
  private startX: number;
  private targetX = -300;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.startX = getGameWidth() + 300;
  }

  /**
   * 播放导弹动画
   */
  public async play(): Promise<void> {
    if (this.active) return;

    const gameWidth = getGameWidth();
    const gameHeight = getGameHeight();

    try {
      // 加载导弹图片
      const texture = await PIXI.Assets.load('/assets/missile.png');
      
      this.sprite = new PIXI.Sprite(texture);
      this.sprite.anchor.set(0.5);
      
      // 设置位置（从右侧屏幕外开始，垂直居中略偏上）
      this.sprite.x = this.startX;
      this.sprite.y = gameHeight * 0.4;
      
      // 设置旋转角度（向左飞行）
      this.sprite.rotation = 0;
      
      // 设置 zIndex 为最高层（在所有元素之上）
      this.sprite.zIndex = 100;
      
      this.container.addChild(this.sprite);
      this.active = true;

      // 启动动画
      this.animate();
    } catch (error) {
      console.error('Failed to load missile texture:', error);
    }
  }

  /**
   * 动画更新
   */
  private animate(): void {
    if (!this.sprite || !this.active) return;

    const startTime = Date.now();
    const duration = ((this.targetX - this.startX) / this.speed) * 1000; // 毫秒

    const updatePosition = () => {
      if (!this.sprite || !this.active) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数（先加速后减速）
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      this.sprite.x = this.startX + (this.targetX - this.startX) * easeProgress;

      // 轻微的上下波动效果
      const gameHeight = getGameHeight();
      this.sprite.y = gameHeight * 0.4 + Math.sin(progress * Math.PI * 2) * 10;

      if (progress < 1) {
        requestAnimationFrame(updatePosition);
      } else {
        this.destroy();
      }
    };

    updatePosition();
  }

  /**
   * 销毁动画
   */
  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = undefined;
    }
    this.active = false;
  }
}
