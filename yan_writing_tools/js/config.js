/**
 * English Writing Studio - Config
 * 配置常量
 */

// ========== 应用信息 ==========
export const APP_INFO = {
    name: 'English Writing Studio',
    version: '2.0.0',
    description: '让每个孩子都能写出让自己骄傲的英文',
    author: 'York Coding',
    year: 2025
};

// ========== 考试目标（推荐：按备考路径选难度，可与年级并存）==========
/** @typedef {'ket'|'pet'|'fce'|'zhongkao'|'gaokao'} ExamGoalId */

/**
 * 与 CEFR 大致对应，便于与剑桥体系衔接；同一素材可挂多个 id（overlap 在题库字段 examGoals 中表达）。
 * 参考：Cambridge English 考试级别说明；课标为教研常用对照，非强制年龄绑定。
 */
export const EXAM_GOALS = [
    { id: 'ket', name: '剑桥 A2 Key（KET）', shortName: 'KET', icon: '🔑', cefr: 'A2', wordBand: '约25词短讯 + 看图写话35词', note: '基础日常交际与简单叙述' },
    { id: 'pet', name: '剑桥 B1 Preliminary（PET）', shortName: 'PET', icon: '📧', cefr: 'B1', wordBand: '约100词邮件/短文', note: '邮件、故事、杂志风格短文' },
    { id: 'fce', name: '剑桥 B2 First（FCE）', shortName: 'FCE', icon: '📰', cefr: 'B2', wordBand: '140–190词', note: 'Essay + article/review/report 等' },
    { id: 'zhongkao', name: '中考英语书面表达', shortName: '中考', icon: '🏫', cefr: 'A2–B1', wordBand: '常见60–120词', note: '应用文为主：邮件、发言稿、投稿等' },
    { id: 'gaokao', name: '高考英语写作（新高考）', shortName: '高考', icon: '🎓', cefr: 'B1–B2', wordBand: '应用文约80词；读后续写约150词/段', note: '应用文+读后续写（省份卷型略有差异）' }
];

/**
 * 考试目标 → 六大模块题库中的年级标签（OR）。用于在不改旧 grades 字段的前提下按备考路径筛题。
 */
export const EXAM_GOAL_GRADE_RANGES = {
    ket: ['小学3年级', '小学4年级', '小学5年级', '小学6年级', '初一'],
    pet: ['小学5年级', '小学6年级', '初一', '初二', '初三'],
    fce: ['初二', '初三', '高一', '高二', '高三'],
    zhongkao: ['小学6年级', '初一', '初二', '初三'],
    gaokao: ['初三', '高一', '高二', '高三']
};

/**
 * @param {string|null|undefined} id
 * @returns {string}
 */
export function formatExamGoalLabel(id) {
    if (!id || id === 'all') return '全部目标';
    const g = EXAM_GOALS.find(x => x.id === id);
    return g ? g.shortName : id;
}

// ========== 年级配置 ==========
export const GRADES = [
    { id: 'all', name: '全部年级', icon: '🎓', lexile: '' },
    { id: '小学3年级', name: '小学3年级', icon: '📚', lexile: '300L-500L', cefr: 'A1-A2' },
    { id: '小学4年级', name: '小学4年级', icon: '📚', lexile: '350L-550L', cefr: 'A2' },
    { id: '小学5年级', name: '小学5年级', icon: '📖', lexile: '450L-650L', cefr: 'A2' },
    { id: '小学6年级', name: '小学6年级', icon: '📖', lexile: '500L-700L', cefr: 'A2-B1' },
    { id: '初一', name: '初一', icon: '🎒', lexile: '600L-800L', cefr: 'A2' },
    { id: '初二', name: '初二', icon: '🎒', lexile: '700L-900L', cefr: 'A2-B1' },
    { id: '初三', name: '初三', icon: '🏫', lexile: '800L-1000L', cefr: 'B1' },
    { id: '高一', name: '高一', icon: '📕', lexile: '900L-1100L', cefr: 'B1-B2' },
    { id: '高二', name: '高二', icon: '📗', lexile: '1000L-1200L', cefr: 'B2' },
    { id: '高三', name: '高三', icon: '📘', lexile: '1100L-1300L+', cefr: 'B2-C1' }
];

// ========== 模块配置 ==========
export const MODULES = {
    expansion: {
        id: 'expansion',
        name: '句子变形记',
        description: '给简单句施魔法，看它如何一步步变得更酷、更有故事感',
        icon: '✨',
        color: '#6366f1',
        levels: [
            { id: 1, name: '添加师', icon: '✨', skill: 'adjective', description: '加形容词/副词' },
            { id: 2, name: '时间法师', icon: '⏰', skill: 'time', description: '加时间状语' },
            { id: 3, name: '地点术士', icon: '📍', skill: 'place', description: '加地点状语' },
            { id: 4, name: '原因巫师', icon: '🔮', skill: 'reason', description: '加原因从句' },
            { id: 5, name: '复合大师', icon: '👑', skill: 'complex', description: '自由组合' }
        ]
    },
    translation: {
        id: 'translation',
        name: '翻译侦探社',
        description: '你是翻译侦探，把中文"案发现场"还原成最地道的英文',
        icon: '🕵️',
        color: '#10b981',
        detectiveLevels: [
            { id: 'apprentice', name: '见习侦探', minScore: 0, description: '日常对话' },
            { id: 'detective', name: '正式侦探', minScore: 70, description: '校园故事' },
            { id: 'master', name: '特级侦探', minScore: 90, description: '诗歌名言' }
        ]
    },
    grammar: {
        id: 'grammar',
        name: '找茬大作战',
        description: '帮别人检查作文里的问题，你会发现自己也在悄悄进步',
        icon: '🎯',
        color: '#ef4444',
        modes: ['限时挑战', '错误盲盒', '互助PK']
    },
    vocabulary: {
        id: 'vocabulary',
        name: '词汇换装间',
        description: '给词汇换上不同风格的衣服——正式装、休闲装、华丽装',
        icon: '👗',
        color: '#f59e0b',
        styles: [
            { id: 'formal', name: '正式装', icon: '👔', description: '学术写作风格' },
            { id: 'casual', name: '休闲装', icon: '👕', description: '日常交流风格' },
            { id: 'literary', name: '华丽装', icon: '👑', description: '文学创作风格' }
        ]
    },
    transformation: {
        id: 'transformation',
        name: '句型变变变',
        description: '同一个意思，用不同方式说，比谁的版本更有创意',
        icon: '🎭',
        color: '#ec4899',
        challengeTypes: ['诗意版', '幽默版', '正式版']
    },
    transition: {
        id: 'transition',
        name: '连接词魔法',
        description: '用魔法胶水把句子粘在一起，让文字流畅得像小溪',
        icon: '🪄',
        color: '#8b5cf6',
        magicianLevels: [
            { id: 'apprentice', name: '学徒', words: ['and', 'but', 'so', 'because'] },
            { id: 'mage', name: '法师', words: ['however', 'therefore', 'furthermore'] },
            { id: 'archmage', name: '大法师', words: ['consequently', 'nevertheless', 'meanwhile'] }
        ]
    }
};

// ========== 成就配置 ==========
export const ACHIEVEMENTS = {
    // 创作类成就
    creation: [
        { id: 'first_sentence', name: '初出茅庐', icon: '📝', desc: '创作第一个句子', requirement: 1 },
        { id: 'sentence_10', name: '文思泉涌', icon: '✍️', desc: '创作10个句子', requirement: 10 },
        { id: 'sentence_50', name: '笔耕不辍', icon: '📚', desc: '创作50个句子', requirement: 50 },
        { id: 'sentence_100', name: '著作等身', icon: '📖', desc: '创作100个句子', requirement: 100 }
    ],
    // 连续打卡成就
    streak: [
        { id: 'streak_3', name: '初露锋芒', icon: '🔥', desc: '连续打卡3天', requirement: 3 },
        { id: 'streak_7', name: '坚持不懈', icon: '📅', desc: '连续打卡7天', requirement: 7 },
        { id: 'streak_30', name: '持之以恒', icon: '📆', desc: '连续打卡30天', requirement: 30 },
        { id: 'streak_100', name: '习惯养成', icon: '🏆', desc: '连续打卡100天', requirement: 100 }
    ],
    // 技能类成就
    skill: [
        { id: 'master_expansion', name: '变形大师', icon: '✨', desc: '完成所有变形关卡' },
        { id: 'master_translation', name: '翻译专家', icon: '🕵️', desc: '获得特级侦探称号' },
        { id: 'master_grammar', name: '找茬高手', icon: '🎯', desc: '找出100个错误' },
        { id: 'master_vocabulary', name: '搭配大师', icon: '👗', desc: '连续10次正确搭配' },
        { id: 'master_transformation', name: '百变星君', icon: '🎭', desc: '作品进入创意殿堂' },
        { id: 'master_transition', name: '连接大师', icon: '🪄', desc: '完成大法师挑战' }
    ],
    // 社交类成就
    social: [
        { id: 'first_like', name: '初获认可', icon: '❤️', desc: '获得第一个赞', requirement: 1 },
        { id: 'popular_10', name: '小有名气', icon: '⭐', desc: '获得10个赞', requirement: 10 },
        { id: 'popular_50', name: '人气作者', icon: '🌟', desc: '获得50个赞', requirement: 50 },
        { id: 'collector', name: '收藏家', icon: '💎', desc: '收藏50个好句子', requirement: 50 }
    ]
};

// ========== 评分权重配置 ==========
export const SCORING_WEIGHTS = {
    creativity: 0.25,     // 创意度
    fluency: 0.25,      // 流畅度
    complexity: 0.20,   // 复杂度
    accuracy: 0.20,     // 准确性
    completeness: 0.10  // 完整度
};

// ========== 反馈配置 ==========
export const FEEDBACK_TEMPLATES = {
    praise: [
        '你使用的"{highlight}"让句子有了{effect}！',
        '这个"{highlight}"用得很棒，让句子更生动了！',
        '我喜欢你的"{highlight}"，这展示了你的创意！',
        '"{highlight}"这个词选得真好，很有画面感！'
    ],
    suggestion: [
        '如果想让句子更有冲击力，试试{suggestion}',
        '这里可以变得更好：{suggestion}',
        '一个想法：{suggestion}',
        '进阶技巧：{suggestion}'
    ],
    invitation: [
        '要不要试试看？',
        '试着改一下？',
        '想不想挑战一下？',
        '要不要尝试这个版本？'
    ],
    encouragement: [
        '做得很好！继续保持！',
        '进步明显，再接再厉！',
        '你正在变得越来越强！',
        '每一句都在进步，加油！'
    ]
};

// ========== 画廊配置 ==========
export const GALLERY_CONFIG = {
    tabs: [
        { id: 'hot', name: '本周最热', icon: '🔥' },
        { id: 'editor', name: '编辑精选', icon: '✨' },
        { id: 'my', name: '我的收藏', icon: '💎' },
        { id: 'creations', name: '我的作品', icon: '📝' }
    ],
    topics: [
        { id: 'campus', name: '校园生活', icon: '🎒' },
        { id: 'family', name: '家庭亲情', icon: '🏠' },
        { id: 'environment', name: '环境保护', icon: '🌱' },
        { id: 'technology', name: '科技发展', icon: '💻' },
        { id: 'culture', name: '传统文化', icon: '🏮' },
        { id: 'dreams', name: '梦想未来', icon: '⭐' }
    ],
    pageSize: 12
};

// ========== 本地存储配置 ==========
export const STORAGE_CONFIG = {
    prefix: 'ews_',
    version: '2.0.0',
    maxSize: 5 * 1024 * 1024, // 5MB
    cleanupThreshold: 0.8 // 80%时清理
};

// ========== API配置（预留） ==========
export const API_CONFIG = {
    baseUrl: '', // 预留API地址
    timeout: 30000,
    retryCount: 3
};

// ========== 调试配置 ==========
export const DEBUG_CONFIG = {
    enabled: false,
    logLevel: 'warn', // 'debug' | 'info' | 'warn' | 'error'
    mockData: false
};

// ========== 导出默认配置 ==========
export default {
    APP_INFO,
    EXAM_GOALS,
    EXAM_GOAL_GRADE_RANGES,
    formatExamGoalLabel,
    GRADES,
    MODULES,
    ACHIEVEMENTS,
    SCORING_WEIGHTS,
    FEEDBACK_TEMPLATES,
    GALLERY_CONFIG,
    STORAGE_CONFIG,
    API_CONFIG,
    DEBUG_CONFIG
};
