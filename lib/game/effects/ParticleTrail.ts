import * as PIXI from 'pixi.js';

/**
 * 粒子拖尾效果
 * 为玩家飞机或子弹添加拖尾效果
 */
export class ParticleTrail {
  private particles: PIXI.Graphics[] = [];
  private particleData: { life: number; maxLife: number }[] = [];
  private stage: PIXI.Container;
  private color: number;
  private maxParticles: number;
  private spawnInterval: number;
  private timeSinceLastSpawn = 0;
  private particleSize: number;

  constructor(
    stage: PIXI.Container,
    color: number = 0xffff00,
    maxParticles: number = 10,
    spawnInterval: number = 50, // 毫秒
    particleSize: number = 3
  ) {
    this.stage = stage;
    this.color = color;
    this.maxParticles = maxParticles;
    this.spawnInterval = spawnInterval;
    this.particleSize = particleSize;
  }

  /**
   * 在指定位置生成粒子
   */
  public emit(x: number, y: number, deltaMS: number): void {
    this.timeSinceLastSpawn += deltaMS;

    if (this.timeSinceLastSpawn >= this.spawnInterval) {
      this.timeSinceLastSpawn = 0;

      // 创建新粒子
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, this.particleSize);
      particle.fill(this.color);
      particle.x = x + (Math.random() - 0.5) * 10; // 添加随机偏移
      particle.y = y + (Math.random() - 0.5) * 10;
      
      // 设置 zIndex 为 5（在背景上方，其他实体下方）
      particle.zIndex = 5;
      
      this.stage.addChild(particle);
      this.particles.push(particle);
      this.particleData.push({ life: 500, maxLife: 500 }); // 粒子存活时间500ms

      // 限制粒子数量
      if (this.particles.length > this.maxParticles) {
        const oldParticle = this.particles.shift();
        oldParticle?.destroy();
        this.particleData.shift();
      }
    }
  }

  /**
   * 更新所有粒子
   */
  public update(deltaMS: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const data = this.particleData[i];

      // 减少生命值
      data.life -= deltaMS;

      // 更新透明度和大小
      const lifeRatio = Math.max(0, data.life / data.maxLife);
      particle.alpha = lifeRatio;
      particle.scale.set(lifeRatio);

      // 移除死亡的粒子
      if (data.life <= 0) {
        particle.destroy();
        this.particles.splice(i, 1);
        this.particleData.splice(i, 1);
      }
    }
  }

  /**
   * 清除所有粒子
   */
  public clear(): void {
    this.particles.forEach((p) => p.destroy());
    this.particles = [];
    this.particleData = [];
  }

  /**
   * 销毁粒子系统
   */
  public destroy(): void {
    this.clear();
  }
}
