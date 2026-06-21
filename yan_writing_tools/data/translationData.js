/**
 * English Writing Studio - Translation Data
 * 翻译侦探社 - 题库数据
 */

import { filterByPracticeTarget } from '../js/utils.js';

export const translationData = [
    // ===== 见习侦探级别 (日常对话) =====
    {
        id: 'trans-001',
        grades: ['小学3年级', '小学4年级', '小学5年级'],
        difficulty: 'apprentice',
        chinese: '你好，我叫小明。',
        clues: ['hello', 'name', 'Xiaoming'],
        simpleTranslation: 'Hello, I am Xiaoming.',
        advancedTranslation: 'Hello, my name is Xiaoming.',
        vocabularyComparison: [
            { simple: 'I am', advanced: 'my name is', reason: 'my name is 在介绍自己时更正式' }
        ],
        tags: ['问候', '自我介绍']
    },
    {
        id: 'trans-002',
        grades: ['小学4年级', '小学5年级', '小学6年级'],
        difficulty: 'apprentice',
        chinese: '我喜欢吃苹果。',
        clues: ['like', 'eat', 'apples'],
        simpleTranslation: 'I like eat apples.',
        advancedTranslation: 'I like eating apples. / I enjoy eating apples.',
        vocabularyComparison: [
            { simple: 'like', advanced: 'enjoy', reason: 'enjoy 表示更强烈的喜欢' },
            { simple: 'like eat', advanced: 'like eating', reason: 'like 后接动词-ing形式' }
        ],
        tags: ['食物', '爱好']
    },
    {
        id: 'trans-003',
        grades: ['小学5年级', '小学6年级', '初一'],
        difficulty: 'apprentice',
        chinese: '今天天气很好。',
        clues: ['today', 'weather', 'good'],
        simpleTranslation: 'Today weather is good.',
        advancedTranslation: 'The weather is nice today. / It is a beautiful day today.',
        vocabularyComparison: [
            { simple: 'good', advanced: 'nice/beautiful/lovely', reason: '描述天气用nice/beautiful更地道' },
            { simple: 'Today weather', advanced: 'The weather', reason: 'weather前需要加定冠词the' }
        ],
        tags: ['天气', '日常']
    },
    {
        id: 'trans-004',
        grades: ['小学5年级', '小学6年级', '初一'],
        difficulty: 'apprentice',
        chinese: '我在学校学习。',
        clues: ['at', 'school', 'study'],
        simpleTranslation: 'I at school study.',
        advancedTranslation: 'I study at school.',
        vocabularyComparison: [
            { simple: 'I at school study', advanced: 'I study at school', reason: '英语语序是主语+动词+地点' }
        ],
        tags: ['校园', '学习']
    },
    
    // ===== 正式侦探级别 (校园故事) =====
    {
        id: 'trans-005',
        grades: ['小学6年级', '初一', '初二'],
        difficulty: 'detective',
        chinese: '我们每天早上八点开始上课。',
        clues: ['every morning', 'eight o\'clock', 'start', 'class'],
        simpleTranslation: 'We every morning at eight start class.',
        advancedTranslation: 'Classes begin at 8 o\'clock every morning. / We start our classes at 8 a.m. every day.',
        vocabularyComparison: [
            { simple: 'start', advanced: 'begin', reason: 'begin 比 start 更正式' },
            { simple: 'eight', advanced: '8 o\'clock / 8 a.m.', reason: 'a.m. 表示上午，更精确' }
        ],
        tags: ['校园', '时间']
    },
    {
        id: 'trans-006',
        grades: ['初一', '初二', '初三'],
        difficulty: 'detective',
        chinese: '这本书很有趣，我已经读了三遍了。',
        clues: ['book', 'interesting', 'read', 'three times'],
        simpleTranslation: 'This book is very interesting. I have read it three times.',
        advancedTranslation: 'This book is so fascinating that I have read it three times already.',
        vocabularyComparison: [
            { simple: 'interesting', advanced: 'fascinating/captivating', reason: 'fascinating 表示非常吸引人' },
            { simple: 'very interesting', advanced: 'so fascinating that', reason: 'so...that 结构更有表现力' }
        ],
        tags: ['阅读', '爱好']
    },
    {
        id: 'trans-007',
        grades: ['初二', '初三', '高一'],
        difficulty: 'detective',
        chinese: '我的朋友Tom是个乐于助人的人。',
        clues: ['friend', 'Tom', 'helpful', 'person'],
        simpleTranslation: 'My friend Tom is a person who likes to help others.',
        advancedTranslation: 'My friend Tom is a helpful and considerate person who is always ready to lend a hand.',
        vocabularyComparison: [
            { simple: 'likes to help others', advanced: 'helpful and considerate', reason: '形容词更简洁有力' },
            { simple: 'help others', advanced: 'lend a hand', reason: 'lend a hand 是地道习语' }
        ],
        tags: ['人物', '友谊']
    },
    {
        id: 'trans-008',
        grades: ['初二', '初三', '高一'],
        difficulty: 'detective',
        chinese: '随着科技的发展，我们的生活发生了巨大的变化。',
        clues: ['technology', 'develop', 'life', 'great changes'],
        simpleTranslation: 'With the development of technology, our life has big changes.',
        advancedTranslation: 'With the advancement of technology, our lives have undergone tremendous changes.',
        vocabularyComparison: [
            { simple: 'development', advanced: 'advancement', reason: 'advancement 强调进步' },
            { simple: 'big changes', advanced: 'undergone tremendous changes', reason: 'undergo changes 是固定搭配' }
        ],
        tags: ['科技', '社会']
    },
    
    // ===== 特级侦探级别 (诗歌名言) =====
    {
        id: 'trans-009',
        grades: ['初三', '高一', '高二'],
        difficulty: 'master',
        chinese: '活到老，学到老。',
        clues: ['live', 'old', 'learn', 'never too late'],
        simpleTranslation: 'Live until old, learn until old.',
        advancedTranslation: 'It is never too late to learn. / One is never too old to learn.',
        vocabularyComparison: [
            { simple: '直译', advanced: 'It is never too late to learn', reason: '英语谚语，更地道' }
        ],
        tags: ['名言', '学习']
    },
    {
        id: 'trans-010',
        grades: ['高一', '高二', '高三'],
        difficulty: 'master',
        chinese: '山重水复疑无路，柳暗花明又一村。',
        clues: ['mountains', 'water', 'doubt', 'no road', 'willows', 'flowers', 'another village'],
        simpleTranslation: 'After many mountains and waters, I doubt there is no road. But willows are dark and flowers are bright, and there is another village.',
        advancedTranslation: 'After endless mountains and rivers that seem to block the way, suddenly there appears a village with willows in dark green and flowers in bright colors.',
        vocabularyComparison: [
            { simple: '直译', advanced: '意译加文学修饰', reason: '诗歌需要意境传达' }
        ],
        tags: ['诗歌', '文化']
    },
    {
        id: 'trans-011',
        grades: ['高二', '高三'],
        difficulty: 'master',
        chinese: '环境保护是我们这一代人的责任。',
        clues: ['environmental protection', 'our generation', 'responsibility'],
        simpleTranslation: 'Environmental protection is the responsibility of our generation.',
        advancedTranslation: 'It is incumbent upon our generation to safeguard the environment for posterity.',
        vocabularyComparison: [
            { simple: 'protection', advanced: 'safeguard', reason: 'safeguard 更正式，强调保护' },
            { simple: 'our generation', advanced: 'posterity', reason: 'posterity 指后代，更有深度' },
            { simple: 'responsibility', advanced: 'incumbent upon', reason: 'incumbent upon 表示义不容辞' }
        ],
        tags: ['环保', '议论文']
    },
    {
        id: 'trans-012',
        grades: ['高二', '高三'],
        difficulty: 'master',
        chinese: '网络让世界变成了地球村。',
        clues: ['internet', 'world', 'global village'],
        simpleTranslation: 'The internet makes the world become a global village.',
        advancedTranslation: 'The Internet has transformed the world into a global village, bridging geographical divides and fostering unprecedented connectivity.',
        vocabularyComparison: [
            { simple: 'makes...become', advanced: 'has transformed...into', reason: 'transform 更有转变的力度' },
            { simple: '网络让世界变成', advanced: 'bridging divides and fostering connectivity', reason: '补充具体影响更有说服力' }
        ],
        tags: ['科技', '社会']
    },
    
    // ===== 更多题目... =====
    {
        id: 'trans-013',
        grades: ['小学6年级', '初一', '初二'],
        difficulty: 'detective',
        chinese: '我的家离学校很近，步行只要十分钟。',
        clues: ['home', 'school', 'close', 'ten minutes', 'walk'],
        simpleTranslation: 'My home is near school. Walk only need ten minutes.',
        advancedTranslation: 'My home is located within walking distance of the school, just a ten-minute stroll away.',
        vocabularyComparison: [
            { simple: 'near', advanced: 'within walking distance', reason: 'within walking distance 是地道表达' },
            { simple: 'walk only need', advanced: 'a ten-minute stroll', reason: '名词短语更简洁' }
        ],
        tags: ['日常', '地点']
    },
    {
        id: 'trans-014',
        grades: ['初三', '高一', '高二'],
        difficulty: 'detective',
        chinese: '虽然任务很艰巨，但我们决心完成它。',
        clues: ['although', 'task', 'difficult', 'determined', 'complete'],
        simpleTranslation: 'Although the task is very difficult, but we are determined to finish it.',
        advancedTranslation: 'Despite the daunting nature of the task, we remain resolute in our determination to see it through.',
        vocabularyComparison: [
            { simple: 'Although...but', advanced: 'Despite', reason: '英语中 although 和 but 不能同时使用' },
            { simple: 'very difficult', advanced: 'daunting', reason: 'daunting 表示令人畏缩的，更精准' },
            { simple: 'finish', advanced: 'see it through', reason: 'see through 是坚持到底的习语' }
        ],
        tags: ['学习', '态度']
    },
    {
        id: 'trans-015',
        grades: ['高一', '高二', '高三'],
        difficulty: 'master',
        chinese: '真正的友谊不是锦上添花，而是雪中送炭。',
        clues: ['true friendship', 'not', 'add flowers', 'send charcoal', 'snow'],
        simpleTranslation: 'True friendship is not adding flowers to brocade, but sending charcoal in snowy weather.',
        advancedTranslation: 'True friendship is not about being there for the good times alone, but about offering support when it is most needed.',
        vocabularyComparison: [
            { simple: '直译成语', advanced: '意译', reason: '成语需要意译才能传达含义' },
            { simple: '锦上添花', advanced: 'being there for the good times', reason: '意译' },
            { simple: '雪中送炭', advanced: 'offering support when most needed', reason: '意译' }
        ],
        tags: ['名言', '友谊']
    }
];

// 按年级过滤
export function filterByGrade(grade) {
    if (!grade || grade === 'all') return translationData;
    return translationData.filter(item => item.grades.includes(grade));
}

// 按难度过滤
export function filterByDifficulty(difficulty) {
    return translationData.filter(item => item.difficulty === difficulty);
}

/**
 * @param {string|null} grade - 兼容旧版；与 examGoal 二选一优先使用 examGoal
 * @param {string|null} difficulty
 * @param {string|null} examGoal - all | ket | pet | fce | zhongkao | gaokao
 */
export function getRandomExercise(grade = null, difficulty = null, examGoal = null) {
    let data = translationData;
    if (examGoal && examGoal !== 'all') {
        data = filterByPracticeTarget(data, examGoal);
    } else if (grade) {
        data = filterByGrade(grade);
    }
    if (difficulty) data = data.filter(item => item.difficulty === difficulty);
    if (data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

// 侦探等级
export const DETECTIVE_LEVELS = {
    apprentice: { name: '见习侦探', minScore: 0, description: '日常对话', icon: '🥉' },
    detective: { name: '正式侦探', minScore: 70, description: '校园故事', icon: '🥈' },
    master: { name: '特级侦探', minScore: 90, description: '诗歌名言', icon: '🥇' }
};

// 计算侦探等级
export function getDetectiveLevel(score) {
    if (score >= DETECTIVE_LEVELS.master.minScore) return DETECTIVE_LEVELS.master;
    if (score >= DETECTIVE_LEVELS.detective.minScore) return DETECTIVE_LEVELS.detective;
    return DETECTIVE_LEVELS.apprentice;
}

export default { 
    translationData, 
    filterByGrade, 
    filterByDifficulty, 
    getRandomExercise, 
    DETECTIVE_LEVELS,
    getDetectiveLevel 
};
