import * as PIXI from 'pixi.js';
import { Enemy, EnemyType } from '../entities/Enemy';
import { EnemyBullet } from '../entities/EnemyBullet';
import { ENEMY_TYPES, getGameWidth, DIFFICULTY_LEVELS } from '../utils/constants';
import { useGameStore } from '@/store/gameStore';

/**
 * EnemyManager 类
 * 
 * 管理所有敌人的生成、更新和销毁
 */
export class EnemyManager {
  private container: PIXI.Container;
  private enemies: Enemy[] = [];
  private enemyBullets: EnemyBullet[] = [];
  private lastSpawnTime = 0;
  private spawnInterval = 800; // 初始 0.8秒生成一个敌人（增加竞技性）

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  /**
   * 根据分数调整难度
   */
  private updateDifficulty(): void {
    const score = useGameStore.getState().score;
    
    for (const level of DIFFICULTY_LEVELS) {
      if (score >= level.scoreRange[0] && score <= level.scoreRange[1]) {
        this.spawnInterval = level.spawnInterval;
        break;
      }
    }
  }

  /**
   * 更新所有敌人
   * @param deltaMS - 时间增量（毫秒）
   * @param currentTime - 当前时间戳
   */
  public update(deltaMS: number, currentTime: number): void {
    // 更新难度
    this.updateDifficulty();

    // 生成新敌人
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.spawnEnemy();
      this.lastSpawnTime = currentTime;
    }

    // 更新所有敌人
    this.enemies.forEach((enemy) => {
      const bullets = enemy.update(deltaMS, currentTime);
      if (bullets) {
        this.enemyBullets.push(...bullets); // 展开数组，添加所有子弹
      }
    });

    // 更新所有敌人子弹
    this.enemyBullets.forEach((bullet) => {
      bullet.update(deltaMS);
    });

    // 移除不活跃的敌人
    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy.active) {
        enemy.destroy();
        return false;
      }
      return true;
    });

    // 移除不活跃的敌人子弹
    this.enemyBullets = this.enemyBullets.filter((bullet) => {
      if (!bullet.active) {
        bullet.destroy();
        return false;
      }
      return true;
    });
  }

  /**
   * 生成敌人
   */
  private spawnEnemy(): void {
    // 随机选择敌人类型
    const rand = Math.random();
    let type: EnemyType = 'SMALL';
    
    if (rand < ENEMY_TYPES.SMALL.probability) {
      type = 'SMALL';
    } else if (rand < ENEMY_TYPES.SMALL.probability + ENEMY_TYPES.MEDIUM.probability) {
      type = 'MEDIUM';
    } else {
      type = 'LARGE';
    }

    // 所有敌机都可以发射子弹
    const canFire = true;

    // 随机 X 位置
    const config = ENEMY_TYPES[type];
    const gameWidth = getGameWidth();
    const x = Math.random() * (gameWidth - config.width) + config.width / 2;
    const y = -config.height;

    const enemy = new Enemy(x, y, type, this.container, canFire);
    this.enemies.push(enemy);
  }

  /**
   * 获取所有活跃的敌人
   */
  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  /**
   * 获取所有敌人子弹
   */
  public getEnemyBullets(): EnemyBullet[] {
    return this.enemyBullets;
  }

  /**
   * 销毁敌人管理器
   */
  public destroy(): void {
    this.enemies.forEach((enemy) => enemy.destroy());
    this.enemies = [];
    this.enemyBullets.forEach((bullet) => bullet.destroy());
    this.enemyBullets = [];
  }
}
