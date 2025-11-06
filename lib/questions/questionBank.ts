import { Question } from '@/store/uiStore';

/**
 * 题库数据 - 反法西斯胜利 & 中华民族伟大复兴主题
 */
export const questionBank: Question[] = [
  // 简单题
  {
    id: 'q001',
    question: '中国人民抗日战争胜利纪念日是哪一天？',
    options: ['9月3日', '8月15日', '10月1日', '7月7日'],
    correctAnswer: 0,
    difficulty: 'easy',
    category: '反法西斯胜利',
  },
  {
    id: 'q002',
    question: '第二次世界大战中,法西斯轴心国不包括以下哪个国家？',
    options: ['苏联', '德国', '日本', '意大利'],
    correctAnswer: 0,
    difficulty: 'easy',
    category: '反法西斯胜利',
  },
  {
    id: 'q003',
    question: '中国共产党第十九次全国代表大会提出的"两个一百年"奋斗目标中,第一个百年目标是？',
    options: [
      '2021年全面建成小康社会',
      '2049年建成社会主义现代化强国',
      '2035年基本实现现代化',
      '2050年实现共同富裕',
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: '中华民族伟大复兴',
  },
  {
    id: 'q004',
    question: '中国梦的本质是？',
    options: [
      '国家富强、民族振兴、人民幸福',
      '经济发展',
      '军事强大',
      '文化繁荣',
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: '中华民族伟大复兴',
  },
  {
    id: 'q005',
    question: '抗日战争全面爆发的标志性事件是？',
    options: ['七七事变', '九一八事变', '淞沪会战', '百团大战'],
    correctAnswer: 0,
    difficulty: 'easy',
    category: '反法西斯胜利',
  },
  
  // 中等题
  {
    id: 'q006',
    question: '中国在抗日战争中的作用是什么？',
    options: [
      '开辟了世界反法西斯战争的东方主战场',
      '仅仅是配合作战',
      '主要负责后勤保障',
      '提供经济援助',
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    category: '反法西斯胜利',
  },
  {
    id: 'q007',
    question: '"一带一路"倡议的核心理念是？',
    options: [
      '共商共建共享',
      '以邻为壑',
      '单边主义',
      '零和博弈',
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    category: '中华民族伟大复兴',
  },
  {
    id: 'q008',
    question: '中国特色社会主义进入新时代的主要矛盾是？',
    options: [
      '人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾',
      '生产力与生产关系的矛盾',
      '经济基础与上层建筑的矛盾',
      '阶级矛盾',
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    category: '中华民族伟大复兴',
  },
  {
    id: 'q009',
    question: '世界反法西斯战争胜利的重要意义不包括？',
    options: [
      '消除了所有战争隐患',
      '维护了世界和平',
      '促进了民族解放运动',
      '建立了联合国',
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    category: '反法西斯胜利',
  },
  {
    id: 'q010',
    question: '脱贫攻坚战取得全面胜利是在哪一年？',
    options: ['2020年', '2021年', '2019年', '2018年'],
    correctAnswer: 0,
    difficulty: 'medium',
    category: '中华民族伟大复兴',
  },
  
  // 困难题
  {
    id: 'q011',
    question: '抗日战争胜利对实现中华民族伟大复兴的深远影响是？',
    options: [
      '奠定了中国人民自立于世界民族之林的坚实基础,开启了民族复兴的新纪元',
      '仅仅是赢得了战争',
      '获得了物质赔偿',
      '扩大了国土面积',
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: '反法西斯胜利',
  },
  {
    id: 'q012',
    question: '实现中华民族伟大复兴的根本保证是？',
    options: [
      '坚持中国共产党的领导',
      '经济高速发展',
      '科技进步',
      '文化自信',
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: '中华民族伟大复兴',
  },
  {
    id: 'q013',
    question: '中国在世界反法西斯战争中付出的代价和贡献体现在？',
    options: [
      '伤亡3500万人以上,牵制和消灭了日本陆军主力',
      '仅提供了物资支援',
      '只是在局部战场作战',
      '主要依靠外国援助',
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: '反法西斯胜利',
  },
  {
    id: 'q014',
    question: '习近平新时代中国特色社会主义思想的核心要义是？',
    options: [
      '坚持和发展中国特色社会主义',
      '全面建成小康社会',
      '实现共同富裕',
      '科技创新',
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: '中华民族伟大复兴',
  },
  {
    id: 'q015',
    question: '实现中华民族伟大复兴需要弘扬的抗战精神核心是？',
    options: [
      '爱国主义为核心的伟大民族精神',
      '个人英雄主义',
      '盲目乐观主义',
      '狭隘民族主义',
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    category: '反法西斯胜利',
  },
];

/**
 * 根据难度获取随机题目
 */
export function getRandomQuestion(
  difficulty: 'easy' | 'medium' | 'hard',
  usedQuestions: Set<string> = new Set()
): Question | null {
  const availableQuestions = questionBank.filter(
    (q) => q.difficulty === difficulty && !usedQuestions.has(q.id)
  );
  
  if (availableQuestions.length === 0) {
    // 如果该难度没有未用过的题目，从所有题目中随机选择
    const fallbackQuestions = questionBank.filter(
      (q) => q.difficulty === difficulty
    );
    if (fallbackQuestions.length === 0) return null;
    return fallbackQuestions[
      Math.floor(Math.random() * fallbackQuestions.length)
    ];
  }
  
  return availableQuestions[
    Math.floor(Math.random() * availableQuestions.length)
  ];
}

/**
 * 根据分数获取对应难度的题目
 */
export function getQuestionByScore(
  score: number,
  usedQuestions: Set<string> = new Set()
): Question | null {
  let difficulty: 'easy' | 'medium' | 'hard';
  
  if (score < 3000) {
    difficulty = 'easy';
  } else if (score < 12000) {
    difficulty = 'medium';
  } else {
    difficulty = 'hard';
  }
  
  return getRandomQuestion(difficulty, usedQuestions);
}
