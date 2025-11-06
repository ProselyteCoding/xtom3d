import * as PIXI from 'pixi.js';
import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { getGameWidth } from '../utils/constants';

/**
 * 道具管理器
 * 管理道具的生成、更新和销毁
 */
export class PowerUpManager {
  private stage: PIXI.Container;
  private powerUps: PowerUp[] = [];
  private spawnInterval = 10000; // 10秒生成一个道具（增加竞技性）
  private lastSpawnTime = 0;

  constructor(stage: PIXI.Container) {
    this.stage = stage;
  }

  /**
   * 更新道具
   */
  public update(deltaMS: number, currentTime: number): void {
    // 检查是否需要生成新道具
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.spawnPowerUp();
      this.lastSpawnTime = currentTime;
    }

    // 更新所有道具
    this.powerUps.forEach((powerUp) => {
      powerUp.update(deltaMS);
    });

    // 移除不活跃的道具
    this.powerUps = this.powerUps.filter((powerUp) => {
      if (!powerUp.active) {
        powerUp.destroy();
        return false;
      }
      return true;
    });
  }

  /**
   * 生成道具
   */
  private spawnPowerUp(): void {
    const gameWidth = getGameWidth();
    const x = Math.random() * (gameWidth - 100) + 50;
    const y = -30;

    // 随机选择道具类型：蓝色问号盒、红色问号盒、黄色问号盒
    const types: PowerUpType[] = ['mysteryBlue', 'mysteryRed', 'mysteryYellow'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const powerUp = new PowerUp(x, y, randomType, this.stage);
    this.powerUps.push(powerUp);
  }

  /**
   * 手动生成指定类型的道具（用于测试或特殊奖励）
   */
  public spawnSpecificPowerUp(type: PowerUpType, x?: number): void {
    const gameWidth = getGameWidth();
    const posX = x ?? Math.random() * (gameWidth - 100) + 50;
    const y = -30;

    const powerUp = new PowerUp(posX, y, type, this.stage);
    this.powerUps.push(powerUp);
  }

  /**
   * 获取所有活跃的道具
   */
  public getPowerUps(): PowerUp[] {
    return this.powerUps;
  }

  /**
   * 清除所有道具
   */
  public clear(): void {
    this.powerUps.forEach((powerUp) => powerUp.destroy());
    this.powerUps = [];
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.clear();
  }
}
