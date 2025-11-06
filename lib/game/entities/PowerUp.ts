import * as PIXI from 'pixi.js';
import { getGameHeight } from '../utils/constants';

/**
 * 道具类型
 * mysteryBlue: 蓝色问号盒，答题后获得护盾
 * mysteryRed: 红色问号盒，答题后获得东风5C导弹
 * mysteryYellow: 黄色问号盒，答题后随机获得道具（护盾或东风5C）
 */
export type PowerUpType = 'mysteryBlue' | 'mysteryRed' | 'mysteryYellow';

/**
 * 道具类
 * 从屏幕顶部掉落，玩家碰到后获得增益效果
 */
export class PowerUp {
  public sprite: PIXI.Graphics;
  public active = true;
  public type: PowerUpType;
  private speed = 80; // 下落速度

  constructor(x: number, y: number, type: PowerUpType, container: PIXI.Container) {
    this.type = type;
    this.sprite = new PIXI.Graphics();

    // 根据道具类型绘制不同的形状和颜色
    switch (type) {
      case 'mysteryBlue':
        // 蓝色问号盒 - 护盾
        this.drawMysteryBox(0x00bfff);
        break;
      case 'mysteryRed':
        // 红色问号盒 - 东风5C导弹
        this.drawMysteryBox(0xff0000);
        break;
      case 'mysteryYellow':
        // 黄色问号盒 - 随机道具
        this.drawMysteryBox(0xffd700);
        break;
    }

    this.sprite.x = x;
    this.sprite.y = y;
    
    // 设置 zIndex 为 10（游戏实体层）
    this.sprite.zIndex = 10;

    container.addChild(this.sprite);

    // 添加旋转动画
    this.sprite.rotation = 0;
  }

  /**
   * 绘制问号盒
   */
  private drawMysteryBox(color: number): void {
    // 绘制圆角方形盒子（更大一些）
    this.sprite.roundRect(-18, -18, 36, 36, 4);
    this.sprite.fill({ color });
    this.sprite.stroke({ color: 0xffffff, width: 2.5 });

    // 绘制问号 "?"
    const graphics = new PIXI.Graphics();
    
    // 问号的上半部分 - 使用贝塞尔曲线绘制更平滑的问号
    graphics.moveTo(-3, -8);
    
    // 上弧
    graphics.bezierCurveTo(-3, -12, 3, -12, 3, -8);
    
    // 右侧
    graphics.lineTo(3, -4);
    graphics.bezierCurveTo(3, -2, 1, 0, 0, 2);
    graphics.stroke({ color: 0xffffff, width: 3, cap: 'round', join: 'round' });
    
    // 问号的点（更大更圆润）
    graphics.circle(0, 7, 2.5);
    graphics.fill({ color: 0xffffff });
    
    this.sprite.addChild(graphics);
  }

  /**
   * 更新道具位置
   */
  public update(deltaMS: number): void {
    const speedMultiplier = deltaMS / 1000;
    this.sprite.y += this.speed * speedMultiplier;

    // 添加旋转动画
    this.sprite.rotation += 2 * speedMultiplier;

    // 检查是否超出屏幕
    if (this.sprite.y > getGameHeight() + 50) {
      this.active = false;
    }
  }

  /**
   * 获取道具边界
   */
  public getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.sprite.x - 18,
      y: this.sprite.y - 18,
      width: 36,
      height: 36,
    };
  }

  /**
   * 销毁道具
   */
  public destroy(): void {
    this.sprite.destroy();
  }
}
