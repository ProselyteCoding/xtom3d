import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { EnemyBullet } from '../entities/EnemyBullet';
import { PowerUp } from '../entities/PowerUp';
import { Player } from '../entities/Player';
import { useGameStore } from '@/store/gameStore';
import { BULLET } from '../utils/constants';
import { AudioManager } from '../managers/AudioManager';

/**
 * CollisionManager 类
 * 
 * 处理游戏中所有的碰撞检测
 */
export class CollisionManager {
  private onEnemyDestroyed?: (x: number, y: number, size: 'small' | 'medium' | 'large') => void;
  private onQuestionTriggered?: (source: 'mysteryBlue' | 'mysteryRed' | 'mysteryYellow') => void;
  private audioManager: AudioManager;

  constructor() {
    this.audioManager = AudioManager.getInstance();
  }

  /**
   * 设置敌人被摧毁时的回调
   */
  public setOnEnemyDestroyed(callback: (x: number, y: number, size: 'small' | 'medium' | 'large') => void): void {
    this.onEnemyDestroyed = callback;
  }

  /**
   * 设置问号盒触发答题的回调
   */
  public setOnQuestionTriggered(callback: (source: 'mysteryBlue' | 'mysteryRed' | 'mysteryYellow') => void): void {
    this.onQuestionTriggered = callback;
  }

  /**
   * 检测两个矩形是否碰撞
   */
  private checkRectCollision(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * 检测子弹与敌人的碰撞
   * @param bullets - 子弹数组
   * @param enemies - 敌人数组
   */
  public checkBulletEnemyCollisions(bullets: Bullet[], enemies: Enemy[]): void {
    bullets.forEach((bullet) => {
      if (!bullet.active) return;

      const bulletBounds = bullet.getBounds();

      enemies.forEach((enemy) => {
        if (!enemy.active) return;

        const enemyBounds = enemy.getBounds();

        if (this.checkRectCollision(bulletBounds, enemyBounds)) {
          // 碰撞发生
          bullet.active = false;
          const destroyed = enemy.takeDamage(BULLET.DAMAGE);

          if (destroyed) {
            // 敌人被摧毁，增加分数
            useGameStore.getState().incrementScore(enemy.score);
            
            // 播放爆炸音效（不播放命中音效）
            // 注意：爆炸效果会在回调中播放爆炸音效，这里不需要重复播放
            
            // 触发爆炸效果
            if (this.onEnemyDestroyed) {
              const bounds = enemy.getBounds();
              const size = bounds.width <= 50 ? 'small' : bounds.width <= 70 ? 'medium' : 'large';
              this.onEnemyDestroyed(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, size);
            }
          } else {
            // 敌人受伤但未死亡，播放命中音效
            this.audioManager.playBulletHit();
          }
        }
      });
    });
  }

  /**
   * 检测玩家与敌人的碰撞
   * @param player - 玩家
   * @param enemies - 敌人数组
   */
  public checkPlayerEnemyCollisions(player: Player, enemies: Enemy[]): void {
    const playerPos = player.getPosition();
    const playerBounds = {
      x: playerPos.x - 20,
      y: playerPos.y - 30,
      width: 40,
      height: 60,
    };

    enemies.forEach((enemy) => {
      if (!enemy.active) return;

      const enemyBounds = enemy.getBounds();

      if (this.checkRectCollision(playerBounds, enemyBounds)) {
        // 碰撞发生
        enemy.active = false;
        
        const currentLives = useGameStore.getState().lives;
        const hasShield = useGameStore.getState().powerUps.shield;
        
        // 扣血
        useGameStore.getState().loseLife();
        
        // 根据是否还有生命值播放音效
        if (hasShield || currentLives > 1) {
          // 受击但未死亡
          this.audioManager.playHit();
        } else {
          // 死亡
          this.audioManager.playExplosion();
        }
        
        // 触发爆炸效果
        if (this.onEnemyDestroyed) {
          const bounds = enemy.getBounds();
          const size = bounds.width <= 50 ? 'small' : bounds.width <= 70 ? 'medium' : 'large';
          this.onEnemyDestroyed(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, size);
        }
      }
    });
  }

  /**
   * 检测敌人子弹与玩家的碰撞
   * @param enemyBullets - 敌人子弹数组
   * @param player - 玩家
   */
  public checkEnemyBulletPlayerCollisions(enemyBullets: EnemyBullet[], player: Player): void {
    const playerPos = player.getPosition();
    const playerBounds = {
      x: playerPos.x - 20,
      y: playerPos.y - 30,
      width: 40,
      height: 60,
    };

    enemyBullets.forEach((bullet) => {
      if (!bullet.active) return;

      const bulletBounds = bullet.getBounds();

      if (this.checkRectCollision(bulletBounds, playerBounds)) {
        // 碰撞发生
        bullet.active = false;
        
        const currentLives = useGameStore.getState().lives;
        const hasShield = useGameStore.getState().powerUps.shield;
        
        // 扣血
        useGameStore.getState().loseLife();
        
        // 根据是否还有生命值播放音效
        if (hasShield || currentLives > 1) {
          // 受击但未死亡
          this.audioManager.playHit();
        } else {
          // 死亡
          this.audioManager.playExplosion();
        }
      }
    });
  }

  /**
   * 检测道具与玩家的碰撞
   * @param powerUps - 道具数组
   * @param player - 玩家
   */
  public checkPowerUpPlayerCollisions(powerUps: PowerUp[], player: Player): void {
    const playerPos = player.getPosition();
    const playerBounds = {
      x: playerPos.x - 20,
      y: playerPos.y - 30,
      width: 40,
      height: 60,
    };

    powerUps.forEach((powerUp) => {
      if (!powerUp.active) return;

      const powerUpBounds = powerUp.getBounds();

      if (this.checkRectCollision(powerUpBounds, playerBounds)) {
        // 碰撞发生
        powerUp.active = false;

        // 所有问号盒都触发答题
        if (this.onQuestionTriggered) {
          this.onQuestionTriggered(powerUp.type);
        }
      }
    });
  }

  /**
   * 执行所有碰撞检测
   * @param bullets - 玩家子弹数组
   * @param enemies - 敌人数组
   * @param player - 玩家
   * @param enemyBullets - 敌人子弹数组
   * @param powerUps - 道具数组
   */
  public checkCollisions(
    bullets: Bullet[], 
    enemies: Enemy[], 
    player: Player, 
    enemyBullets: EnemyBullet[] = [],
    powerUps: PowerUp[] = []
  ): void {
    this.checkBulletEnemyCollisions(bullets, enemies);
    this.checkPlayerEnemyCollisions(player, enemies);
    this.checkEnemyBulletPlayerCollisions(enemyBullets, player);
    this.checkPowerUpPlayerCollisions(powerUps, player);
  }
}
