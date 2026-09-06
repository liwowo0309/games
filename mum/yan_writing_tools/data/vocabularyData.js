/**
 * English Writing Studio - Vocabulary Data
 * 词汇换装间 - 题库数据
 */

import { filterByPracticeTarget } from '../js/utils.js';

export const vocabularyData = [
    // ===== 基础词汇升级 =====
    {
        id: 'vocab-001',
        grades: ['小学5年级', '小学6年级', '初一'],
        word: 'good',
        context: 'This is a good book.',
        options: [
            { word: 'excellent', level: 2, style: ['formal', 'academic'], meaning: '优秀的，卓越的' },
            { word: 'outstanding', level: 3, style: ['formal', 'academic'], meaning: '杰出的，出色的' },
            { word: 'remarkable', level: 3, style: ['formal', 'literary'], meaning: '非凡的，显著的' },
            { word: 'beneficial', level: 2, style: ['academic'], meaning: '有益的，有利的' }
        ],
        collocations: [
            'excellent performance',
            'outstanding achievement',
            'remarkable progress',
            'beneficial to health'
        ],
        example: 'This is an excellent book that has won many awards.'
    },
    {
        id: 'vocab-002',
        grades: ['小学6年级', '初一', '初二'],
        word: 'bad',
        context: 'Smoking is bad for your health.',
        options: [
            { word: 'harmful', level: 2, style: ['formal', 'academic'], meaning: '有害的' },
            { word: 'detrimental', level: 3, style: ['academic'], meaning: '不利的，有害的' },
            { word: 'damaging', level: 2, style: ['formal'], meaning: '有损害的' },
            { word: 'unfavorable', level: 3, style: ['academic'], meaning: '不利的' }
        ],
        collocations: [
            'harmful effects',
            'detrimental to health',
            'damaging consequences',
            'unfavorable conditions'
        ],
        example: 'Smoking is extremely harmful to your health and well-being.'
    },
    {
        id: 'vocab-003',
        grades: ['初一', '初二', '初三'],
        word: 'say',
        context: 'He said that he would come.',
        options: [
            { word: 'claim', level: 2, style: ['formal', 'academic'], meaning: '声称，宣称' },
            { word: 'argue', level: 2, style: ['academic'], meaning: '主张，论证' },
            { word: 'assert', level: 3, style: ['formal', 'academic'], meaning: '断言，坚称' },
            { word: 'mention', level: 1, style: ['casual', 'formal'], meaning: '提及，说起' }
        ],
        collocations: [
            'claim that',
            'argue for/against',
            'assert confidently',
            'mention briefly'
        ],
        example: 'He claimed that he would come, but he never showed up.'
    },
    {
        id: 'vocab-004',
        grades: ['初二', '初三', '高一'],
        word: 'think',
        context: 'I think this is a good idea.',
        options: [
            { word: 'believe', level: 2, style: ['formal'], meaning: '相信，认为' },
            { word: 'maintain', level: 3, style: ['formal', 'academic'], meaning: '坚持认为' },
            { word: 'suppose', level: 2, style: ['casual', 'formal'], meaning: '猜想，认为' },
            { word: 'be convinced', level: 2, style: ['formal'], meaning: '确信' }
        ],
        collocations: [
            'believe that',
            'maintain that',
            'suppose so',
            'be convinced of'
        ],
        example: 'I believe this is an excellent idea worth pursuing.'
    },
    {
        id: 'vocab-005',
        grades: ['初一', '初二', '初三'],
        word: 'many',
        context: 'There are many students in the classroom.',
        options: [
            { word: 'numerous', level: 2, style: ['formal', 'academic'], meaning: '众多的，许多的' },
            { word: 'various', level: 2, style: ['formal'], meaning: '各种各样的' },
            { word: 'abundant', level: 3, style: ['academic', 'literary'], meaning: '丰富的，充裕的' },
            { word: 'a plethora of', level: 4, style: ['academic'], meaning: '大量的，过多的' }
        ],
        collocations: [
            'numerous occasions',
            'various reasons',
            'abundant evidence',
            'a plethora of options'
        ],
        example: 'There are numerous students from different countries in the classroom.'
    },
    
    // ===== 进阶词汇升级 =====
    {
        id: 'vocab-006',
        grades: ['初三', '高一', '高二'],
        word: 'big',
        context: 'This is a big problem we need to solve.',
        options: [
            { word: 'significant', level: 3, style: ['formal', 'academic'], meaning: '重大的，重要的' },
            { word: 'substantial', level: 3, style: ['formal', 'academic'], meaning: '大量的，实质的' },
            { word: 'considerable', level: 3, style: ['formal'], meaning: '相当大的，重要的' },
            { word: 'enormous', level: 3, style: ['formal', 'literary'], meaning: '巨大的，庞大的' }
        ],
        collocations: [
            'significant problem',
            'substantial amount',
            'considerable effort',
            'enormous pressure'
        ],
        example: 'This is a significant problem that requires our immediate attention.'
    },
    {
        id: 'vocab-007',
        grades: ['初三', '高一', '高二'],
        word: 'small',
        context: 'There is only a small chance of success.',
        options: [
            { word: 'slim', level: 2, style: ['formal'], meaning: '微小的，渺茫的' },
            { word: 'minimal', level: 3, style: ['academic'], meaning: '最小的，极少的' },
            { word: 'negligible', level: 4, style: ['academic'], meaning: '可忽略的，微不足道的' },
            { word: 'minute', level: 3, style: ['formal'], meaning: '极小的' }
        ],
        collocations: [
            'slim chance',
            'minimal impact',
            'negligible difference',
            'minute details'
        ],
        example: 'There is only a slim chance of success, but we should still try.'
    },
    {
        id: 'vocab-008',
        grades: ['高一', '高二', '高三'],
        word: 'show',
        context: 'The data shows that sales have increased.',
        options: [
            { word: 'demonstrate', level: 3, style: ['formal', 'academic'], meaning: '证明，展示' },
            { word: 'indicate', level: 3, style: ['formal', 'academic'], meaning: '表明，指示' },
            { word: 'reveal', level: 3, style: ['formal'], meaning: '揭示，显示' },
            { word: 'illustrate', level: 3, style: ['academic'], meaning: '阐明，举例说明' }
        ],
        collocations: [
            'demonstrate clearly',
            'indicate that',
            'reveal the truth',
            'illustrate the point'
        ],
        example: 'The data clearly demonstrates that sales have increased significantly.'
    },
    {
        id: 'vocab-009',
        grades: ['高一', '高二', '高三'],
        word: 'help',
        context: 'This book helps me understand grammar better.',
        options: [
            { word: 'assist', level: 3, style: ['formal'], meaning: '协助，帮助' },
            { word: 'aid', level: 3, style: ['formal', 'academic'], meaning: '援助，帮助' },
            { word: 'facilitate', level: 4, style: ['academic'], meaning: '促进，使便利' },
            { word: 'enable', level: 3, style: ['formal'], meaning: '使能够，使可能' }
        ],
        collocations: [
            'assist in doing',
            'aid understanding',
            'facilitate learning',
            'enable someone to'
        ],
        example: 'This book facilitates my understanding of complex grammatical structures.'
    },
    {
        id: 'vocab-010',
        grades: ['高二', '高三'],
        word: 'important',
        context: 'It is important to protect the environment.',
        options: [
            { word: 'crucial', level: 3, style: ['formal', 'academic'], meaning: '至关重要的' },
            { word: 'vital', level: 3, style: ['formal', 'academic'], meaning: '极其重要的' },
            { word: 'essential', level: 3, style: ['formal'], meaning: '必不可少的' },
            { word: 'imperative', level: 4, style: ['academic'], meaning: '迫切的，必要的' }
        ],
        collocations: [
            'crucial role',
            'vital importance',
            'essential requirement',
            'imperative that'
        ],
        example: 'It is crucial that we take immediate action to protect the environment.'
    },
    
    // ===== 学术词汇 =====
    {
        id: 'vocab-011',
        grades: ['高二', '高三'],
        word: 'get',
        context: 'Students get knowledge from books.',
        options: [
            { word: 'acquire', level: 3, style: ['formal', 'academic'], meaning: '获得，习得' },
            { word: 'obtain', level: 3, style: ['formal'], meaning: '获得，得到' },
            { word: 'gain', level: 2, style: ['formal'], meaning: '获得，增加' },
            { word: 'attain', level: 4, style: ['academic'], meaning: '达到，获得' }
        ],
        collocations: [
            'acquire knowledge',
            'obtain information',
            'gain experience',
            'attain goals'
        ],
        example: 'Students acquire knowledge through reading and practice.'
    },
    {
        id: 'vocab-012',
        grades: ['高二', '高三'],
        word: 'use',
        context: 'We use computers for work and study.',
        options: [
            { word: 'utilize', level: 3, style: ['formal', 'academic'], meaning: '利用，使用' },
            { word: 'employ', level: 3, style: ['formal'], meaning: '使用，雇用' },
            { word: 'apply', level: 2, style: ['formal'], meaning: '应用，运用' },
            { word: 'adopt', level: 3, style: ['formal'], meaning: '采用，采纳' }
        ],
        collocations: [
            'utilize resources',
            'employ methods',
            'apply knowledge',
            'adopt strategies'
        ],
        example: 'We utilize computers extensively for both work and academic research.'
    }
];

// 风格定义
export const VOCAB_STYLES = {
    casual: { name: '休闲装', icon: '👕', color: '#10b981', description: '日常交流风格' },
    formal: { name: '正式装', icon: '👔', color: '#3b82f6', description: '学术写作风格' },
    academic: { name: '学术装', icon: '🎓', color: '#8b5cf6', description: '专业论文风格' },
    literary: { name: '华丽装', icon: '👑', color: '#f59e0b', description: '文学创作风格' }
};

// 词汇等级
export const VOCAB_LEVELS = {
    1: { name: '基础', color: '#94a3b8' },
    2: { name: '进阶', color: '#3b82f6' },
    3: { name: '高级', color: '#8b5cf6' },
    4: { name: '学术', color: '#f59e0b' }
};

// 按年级过滤
export function filterByGrade(grade) {
    if (!grade || grade === 'all') return vocabularyData;
    return vocabularyData.filter(item => item.grades.includes(grade));
}

// 按风格过滤
export function filterByStyle(style) {
    return vocabularyData.filter(item => 
        item.options.some(opt => opt.style.includes(style))
    );
}

/**
 * @param {string|null} grade
 * @param {string|null} examGoal
 */
export function getRandomExercise(grade = null, examGoal = null) {
    let data = vocabularyData;
    if (examGoal && examGoal !== 'all') {
        data = filterByPracticeTarget(data, examGoal);
    } else if (grade) {
        data = filterByGrade(grade);
    }
    if (data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

// 获取同义词替换建议
export function getSynonymSuggestions(word) {
    const item = vocabularyData.find(v => v.word === word);
    if (!item) return null;
    return item.options;
}

// 获取搭配建议
export function getCollocations(word) {
    const item = vocabularyData.find(v => v.word === word);
    if (!item) return [];
    return item.collocations;
}

export default {
    vocabularyData,
    VOCAB_STYLES,
    VOCAB_LEVELS,
    filterByGrade,
    filterByStyle,
    getRandomExercise,
    getSynonymSuggestions,
    getCollocations
};
