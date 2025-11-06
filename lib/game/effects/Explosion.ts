import * as PIXI from 'pixi.js';

/**
 * 爆炸效果类
 * 当敌机被击毁时显示爆炸动画
 */
export class Explosion {
  private container: PIXI.Container;
  private particles: PIXI.Graphics[] = [];
  private particleVelocities: { vx: number; vy: number; life: number }[] = [];
  private maxLife = 1000; // 粒子最大生命周期（毫秒）
  private isDead = false;

  constructor(x: number, y: number, size: 'small' | 'medium' | 'large' = 'medium') {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;
    
    // 设置 zIndex 为 15（在所有实体上方）
    this.container.zIndex = 15;

    // 根据爆炸大小决定粒子数量和速度
    let particleCount: number;
    let speedMultiplier: number;
    let particleSize: number;

    switch (size) {
      case 'small':
        particleCount = 8;
        speedMultiplier = 1;
        particleSize = 3;
        break;
      case 'medium':
        particleCount = 15;
        speedMultiplier = 1.2;
        particleSize = 4;
        break;
      case 'large':
        particleCount = 25;
        speedMultiplier = 1.5;
        particleSize = 5;
        break;
    }

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      
      // 随机颜色（红、橙、黄）
      const colors = [0xff0000, 0xff4500, 0xff8c00, 0xffa500, 0xffff00];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.circle(0, 0, particleSize);
      particle.fill(color);
      
      this.container.addChild(particle);
      this.particles.push(particle);

      // 随机速度和方向
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = (100 + Math.random() * 100) * speedMultiplier;
      
      this.particleVelocities.push({
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: this.maxLife,
      });
    }
  }

  /**
   * 更新爆炸效果
   */
  public update(deltaMS: number): void {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const velocity = this.particleVelocities[i];

      // 更新位置
      particle.x += velocity.vx * (deltaMS / 1000);
      particle.y += velocity.vy * (deltaMS / 1000);

      // 添加重力效果
      velocity.vy += 200 * (deltaMS / 1000);

      // 减少生命值
      velocity.life -= deltaMS;

      // 根据剩余生命值调整透明度
      particle.alpha = Math.max(0, velocity.life / this.maxLife);

      // 缩小粒子
      const scale = velocity.life / this.maxLife;
      particle.scale.set(scale);
    }

    // 检查是否所有粒子都死亡
    if (this.particleVelocities.every((v) => v.life <= 0)) {
      this.isDead = true;
    }
  }

  /**
   * 检查爆炸是否结束
   */
  public isFinished(): boolean {
    return this.isDead;
  }

  /**
   * 获取容器
   */
  public getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * 销毁爆炸效果
   */
  public destroy(): void {
    this.particles.forEach((p) => p.destroy());
    this.particles = [];
    this.particleVelocities = [];
    this.container.destroy();
  }
}
