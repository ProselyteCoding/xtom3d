'use client';

import { Modal, Button } from 'antd';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';

interface GameOverModalProps {
  onRestart?: () => void;
  onBackToMenu?: () => void;
}

export default function GameOverModal({ onRestart, onBackToMenu }: GameOverModalProps) {
  const showGameOverModal = useUIStore((state) => state.showGameOverModal);
  const setShowGameOverModal = useUIStore((state) => state.setShowGameOverModal);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const resetGame = useGameStore((state) => state.resetGame);
  const startGame = useGameStore((state) => state.startGame);

  const handleRestart = () => {
    setShowGameOverModal(false);
    resetGame();
    // 等待状态重置后立即开始游戏
    setTimeout(() => {
      startGame();
      onRestart?.();
    }, 100);
  };

  const handleBackToMenu = () => {
    setShowGameOverModal(false);
    resetGame();
    onBackToMenu?.();
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
          🎮 游戏结束
        </div>
      }
      open={showGameOverModal}
      closable={false}
      footer={null}
      width={500}
      zIndex={9999}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        {/* 分数显示 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
              本次分数
            </p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#fff', margin: 0, lineHeight: 1 }}>
              {score}
            </p>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
              最高分数
            </p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', margin: 0, lineHeight: 1 }}>
              {highScore}
            </p>
          </div>
        </div>

        {/* 按钮 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleRestart}
            style={{
              height: '50px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.4)'
            }}
          >
            🎯 再来一次
          </Button>
          
          <Button
            size="large"
            onClick={handleBackToMenu}
            style={{
              height: '50px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px'
            }}
          >
            🏠 返回首页
          </Button>
        </div>
      </div>
    </Modal>
  );
}

