import * as PIXI from 'pixi.js';
import { ENEMY_TYPES } from '../utils/constants';
import { EnemyBullet } from './EnemyBullet';
import { getAssetPath } from '@/lib/utils/assetPath';

export type EnemyType = 'SMALL' | 'MEDIUM' | 'LARGE';

/**
 * Enemy 类
 * 
 * 敌机实体
 */
export class Enemy {
  public sprite: PIXI.Sprite;
  private healthBar: PIXI.Graphics;
  private speed: number;
  public health: number;
  public maxHealth: number;
  public score: number;
  public active = true;
  public type: EnemyType;
  private config: { width: number; height: number; speed: number; health: number; score: number; probability: number };
  private lastFireTime = 0;
  private fireRate = 2000; // 每2秒发射一次
  private canFire: boolean;
  private container: PIXI.Container;
  
  // 静态纹理缓存
  private static textures: Map<EnemyType, PIXI.Texture> = new Map();

  /**
   * 预加载敌机纹理
   */
  public static async loadTextures(): Promise<void> {
    if (Enemy.textures.size === 0) {
      try {
        const [texture1, texture2, texture3] = await Promise.all([
          PIXI.Assets.load(getAssetPath('/assets/enemy-plane1.jpg')),
          PIXI.Assets.load(getAssetPath('/assets/enemy-plane2.jpg')),
          PIXI.Assets.load(getAssetPath('/assets/enemy-plane3.jpg')),
        ]);
        Enemy.textures.set('SMALL', texture1);
        Enemy.textures.set('MEDIUM', texture2);
        Enemy.textures.set('LARGE', texture3);
      } catch (error) {
        console.error('Failed to load enemy textures:', error);
      }
    }
  }

  constructor(x: number, y: number, type: EnemyType, container: PIXI.Container, canFire = false) {
    this.type = type;
    this.config = ENEMY_TYPES[type];
    this.container = container;
    this.canFire = canFire;

    this.speed = this.config.speed;
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.score = this.config.score;

    // 使用预加载的纹理或降级方案
    const texture = Enemy.textures.get(type);
    
    console.log('创建敌机:', { 
      type, 
      hasTexture: !!texture, 
      textureLabel: texture?.label,
      width: this.config.width,
      height: this.config.height
    });
    
    if (texture) {
      this.sprite = new PIXI.Sprite(texture);
    } else {
      // 降级方案：使用纯色方块
      this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      this.sprite.tint = this.canFire ? 0xff8800 : 0xff0000;
    }
    
    // 设置飞机大小和锚点
    this.sprite.width = this.config.width;
    this.sprite.height = this.config.height;
    this.sprite.anchor.set(0.5);
    
    // 设置 zIndex 为 10（游戏实体层）
    this.sprite.zIndex = 10;

    // 创建血条
    this.healthBar = new PIXI.Graphics();
    this.healthBar.zIndex = 11; // 血条在飞机上方
    this.updateHealthBar();

    // 设置位置
    this.sprite.x = x;
    this.sprite.y = y;

    container.addChild(this.sprite);
    container.addChild(this.healthBar);
  }

  /**
   * 更新血条显示
   */
  private updateHealthBar(): void {
    this.healthBar.clear();
    
    if (this.maxHealth > 1) {
      const barWidth = this.config.width;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;

      // 背景
      this.healthBar.rect(0, 0, barWidth, barHeight);
      this.healthBar.fill({ color: 0x333333 });

      // 当前血量
      this.healthBar.rect(0, 0, barWidth * healthPercent, barHeight);
      this.healthBar.fill({ color: 0x00ff00 });
    }
  }

  /**
   * 更新敌机位置
   * @param deltaMS - 时间增量（毫秒）
   * @param currentTime - 当前时间
   * @returns 发射的子弹数组（如果有）
   */
  public update(deltaMS: number, currentTime: number): EnemyBullet[] | null {
    const speedMultiplier = deltaMS / 1000;
    this.sprite.y += this.speed * speedMultiplier;

    // 更新血条位置
    this.healthBar.x = this.sprite.x - this.config.width / 2;
    this.healthBar.y = this.sprite.y - this.config.height / 2 - 8;

    // 如果敌机移出屏幕底部，标记为不活跃
    if (this.sprite.y > window.innerHeight + 100) {
      this.active = false;
    }

    // 发射子弹
    if (this.canFire && currentTime - this.lastFireTime >= this.fireRate && this.sprite.y > 50 && this.sprite.y < window.innerHeight - 100) {
      this.lastFireTime = currentTime;
      
      // 大型敌机发射弧形子弹（3发）
      if (this.type === 'LARGE') {
        const bullets: EnemyBullet[] = [];
        // 中间一发
        bullets.push(new EnemyBullet(this.sprite.x, this.sprite.y + this.config.height / 2, this.container, 0));
        // 左侧一发（-30度）
        bullets.push(new EnemyBullet(this.sprite.x - 10, this.sprite.y + this.config.height / 2, this.container, -0.5));
        // 右侧一发（+30度）
        bullets.push(new EnemyBullet(this.sprite.x + 10, this.sprite.y + this.config.height / 2, this.container, 0.5));
        return bullets;
      } else {
        // 小型和中型敌机发射直线子弹
        return [new EnemyBullet(this.sprite.x, this.sprite.y + this.config.height / 2, this.container, 0)];
      }
    }

    return null;
  }

  /**
   * 受到伤害
   * @param damage - 伤害值
   * @returns 是否被摧毁
   */
  public takeDamage(damage: number): boolean {
    this.health -= damage;
    this.updateHealthBar();
    
    if (this.health <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }

  /**
   * 获取敌机边界
   */
  public getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.sprite.x - this.config.width / 2,
      y: this.sprite.y - this.config.height / 2,
      width: this.config.width,
      height: this.config.height,
    };
  }

  /**
   * 销毁敌机
   */
  public destroy(): void {
    this.sprite.destroy();
    this.healthBar.destroy();
  }
}
