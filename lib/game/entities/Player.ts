import * as PIXI from 'pixi.js';
import { PLAYER, getGameWidth, getGameHeight } from '../utils/constants';
import { ParticleTrail } from '../effects/ParticleTrail';

/**
 * Player 类
 * 
 * 玩家控制的飞机
 */
export class Player {
  public sprite: PIXI.Sprite;
  private speed = PLAYER.SPEED;
  private keys: { [key: string]: boolean } = {};
  private particleTrail: ParticleTrail;
  private container: PIXI.Container;
  private keyDownHandler!: (e: KeyboardEvent) => void;
  private keyUpHandler!: (e: KeyboardEvent) => void;

  constructor(container: PIXI.Container, texture?: PIXI.Texture) {
    this.container = container;
    
    // 创建拖尾效果（蓝色）
    this.particleTrail = new ParticleTrail(container, 0x00bfff, 15, 30, 2);
    
    // 使用传入的 texture 或使用默认绿色三角形
    if (texture) {
      this.sprite = new PIXI.Sprite(texture);
      this.sprite.width = 60;
      this.sprite.height = 80;
    } else {
      // 降级方案：使用默认白色 texture
      this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      this.sprite.width = 40;
      this.sprite.height = 60;
      this.sprite.tint = 0x00bfff; // 蓝色
    }
    
    // 设置锚点
    this.sprite.anchor.set(0.5);
    
    // 设置 zIndex 为 10（游戏实体层）
    this.sprite.zIndex = 10;

    // 设置初始位置（使用动态的游戏高度）
    this.sprite.x = getGameWidth() / 2;
    this.sprite.y = getGameHeight() - 80; // 距离底部80像素

    container.addChild(this.sprite);

    // 设置键盘监听
    this.setupKeyboardControls();
  }

  /**
   * 设置键盘控制
   */
  private setupKeyboardControls(): void {
    this.keyDownHandler = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;
    };

    this.keyUpHandler = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
  }

  /**
   * 更新玩家位置
   * @param deltaMS - 时间增量（毫秒）
   */
  public update(deltaMS: number): void {
    const speedMultiplier = deltaMS / 1000; // 转换为秒
    const moveDistance = this.speed * speedMultiplier;

    // 左右移动
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.sprite.x -= moveDistance;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.sprite.x += moveDistance;
    }

    // 上下移动
    if (this.keys['w'] || this.keys['arrowup']) {
      this.sprite.y -= moveDistance;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      this.sprite.y += moveDistance;
    }

    // 限制玩家在屏幕内
    const halfWidth = 20;
    const halfHeight = 30;
    const gameWidth = getGameWidth();
    const gameHeight = getGameHeight();
    
    this.sprite.x = Math.max(halfWidth, Math.min(gameWidth - halfWidth, this.sprite.x));
    this.sprite.y = Math.max(halfHeight, Math.min(gameHeight - halfHeight, this.sprite.y));
    
    // 更新拖尾效果（在飞机尾部生成粒子）
    this.particleTrail.emit(this.sprite.x, this.sprite.y + 25, deltaMS);
    this.particleTrail.update(deltaMS);
  }

  /**
   * 获取玩家位置
   */
  public getPosition(): { x: number; y: number } {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
    };
  }

  /**
   * 销毁玩家
   */
  public destroy(): void {
    // 清理拖尾效果
    this.particleTrail.destroy();
    
    // 移除键盘监听
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    
    this.sprite.destroy();
  }
}
