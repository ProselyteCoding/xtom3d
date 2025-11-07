'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Button } from 'antd';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { GameManager } from '@/lib/game/managers/GameManager';
import { AudioManager } from '@/lib/game/managers/AudioManager';
import { gameDimensions } from '@/lib/game/utils/constants';
import GameOverModal from '@/components/GameOverModal';
import styles from './page.module.scss';
import { getAssetPath } from '@/lib/utils/assetPath';

// PixiJS 相关导入
import * as PIXI from 'pixi.js';

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { loadHighScore, highScore, score, lives, gameState, pauseGame, resetGame, powerUps } = useGameStore();
  const { 
    showMenu, 
    showInstructions, 
    showQuestionModal, 
    currentQuestion,
    questionSource,
    questionStartTime,
    questionTimeLimit,
    setShowMenu, 
    setShowInstructions,
    setShowGameOverModal,
    submitAnswer,
    handleTimeout
  } = useUIStore();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(questionTimeLimit);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const gameManagerRef = useRef<GameManager | null>(null);

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  useEffect(() => {
    if (!gameStarted || !canvasRef.current) {
      return;
    }

    const container = canvasRef.current;
    let disposed = false;
    let app: PIXI.Application | null = null;
    let manager: GameManager | null = null;

    const handleResize = () => {
      if (app && container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        app.renderer.resize(width, height);
        gameDimensions.setDimensions(width, height);
      }
    };

    const bootstrap = async () => {
      // 获取容器的实际尺寸
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // 设置全局游戏尺寸
      gameDimensions.setDimensions(width, height);

      const createdApp = new PIXI.Application();
      await createdApp.init({
        width: width,
        height: height,
        background: '#000',
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      });

      if (disposed) {
        createdApp.destroy(true, { children: true });
        return;
      }

      app = createdApp;
      pixiAppRef.current = createdApp;

      const view = (createdApp.canvas ?? createdApp.renderer.view) as HTMLCanvasElement;
      container.appendChild(view);

      manager = new GameManager(createdApp);
      gameManagerRef.current = manager;
      manager.start();

      handleResize();
      window.addEventListener('resize', handleResize);
    };

    bootstrap();

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);

      manager?.destroy();
      gameManagerRef.current = null;

      if (app) {
        app.destroy(true, { children: true });
      }
      pixiAppRef.current = null;

      container.innerHTML = '';
      resetGame();
    };
  }, [gameStarted, resetGame]);

  // 监听游戏结束状态
  useEffect(() => {
    if (gameState === 'GAME_OVER' && gameStarted) {
      // 游戏结束，显示对话框
      setTimeout(() => {
        Modal.info({
          title: '游戏结束',
          content: (
            <div>
              <p>本局分数：{score}</p>
              <p>最高分：{highScore}</p>
            </div>
          ),
          onOk: () => {
            setGameStarted(false);
          },
        });
      }, 500);
    }
  }, [gameState, gameStarted, score, highScore]);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleShowMenu = () => {
    if (!gameStarted) return;
    pauseGame();
    setShowMenu(true);
  };

  // 获取奖励描述
  const getRewardDescription = (source: typeof questionSource) => {
    switch (source) {
      case 'mysteryBlue':
        return { icon: '🛡️', text: '护盾', description: '答对获得护盾保护', isImage: false };
      case 'mysteryRed':
        return { icon: getAssetPath('/assets/missile.png'), text: '东风5C', description: '答对获得1枚东风5C导弹', isImage: true };
      case 'mysteryYellow':
        return { icon: '🎁', text: '随机道具', description: '答对随机获得护盾或东风5C', isImage: false };
      case 'revive':
        return { icon: '❤️', text: '复活机会', description: '答对复活并恢复1点生命', isImage: false };
      default:
        return null;
    }
  };

  const handleAnswerQuestion = useCallback((answer: number | boolean) => {
    const isCorrect = submitAnswer(answer);
    const source = useUIStore.getState().questionSource;
    
    console.log('答题结果:', { isCorrect, source, answer });
    
    // 根据答题来源和结果给予奖励
    if (isCorrect) {
      const gameStore = useGameStore.getState();
      
      if (source === 'mysteryBlue') {
        // 蓝色问号盒：答对获得护盾
        console.log('执行：激活护盾');
        gameStore.activateShield();
        gameStore.incrementScore(100);
        AudioManager.getInstance().playPowerUp();
        console.log('✅ 答对了！获得护盾和 100 分');
      } else if (source === 'mysteryRed') {
        // 红色问号盒：答对获得东风5C
        console.log('执行：添加东风5C');
        gameStore.addBomb();
        gameStore.incrementScore(100);
        AudioManager.getInstance().playPowerUp();
        console.log('✅ 答对了！获得东风5C和 100 分');
      } else if (source === 'mysteryYellow') {
        // 黄色问号盒：答对随机获得东风5C或护盾
        const powerUpTypes = ['bomb', 'shield'] as const;
        const randomIndex = Math.floor(Math.random() * powerUpTypes.length);
        const randomType = powerUpTypes[randomIndex];
        
        console.log('执行：添加随机道具', randomType);
        if (randomType === 'bomb') {
          gameStore.addBomb();
        } else if (randomType === 'shield') {
          gameStore.activateShield();
        }
        
        gameStore.incrementScore(100);
        AudioManager.getInstance().playPowerUp();
        console.log(`✅ 答对了！获得道具：${randomType} 和 100 分`);
      } else if (source === 'revive') {
        // 复活：答对恢复生命到1并标记已使用复活
        console.log('执行：复活');
        useGameStore.setState({ lives: 1, hasUsedRevive: true });
        AudioManager.getInstance().playRevive();
        console.log('✅ 答对了！成功复活！生命值恢复到 1');
      }
    } else {
      if (source === 'revive') {
        // 复活失败，游戏结束
        useGameStore.getState().gameOver();
        console.log('❌ 答错了，复活失败！');
      } else {
        console.log('❌ 答错了，继续加油！');
      }
    }
    
    // 奖励处理完成后，清空答题来源
    useUIStore.getState().clearQuestionSource();
  }, [submitAnswer]);
  
  // 监听生命值变化，生命为0且未使用复活时触发复活答题
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      // 当生命值变为0，且未使用复活，且游戏正在进行时触发复活答题
      if (
        state.lives === 0 && 
        prevState.lives > 0 && 
        !state.hasUsedRevive && 
        state.gameState === 'PLAYING'
      ) {
        console.log('触发复活答题');
        // 暂停游戏并触发复活答题
        pauseGame();
        const { triggerQuestion } = useUIStore.getState();
        triggerQuestion('revive');
      }
      
      // 当游戏结束时，显示游戏结束 Modal
      if (state.gameState === 'GAME_OVER' && prevState.gameState !== 'GAME_OVER') {
        console.log('游戏结束，显示结束界面');
        console.log('调用 setShowGameOverModal(true)');
        setShowGameOverModal(true);
        console.log('setShowGameOverModal 调用完成，当前状态:', useUIStore.getState().showGameOverModal);
      }
    });
    
    return () => unsubscribe();
  }, [pauseGame, setShowGameOverModal]);
  
  // ESC 键关闭菜单
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMenu) {
        setShowMenu(false);
        useGameStore.getState().resumeGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMenu, setShowMenu]);

  // 答题倒计时
  useEffect(() => {
    if (!showQuestionModal || !questionStartTime) {
      setTimeRemaining(questionTimeLimit);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - questionStartTime) / 1000;
      const remaining = Math.max(0, questionTimeLimit - elapsed);
      setTimeRemaining(remaining);

      // 如果时间到了，自动提交（视为答错）
      if (remaining === 0) {
        clearInterval(interval);
        handleTimeout();
      }
    }, 100); // 每100ms更新一次，使进度条更流畅

    return () => clearInterval(interval);
  }, [showQuestionModal, questionStartTime, questionTimeLimit, handleTimeout]);

  return (
    <div className={styles.container}>
      {/* 游戏画布容器 */}
      <div 
        ref={canvasRef} 
        className={styles.gameCanvas}
        style={{ display: gameStarted ? 'block' : 'none' }}
      />

      {/* 首页覆盖层 */}
      {!gameStarted && (
        <div className={styles.homeOverlay}>
          <div className={styles.title}>
            <h1>⚡ 雷霆战机 ⚡</h1>
            <p>反法西斯胜利 · 中华民族伟大复兴</p>
          </div>
          
          <div className={styles.scoreDisplay}>
            <div className={styles.scoreItem}>
              <span>最高分：</span>
              <span className={styles.scoreValue}>{highScore}</span>
            </div>
          </div>
          
          <div className={styles.buttons}>
              <Button 
                className={styles.startButton} 
                type="primary" 
                size="large" 
                onClick={handleStartGame}
              >
                开始游戏
              </Button>
              <Button 
                className={styles.instructionButton} 
                size="large" 
                onClick={handleShowInstructions}
              >
                游戏说明
              </Button>
          </div>
        </div>
      )}

      {/* 菜单按钮 */}
      {gameStarted && (
        <div className={styles.menuButton} onClick={handleShowMenu}>
          ☰
        </div>
      )}

      {/* 游戏内分数显示 */}
      {gameStarted && (
        <div className={styles.gameHUD}>
          <div className={styles.scorePanel}>
            <div>分数：{score}</div>
            <div>❤️ × {lives}</div>
            {powerUps.shield && <div>🛡️ 护盾</div>}
            {powerUps.bombs > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img 
                  src={getAssetPath('/assets/missile.png')}
                  alt="东风5C" 
                  style={{ width: '20px', height: '20px', imageRendering: 'pixelated' }}
                />
                <span>× {powerUps.bombs}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 导弹触发按钮（移动端） */}
      {gameStarted && powerUps.bombs > 0 && (
        <div 
          className={styles.missileButton}
          onClick={() => {
            if (gameManagerRef.current && powerUps.bombs > 0) {
              gameManagerRef.current.useBomb();
            }
          }}
        >
          <img 
            src={getAssetPath('/assets/missile.png')}
            alt="发射导弹" 
          />
        </div>
      )}

      {/* 菜单弹窗 */}
      <Modal
        title="游戏菜单"
        open={showMenu}
        onCancel={() => {
          setShowMenu(false);
          useGameStore.getState().resumeGame();
        }}
        footer={[
          <Button
            key="continue"
            type="primary"
            onClick={() => {
              setShowMenu(false);
              useGameStore.getState().resumeGame();
            }}
          >
            继续游戏
          </Button>,
          <Button key="restart" onClick={() => {
            setGameStarted(false);
            setShowMenu(false);
          }}>
            返回首页
          </Button>,
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <p>当前分数：{score}</p>
          <p>最高分：{highScore}</p>
        </div>
      </Modal>

      {/* 游戏说明弹窗 */}
      <Modal
        title="游戏说明"
        open={showInstructions}
        onCancel={() => setShowInstructions(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowInstructions(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <div style={{ padding: '20px 0', lineHeight: '1.8' }}>
          <h3>🎮 操作说明</h3>
          <ul>
            <li>使用 <strong>WASD</strong> 或 <strong>方向键</strong> 移动飞机</li>
            <li>飞机会自动开火</li>
            <li>按 <strong>空格键</strong> 使用东风5C导弹（清屏攻击）</li>
            <li>按 <strong>ESC</strong> 键暂停游戏</li>
          </ul>
          
          <h3 style={{ marginTop: '20px' }}>💎 道具系统</h3>
          <ul>
            <li>🔥 <strong>火力增强（红色五角星）</strong>：增加额外弹道</li>
            <li>🛡️ <strong>护盾（蓝色圆形）</strong>：抵挡一次伤害</li>
            <li>� <strong>东风5C导弹</strong>：按空格键清除屏幕所有敌人和子弹</li>
          </ul>
          
          <h3 style={{ marginTop: '20px' }}>📚 答题机制</h3>
          <ul>
            <li>游戏过程中会在特定分数触发答题弹窗</li>
            <li>答题期间游戏暂停</li>
            <li>答对获得额外分数奖励（简单100分，中等300分，困难500分）</li>
            <li>答错不会有惩罚</li>
          </ul>
          
          <h3 style={{ marginTop: '20px' }}>🎯 游戏目标</h3>
          <p>在这款以反法西斯胜利和中华民族伟大复兴为主题的飞行射击游戏中，消灭敌人、挑战高分，同时学习历史知识！</p>
        </div>
      </Modal>

      {/* 答题弹窗 */}
      <Modal
        title={currentQuestion?.type === 'judge' ? '判断题' : '单选题'}
        open={showQuestionModal}
        closable={false}
        footer={null}
        width={700}
      >
        {currentQuestion && (
          <div style={{ padding: '20px 0' }}>
            {/* 奖励提示 */}
            {questionSource && getRewardDescription(questionSource) && (
              <div style={{ 
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f0f5ff',
                borderRadius: '8px',
                borderLeft: '4px solid #1890ff'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1890ff'
                }}>
                  {getRewardDescription(questionSource)?.isImage ? (
                    <img 
                      src={getRewardDescription(questionSource)?.icon}
                      alt="东风5C"
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        marginRight: '8px',
                        imageRendering: 'pixelated'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '24px', marginRight: '8px' }}>
                      {getRewardDescription(questionSource)?.icon}
                    </span>
                  )}
                  <span>{getRewardDescription(questionSource)?.description}</span>
                </div>
              </div>
            )}
            
            <h3 style={{ marginBottom: '24px', fontSize: '18px', lineHeight: '1.6' }}>
              {currentQuestion.question}
            </h3>
            
            {/* 单选题显示 */}
            {currentQuestion.type === 'choice' && currentQuestion.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    size="large"
                    style={{ 
                      height: 'auto', 
                      padding: '12px 20px',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      lineHeight: '1.6'
                    }}
                    onClick={() => handleAnswerQuestion(index)}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </Button>
                ))}
              </div>
            )}
            
            {/* 判断题显示 */}
            {currentQuestion.type === 'judge' && (
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '24px' }}>
                <Button
                  type="primary"
                  size="large"
                  style={{ 
                    minWidth: '120px',
                    height: '50px',
                    fontSize: '18px',
                    backgroundColor: '#52c41a'
                  }}
                  onClick={() => handleAnswerQuestion(true)}
                >
                  ✓ 正确
                </Button>
                <Button
                  danger
                  size="large"
                  style={{ 
                    minWidth: '120px',
                    height: '50px',
                    fontSize: '18px'
                  }}
                  onClick={() => handleAnswerQuestion(false)}
                >
                  ✗ 错误
                </Button>
              </div>
            )}
            
            {/* 倒计时进度条 */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#666' }}>答题时间</span>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: timeRemaining < 10 ? '#ff4d4f' : '#1890ff'
                }}>
                  {Math.ceil(timeRemaining)}s
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${(timeRemaining / questionTimeLimit) * 100}%`,
                  height: '100%',
                  backgroundColor: timeRemaining < 10 ? '#ff4d4f' : '#1890ff',
                  transition: 'width 0.1s linear, background-color 0.3s',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 游戏结束 Modal */}
      <GameOverModal 
        onRestart={() => {
          // 再来一次：保持游戏运行状态，但重置游戏
          // gameStarted 保持为 true，这样游戏会继续运行
        }}
        onBackToMenu={() => {
          // 返回首页：关闭游戏，显示首页
          setGameStarted(false);
        }}
      />
    </div>
  );
}
