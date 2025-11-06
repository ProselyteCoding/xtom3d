import * as PIXI from 'pixi.js';
import { BULLET } from '../utils/constants';

/**
 * Bullet 类
 * 
 * 玩家发射的子弹
 */
export class Bullet {
  public sprite: PIXI.Graphics;
  private speed = BULLET.SPEED;
  public active = true;

  constructor(x: number, y: number, container: PIXI.Container) {
    // 创建子弹图形（蓝色矩形）
    this.sprite = new PIXI.Graphics();
    this.sprite.rect(-BULLET.WIDTH / 2, -BULLET.HEIGHT / 2, BULLET.WIDTH, BULLET.HEIGHT);
    this.sprite.fill({ color: 0x00bfff }); // 蓝色（深天蓝）

    // 设置位置
    this.sprite.x = x;
    this.sprite.y = y;
    
    // 设置 zIndex 为 9（在背景上方，飞机下方）
    this.sprite.zIndex = 9;

    container.addChild(this.sprite);
  }

  /**
   * 更新子弹位置
   * @param deltaMS - 时间增量（毫秒）
   */
  public update(deltaMS: number): void {
    const speedMultiplier = deltaMS / 1000;
    this.sprite.y -= this.speed * speedMultiplier;

    // 如果子弹飞出屏幕顶部，标记为不活跃
    if (this.sprite.y < -50) {
      this.active = false;
    }
  }

  /**
   * 获取子弹边界
   */
  public getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.sprite.x - BULLET.WIDTH / 2,
      y: this.sprite.y - BULLET.HEIGHT / 2,
      width: BULLET.WIDTH,
      height: BULLET.HEIGHT,
    };
  }

  /**
   * 销毁子弹
   */
  public destroy(): void {
    this.sprite.destroy();
  }
}
