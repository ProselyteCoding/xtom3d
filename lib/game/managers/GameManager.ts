import * as PIXI from 'pixi.js';
import { useGameStore, GameState } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Background } from '../utils/Background';
import { Player } from '../entities/Player';
import { BulletManager } from './BulletManager';
import { EnemyManager } from './EnemyManager';
import { CollisionManager } from './CollisionManager';
import { ExplosionManager } from './ExplosionManager';
import { AudioManager } from './AudioManager';
import { PowerUpManager } from './PowerUpManager';
import { MissileAnimation } from '../effects/MissileAnimation';
import { getGameWidth, getGameHeight } from '../utils/constants';

/**
 * GameManager 类
 * 
 * 游戏的主管理器，负责协调游戏的所有方面，包括：
 * - 初始化 PixiJS 应用
 * - 管理游戏主循环 (ticker)
 * - 场景切换
 * - 协调其他子管理器（如玩家、敌人、UI等）
 * - 监听和响应游戏状态变化
 */
export class GameManager {
  private app: PIXI.Application;
  private elapsedTime = 0;
  private unsubscribe?: () => void;
  private background?: Background;
  private player?: Player;
  private bulletManager?: BulletManager;
  private enemyManager?: EnemyManager;
  private collisionManager?: CollisionManager;
  private explosionManager?: ExplosionManager;
  private powerUpManager?: PowerUpManager;
  private audioManager: AudioManager;
  private missileAnimation?: MissileAnimation;

  constructor(app: PIXI.Application) {
    this.app = app;
    
    // 初始化音效管理器
    this.audioManager = AudioManager.getInstance();
    this.audioManager.init();

    // 初始化游戏
    this.init();
    
    // 设置炸弹快捷键
    this.setupBombHotkey();
  }

  /**
   * 初始化游戏
   */
  private async init(): Promise<void> {
    console.log("GameManager initialized");
    console.log(`Game dimensions: ${getGameWidth()} x ${getGameHeight()}`);
    console.log(`Canvas dimensions: ${this.app.canvas.width} x ${this.app.canvas.height}`);
    console.log(`Renderer dimensions: ${this.app.renderer.width} x ${this.app.renderer.height}`);

    // 启用 stage 的 zIndex 排序
    this.app.stage.sortableChildren = true;

    // 预加载所有资源
    try {
      const [playerTexture] = await Promise.all([
        PIXI.Assets.load('/assets/my-plane.jpg'),
        // 预加载敌机纹理
        import('../entities/Enemy').then(module => module.Enemy.loadTextures()),
      ]);
      
      console.log('Assets loaded successfully');
      
      // 创建背景
      this.background = new Background(this.app.stage);

      // 创建玩家（传入预加载的纹理）
      this.player = new Player(this.app.stage, playerTexture);
    } catch (error) {
      console.error('Failed to load assets:', error);
      // 降级：不使用纹理创建
      this.background = new Background(this.app.stage);
      this.player = new Player(this.app.stage);
    }

    // 创建子弹管理器
    this.bulletManager = new BulletManager(this.app.stage, this.player);

    // 创建敌人管理器
    this.enemyManager = new EnemyManager(this.app.stage);

    // 创建爆炸管理器
    this.explosionManager = new ExplosionManager(this.app.stage);

    // 创建道具管理器
    this.powerUpManager = new PowerUpManager(this.app.stage);

    // 创建碰撞管理器
    this.collisionManager = new CollisionManager();
    
    // 设置爆炸回调
    this.collisionManager.setOnEnemyDestroyed((x, y, size) => {
      this.explosionManager?.createExplosion(x, y, size);
      this.audioManager.playExplosion();
    });

    // 设置问号盒触发答题回调
    this.collisionManager.setOnQuestionTriggered((source) => {
      // 暂停游戏并触发答题
      useUIStore.getState().triggerQuestion(source);
    });

    // 监听 Zustand 中游戏状态的变化
    this.unsubscribe = useGameStore.subscribe((state, prevState) => {
      if (state.gameState !== prevState.gameState) {
        this.onGameStateChange(state.gameState, prevState.gameState);
      }
    });

    // 立即使用初始状态触发一次
    const initialState = useGameStore.getState();
    this.onGameStateChange(initialState.gameState, null);

    // 设置游戏主循环
  this.app.ticker.add(this.update, this);
  }

  /**
   * 设置炸弹快捷键（空格键）
   */
  private setupBombHotkey(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        const gameState = useGameStore.getState().gameState;
        if (gameState === 'PLAYING') {
          this.useBomb();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
  }

  /**
   * 使用炸弹
   */
  private useBomb(): void {
    const success = useGameStore.getState().useBomb();
    if (success && this.enemyManager && this.explosionManager) {
      // 播放导弹动画
      if (!this.missileAnimation) {
        this.missileAnimation = new MissileAnimation(this.app.stage);
      }
      this.missileAnimation.play();
      
      // 清除所有敌人并创建爆炸效果
      const enemies = this.enemyManager.getEnemies();
      enemies.forEach((enemy) => {
        if (enemy.active) {
          const bounds = enemy.getBounds();
          this.explosionManager?.createExplosion(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
            'large'
          );
          // 给予分数奖励
          useGameStore.getState().incrementScore(enemy.score);
          enemy.active = false;
        }
      });
      
      // 清除所有敌人子弹
      const enemyBullets = this.enemyManager.getEnemyBullets();
      enemyBullets.forEach((bullet) => {
        bullet.active = false;
      });
      
      // 播放爆炸音效
      this.audioManager.playExplosion();
    }
  }

  /**
   * 游戏主循环，每一帧都会调用
   * @param ticker - Ticker 实例
   */
  private update(ticker: PIXI.Ticker): void {
    const gameState = useGameStore.getState().gameState;

    if (gameState !== 'PLAYING') {
      return;
    }
    
    const deltaMS = ticker.deltaMS;
    this.elapsedTime += deltaMS;

    // 更新背景
    this.background?.update(deltaMS);

    // 更新玩家
    this.player?.update(deltaMS);

    // 更新子弹
    this.bulletManager?.update(deltaMS, this.elapsedTime);

    // 更新敌人
    this.enemyManager?.update(deltaMS, this.elapsedTime);

    // 更新爆炸效果
    this.explosionManager?.update(deltaMS);

    // 更新道具
    this.powerUpManager?.update(deltaMS, this.elapsedTime);

    // 检测碰撞
    if (this.collisionManager && this.bulletManager && this.enemyManager && this.player && this.powerUpManager) {
      this.collisionManager.checkCollisions(
        this.bulletManager.getBullets(),
        this.enemyManager.getEnemies(),
        this.player,
        this.enemyManager.getEnemyBullets(),
        this.powerUpManager.getPowerUps()
      );
    }
  }
  /**
   * 响应游戏状态变化的处理器
   * @param newState - 新的游戏状态
   * @param oldState - 旧的游戏状态
   */
  private onGameStateChange(newState: GameState, oldState: GameState | null): void {
    if (newState === oldState) return;
    
    console.log(`Game state changed from ${oldState ?? 'initial'} to ${newState}`);
    switch (newState) {
      case 'PLAYING':
        // 恢复游戏逻辑
        this.app.ticker.start();
        break;
      case 'PAUSED':
        // 暂停游戏逻辑
        this.app.ticker.stop();
        break;
      case 'GAME_OVER':
        // 处理游戏结束逻辑
        this.app.ticker.stop();
        // 可以在这里显示游戏结束画面
        break;
      case 'READY':
        // 准备状态，可以显示开始菜单
        this.app.ticker.stop();
        break;
    }
  }

  /**
   * 启动游戏
   */
  public start(): void {
    useGameStore.getState().startGame();
  }

  /**
   * 销毁游戏实例，清理资源
   */
  public destroy(): void {
    this.app.ticker.remove(this.update, this);
    this.app.ticker.stop();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    
    // 清理背景
    this.background?.destroy();
    this.background = undefined;
    
    // 清理玩家
    this.player?.destroy();
    this.player = undefined;
    
    // 清理子弹管理器
    this.bulletManager?.destroy();
    this.bulletManager = undefined;
    
    // 清理敌人管理器
    this.enemyManager?.destroy();
    this.enemyManager = undefined;
    
    // 清理爆炸管理器
    this.explosionManager?.destroy();
    this.explosionManager = undefined;
    
    // 清理道具管理器
    this.powerUpManager?.destroy();
    this.powerUpManager = undefined;
    
    // 清理导弹动画
    this.missileAnimation?.destroy();
    this.missileAnimation = undefined;
    
    // 碰撞管理器无需清理
    this.collisionManager = undefined;
  }
}
