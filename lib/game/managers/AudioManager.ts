import { Howl } from 'howler';

/**
 * 音效管理器
 * 使用 Howler.js 管理游戏音效和背景音乐
 */
export class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Howl> = new Map();
  private bgMusic?: Howl;
  private enabled = true;
  private musicVolume = 0.15; // 非常轻的背景音乐
  private sfxVolume = 0.4;

  private constructor() {
    // 私有构造函数，确保单例
  }

  /**
   * 获取音效管理器实例
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * 初始化音效（使用Web Audio API生成音效）
   */
  public init(): void {
    console.log('AudioManager initialized with procedural audio');
    // 不启动背景音乐
  }

  /**
   * 播放爆炸音效（敌机/玩家死亡）
   * 更有冲击力的爆炸声
   */
  public playExplosion(): void {
    if (!this.enabled) return;
    this.playExplosionSound();
  }

  /**
   * 播放受击音效（受损但未死亡）
   * 短促的打击声
   */
  public playHit(): void {
    if (!this.enabled) return;
    this.playHitSound();
  }

  /**
   * 播放获得道具音效
   * 愉悦的上升音调
   */
  public playPowerUp(): void {
    if (!this.enabled) return;
    this.playPowerUpSound();
  }

  /**
   * 播放复活音效
   * 振奋人心的声音
   */
  public playRevive(): void {
    if (!this.enabled) return;
    this.playReviveSound();
  }

  /**
   * 播放子弹发射音效
   */
  public playShoot(): void {
    if (!this.enabled) return;
    this.playShootSound();
  }

  /**
   * 播放命中音效（子弹击中敌机但未摧毁）
   */
  public playBulletHit(): void {
    if (!this.enabled) return;
    this.playBulletHitSound();
  }

  /**
   * 设置音效开关
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 设置音乐音量
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 设置音效音量
   */
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 子弹发射音效（简短的高音）
   */
  private playShootSound(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 0.05;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.value = 800;
      
      gain.gain.setValueAtTime(this.sfxVolume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (error) {
      console.warn('Shoot sound failed:', error);
    }
  }

  /**
   * 子弹命中音效（击中敌机但未摧毁）
   */
  private playBulletHitSound(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 0.08;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (error) {
      console.warn('Bullet hit sound failed:', error);
    }
  }

  /**
   * 爆炸音效（复杂的噪声）
   */
  private playExplosionSound(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 0.4;
      
      // 使用多个频率创建爆炸效果
      const frequencies = [80, 120, 160];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        const startVolume = this.sfxVolume * 0.3 * (1 - i * 0.2);
        gain.gain.setValueAtTime(startVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      });
      
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (error) {
      console.warn('Explosion sound failed:', error);
    }
  }

  /**
   * 受击音效（短促的打击声）
   */
  private playHitSound(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 0.15;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (error) {
      console.warn('Hit sound failed:', error);
    }
  }

  /**
   * 获得道具音效（上升音调）
   */
  private playPowerUpSound(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 0.3;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (error) {
      console.warn('Power-up sound failed:', error);
    }
  }

  /**
   * 复活音效（振奋的上升音调序列）
   */
  private playReviveSound(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 0.6;
      
      // 播放一系列上升音调
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const delay = i * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, ctx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.2);
      });
      
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (error) {
      console.warn('Revive sound failed:', error);
    }
  }

  /**
   * 销毁音效管理器
   */
  public destroy(): void {
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();
  }
}
