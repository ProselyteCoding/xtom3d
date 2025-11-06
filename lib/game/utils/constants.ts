/**
 * 游戏常量配置
 */

// 画布尺寸
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// 游戏尺寸管理器（单例模式，确保全局一致）
class GameDimensions {
  private static instance: GameDimensions;
  private width: number = 800;
  private height: number = 600;

  private constructor() {}

  static getInstance(): GameDimensions {
    if (!GameDimensions.instance) {
      GameDimensions.instance = new GameDimensions();
    }
    return GameDimensions.instance;
  }

  setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

export const gameDimensions = GameDimensions.getInstance();

// 游戏区域尺寸（从全局管理器获取）
export const getGameWidth = (): number => {
  return gameDimensions.getWidth();
};

export const getGameHeight = (): number => {
  return gameDimensions.getHeight();
};

// 为了向后兼容，保留这些导出
export const GAME_WIDTH = getGameWidth();
export const GAME_HEIGHT = getGameHeight();

// 玩家飞机
export const PLAYER = {
  WIDTH: 64,
  HEIGHT: 64,
  SPEED: 200, // px/s
  INITIAL_LIVES: 3,
  INITIAL_X: CANVAS_WIDTH / 2,
  INITIAL_Y: CANVAS_HEIGHT - 100,
  FIRE_RATE: 200, // ms
} as const;

// 子弹
export const BULLET = {
  WIDTH: 16,
  HEIGHT: 32,
  SPEED: 300, // px/s
  DAMAGE: 1,
} as const;

// 敌机类型
export const ENEMY_TYPES = {
  SMALL: {
    width: 48,
    height: 48,
    speed: 150, // 移速快
    health: 1,
    score: 10,
    probability: 0.5,
    canFire: true, // 可以发射子弹
    firePattern: 'straight', // 直线发射
  },
  MEDIUM: {
    width: 64,
    height: 64,
    speed: 100,
    health: 5, // 有血量
    score: 30,
    probability: 0.35,
    canFire: true, // 可以发射子弹
    firePattern: 'straight', // 直线发射
  },
  LARGE: {
    width: 80,
    height: 80,
    speed: 60,
    health: 10, // 血量更厚
    score: 50,
    probability: 0.15,
    canFire: true, // 可以发射子弹
    firePattern: 'arc', // 弧形发射
  },
} as const;

// 特殊方块
export const SPECIAL_ITEMS = {
  YELLOW: {
    width: 48,
    height: 48,
    speed: 60,
    spawnInterval: [20000, 30000], // 20-30秒随机生成
    type: 'yellow',
  },
  RED: {
    width: 48,
    height: 48,
    speed: 60,
    spawnInterval: 60000, // 60秒生成一次
    cooldown: 30000, // 30秒冷却
    type: 'red',
  },
} as const;

// 难度等级
export const DIFFICULTY_LEVELS = [
  {
    level: 1,
    scoreRange: [0, 999],
    spawnInterval: 2000,
    speedMultiplier: 1.0,
    largeEnemyProbability: 0.05,
  },
  {
    level: 2,
    scoreRange: [1000, 2999],
    spawnInterval: 1500,
    speedMultiplier: 1.2,
    largeEnemyProbability: 0.1,
  },
  {
    level: 3,
    scoreRange: [3000, 4999],
    spawnInterval: 1200,
    speedMultiplier: 1.5,
    largeEnemyProbability: 0.15,
  },
  {
    level: 4,
    scoreRange: [5000, 7999],
    spawnInterval: 800,
    speedMultiplier: 1.8,
    largeEnemyProbability: 0.2,
  },
  {
    level: 5,
    scoreRange: [8000, Infinity],
    spawnInterval: 500,
    speedMultiplier: 2.0,
    largeEnemyProbability: 0.25,
  },
] as const;

// 增益效果
export const POWER_UPS = {
  EXTRA_BULLET: {
    type: 'extraBullet',
    maxStacks: 2, // 最多3条弹道(1+2)
  },
  SHIELD: {
    type: 'shield',
    permanent: true,
  },
  SPEED_BOOST: {
    type: 'speedBoost',
    multiplier: 1.5,
    duration: 8000, // 8秒
  },
} as const;

// 答题配置
export const QUESTION_CONFIG = {
  NORMAL_TIME_LIMIT: 15000, // 15秒
  REVIVE_TIME_LIMIT: 10000, // 10秒
  MAX_REVIVE_CHANCES: 3,
  SCORE_TRIGGERS: [1000, 3000, 5000, 8000, 12000],
  REWARDS: {
    EASY: 100,
    MEDIUM: 300,
    HARD: 500,
  },
} as const;

// 颜色配置
export const COLORS = {
  BACKGROUND: 0x000000,
  PLAYER: 0x00ff00,
  ENEMY: 0xff0000,
  BULLET_PLAYER: 0xffff00,
  BULLET_ENEMY: 0xff00ff,
  SPECIAL_YELLOW: 0xffff00,
  SPECIAL_RED: 0xff0000,
} as const;
