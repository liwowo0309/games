/**
 * English Writing Studio - Transition Data
 * 连接词魔法 - 题库数据
 */

import { filterByPracticeTarget } from '../js/utils.js';

export const transitionData = [
    // ===== 学徒级别：基础连接词 =====
    {
        id: 'transi-001',
        grades: ['小学5年级', '小学6年级', '初一'],
        level: 'apprentice',
        levelName: '学徒',
        title: '我的周末',
        paragraphs: [
            {
                sentences: [
                    'On Saturday morning, I finished my homework.',
                    '(1)_______, I went to the park with my friends.',
                    '(2)_______, we played basketball for two hours.'
                ],
                blanks: [
                    { answer: 'Then/After that', options: ['Then', 'After that', 'Later', 'Next'], type: 'sequence' },
                    { answer: 'Then/After that', options: ['There', 'Then', 'However', 'But'], type: 'sequence' }
                ]
            },
            {
                sentences: [
                    '(3)_______, we felt tired.',
                    '(4)_______, we were very happy.'
                ],
                blanks: [
                    { answer: 'So', options: ['So', 'Because', 'Although', 'But'], type: 'cause-effect' },
                    { answer: 'However/But', options: ['However', 'But', 'And', 'Therefore'], type: 'contrast' }
                ]
            }
        ],
        explanation: 'Then/After that 表示时间顺序；So 表示结果；However/But 表示转折。'
    },
    {
        id: 'transi-002',
        grades: ['小学6年级', '初一', '初二'],
        level: 'apprentice',
        levelName: '学徒',
        title: '我的爱好',
        paragraphs: [
            {
                sentences: [
                    'I like reading books.',
                    '(1)_______, I also enjoy playing basketball.',
                    'I read books (2)_______ I want to learn new things.',
                    '(3)_______, I play basketball because it keeps me healthy.'
                ],
                blanks: [
                    { answer: 'Besides/Also', options: ['Besides', 'Also', 'But', 'So'], type: 'additive' },
                    { answer: 'because', options: ['because', 'so', 'but', 'if'], type: 'cause' },
                    { answer: 'Similarly/Likewise', options: ['Similarly', 'Likewise', 'However', 'Instead'], type: 'comparison' }
                ]
            }
        ],
        explanation: 'Besides/Also 表示补充；because 表示原因；Similarly 表示类似。'
    },
    
    // ===== 法师级别：进阶连接词 =====
    {
        id: 'transi-003',
        grades: ['初一', '初二', '初三'],
        level: 'mage',
        levelName: '法师',
        title: '上学的利弊',
        paragraphs: [
            {
                sentences: [
                    'Going to school has many advantages.',
                    '(1)_______, we can learn knowledge from teachers.',
                    '(2)_______, we can make friends with classmates.',
                    '(3)_______, there are also some challenges.'
                ],
                blanks: [
                    { answer: 'First/Firstly', options: ['First', 'Firstly', 'First of all', 'At first'], type: 'sequence' },
                    { answer: 'In addition/Furthermore/Moreover', options: ['In addition', 'Furthermore', 'Moreover', 'Besides'], type: 'additive' },
                    { answer: 'However/Nevertheless', options: ['However', 'Nevertheless', 'Therefore', 'So'], type: 'contrast' }
                ]
            },
            {
                sentences: [
                    '(4)_______, we have to get up early every day.',
                    '(5)_______, we have much homework to do.'
                ],
                blanks: [
                    { answer: 'For example/For instance', options: ['For example', 'For instance', 'Such as', 'Like'], type: 'exemplification' },
                    { answer: 'In addition/Besides', options: ['In addition', 'Besides', 'However', 'Therefore'], type: 'additive' }
                ]
            }
        ],
        explanation: 'First/Firstly 表示第一；In addition/Furthermore/Moreover 表示递进；However/Nevertheless 表示转折；For example 表示举例。'
    },
    {
        id: 'transi-004',
        grades: ['初二', '初三', '高一'],
        level: 'mage',
        levelName: '法师',
        title: '环保的重要性',
        paragraphs: [
            {
                sentences: [
                    'Environmental protection is crucial for our future.',
                    '(1)_______, clean air is essential for our health.',
                    '(2)_______, polluted air can cause many diseases.',
                    '(3)_______, we must take action to reduce pollution.'
                ],
                blanks: [
                    { answer: 'To begin with/First', options: ['To begin with', 'First', 'However', 'Therefore'], type: 'sequence' },
                    { answer: 'On the contrary/In contrast', options: ['On the contrary', 'In contrast', 'Similarly', 'Likewise'], type: 'contrast' },
                    { answer: 'Therefore/Thus/Consequently', options: ['Therefore', 'Thus', 'Consequently', 'However'], type: 'conclusion' }
                ]
            },
            {
                sentences: [
                    '(4)_______, we should use public transportation more often.',
                    '(5)_______, we can recycle waste to save resources.'
                ],
                blanks: [
                    { answer: 'For instance/For example', options: ['For instance', 'For example', 'Besides', 'Furthermore'], type: 'exemplification' },
                    { answer: 'In addition/Furthermore', options: ['In addition', 'Furthermore', 'Moreover', 'Besides'], type: 'additive' }
                ]
            }
        ],
        explanation: 'To begin with 表示首先；On the contrary/In contrast 表示对比；Therefore/Thus/Consequently 表示结论。'
    },
    
    // ===== 大法师级别：高级连接词 =====
    {
        id: 'transi-005',
        grades: ['高一', '高二', '高三'],
        level: 'archmage',
        levelName: '大法师',
        title: '科技与传统',
        paragraphs: [
            {
                sentences: [
                    'Technology has transformed our lives dramatically.',
                    '(1)_______, we can now communicate instantly with people worldwide.',
                    '(2)_______, this convenience comes with certain risks.',
                    '(3)_______, traditional values still play an important role in society.'
                ],
                blanks: [
                    { answer: 'For instance/To illustrate', options: ['For instance', 'To illustrate', 'Namely', 'Specifically'], type: 'exemplification' },
                    { answer: 'Nevertheless/Nonetheless', options: ['Nevertheless', 'Nonetheless', 'However', 'Yet'], type: 'contrast' },
                    { answer: 'Meanwhile/At the same time', options: ['Meanwhile', 'At the same time', 'Consequently', 'Therefore'], type: 'comparison' }
                ]
            },
            {
                sentences: [
                    '(4)_______, we should embrace technological advancement.',
                    '(5)_______, we must not abandon our cultural heritage.',
                    '(6)_______, a balance between innovation and tradition is essential.'
                ],
                blanks: [
                    { answer: 'On the one hand', options: ['On the one hand', 'Firstly', 'To start with', 'Initially'], type: 'sequence' },
                    { answer: 'On the other hand', options: ['On the other hand', 'Secondly', 'In contrast', 'Conversely'], type: 'contrast' },
                    { answer: 'In conclusion/To conclude', options: ['In conclusion', 'To conclude', 'In summary', 'All in all'], type: 'conclusion' }
                ]
            }
        ],
        explanation: 'To illustrate 表示举例说明；Nevertheless/Nonetheless 表示让步转折；Meanwhile 表示同时；On the one hand...On the other hand 表示两方面；In conclusion 表示总结。'
    },
    {
        id: 'transi-006',
        grades: ['高二', '高三'],
        level: 'archmage',
        levelName: '大法师',
        title: '教育的意义',
        paragraphs: [
            {
                sentences: [
                    'Education is not merely about acquiring knowledge.',
                    '(1)_______, it shapes our character and values.',
                    '(2)_______, it prepares us for future challenges.',
                    '(3)_______, it enables us to contribute meaningfully to society.'
                ],
                blanks: [
                    { answer: 'Rather/More importantly', options: ['Rather', 'More importantly', 'However', 'Therefore'], type: 'emphasis' },
                    { answer: 'Furthermore/Moreover', options: ['Furthermore', 'Moreover', 'In addition', 'Besides'], type: 'additive' },
                    { answer: 'Above all/Most importantly', options: ['Above all', 'Most importantly', 'Finally', 'Lastly'], type: 'emphasis' }
                ]
            },
            {
                sentences: [
                    '(4)_______, education faces numerous challenges today.',
                    '(5)_______, limited resources prevent many from accessing quality education.',
                    '(6)_______, traditional teaching methods may not suit all learners.'
                ],
                blanks: [
                    { answer: 'Admittedly/Granted', options: ['Admittedly', 'Granted', 'Certainly', 'Indeed'], type: 'concession' },
                    { answer: 'For example', options: ['For example', 'For instance', 'Namely', 'Specifically'], type: 'exemplification' },
                    { answer: 'Additionally/In addition', options: ['Additionally', 'In addition', 'Furthermore', 'Moreover'], type: 'additive' }
                ]
            },
            {
                sentences: [
                    '(7)_______, these challenges should not discourage us.',
                    '(8)_______, education remains the key to personal and societal progress.'
                ],
                blanks: [
                    { answer: 'Nevertheless/Even so', options: ['Nevertheless', 'Even so', 'However', 'Yet'], type: 'contrast' },
                    { answer: 'After all/Ultimately', options: ['After all', 'Ultimately', 'In the end', 'Finally'], type: 'conclusion' }
                ]
            }
        ],
        explanation: 'Rather/More importantly 表示强调；Furthermore/Moreover 表示递进；Above all 表示最重要；Admittedly 表示承认；Nevertheless/Even so 表示转折；After all 表示毕竟。'
    }
];

// 连接词分类
export const TRANSITION_CATEGORIES = {
    sequence: { name: '顺序', icon: '➡️', color: '#3b82f6', words: ['First', 'Second', 'Then', 'Next', 'Finally'] },
    additive: { name: '递进', icon: '➕', color: '#10b981', words: ['Also', 'Besides', 'In addition', 'Furthermore', 'Moreover'] },
    contrast: { name: '转折', icon: '⚡', color: '#ef4444', words: ['However', 'But', 'Nevertheless', 'On the contrary'] },
    'cause-effect': { name: '因果', icon: '🔗', color: '#f59e0b', words: ['So', 'Therefore', 'Thus', 'Consequently', 'Because'] },
    exemplification: { name: '举例', icon: '💡', color: '#8b5cf6', words: ['For example', 'For instance', 'Such as', 'Namely'] },
    comparison: { name: '比较', icon: '⚖️', color: '#ec4899', words: ['Similarly', 'Likewise', 'In the same way', 'As well as'] },
    conclusion: { name: '总结', icon: '🏁', color: '#6366f1', words: ['In conclusion', 'To conclude', 'All in all', 'In summary'] },
    emphasis: { name: '强调', icon: '❗', color: '#eab308', words: ['Indeed', 'In fact', 'Most importantly', 'Above all'] },
    concession: { name: '让步', icon: '🤝', color: '#14b8a6', words: ['Admittedly', 'Granted', 'Certainly', 'It is true that'] }
};

// 等级定义
export const LEVELS = {
    apprentice: { name: '学徒', color: '#10b981', description: '使用 and/but/so/because' },
    mage: { name: '法师', color: '#3b82f6', description: '使用 however/therefore/furthermore' },
    archmage: { name: '大法师', color: '#8b5cf6', description: '自由组合所有连接词' }
};

// 按年级过滤
export function filterByGrade(grade) {
    if (!grade || grade === 'all') return transitionData;
    return transitionData.filter(item => item.grades.includes(grade));
}

// 按等级过滤
export function filterByLevel(level) {
    return transitionData.filter(item => item.level === level);
}

/** 与旧版 UI 芯片字段名兼容 */
export const TRANSITION_TYPES = TRANSITION_CATEGORIES;

/**
 * @param {string|null} grade
 * @param {string|null} examGoal
 */
export function getRandomExercise(grade = null, examGoal = null) {
    let data = transitionData;
    if (examGoal && examGoal !== 'all') {
        data = filterByPracticeTarget(data, examGoal);
    } else if (grade && grade !== 'all') {
        data = filterByGrade(grade);
    }
    if (data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

// 获取连接词建议
export function getTransitionSuggestions(category) {
    const cat = TRANSITION_CATEGORIES[category];
    return cat ? cat.words : [];
}

// 检查流畅度
export function checkFluency(text) {
    const transitions = Object.values(TRANSITION_CATEGORIES).flatMap(cat => cat.words);
    const foundTransitions = transitions.filter(t => 
        text.toLowerCase().includes(t.toLowerCase())
    );
    
    // 计算流畅度分数
    const variety = new Set(foundTransitions.map(t => {
        for (const [cat, data] of Object.entries(TRANSITION_CATEGORIES)) {
            if (data.words.includes(t)) return cat;
        }
        return 'other';
    })).size;
    
    return {
        transitionCount: foundTransitions.length,
        variety,
        score: Math.min(100, 40 + variety * 15 + foundTransitions.length * 2)
    };
}

export default {
    transitionData,
    TRANSITION_CATEGORIES,
    TRANSITION_TYPES,
    LEVELS,
    filterByGrade,
    filterByLevel,
    getRandomExercise,
    getTransitionSuggestions,
    checkFluency
};
