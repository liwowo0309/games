/**
 * English Writing Studio - Expansion Data
 * 句子变形记 - 题库数据
 */

export const expansionData = [
    // ===== Level 1: 添加师 (形容词/副词) =====
    {
        id: 'exp-001',
        grades: ['小学3年级', '小学4年级'],
        level: 1,
        levelName: '添加师',
        sentence: 'The cat sleeps.',
        hints: ['加形容词', '加副词'],
        sampleExpansions: [
            'The lazy cat sleeps.',
            'The cat sleeps soundly.',
            'The lazy cat sleeps soundly in the sun.'
        ],
        tags: ['动物', '日常']
    },
    {
        id: 'exp-002',
        grades: ['小学3年级', '小学4年级'],
        level: 1,
        levelName: '添加师',
        sentence: 'The boy runs.',
        hints: ['加形容词修饰boy', '加副词修饰runs'],
        sampleExpansions: [
            'The little boy runs.',
            'The boy runs fast.',
            'The energetic boy runs quickly to school.'
        ],
        tags: ['校园', '动作']
    },
    {
        id: 'exp-003',
        grades: ['小学4年级', '小学5年级'],
        level: 1,
        levelName: '添加师',
        sentence: 'The bird sings.',
        hints: ['描述鸟的特征', '描述唱歌的方式'],
        sampleExpansions: [
            'The beautiful bird sings.',
            'The bird sings happily.',
            'The colorful bird sings beautifully in the morning.'
        ],
        tags: ['自然', '声音']
    },
    {
        id: 'exp-004',
        grades: ['小学5年级', '初一'],
        level: 1,
        levelName: '添加师',
        sentence: 'The flowers bloom.',
        hints: ['描述花的颜色或种类', '描述开花的程度'],
        sampleExpansions: [
            'The red flowers bloom.',
            'The flowers bloom fully.',
            'The beautiful flowers bloom brightly in spring.'
        ],
        tags: ['自然', '植物']
    },
    
    // ===== Level 2: 时间法师 =====
    {
        id: 'exp-005',
        grades: ['小学5年级', '初一', '初二'],
        level: 2,
        levelName: '时间法师',
        sentence: 'I eat breakfast.',
        hints: ['什么时候吃早餐？', '多久吃一次？'],
        sampleExpansions: [
            'I eat breakfast at 7 o\'clock.',
            'I eat breakfast every morning.',
            'I eat breakfast at 7 o\'clock every morning before school.'
        ],
        tags: ['日常', '食物']
    },
    {
        id: 'exp-006',
        grades: ['小学6年级', '初一', '初二'],
        level: 2,
        levelName: '时间法师',
        sentence: 'She studies English.',
        hints: ['什么时候学习？', '学习多久？'],
        sampleExpansions: [
            'She studies English every evening.',
            'She studies English for two hours.',
            'She studies English every evening for two hours before dinner.'
        ],
        tags: ['学习', '语言']
    },
    {
        id: 'exp-007',
        grades: ['初一', '初二', '初三'],
        level: 2,
        levelName: '时间法师',
        sentence: 'We play basketball.',
        hints: ['什么时候打球？', '打多久？'],
        sampleExpansions: [
            'We play basketball after school.',
            'We play basketball for one hour.',
            'We play basketball for one hour every afternoon after class.'
        ],
        tags: ['运动', '校园']
    },
    
    // ===== Level 3: 地点术士 =====
    {
        id: 'exp-008',
        grades: ['小学5年级', '初一', '初二'],
        level: 3,
        levelName: '地点术士',
        sentence: 'The children play.',
        hints: ['在哪里玩？', '什么样的地方？'],
        sampleExpansions: [
            'The children play in the park.',
            'The children play on the playground.',
            'The happy children play happily in the beautiful park near their school.'
        ],
        tags: ['儿童', '游戏']
    },
    {
        id: 'exp-009',
        grades: ['初一', '初二', '初三'],
        level: 3,
        levelName: '地点术士',
        sentence: 'My mother cooks.',
        hints: ['在哪里做饭？', '什么样的厨房？'],
        sampleExpansions: [
            'My mother cooks in the kitchen.',
            'My mother cooks in our small kitchen.',
            'My mother cooks delicious food in our clean kitchen every evening.'
        ],
        tags: ['家庭', '食物']
    },
    {
        id: 'exp-010',
        grades: ['初二', '初三', '高一'],
        level: 3,
        levelName: '地点术士',
        sentence: 'The students read books.',
        hints: ['在哪里读书？', '什么样的环境？'],
        sampleExpansions: [
            'The students read books in the library.',
            'The students read books quietly in the library.',
            'The diligent students read books quietly in the school library every afternoon.'
        ],
        tags: ['学习', '校园']
    },
    
    // ===== Level 4: 原因巫师 =====
    {
        id: 'exp-011',
        grades: ['初一', '初二', '初三'],
        level: 4,
        levelName: '原因巫师',
        sentence: 'I like reading.',
        hints: ['为什么喜欢？', '阅读带来什么？'],
        sampleExpansions: [
            'I like reading because it is interesting.',
            'I like reading because books can take me to different worlds.',
            'I like reading storybooks because they are interesting and can take me to different worlds.'
        ],
        tags: ['爱好', '学习']
    },
    {
        id: 'exp-012',
        grades: ['初二', '初三', '高一'],
        level: 4,
        levelName: '原因巫师',
        sentence: 'She gets up early.',
        hints: ['为什么早起？', '早起做什么？'],
        sampleExpansions: [
            'She gets up early because she wants to exercise.',
            'She gets up early so that she can catch the first bus.',
            'She gets up at six every morning because she wants to exercise and catch the first bus to school.'
        ],
        tags: ['日常', '习惯']
    },
    {
        id: 'exp-013',
        grades: ['初三', '高一', '高二'],
        level: 4,
        levelName: '原因巫师',
        sentence: 'We protect the environment.',
        hints: ['为什么要保护？', '不保护会怎样？'],
        sampleExpansions: [
            'We protect the environment because it is our home.',
            'We protect the environment so that future generations can enjoy it.',
            'We must protect the environment because it is our home and we want future generations to enjoy clean air and water.'
        ],
        tags: ['环保', '社会']
    },
    
    // ===== Level 5: 复合大师 =====
    {
        id: 'exp-014',
        grades: ['初三', '高一', '高二', '高三'],
        level: 5,
        levelName: '复合大师',
        sentence: 'The dog barks.',
        hints: ['什么时候？在哪里？为什么？'],
        sampleExpansions: [
            'The dog barks loudly when strangers come near.',
            'The big dog barks loudly at the door because it sees strangers.',
            'Every evening, the big black dog barks loudly at the front door because it sees strangers approaching the house.'
        ],
        tags: ['动物', '家庭']
    },
    {
        id: 'exp-015',
        grades: ['高一', '高二', '高三'],
        level: 5,
        levelName: '复合大师',
        sentence: 'I feel happy.',
        hints: ['什么时候？为什么？具体怎样？'],
        sampleExpansions: [
            'I feel happy when I help others.',
            'I always feel happy when I spend time with my family.',
            'I always feel genuinely happy when I spend quality time with my family because their love and support give me strength.'
        ],
        tags: ['情感', '家庭']
    },
    {
        id: 'exp-016',
        grades: ['高二', '高三'],
        level: 5,
        levelName: '复合大师',
        sentence: 'Technology changes life.',
        hints: ['如何改变？哪些方面？带来什么影响？'],
        sampleExpansions: [
            'Technology changes our life rapidly in many ways.',
            'Modern technology has significantly changed our daily life since the internet became popular.',
            'Since the internet became popular in the 1990s, modern technology has significantly changed almost every aspect of our daily life, from how we communicate to how we work and learn.'
        ],
        tags: ['科技', '社会']
    },
    
    // ===== 更多题目... =====
    {
        id: 'exp-017',
        grades: ['小学4年级', '小学5年级', '初一'],
        level: 1,
        levelName: '添加师',
        sentence: 'The sun shines.',
        hints: ['什么样的太阳？', '怎样照耀？'],
        sampleExpansions: [
            'The bright sun shines.',
            'The sun shines brightly.',
            'The bright sun shines warmly on the earth.'
        ],
        tags: ['自然', '天气']
    },
    {
        id: 'exp-018',
        grades: ['小学5年级', '初一', '初二'],
        level: 2,
        levelName: '时间法师',
        sentence: 'He watches TV.',
        hints: ['什么时候看？', '看多久？'],
        sampleExpansions: [
            'He watches TV on weekends.',
            'He watches TV for three hours.',
            'He watches TV for three hours every weekend evening.'
        ],
        tags: ['日常', '娱乐']
    },
    {
        id: 'exp-019',
        grades: ['初二', '初三', '高一'],
        level: 3,
        levelName: '地点术士',
        sentence: 'The teacher teaches.',
        hints: ['在哪里教？', '什么样的教室？'],
        sampleExpansions: [
            'The teacher teaches in the classroom.',
            'The teacher teaches in the bright classroom.',
            'The experienced teacher teaches enthusiastically in the bright and modern classroom.'
        ],
        tags: ['校园', '职业']
    },
    {
        id: 'exp-020',
        grades: ['初三', '高一', '高二'],
        level: 4,
        levelName: '原因巫师',
        sentence: 'People exercise regularly.',
        hints: ['为什么锻炼？', '锻炼带来什么好处？'],
        sampleExpansions: [
            'People exercise regularly because they want to stay healthy.',
            'People exercise regularly so that they can maintain good health.',
            'Many people exercise regularly every day because they want to stay healthy and maintain a good figure.'
        ],
        tags: ['健康', '生活']
    }
];

// 按年级过滤数据
export function filterByGrade(grade) {
    if (!grade || grade === 'all') return expansionData;
    return expansionData.filter(item => item.grades.includes(grade));
}

// 按等级过滤数据
export function filterByLevel(level) {
    return expansionData.filter(item => item.level === level);
}

// 随机获取一个练习
export function getRandomExercise(grade = null) {
    const data = grade ? filterByGrade(grade) : expansionData;
    if (data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

// 获取关卡信息
export const LEVELS = [
    { id: 1, name: '添加师', icon: '✨', skill: 'adjective', description: '加形容词/副词' },
    { id: 2, name: '时间法师', icon: '⏰', skill: 'time', description: '加时间状语' },
    { id: 3, name: '地点术士', icon: '📍', skill: 'place', description: '加地点状语' },
    { id: 4, name: '原因巫师', icon: '🔮', skill: 'reason', description: '加原因从句' },
    { id: 5, name: '复合大师', icon: '👑', skill: 'complex', description: '自由组合' }
];

export default { expansionData, filterByGrade, filterByLevel, getRandomExercise, LEVELS };
