import * as PIXI from 'pixi.js';
import { Bullet } from '../entities/Bullet';
import { Player } from '../entities/Player';
import { PLAYER } from '../utils/constants';
import { AudioManager } from './AudioManager';

/**
 * BulletManager 类
 * 
 * 管理所有子弹的生成、更新和销毁
 */
export class BulletManager {
  private container: PIXI.Container;
  private bullets: Bullet[] = [];
  private player: Player;
  private lastFireTime = 0;
  private fireRate = PLAYER.FIRE_RATE;
  private audioManager: AudioManager;

  constructor(container: PIXI.Container, player: Player) {
    this.container = container;
    this.player = player;
    this.audioManager = AudioManager.getInstance();
  }

  /**
   * 更新所有子弹
   * @param deltaMS - 时间增量（毫秒）
   * @param currentTime - 当前时间戳
   */
  public update(deltaMS: number, currentTime: number): void {
    // 自动发射子弹
    if (currentTime - this.lastFireTime >= this.fireRate) {
      this.fire();
      this.lastFireTime = currentTime;
    }

    // 更新所有子弹
    this.bullets.forEach((bullet) => {
      bullet.update(deltaMS);
    });

    // 移除不活跃的子弹
    this.bullets = this.bullets.filter((bullet) => {
      if (!bullet.active) {
        bullet.destroy();
        return false;
      }
      return true;
    });
  }

  /**
   * 发射子弹
   */
  private fire(): void {
    const playerPos = this.player.getPosition();
    const bullet = new Bullet(playerPos.x, playerPos.y - 30, this.container);
    this.bullets.push(bullet);
    
    // 已移除射击音效（太频繁）
  }

  /**
   * 获取所有活跃的子弹
   */
  public getBullets(): Bullet[] {
    return this.bullets;
  }

  /**
   * 销毁子弹管理器
   */
  public destroy(): void {
    this.bullets.forEach((bullet) => bullet.destroy());
    this.bullets = [];
  }
}
