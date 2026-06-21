/**
 * English Writing Studio - 写作题目素材库（考试目标维度）
 *
 * 设计说明：
 * - examGoals：可多选，表达「同一题」对不同考试的 overlap（如 PET 与中考同属 B1 边缘应用文）。
 * - authenticity：区分原创模拟 vs 对公开真题/样题结构的参照；不在此库存放未经授权的整卷扫描件原文。
 */

/** 与课标/常见教辅对照的难度带（非年龄） */
export const PROMPT_DIFFICULTY = {
    foundation: { id: 'foundation', name: '基础输出', note: '句子为主，篇章短' },
    standard: { id: 'standard', name: '标准篇章', note: '完整短信/邮件/短文' },
    advanced: { id: 'advanced', name: '高阶篇章', note: '议论、报道、双段续写等' }
};

/**
 * @typedef {'simulated'|'exam_style'|'public_sample_echo'} AuthenticityType
 * simulated — 完全原创题干
 * exam_style — 题型/字数/体裁对齐某类考试官方说明或常见真题，题干原创
 * public_sample_echo — 情境与公开样题或广泛转载的「回忆版真题要点」同向，文字已重写（非 PDF 原卷）
 */

export const writingPromptBank = [
    // ---------- KET ∩ 中考（短邮件/便条）----------
    {
        id: 'wp-001',
        title: '告诉朋友周末计划',
        genre: 'short_message',
        difficulty: 'foundation',
        examGoals: ['ket', 'zhongkao'],
        wordCount: { min: 25, max: 35, hint: '25–35 词（KET 短讯风格）；中考练笔可放宽到 50 词' },
        situationZh: '你的英国朋友 Sam 在微信上问你这个周六能不能一起打球。',
        bulletPointsZh: ['说明你能不能去', '给出两个具体时间或活动安排中的一个', '用一句话结尾表示友好'],
        constraintsZh: ['使用一般现在时/将来时', '不要出现真实校名'],
        tags: ['日常', '计划'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。体裁对齐 Cambridge A2 Key「写短邮件/便条」类任务与中考低阶应用文练笔；非剑桥或某省中考原卷逐字稿。'
        }
    },
    {
        id: 'wp-002',
        title: '邀请同学参加生日聚会',
        genre: 'short_message',
        difficulty: 'foundation',
        examGoals: ['ket', 'zhongkao'],
        wordCount: { min: 30, max: 45, hint: '30–45 词' },
        situationZh: '你给同班同学 Li Hua 写一张英文便条，邀请他参加你的生日聚会。',
        bulletPointsZh: ['时间、地点', '需要带什么（如一个小游戏或零食）', '询问对方是否能来'],
        constraintsZh: ['语气友好、口语化即可'],
        tags: ['邀请', '校园'],
        authenticity: {
            type: 'simulated',
            noteZh: '原创模拟题。'
        }
    },
    // ---------- PET ∩ 中考（邮件/短文）----------
    {
        id: 'wp-003',
        title: '给交换生介绍本校社团',
        genre: 'email',
        difficulty: 'standard',
        examGoals: ['pet', 'zhongkao'],
        wordCount: { min: 80, max: 100, hint: '80–100 词' },
        situationZh: '下周有一位外国交换生要来你们学校。请你用英文写一封邮件，向他介绍两个学生社团，并说明参加社团的好处。',
        bulletPointsZh: ['自我介绍（姓名用 Li Hua）', '介绍两个社团及活动', '欢迎他加入并给出一条实用建议'],
        constraintsZh: ['邮件格式：称呼、正文、结尾', '不得出现真实校名'],
        tags: ['校园', '交换生'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。话题与多地中考「接待外宾/介绍校园」及 PET 邮件体裁常见训练一致。'
        }
    },
    {
        id: 'wp-004',
        title: '健康生活征文',
        genre: 'article',
        difficulty: 'standard',
        examGoals: ['pet', 'zhongkao'],
        wordCount: { min: 90, max: 110, hint: '90–110 词' },
        situationZh: '校英文报征稿：主题是「How I keep healthy」。请写一篇短文投稿。',
        bulletPointsZh: ['你的两项健康习惯', '一项你想改进的习惯', '呼吁大家重视健康'],
        constraintsZh: ['使用连接词使段落清晰'],
        tags: ['健康', '议论文雏形'],
        authenticity: {
            type: 'simulated',
            noteZh: '原创模拟题。'
        }
    },
    {
        id: 'wp-005',
        title: '传统文化：介绍一项手工艺',
        genre: 'speech_draft',
        difficulty: 'standard',
        examGoals: ['pet', 'zhongkao'],
        wordCount: { min: 80, max: 120, hint: '80–120 词' },
        situationZh: '英语课上老师请大家介绍一项中国传统手工艺（如剪纸、扎染、竹编等）。你准备发言稿。',
        bulletPointsZh: ['说明你选择的项目', '描述制作过程或文化意义', '邀请同学亲自尝试'],
        constraintsZh: ['适合朗读的口语化书面语'],
        tags: ['传统文化'],
        authenticity: {
            type: 'public_sample_echo',
            noteZh: '题干为原创改写。话题方向常被教培资料列为中考书面表达高频主题（如「向外国友人介绍中国文化」类汇编）；若需标注「某年某地真题」，请只使用学校已获授权的版本并另附出处。'
        }
    },
    // ---------- 中考 ----------
    {
        id: 'wp-006',
        title: '劳动教育：一次家务经历',
        genre: 'narrative',
        difficulty: 'standard',
        examGoals: ['zhongkao'],
        wordCount: { min: 80, max: 100, hint: '80–100 词' },
        situationZh: '以「A meaningful housework experience」为题，记叙一次你做家务的经历。',
        bulletPointsZh: ['何时何地', '你做了什么', '你的感受或收获'],
        constraintsZh: ['以记叙为主，可夹叙夹议'],
        tags: ['劳动教育', '记叙文'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。与近年课标热点「劳动教育」命题方向一致。'
        }
    },
    {
        id: 'wp-007',
        title: '环保：节约用水倡议书',
        genre: 'proposal',
        difficulty: 'standard',
        examGoals: ['zhongkao'],
        wordCount: { min: 80, max: 100, hint: '80–100 词' },
        situationZh: '你校将举办「节水周」。请写一则倡议书，呼吁同学们节约用水。',
        bulletPointsZh: ['说明活动背景', '提出至少两条具体建议', '简短有力的结尾号召'],
        constraintsZh: ['使用倡议书常用句式'],
        tags: ['环保', '应用文'],
        authenticity: {
            type: 'simulated',
            noteZh: '原创模拟题。'
        }
    },
    // ---------- PET ----------
    {
        id: 'wp-008',
        title: '回复杂志「最难忘的旅行」',
        genre: 'article',
        difficulty: 'standard',
        examGoals: ['pet'],
        wordCount: { min: 100, max: 120, hint: '约 100 词' },
        situationZh: '你常读的英文青少年杂志征集短文：Describe a trip you will never forget.',
        bulletPointsZh: ['你去哪里、和谁一起', '旅途中印象深刻的一件事', '你从中学到了什么'],
        constraintsZh: ['杂志读者为同龄人，语气自然'],
        tags: ['旅行', '记叙'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。对齐 B1 Preliminary 常见「杂志风格短文」训练形式（参见 Cambridge English B1 考试官方说明中的写作体裁描述）。'
        }
    },
    {
        id: 'wp-009',
        title: '给朋友的建议信：屏幕时间',
        genre: 'email',
        difficulty: 'standard',
        examGoals: ['pet', 'fce'],
        wordCount: { min: 100, max: 140, hint: 'PET 约 100 词；若按 FCE  informal email 可扩写到 140 词左右' },
        situationZh: '你的朋友最近熬夜刷短视频，来信求助。请回信给出建议并分享你自己的一条好习惯。',
        bulletPointsZh: ['表示理解', '两条以上建议', '表达祝愿'],
        constraintsZh: ['非正式邮件语气'],
        tags: ['建议', '科技与生活'],
        authenticity: {
            type: 'simulated',
            noteZh: '原创模拟题。PET 与 FCE 均可练「建议类」邮件，难度差在句式复杂度与篇幅。'
        }
    },
    // ---------- 高考应用文 ----------
    {
        id: 'wp-010',
        title: '邀请外教参加主题班会',
        genre: 'letter_email',
        difficulty: 'standard',
        examGoals: ['gaokao'],
        wordCount: { min: 80, max: 100, hint: '80 词左右（以本省要求为准）' },
        situationZh: '你校将举办「中国传统节日」主题班会。请你给外教 Mr. Smith 写一封信，邀请他参加并请他做一个 5 分钟左右的分享。',
        bulletPointsZh: ['时间、地点、班会目的', '请求对方分享的内容建议', '询问对方是否方便并表达感谢'],
        constraintsZh: ['书信格式完整'],
        tags: ['邀请', '传统文化'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。体裁为新高考常见应用文「邀请信」，与公开教辅中的组合训练同型；非某一省份当年原卷全文。'
        }
    },
    {
        id: 'wp-011',
        title: '投稿：我最敬佩的一个人',
        genre: 'submission',
        difficulty: 'standard',
        examGoals: ['gaokao', 'zhongkao'],
        wordCount: { min: 80, max: 120, hint: '中考 80–100 词；高考投稿类常 80 词左右，以试题说明为准' },
        situationZh: '英文校刊正在征集「The person I admire most」。请你投稿。',
        bulletPointsZh: ['人物是谁', '一两件具体事例', '你从他/她身上学到了什么'],
        constraintsZh: ['记叙+议论结合，结尾点题'],
        tags: ['人物', '投稿'],
        authenticity: {
            type: 'simulated',
            noteZh: '原创模拟题。中考与高考均可出现「征文/投稿」变体，故标双考试目标 overlap。'
        }
    },
    {
        id: 'wp-012',
        title: '建议信：英语学习计划',
        genre: 'letter_email',
        difficulty: 'standard',
        examGoals: ['gaokao', 'pet'],
        wordCount: { min: 80, max: 100, hint: '高考约 80 词；PET 可略增细节至 100 词' },
        situationZh: '你的留学生朋友 Leo 准备参加中文演讲比赛，同时想提高英语听力。他写信征求你的建议。',
        bulletPointsZh: ['肯定对方的努力', '给出听力与演讲各一条可操作建议', '表达支持与鼓励'],
        constraintsZh: ['语气真诚、具体'],
        tags: ['建议', '学习'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。对齐高考常见「建议信」与 PET 邮件。'
        }
    },
    // ---------- 高考读后续写（梗概+方向）----------
    {
        id: 'wp-013',
        title: '读后续写：迷路的小狗',
        genre: 'continuation',
        difficulty: 'advanced',
        examGoals: ['gaokao'],
        wordCount: { min: 120, max: 180, hint: '两段续写合计约 150 词（按各省评分习惯自行分配）' },
        situationZh: '阅读下面短文开头，根据其情节续写两段，使之构成完整故事。',
        readingStubEn: `Last Saturday, Mia volunteered at the city animal shelter. While walking a shy puppy named Bean near the park, a sudden firework frightened him. The leash slipped from her hand, and Bean ran into the crowd.\n\nParagraph 1 opening: Mia took a deep breath and rushed after the sound of barking.\n\nParagraph 2 opening: An hour later, Mia returned to the shelter with Bean safely in her arms.`,
        bulletPointsZh: ['第一段：描写 Mia 如何寻找 Bean（动作、对话或心理）', '第二段：交代如何回到收容所及人物感受', '续写需与所给段首句衔接自然'],
        constraintsZh: ['时态与原文一致', '避免突兀的超自然转折'],
        tags: ['读后续写', '记叙'],
        authenticity: {
            type: 'simulated',
            noteZh: '原创模拟题。题型结构对齐新高考「读后续写」；非教育部考试中心公布的某套真题原文。'
        }
    },
    // ---------- FCE ----------
    {
        id: 'wp-014',
        title: 'Essay：网络学习是否应取代线下课堂',
        genre: 'essay',
        difficulty: 'advanced',
        examGoals: ['fce', 'gaokao'],
        wordCount: { min: 140, max: 190, hint: 'FCE Essay 约 140–190 词；高考若写同类议论文可压缩到 120 词并自行调整结构' },
        situationZh: 'You have had a class discussion about online learning. Now your teacher has asked you to write an essay.',
        bulletPointsEn: [
            'Write an essay discussing whether online learning should replace face-to-face classes at school.',
            'Write about: (1) advantages for students, (2) disadvantages for students, (3) your opinion.',
            'You must include all three points and add your own idea in the third paragraph.'
        ],
        constraintsZh: ['英文题干建议直接用英语作答', '五段式或四段式均可，注意衔接词'],
        tags: ['议论文', '教育'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。Essay 结构对齐 B2 First Writing Part 1 常见要求（题目中列两点+自拟第三点），参见 Cambridge English B2 First handbook 对 essay 的说明。'
        }
    },
    {
        id: 'wp-015',
        title: 'Review：一部适合青少年看的电影',
        genre: 'review',
        difficulty: 'advanced',
        examGoals: ['fce'],
        wordCount: { min: 140, max: 190, hint: '140–190 词' },
        situationZh: 'An international website for teenagers is looking for reviews of films that are suitable for young people. Write a review of a film you have watched.',
        bulletPointsZh: ['简要介绍电影类型与主题（无剧透或少量剧透）', '说明你喜欢或不喜欢的理由', '向读者给出是否推荐的结论'],
        constraintsZh: ['使用评价性词汇与对比连接词'],
        tags: ['影评', 'FCE Part 2'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。体裁对齐 B2 First Writing Part 2 review；情境为典型训练设定，非某一考季原题照录。'
        }
    },
    {
        id: 'wp-016',
        title: 'Report：班级课外阅读情况',
        genre: 'report',
        difficulty: 'advanced',
        examGoals: ['fce'],
        wordCount: { min: 140, max: 190, hint: '140–190 词' },
        situationZh: 'Your teacher has asked you to write a report on how students in your class use their free time for reading in English.',
        bulletPointsZh: ['说明调查目的与方法（可虚构）', '总结主要发现（至少两项）', '提出一条改进建议'],
        constraintsZh: ['使用正式报告语气与小标题（如 Introduction / Findings / Recommendations）'],
        tags: ['报告', '校园'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。对齐 FCE report 常见结构。'
        }
    },
    // ---------- KET 单独：看图写话式 ----------
    {
        id: 'wp-017',
        title: '描述图片中正在发生的事',
        genre: 'picture_based',
        difficulty: 'foundation',
        examGoals: ['ket'],
        wordCount: { min: 35, max: 45, hint: '35–45 词' },
        situationZh: '（课堂可用 PPT 展示）图片场景：公园里一家人在野餐，旁边有一只狗在追飞盘。',
        bulletPointsZh: ['用现在进行时描述至少三个人或物的动作', '写一句关于天气', '一句总结感受'],
        constraintsZh: ['以现在进行时为主'],
        tags: ['看图写话', '家庭'],
        authenticity: {
            type: 'exam_style',
            noteZh: '原创模拟题。对齐 A2 Key 常见「根据图片写短文」能力要求；图片需教师自备。'
        }
    },
    // ---------- 高考 ∩ FCE：议论短文 ----------
    {
        id: 'wp-018',
        title: '短视频对青少年的影响',
        genre: 'argument_short',
        difficulty: 'advanced',
        examGoals: ['gaokao', 'fce'],
        wordCount: { min: 120, max: 180, hint: '可按高考「概要+议论」或 FCE article 自行命题子格式' },
        situationZh: '近年来短视频在青少年中非常流行。请写一篇短文，分析其利与弊，并表明你的态度。',
        bulletPointsZh: ['至少各写一点利与弊', '给出一条自律或家庭/学校可采取的措施', '结论明确'],
        constraintsZh: ['避免空洞口号，举例尽量具体'],
        tags: ['媒体', '议论文'],
        authenticity: {
            type: 'simulated',
            noteZh: '原创模拟题。可作为高考议论文练笔或 FCE article 压缩版。'
        }
    }
];

/**
 * @param {string} examGoalId
 * @returns {typeof writingPromptBank}
 */
export function getWritingPromptsByExamGoal(examGoalId) {
    if (!examGoalId || examGoalId === 'all') return writingPromptBank;
    return writingPromptBank.filter(p => p.examGoals.includes(examGoalId));
}

/**
 * 列出与某考试目标有交集的素材 id（用于运营检查 overlap）
 * @param {string} examGoalId
 */
export function listOverlapPromptIds(examGoalId) {
    return writingPromptBank.filter(p => p.examGoals.includes(examGoalId)).map(p => p.id);
}
