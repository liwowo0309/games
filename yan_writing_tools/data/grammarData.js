/**
 * English Writing Studio - Grammar Data
 * 找茬大作战 - 题库数据
 */

import { filterByPracticeTarget } from '../js/utils.js';

export const grammarData = [
    // ===== 初级：基础语法 =====
    {
        id: 'grammar-001',
        grades: ['小学5年级', '小学6年级', '初一'],
        difficulty: 'beginner',
        category: 'spelling',
        categoryName: '拼写',
        text: 'I am a studant. I like to study English.',
        errors: [
            { word: 'studant', correct: 'student', index: 3, type: 'spelling' }
        ],
        explanation: 'student 拼写错误，应该是 student 而不是 studant。',
        hint: '学生的英文是 student，注意 u 的位置。'
    },
    {
        id: 'grammar-002',
        grades: ['小学5年级', '小学6年级', '初一'],
        difficulty: 'beginner',
        category: 'tense',
        categoryName: '时态',
        text: 'Yesterday, I go to the park with my friends.',
        errors: [
            { word: 'go', correct: 'went', index: 3, type: 'tense' }
        ],
        explanation: 'yesterday 表示过去时间，动词要用过去式 went。',
        hint: 'yesterday 是昨天，表示过去发生的事情。'
    },
    {
        id: 'grammar-003',
        grades: ['小学6年级', '初一', '初二'],
        difficulty: 'beginner',
        category: 'preposition',
        categoryName: '介词',
        text: 'I arrive at school in 8 o\'clock.',
        errors: [
            { word: 'in', correct: 'at', index: 4, type: 'preposition' }
        ],
        explanation: '具体时间点前用 at，in 用于较长的时间段（如 in the morning）。',
        hint: '点钟前用 at，比如 at 9 o\'clock。'
    },
    {
        id: 'grammar-004',
        grades: ['小学6年级', '初一', '初二'],
        difficulty: 'beginner',
        category: 'article',
        categoryName: '冠词',
        text: 'I want to be a engineer when I grow up.',
        errors: [
            { word: 'a', correct: 'an', index: 3, type: 'article' }
        ],
        explanation: 'engineer 以元音音素开头，前面要用 an 而不是 a。',
        hint: '元音开头的单词前用 an。'
    },
    {
        id: 'grammar-005',
        grades: ['初一', '初二', '初三'],
        difficulty: 'beginner',
        category: 'agreement',
        categoryName: '主谓一致',
        text: 'He don\'t like playing basketball.',
        errors: [
            { word: 'don\'t', correct: 'doesn\'t', index: 1, type: 'agreement' }
        ],
        explanation: '第三人称单数 He 后面要用 doesn\'t，而不是 don\'t。',
        hint: 'He/She/It 后面用 does/doesn\'t，I/You/We/They 后面用 do/don\'t。'
    },
    
    // ===== 中级：从句和复杂结构 =====
    {
        id: 'grammar-006',
        grades: ['初二', '初三', '高一'],
        difficulty: 'intermediate',
        category: 'clause',
        categoryName: '从句',
        text: 'This is the book which I bought it yesterday.',
        errors: [
            { word: 'it', correct: '', index: 7, type: 'clause', action: 'remove' }
        ],
        explanation: '定语从句中，关系代词 which 已经充当宾语，不需要再加 it。',
        hint: 'which 在这里是 bought 的宾语，不需要 it。'
    },
    {
        id: 'grammar-007',
        grades: ['初二', '初三', '高一'],
        difficulty: 'intermediate',
        category: 'word-order',
        categoryName: '语序',
        text: 'I very like English. It is very interesting.',
        errors: [
            { word: 'very like', correct: 'like ... very much', index: 1, type: 'word-order' }
        ],
        explanation: '英语中 very much 放在动词后面，不是 very + 动词。',
        hint: 'like ... very much 而不是 very like。'
    },
    {
        id: 'grammar-008',
        grades: ['初三', '高一', '高二'],
        difficulty: 'intermediate',
        category: 'conjunction',
        categoryName: '连词',
        text: 'Although it was raining, but we still went out.',
        errors: [
            { word: 'but', correct: '', index: 5, type: 'conjunction', action: 'remove' }
        ],
        explanation: '英语中 although 和 but 不能同时使用，只能用一个。',
        hint: 'Although 和 but 只能二选一。'
    },
    {
        id: 'grammar-009',
        grades: ['初三', '高一', '高二'],
        difficulty: 'intermediate',
        category: 'non-finite',
        categoryName: '非谓语',
        text: 'I enjoy to read books in my free time.',
        errors: [
            { word: 'to read', correct: 'reading', index: 2, type: 'non-finite' }
        ],
        explanation: 'enjoy 后面要接动名词 doing，不能接不定式 to do。',
        hint: 'enjoy doing something 是固定搭配。'
    },
    
    // ===== 高级：虚拟语气和复杂结构 =====
    {
        id: 'grammar-010',
        grades: ['高一', '高二', '高三'],
        difficulty: 'advanced',
        category: 'subjunctive',
        categoryName: '虚拟语气',
        text: 'If I am you, I would accept this offer.',
        errors: [
            { word: 'am', correct: 'were', index: 2, type: 'subjunctive' }
        ],
        explanation: '虚拟语气中，无论主语是谁，be 动词都用 were。',
        hint: 'If I were you 是虚拟语气的固定表达。'
    },
    {
        id: 'grammar-011',
        grades: ['高二', '高三'],
        difficulty: 'advanced',
        category: 'inversion',
        categoryName: '倒装',
        text: 'I had never seen such a beautiful sunset before.',
        errors: [
            { word: 'I had', correct: 'Never had I', index: 0, type: 'inversion' }
        ],
        explanation: '否定词 never 放在句首时，句子要部分倒装。',
        hint: 'Never 放句首要倒装：Never + 助动词 + 主语 + 动词。',
        isAdvanced: true
    },
    {
        id: 'grammar-012',
        grades: ['高二', '高三'],
        difficulty: 'advanced',
        category: 'emphasis',
        categoryName: '强调句',
        text: 'It is only in this way which we can solve the problem.',
        errors: [
            { word: 'which', correct: 'that', index: 5, type: 'emphasis' }
        ],
        explanation: '强调句型 It is...that... 中只能用 that，不能用 which/who。',
        hint: '强调句型 It is ... that ...，that 不能换。'
    },
    
    // ===== 更多题目... =====
    {
        id: 'grammar-013',
        grades: ['初一', '初二', '初三'],
        difficulty: 'intermediate',
        category: 'comparison',
        categoryName: '比较级',
        text: 'Shanghai is more bigger than Suzhou.',
        errors: [
            { word: 'more bigger', correct: 'bigger', index: 2, type: 'comparison' }
        ],
        explanation: 'bigger 本身已经是比较级，不需要再加 more。',
        hint: '单音节形容词的比较级加 -er，不需要 more。'
    },
    {
        id: 'grammar-014',
        grades: ['初一', '初二', '初三'],
        difficulty: 'beginner',
        category: 'plural',
        categoryName: '单复数',
        text: 'I have two child. They are very cute.',
        errors: [
            { word: 'child', correct: 'children', index: 2, type: 'plural' }
        ],
        explanation: 'child 的复数形式是不规则变化 children。',
        hint: 'two 后面要用复数，child 的复数是 children。'
    },
    {
        id: 'grammar-015',
        grades: ['初三', '高一', '高二'],
        difficulty: 'intermediate',
        category: 'passive',
        categoryName: '被动语态',
        text: 'The book was written by a famous writer in 1990.',
        errors: [],
        explanation: '这句话语法正确。被动语态 was written 使用正确，by 引出动作执行者。',
        hint: '这句话没有错误哦！',
        isCorrect: true
    },
    
    // ===== 词组搭配 =====
    {
        id: 'grammar-016',
        grades: ['小学5年级', '小学6年级', '初一'],
        difficulty: 'beginner',
        category: 'collocation',
        categoryName: '词组搭配',
        text: 'I make my homework every day.',
        errors: [
            { word: 'make', correct: 'do', index: 1, type: 'collocation' }
        ],
        explanation: '做作业应该用 do homework，而不是 make homework。',
        hint: '做作业是 do homework，make 通常用于制作东西。'
    },
    {
        id: 'grammar-017',
        grades: ['初一', '初二', '初三'],
        difficulty: 'beginner',
        category: 'collocation',
        categoryName: '词组搭配',
        text: 'He takes a shower with his friends yesterday.',
        errors: [
            { word: 'takes', correct: 'took', index: 1, type: 'tense' }
        ],
        explanation: 'yesterday 表示过去时间，动词 take 要用过去式 took。take a shower 是固定搭配。',
        hint: 'yesterday 是昨天，take 的过去式是 took。'
    },
    {
        id: 'grammar-018',
        grades: ['小学6年级', '初一', '初二'],
        difficulty: 'beginner',
        category: 'collocation',
        categoryName: '词组搭配',
        text: 'I am good in playing basketball.',
        errors: [
            { word: 'in', correct: 'at', index: 3, type: 'collocation' }
        ],
        explanation: '擅长做某事应该用 be good at，而不是 be good in。',
        hint: '擅长... 用 be good at，这是固定搭配。'
    },
    {
        id: 'grammar-019',
        grades: ['初一', '初二', '初三'],
        difficulty: 'intermediate',
        category: 'collocation',
        categoryName: '词组搭配',
        text: 'She is interested on learning English.',
        errors: [
            { word: 'on', correct: 'in', index: 3, type: 'collocation' }
        ],
        explanation: '对...感兴趣应该用 be interested in，而不是 be interested on。',
        hint: 'be interested in 是固定搭配，表示对...感兴趣。'
    },
    {
        id: 'grammar-020',
        grades: ['初二', '初三', '高一'],
        difficulty: 'intermediate',
        category: 'collocation',
        categoryName: '词组搭配',
        text: 'We should pay attention for our pronunciation.',
        errors: [
            { word: 'for', correct: 'to', index: 4, type: 'collocation' }
        ],
        explanation: '注意... 应该用 pay attention to，而不是 pay attention for。',
        hint: 'pay attention to 是固定搭配，表示注意...。'
    },
    {
        id: 'grammar-021',
        grades: ['初三', '高一', '高二'],
        difficulty: 'advanced',
        category: 'collocation',
        categoryName: '词组搭配',
        text: 'The meeting will be held at next Monday.',
        errors: [
            { word: 'at', correct: '', index: 5, type: 'collocation', action: 'remove' }
        ],
        explanation: 'next Monday 前不需要加介词 at，直接说 The meeting will be held next Monday。',
        hint: 'next/last + 时间 前面不加介词。'
    },
    
    // ===== 词性转换 =====
    {
        id: 'grammar-022',
        grades: ['小学6年级', '初一', '初二'],
        difficulty: 'beginner',
        category: 'word-formation',
        categoryName: '词性转换',
        text: 'She is a very success teacher.',
        errors: [
            { word: 'success', correct: 'successful', index: 4, type: 'word-formation' }
        ],
        explanation: '修饰名词 teacher 应该用形容词 successful，而不是名词 success。',
        hint: '修饰名词用形容词，success 的形容词是 successful。'
    },
    {
        id: 'grammar-023',
        grades: ['初一', '初二', '初三'],
        difficulty: 'intermediate',
        category: 'word-formation',
        categoryName: '词性转换',
        text: 'He speaks English very good.',
        errors: [
            { word: 'good', correct: 'well', index: 4, type: 'word-formation' }
        ],
        explanation: '修饰动词 speaks 应该用副词 well，而不是形容词 good。',
        hint: '修饰动词用副词，good 的副词是 well。'
    },
    {
        id: 'grammar-024',
        grades: ['初二', '初三', '高一'],
        difficulty: 'intermediate',
        category: 'word-formation',
        categoryName: '词性转换',
        text: 'The happy of the children is our goal.',
        errors: [
            { word: 'happy', correct: 'happiness', index: 1, type: 'word-formation' }
        ],
        explanation: '作主语应该用名词 happiness，而不是形容词 happy。',
        hint: '句子缺少主语，需要名词，happy 的名词是 happiness。'
    },
    {
        id: 'grammar-025',
        grades: ['初三', '高一', '高二'],
        difficulty: 'advanced',
        category: 'word-formation',
        categoryName: '词性转换',
        text: 'We should make a decide as soon as possible.',
        errors: [
            { word: 'decide', correct: 'decision', index: 3, type: 'word-formation' }
        ],
        explanation: 'make a 后面应该接名词 decision，而不是动词 decide。make a decision 是固定搭配。',
        hint: 'make a + 名词，decide 的名词是 decision。'
    }
];

// 分类信息
export const GRAMMAR_CATEGORIES = {
    tense: { name: '时态', icon: '⏰', color: '#3b82f6' },
    preposition: { name: '介词', icon: '📍', color: '#10b981' },
    article: { name: '冠词', icon: '🔤', color: '#8b5cf6' },
    agreement: { name: '主谓一致', icon: '🤝', color: '#ec4899' },
    clause: { name: '从句', icon: '🔗', color: '#6366f1' },
    'word-order': { name: '语序', icon: '🔄', color: '#f97316' },
    conjunction: { name: '连词', icon: '⛓️', color: '#06b6d4' },
    'non-finite': { name: '非谓语', icon: '📝', color: '#84cc16' },
    subjunctive: { name: '虚拟语气', icon: '🔮', color: '#a855f7' },
    inversion: { name: '倒装', icon: '🔃', color: '#ef4444' },
    emphasis: { name: '强调句', icon: '❗', color: '#eab308' },
    comparison: { name: '比较级', icon: '⚖️', color: '#14b8a6' },
    plural: { name: '单复数', icon: '👥', color: '#64748b' },
    passive: { name: '被动语态', icon: '♻️', color: '#22c55e' },
    collocation: { name: '词组搭配', icon: '🧩', color: '#f59e0b' },
    'word-formation': { name: '词性转换', icon: '🔄', color: '#a855f7' }
};

// 难度级别
export const DIFFICULTY_LEVELS = {
    beginner: { name: '初级', color: '#10b981', minScore: 0 },
    intermediate: { name: '中级', color: '#f59e0b', minScore: 60 },
    advanced: { name: '高级', color: '#ef4444', minScore: 80 }
};

// 按年级过滤
export function filterByGrade(grade) {
    if (!grade || grade === 'all') return grammarData;
    return grammarData.filter(item => item.grades.includes(grade));
}

// 按分类过滤
export function filterByCategory(category) {
    return grammarData.filter(item => item.category === category);
}

// 按难度过滤
export function filterByDifficulty(difficulty) {
    return grammarData.filter(item => item.difficulty === difficulty);
}

/**
 * @param {string|null} grade
 * @param {string|null} category
 * @param {string|null} examGoal
 */
export function getRandomExercise(grade = null, category = null, examGoal = null) {
    let data = grammarData;
    if (examGoal && examGoal !== 'all') {
        data = filterByPracticeTarget(data, examGoal);
    } else if (grade) {
        data = filterByGrade(grade);
    }
    if (category) data = filterByCategory(category);
    if (data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

// 获取分类统计
export function getCategoryStats(grade = null) {
    const data = grade ? filterByGrade(grade) : grammarData;
    const stats = {};
    
    Object.keys(GRAMMAR_CATEGORIES).forEach(cat => {
        stats[cat] = data.filter(item => item.category === cat).length;
    });
    
    return stats;
}

export default {
    grammarData,
    GRAMMAR_CATEGORIES,
    DIFFICULTY_LEVELS,
    filterByGrade,
    filterByCategory,
    filterByDifficulty,
    getRandomExercise,
    getCategoryStats
};
