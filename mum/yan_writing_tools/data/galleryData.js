/**
 * English Writing Studio - Gallery Data
 * 句子画廊 - 示例数据
 */

export const galleryData = {
    hot: [
        {
            id: 'gal-001',
            text: 'Every morning, as the golden sunlight streams through my window, I realize that each day is a precious gift waiting to be unwrapped.',
            author: '小作家A',
            avatar: '👧',
            likes: 128,
            favorites: 45,
            evolution: 'The sun shines. → The golden sunlight shines through my window.',
            tags: ['自然', '感悟'],
            createdAt: Date.now() - 86400000
        },
        {
            id: 'gal-002',
            text: 'Although the path ahead seems long and winding, I know that every step I take brings me closer to my dreams.',
            author: '追梦人',
            avatar: '👦',
            likes: 96,
            favorites: 32,
            evolution: 'I walk on the path. → I walk on the long path to my dreams.',
            tags: ['梦想', '坚持'],
            createdAt: Date.now() - 172800000
        },
        {
            id: 'gal-003',
            text: 'Reading is not merely a hobby; it is a bridge that connects me to different worlds and allows me to live a thousand lives.',
            author: '书虫小王',
            avatar: '📚',
            likes: 84,
            favorites: 28,
            evolution: 'I like reading. → Reading connects me to different worlds.',
            tags: ['阅读', '爱好'],
            createdAt: Date.now() - 259200000
        }
    ],
    editor: [
        {
            id: 'gal-004',
            text: 'True friendship is like a lighthouse that guides us through the darkest storms of life, always shining bright and never fading.',
            author: '友谊使者',
            avatar: '🤝',
            likes: 156,
            favorites: 67,
            evolution: 'Friendship is important. → Friendship is like a lighthouse.',
            tags: ['友谊', '比喻'],
            createdAt: Date.now() - 345600000,
            isEditorPick: true
        },
        {
            id: 'gal-005',
            text: 'When we protect the environment, we are not just saving the planet; we are securing a beautiful future for generations to come.',
            author: '环保小卫士',
            avatar: '🌱',
            likes: 142,
            favorites: 58,
            evolution: 'We protect the environment. → We secure a future for generations.',
            tags: ['环保', '责任'],
            createdAt: Date.now() - 432000000,
            isEditorPick: true
        }
    ],
    topics: {
        campus: [
            {
                id: 'gal-topic-001',
                text: 'The school bell rings, signaling not just the end of a class, but the beginning of another exciting journey of discovery.',
                author: '校园诗人',
                avatar: '🎒',
                likes: 76,
                tags: ['校园', '学习']
            }
        ],
        family: [
            {
                id: 'gal-topic-002',
                text: 'Home is where love resides, memories are created, friends always belong, and laughter never ends.',
                author: '家的守护者',
                avatar: '🏠',
                likes: 189,
                tags: ['家庭', '温暖']
            }
        ],
        dreams: [
            {
                id: 'gal-topic-003',
                text: 'Dreams are the seeds of change. Nothing ever grows without a seed, and nothing ever changes without a dream.',
                author: '梦想家',
                avatar: '⭐',
                likes: 203,
                tags: ['梦想', '励志']
            }
        ]
    }
};

export default { galleryData };
