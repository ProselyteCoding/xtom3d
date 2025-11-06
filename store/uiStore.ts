import { create } from 'zustand';
import { useGameStore } from './gameStore';
import { judgeQuestions } from '@/lib/questions/judgeQuestions';
import { choiceQuestions } from '@/lib/questions/choiceQuestions';

export type QuestionType = 'choice' | 'judge';

// 答题触发场景
export type QuestionTriggerSource = 'mysteryBlue' | 'mysteryRed' | 'mysteryYellow' | 'revive';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[]; // 单选题的选项
  // 答案在提交时才比对，不存储在这里
}

interface UIStore {
  // Modal 显示状态
  showMenu: boolean;
  showInstructions: boolean;
  showQuestionModal: boolean;
  showGameOverModal: boolean;
  
  // 当前题目
  currentQuestion: Question | null;
  currentAnswer: number | boolean | null; // 存储正确答案用于比对
  questionSource: QuestionTriggerSource | null; // 答题触发来源
  questionStartTime: number | null; // 答题开始时间
  questionTimeLimit: number; // 答题时间限制（秒）
  
  // Actions
  setShowMenu: (show: boolean) => void;
  setShowInstructions: (show: boolean) => void;
  setShowGameOverModal: (show: boolean) => void;
  
  triggerQuestion: (source: QuestionTriggerSource) => void;
  submitAnswer: (answer: number | boolean) => boolean; // 返回是否答对
  handleTimeout: () => void; // 处理超时
  clearQuestionSource: () => void; // 清空答题来源
}

export const useUIStore = create<UIStore>((set, get) => ({
  // 初始状态
  showMenu: false,
  showInstructions: false,
  showQuestionModal: false,
  showGameOverModal: false,
  
  currentQuestion: null,
  currentAnswer: null,
  questionSource: null,
  questionStartTime: null,
  questionTimeLimit: 30, // 30秒答题时间
  
  // Actions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  setShowMenu: (show) => set({ showMenu: show }),
  setShowInstructions: (show) => set({ showInstructions: show }),
  setShowGameOverModal: (show) => set({ showGameOverModal: show }),
  
  triggerQuestion: (source: QuestionTriggerSource) => {
    // 随机选择题型：0 = 单选题, 1 = 判断题
    const questionType = Math.random() < 0.5 ? 'choice' : 'judge';
    
    if (questionType === 'choice') {
      // 随机选择一道单选题
      const randomIndex = Math.floor(Math.random() * choiceQuestions.length);
      const selectedQuestion = choiceQuestions[randomIndex];
      
      const question: Question = {
        id: selectedQuestion.id,
        type: 'choice',
        question: selectedQuestion.question,
        options: selectedQuestion.options,
      };
      
      set({ 
        showQuestionModal: true, 
        currentQuestion: question,
        currentAnswer: selectedQuestion.answer, // 存储正确答案索引
        questionSource: source,
        questionStartTime: Date.now(), // 记录开始时间
      });
    } else {
      // 随机选择一道判断题
      const randomIndex = Math.floor(Math.random() * judgeQuestions.length);
      const selectedQuestion = judgeQuestions[randomIndex];
      
      const question: Question = {
        id: selectedQuestion.id,
        type: 'judge',
        question: selectedQuestion.question,
      };
      
      set({ 
        showQuestionModal: true, 
        currentQuestion: question,
        currentAnswer: selectedQuestion.answer, // 存储正确答案 true/false
        questionSource: source,
        questionStartTime: Date.now(), // 记录开始时间
      });
    }
    
    useGameStore.getState().pauseGame();
  },
  
  submitAnswer: (answer: number | boolean) => {
    const { currentQuestion, currentAnswer, questionSource } = get();
    if (currentQuestion && currentAnswer !== null) {
      const isCorrect = answer === currentAnswer;
      
      console.log('submitAnswer 执行:', { answer, currentAnswer, isCorrect, questionSource });
      
      // 先恢复游戏和关闭弹窗（但保持 questionSource，让外部能读取）
      set({ 
        showQuestionModal: false, 
        currentQuestion: null, 
        currentAnswer: null,
        questionStartTime: null 
      });
      useGameStore.getState().resumeGame();
      
      // 返回是否答对（注意：此时 questionSource 仍然保留，等待外部处理完后再清空）
      return isCorrect;
    }
    return false;
  },
  
  // 处理超时
  handleTimeout: () => {
    const { questionSource } = get();
    console.log('答题超时:', { questionSource });
    
    // 关闭弹窗，恢复游戏
    set({ 
      showQuestionModal: false, 
      currentQuestion: null, 
      currentAnswer: null,
      questionStartTime: null 
    });
    useGameStore.getState().resumeGame();
    
    // 如果是复活答题超时，则游戏结束
    if (questionSource === 'revive') {
      useGameStore.getState().gameOver();
    }
    
    // 返回 false 表示答题失败
    return false;
  },
  
  // 新增：清空答题来源（在奖励发放完成后调用）
  clearQuestionSource: () => {
    set({ questionSource: null, questionStartTime: null });
  },
}));
