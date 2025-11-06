import { create } from 'zustand';

export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

interface PowerUps {
  extraBullets: number; // 额外弹道数量
  shield: boolean; // 护盾
  speedBoost: boolean; // 加速
  speedBoostEndTime: number; // 加速结束时间
  bombs: number; // 东风5C导弹数量
}

interface GameStore {
  // 游戏状态
  gameState: GameState;
  score: number;
  lives: number;
  level: number;
  highScore: number;
  
  // 增益效果
  powerUps: PowerUps;
  
  // 复活相关
  reviveChances: number;
  hasUsedRevive: boolean; // 标记是否已使用过复活机会
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  resetGame: () => void;
  
  incrementScore: (points: number) => void;
  loseLife: () => void;
  addLife: () => void;
  
  addExtraBullet: () => void;
  activateShield: () => void;
  activateSpeedBoost: () => void;
  deactivateSpeedBoost: () => void;
  addBomb: () => void;
  useBomb: () => boolean;
  
  useReviveChance: () => boolean;
  loadHighScore: () => void;
  saveHighScore: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  gameState: 'READY',
  score: 0,
  lives: 3,
  level: 1,
  highScore: 0,
  
  powerUps: {
    extraBullets: 0,
    shield: false,
    speedBoost: false,
    speedBoostEndTime: 0,
    bombs: 0,
  },
  
  reviveChances: 3,
  hasUsedRevive: false,
  
  // Actions
  startGame: () => {
    set({
      gameState: 'PLAYING',
      score: 0,
      lives: 3,
      level: 1,
      reviveChances: 3,
      hasUsedRevive: false,
      powerUps: {
        extraBullets: 0,
        shield: false,
        speedBoost: false,
        speedBoostEndTime: 0,
        bombs: 0,
      },
    });
  },
  
  pauseGame: () => {
    set({ gameState: 'PAUSED' });
  },
  
  resumeGame: () => {
    set({ gameState: 'PLAYING' });
  },
  
  gameOver: () => {
    const { score, highScore, saveHighScore } = get();
    if (score > highScore) {
      set({ highScore: score });
      saveHighScore();
    }
    set({ gameState: 'GAME_OVER' });
  },
  
  resetGame: () => {
    set({
      gameState: 'READY',
      score: 0,
      lives: 3,
      level: 1,
      reviveChances: 3,
      hasUsedRevive: false,
      powerUps: {
        extraBullets: 0,
        shield: false,
        speedBoost: false,
        speedBoostEndTime: 0,
        bombs: 0,
      },
    });
  },
  
  incrementScore: (points: number) => {
    set((state) => {
      const newScore = state.score + points;
      const newLevel = Math.floor(newScore / 1000) + 1;
      return {
        score: newScore,
        level: newLevel,
      };
    });
  },
  
  loseLife: () => {
    set((state) => {
      // 如果有护盾，先消耗护盾
      if (state.powerUps.shield) {
        return {
          powerUps: {
            ...state.powerUps,
            shield: false,
          },
        };
      }
      
      // 否则扣血
      const newLives = state.lives - 1;
      
      // 如果生命值为0且未使用过复活，不直接游戏结束
      // 让上层代码监听状态变化并触发复活答题
      if (newLives <= 0 && state.hasUsedRevive) {
        // 已使用过复活，直接游戏结束
        get().gameOver();
      }
      
      return { lives: newLives };
    });
  },
  
  addLife: () => {
    set((state) => ({ lives: state.lives + 1 }));
  },
  
  addExtraBullet: () => {
    set((state) => {
      const newCount = Math.min(state.powerUps.extraBullets + 1, 2);
      console.log('🎯 gameStore.addExtraBullet:', state.powerUps.extraBullets, '→', newCount);
      return {
        powerUps: {
          ...state.powerUps,
          extraBullets: newCount,
        },
      };
    });
  },
  
  activateShield: () => {
    set((state) => {
      console.log('🛡️ gameStore.activateShield:', state.powerUps.shield, '→ true');
      return {
        powerUps: {
          ...state.powerUps,
          shield: true,
        },
      };
    });
  },
  
  activateSpeedBoost: () => {
    set((state) => {
      console.log('⚡ gameStore.activateSpeedBoost:', state.powerUps.speedBoost, '→ true');
      return {
        powerUps: {
          ...state.powerUps,
          speedBoost: true,
          speedBoostEndTime: Date.now() + 8000,
        },
      };
    });
  },
  
  deactivateSpeedBoost: () => {
    set((state) => ({
      powerUps: {
        ...state.powerUps,
        speedBoost: false,
        speedBoostEndTime: 0,
      },
    }));
  },
  
  addBomb: () => {
    set((state) => {
      const newCount = Math.min(state.powerUps.bombs + 1, 3);
      console.log('� gameStore.addBomb:', state.powerUps.bombs, '→', newCount);
      return {
        powerUps: {
          ...state.powerUps,
          bombs: newCount, // 最多3枚东风5C
        },
      };
    });
  },
  
  useBomb: () => {
    const { powerUps } = get();
    if (powerUps.bombs > 0) {
      set((state) => ({
        powerUps: {
          ...state.powerUps,
          bombs: state.powerUps.bombs - 1,
        },
      }));
      return true;
    }
    return false;
  },
  
  useReviveChance: () => {
    const { reviveChances } = get();
    if (reviveChances > 0) {
      set({
        reviveChances: reviveChances - 1,
        lives: 3,
        powerUps: {
          extraBullets: 0,
          shield: true, // 复活后给护盾
          speedBoost: false,
          speedBoostEndTime: 0,
          bombs: 1, // 复活后给一枚东风5C
        },
      });
      return true;
    }
    return false;
  },
  
  loadHighScore: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('xtom3d_highScore');
      if (saved) {
        set({ highScore: parseInt(saved, 10) });
      }
    }
  },
  
  saveHighScore: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('xtom3d_highScore', get().highScore.toString());
    }
  },
}));
