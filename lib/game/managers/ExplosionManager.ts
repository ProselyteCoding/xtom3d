import * as PIXI from 'pixi.js';
import { Explosion } from '../effects/Explosion';

/**
 * 爆炸效果管理器
 * 管理所有爆炸动画的生命周期
 */
export class ExplosionManager {
  private stage: PIXI.Container;
  private explosions: Explosion[] = [];

  constructor(stage: PIXI.Container) {
    this.stage = stage;
  }

  /**
   * 创建爆炸效果
   */
  public createExplosion(x: number, y: number, size: 'small' | 'medium' | 'large' = 'medium'): void {
    const explosion = new Explosion(x, y, size);
    this.stage.addChild(explosion.getContainer());
    this.explosions.push(explosion);
  }

  /**
   * 更新所有爆炸效果
   */
  public update(deltaMS: number): void {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      explosion.update(deltaMS);

      // 移除已完成的爆炸
      if (explosion.isFinished()) {
        explosion.destroy();
        this.explosions.splice(i, 1);
      }
    }
  }

  /**
   * 清除所有爆炸
   */
  public clear(): void {
    this.explosions.forEach((e) => e.destroy());
    this.explosions = [];
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.clear();
  }
}
