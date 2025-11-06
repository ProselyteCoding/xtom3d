import * as PIXI from 'pixi.js';

/**
 * EnemyBullet 类
 * 
 * 敌人发射的子弹
 */
export class EnemyBullet {
  public sprite: PIXI.Graphics;
  private speed = 200;
  private angle: number; // 发射角度（弧度）
  public active = true;

  constructor(x: number, y: number, container: PIXI.Container, angle: number = 0) {
    this.angle = angle;
    
    // 创建敌人子弹图形（鲜艳紫色圆形）
    this.sprite = new PIXI.Graphics();
    this.sprite.circle(0, 0, 6);
    this.sprite.fill({ color: 0xda70d6 }); // 鲜艳的兰花紫

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
    
    // 根据角度计算移动方向
    this.sprite.x += Math.sin(this.angle) * this.speed * speedMultiplier;
    this.sprite.y += this.speed * speedMultiplier;

    // 如果子弹飞出屏幕，标记为不活跃
    if (this.sprite.y > window.innerHeight + 50 || 
        this.sprite.x < -50 || 
        this.sprite.x > window.innerWidth + 50) {
      this.active = false;
    }
  }

  /**
   * 获取子弹边界
   */
  public getBounds(): { x: number; y: number; width: number; height: number } {
    const radius = 6;
    return {
      x: this.sprite.x - radius,
      y: this.sprite.y - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  /**
   * 销毁子弹
   */
  public destroy(): void {
    this.sprite.destroy();
  }
}
