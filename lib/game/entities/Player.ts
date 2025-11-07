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
  private touchStartHandler!: (e: TouchEvent) => void;
  private touchMoveHandler!: (e: TouchEvent) => void;
  private touchEndHandler!: (e: TouchEvent) => void;
  private isTouching = false;
  private touchOffsetX = 0;
  private touchOffsetY = 0;
  private canvasElement: HTMLCanvasElement | null = null;

  constructor(container: PIXI.Container, texture?: PIXI.Texture) {
    this.container = container;
    
    // 获取 canvas 元素
    this.canvasElement = document.querySelector('canvas');
    
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
    
    // 设置触摸监听
    this.setupTouchControls();
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
   * 设置触摸控制（移动端）
   */
  private setupTouchControls(): void {
    this.touchStartHandler = (e: TouchEvent) => {
      // 只在触摸 canvas 元素时处理
      const target = e.target as HTMLElement;
      if (target.tagName !== 'CANVAS') return;
      
      e.preventDefault(); // 只阻止 canvas 上的默认行为
      const touch = e.touches[0];
      if (!this.canvasElement) return;
      
      const rect = this.canvasElement.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      // 计算触摸点与飞机的偏移量
      this.touchOffsetX = touchX - this.sprite.x;
      this.touchOffsetY = touchY - this.sprite.y;
      
      // 检查是否触摸到飞机附近（触摸范围扩大）
      const dx = touchX - this.sprite.x;
      const dy = touchY - this.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 更宽松的触摸范围，便于操作
      if (distance < 100) {
        this.isTouching = true;
      }
    };

    this.touchMoveHandler = (e: TouchEvent) => {
      if (!this.isTouching) return;
      
      // 只在拖动飞机时阻止默认行为
      e.preventDefault();
      
      const touch = e.touches[0];
      if (!this.canvasElement) return;
      
      const rect = this.canvasElement.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      // 更新飞机位置（减去偏移量，使飞机中心跟随手指）
      this.sprite.x = touchX - this.touchOffsetX;
      this.sprite.y = touchY - this.touchOffsetY;
      
      // 限制在屏幕内
      const halfWidth = 20;
      const halfHeight = 30;
      const gameWidth = getGameWidth();
      const gameHeight = getGameHeight();
      
      this.sprite.x = Math.max(halfWidth, Math.min(gameWidth - halfWidth, this.sprite.x));
      this.sprite.y = Math.max(halfHeight, Math.min(gameHeight - halfHeight, this.sprite.y));
    };

    this.touchEndHandler = (e: TouchEvent) => {
      if (this.isTouching) {
        e.preventDefault();
      }
      this.isTouching = false;
    };

    // 在 window 上监听，但只处理 canvas 上的触摸
    window.addEventListener('touchstart', this.touchStartHandler, { passive: false });
    window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    window.addEventListener('touchend', this.touchEndHandler, { passive: false });
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
    
    // 移除触摸监听
    window.removeEventListener('touchstart', this.touchStartHandler);
    window.removeEventListener('touchmove', this.touchMoveHandler);
    window.removeEventListener('touchend', this.touchEndHandler);
    
    this.sprite.destroy();
  }
}
