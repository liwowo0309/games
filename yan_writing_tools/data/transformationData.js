/**
 * English Writing Studio - Transformation Data
 * 句型变变变 - 题库数据
 */

import { filterByPracticeTarget } from '../js/utils.js';

export const transformationData = [
    // ===== 主动变被动 =====
    {
        id: 'transf-001',
        grades: ['初二', '初三', '高一'],
        type: 'active-passive',
        typeName: '主动变被动',
        active: 'The students clean the classroom every day.',
        passive: 'The classroom is cleaned by the students every day.',
        hint: '宾语变主语，动词变成 be + 过去分词',
        explanation: '主动语态：主语 + 动词 + 宾语。被动语态：宾语变主语 + be动词 + 过去分词 + by + 原主语。'
    },
    {
        id: 'transf-002',
        grades: ['初三', '高一', '高二'],
        type: 'active-passive',
        typeName: '主动变被动',
        active: 'Someone has stolen my bicycle.',
        passive: 'My bicycle has been stolen.',
        hint: '现在完成时的被动：have/has been + 过去分词',
        explanation: '现在完成时的被动语态结构：have/has been + 过去分词。当不知道动作执行者时，可以省略by短语。'
    },
    {
        id: 'transf-003',
        grades: ['初三', '高一', '高二'],
        type: 'passive-active',
        typeName: '被动变主动',
        passive: 'The window was broken by the boy.',
        active: 'The boy broke the window.',
        hint: 'by后面的名词变主语，be + 过去分词变回主动形式',
        explanation: '被动变主动：by后面的名词（动作执行者）变为主语，去掉be动词，恢复动词主动形式。'
    },
    
    // ===== 直接引语变间接引语 =====
    {
        id: 'transf-004',
        grades: ['初三', '高一', '高二'],
        type: 'direct-indirect',
        typeName: '直接引语变间接引语',
        direct: 'He said, "I am busy now."',
        indirect: 'He said that he was busy then.',
        hint: '人称、时态、时间/地点词要相应变化',
        explanation: '直接引语变间接引语：去掉引号，加that，第一人称变第三人称，现在时变过去时，now变then。'
    },
    {
        id: 'transf-005',
        grades: ['高一', '高二', '高三'],
        type: 'direct-indirect',
        typeName: '直接引语变间接引语',
        direct: '"Have you finished your homework?" the teacher asked.',
        indirect: 'The teacher asked if/whether I had finished my homework.',
        hint: '一般疑问句用if/whether，语序变陈述句语序',
        explanation: '一般疑问句变间接引语：用if或whether引导，语序从疑问句变为陈述句语序（主语在前，动词在后）。'
    },
    {
        id: 'transf-006',
        grades: ['高一', '高二', '高三'],
        type: 'direct-indirect',
        typeName: '直接引语变间接引语',
        direct: '"Don\'t be late again," the boss said to Tom.',
        indirect: 'The boss told Tom not to be late again.',
        hint: '祈使句用tell/ask/order + 宾语 + (not) to do',
        explanation: '祈使句变间接引语：said to 变成 told/asked/ordered，用 (not) to do 结构表达命令或请求。'
    },
    
    // ===== 陈述句变倒装 =====
    {
        id: 'transf-007',
        grades: ['高一', '高二', '高三'],
        type: 'statement-inversion',
        typeName: '陈述句变倒装',
        statement: 'I have never seen such a beautiful sunset.',
        inversion: 'Never have I seen such a beautiful sunset.',
        hint: '否定词Never放在句首，句子部分倒装：Never + 助动词 + 主语 + 动词',
        explanation: '否定副词(Never, Seldom, Rarely, Hardly, Scarcely, Little等)放在句首时，句子需要部分倒装：助动词提前到主语前。'
    },
    {
        id: 'transf-008',
        grades: ['高二', '高三'],
        type: 'statement-inversion',
        typeName: '陈述句变倒装',
        statement: 'He realized the importance of health only after he got sick.',
        inversion: 'Only after he got sick did he realize the importance of health.',
        hint: 'Only + 状语放在句首，句子部分倒装',
        explanation: 'Only + 状语（副词、介词短语、从句）放在句首时，句子需要部分倒装。'
    },
    {
        id: 'transf-009',
        grades: ['高二', '高三'],
        type: 'statement-inversion',
        typeName: '陈述句变倒装',
        statement: 'The teacher came in and the class began.',
        inversion: 'In came the teacher and the class began.',
        hint: '表示方位的副词(Here/There/In/Out/Up/Down)放在句首，完全倒装',
        explanation: '方位副词放在句首，且主语是名词时，句子完全倒装：副词 + 动词 + 主语。主语是代词时不倒装。'
    },
    
    // ===== 强调句型 =====
    {
        id: 'transf-010',
        grades: ['高一', '高二', '高三'],
        type: 'cleft-sentence',
        typeName: '强调句型',
        normal: 'I met John in the park yesterday.',
        cleft: 'It was in the park that I met John yesterday.',
        emphasis: '地点',
        hint: '强调地点用：It is/was + 被强调部分 + that + 其他',
        explanation: '强调句型结构：It is/was + 被强调部分(主语/宾语/状语) + that/who + 其他。强调地点时用that。'
    },
    {
        id: 'transf-011',
        grades: ['高二', '高三'],
        type: 'cleft-sentence',
        typeName: '强调句型',
        normal: 'Tom gave me this book.',
        cleft: 'It was Tom who/that gave me this book.',
        emphasis: '主语',
        hint: '强调人用who或that，强调物或时间地点用that',
        explanation: '强调人时可以用who或that，强调时间、地点、原因、方式时只能用that。'
    },
    {
        id: 'transf-012',
        grades: ['高二', '高三'],
        type: 'cleft-sentence',
        typeName: '强调句型',
        normal: 'I bought this dress yesterday because it was on sale.',
        cleft: 'It was because it was on sale that I bought this dress yesterday.',
        emphasis: '原因',
        hint: '强调原因状语从句用that引导',
        explanation: '强调原因状语从句时，要把because一起放在被强调的位置，后面用that。'
    },
    
    // ===== 简单句变复合句 =====
    {
        id: 'transf-013',
        grades: ['初三', '高一', '高二'],
        type: 'simple-complex',
        typeName: '简单句变复合句',
        simple: 'I met Mary. She is my old friend.',
        complex: 'I met Mary, who is my old friend.',
        hint: '两句有共同名词，用定语从句连接',
        explanation: '两个简单句有共同的名词（Mary），可以用定语从句将其合并，用who/which/that引导。'
    },
    {
        id: 'transf-014',
        grades: ['高一', '高二', '高三'],
        type: 'simple-complex',
        typeName: '简单句变复合句',
        simple: 'He studied hard. He wanted to pass the exam.',
        complex: 'He studied hard because he wanted to pass the exam.',
        hint: '表示因果关系用because连接',
        explanation: '两个简单句有因果关系时，可以用because/since/as引导原因状语从句，合并成复合句。'
    },
    {
        id: 'transf-015',
        grades: ['高一', '高二', '高三'],
        type: 'simple-complex',
        typeName: '简单句变复合句',
        simple: 'We will go for a picnic. The weather is fine.',
        complex: 'We will go for a picnic if the weather is fine.',
        hint: '表示条件用if连接',
        explanation: '一个句子表示条件，另一个表示结果时，可以用if/unless/as long as引导条件状语从句。'
    },
    
    // ===== 挑战题目：创意改写 =====
    {
        id: 'transf-016',
        grades: ['高二', '高三'],
        type: 'creative',
        typeName: '创意改写',
        original: 'Life is hard.',
        poetic: 'Life is but a walking shadow, a poor player that struts and frets his hour upon the stage.',
        humorous: 'Life is like a video game where the difficulty level keeps increasing but nobody gave you the manual.',
        formal: 'Life presents numerous challenges and obstacles that require resilience and determination to overcome.',
        hint: '用不同的风格表达同一个意思：诗意版、幽默版、正式版',
        explanation: '同一个意思可以用不同的风格表达：诗意版用修辞，幽默版用比喻，正式版用学术词汇。'
    },
    {
        id: 'transf-017',
        grades: ['高二', '高三'],
        type: 'creative',
        typeName: '创意改写',
        original: 'Time flies.',
        poetic: 'Time, the subtle thief of youth, slips through our fingers like grains of golden sand.',
        humorous: 'Time flies like an arrow; fruit flies like a banana.',
        formal: 'The passage of time occurs at a seemingly accelerated pace as one ages.',
        hint: '用不同的风格表达同一个意思',
        explanation: '尝试用诗意、幽默、正式三种风格改写同一句话，体会语言的魅力。'
    }
];

// 转换类型定义
export const TRANSFORMATION_TYPES = {
    'active-passive': { name: '主动变被动', icon: '🔁', color: '#3b82f6' },
    'passive-active': { name: '被动变主动', icon: '🔀', color: '#3b82f6' },
    'direct-indirect': { name: '直接变间接引语', icon: '💬', color: '#8b5cf6' },
    'statement-inversion': { name: '陈述变倒装', icon: '🔃', color: '#ef4444' },
    'cleft-sentence': { name: '强调句型', icon: '❗', color: '#f59e0b' },
    'simple-complex': { name: '简单变复合句', icon: '🔗', color: '#10b981' },
    'creative': { name: '创意改写', icon: '✨', color: '#ec4899' }
};

// 按年级过滤
export function filterByGrade(grade) {
    if (!grade || grade === 'all') return transformationData;
    return transformationData.filter(item => item.grades.includes(grade));
}

// 按类型过滤
export function filterByType(type) {
    return transformationData.filter(item => item.type === type);
}

/**
 * @param {string|null} grade
 * @param {string|null} type
 * @param {string|null} examGoal
 */
export function getRandomExercise(grade = null, type = null, examGoal = null) {
    let data = transformationData;
    if (examGoal && examGoal !== 'all') {
        data = filterByPracticeTarget(data, examGoal);
    } else if (grade) {
        data = filterByGrade(grade);
    }
    if (type) data = filterByType(type);
    if (data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

// 获取类型统计
export function getTypeStats(grade = null) {
    const data = grade ? filterByGrade(grade) : transformationData;
    const stats = {};
    
    Object.keys(TRANSFORMATION_TYPES).forEach(type => {
        stats[type] = data.filter(item => item.type === type).length;
    });
    
    return stats;
}

export default {
    transformationData,
    TRANSFORMATION_TYPES,
    filterByGrade,
    filterByType,
    getRandomExercise,
    getTypeStats
};
