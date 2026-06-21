/**
 * English Writing Studio - State Management
 * 全局状态管理
 */

import { loadUserData, saveUserData } from './storage.js';
import { formatExamGoalLabel } from './config.js';

// ========== 全局状态对象 ==========
export const state = {
    // 当前状态
    currentMode: null,
    currentGrade: null,
    /** @type {string} 考试目标：all | ket | pet | fce | zhongkao | gaokao */
    currentExamGoal: 'all',
    currentExercise: null,
    
    // 用户进度
    userProgress: {
        expansion: { completed: 0, currentLevel: 1, accuracy: 0 },
        translation: { completed: 0, accuracy: 0 },
        grammar: { completed: 0, accuracy: 0 },
        vocabulary: { completed: 0, accuracy: 0 },
        transformation: { completed: 0, accuracy: 0 },
        transition: { completed: 0, accuracy: 0 }
    },
    
    // 成就系统
    achievements: [],
    unlockedAchievements: [],
    
    // 画廊数据
    gallery: {
        favorites: [],
        myCreations: [],
        likes: []
    },
    
    // 连续打卡
    streak: {
        current: 0,
        lastActive: null,
        history: []
    },
    
    // 统计数据
    stats: {
        totalCreations: 0,
        totalWords: 0,
        totalSentences: 0,
        totalLikes: 0
    },
    
    // 设置
    settings: {
        soundEnabled: true,
        notificationsEnabled: true,
        theme: 'dark'
    },
    
    // 临时状态（不持久化）
    temp: {
        currentFeedback: null,
        currentEvolution: null,
        sessionStartTime: null
    }
};

// ========== 监听器 ==========
const listeners = new Map();

/**
 * 订阅状态变化
 * @param {string} key - 状态键
 * @param {Function} callback - 回调函数
 */
export function subscribe(key, callback) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set());
    }
    listeners.get(key).add(callback);
}

/**
 * 取消订阅
 * @param {string} key - 状态键
 * @param {Function} callback - 回调函数
 */
export function unsubscribe(key, callback) {
    if (listeners.has(key)) {
        listeners.get(key).delete(callback);
    }
}

/**
 * 触发状态变化通知
 * @param {string} key - 状态键
 * @param {any} value - 新值
 */
function notify(key, value) {
    if (listeners.has(key)) {
        listeners.get(key).forEach(callback => {
            try {
                callback(value, state);
            } catch (error) {
                console.error(`State listener error for ${key}:`, error);
            }
        });
    }
}

// ========== 状态操作方法 ==========

/**
 * 设置当前模式
 * @param {string} mode - 模式名称
 */
export function setMode(mode) {
    const prevMode = state.currentMode;
    state.currentMode = mode;
    state.temp.sessionStartTime = Date.now();
    notify('currentMode', mode);
    notify('modeChange', { from: prevMode, to: mode });
}

/**
 * 设置当前年级
 * @param {string} grade - 年级
 */
export function setGrade(grade) {
    state.currentGrade = grade;
    saveUserData('currentGrade', grade);
    notify('currentGrade', grade);
}

/**
 * 设置当前考试目标（首页下拉），驱动六大模块筛题与写作素材库
 * @param {string} examGoalId
 */
export function setExamGoal(examGoalId) {
    const id = examGoalId || 'all';
    state.currentExamGoal = id;
    saveUserData('currentExamGoal', id);
    notify('currentExamGoal', id);
}

/**
 * 设置当前练习
 * @param {Object} exercise - 练习数据
 */
export function setCurrentExercise(exercise) {
    state.currentExercise = exercise;
    notify('currentExercise', exercise);
}

/**
 * 更新模块进度
 * @param {string} mode - 模式名称
 * @param {Object} data - 进度数据
 */
export function updateProgress(mode, data) {
    if (!state.userProgress[mode]) {
        state.userProgress[mode] = {};
    }
    
    const prevData = { ...state.userProgress[mode] };
    state.userProgress[mode] = {
        ...prevData,
        ...data,
        lastUpdated: Date.now()
    };
    
    saveUserData('userProgress', state.userProgress);
    notify(`progress.${mode}`, state.userProgress[mode]);
    notify('progressUpdate', { mode, data: state.userProgress[mode] });
}

/**
 * 增加完成计数
 * @param {string} mode - 模式名称
 */
export function incrementCompleted(mode) {
    const current = state.userProgress[mode]?.completed || 0;
    updateProgress(mode, { completed: current + 1 });
    
    // 更新总统计
    state.stats.totalCreations++;
    saveUserData('stats', state.stats);
    
    notify('statsUpdate', state.stats);
}

/**
 * 记录字数统计
 * @param {number} wordCount - 词数
 */
export function recordWordCount(wordCount) {
    state.stats.totalWords += wordCount;
    state.stats.totalSentences++;
    saveUserData('stats', state.stats);
    notify('statsUpdate', state.stats);
}

/**
 * 解锁成就
 * @param {string} achievementId - 成就ID
 */
export function unlockAchievement(achievementId) {
    if (!state.unlockedAchievements.includes(achievementId)) {
        state.unlockedAchievements.push(achievementId);
        saveUserData('unlockedAchievements', state.unlockedAchievements);
        notify('achievementUnlock', achievementId);
        
        // 记录解锁时间
        const achievement = state.achievements.find(a => a.id === achievementId);
        if (achievement) {
            achievement.unlockedAt = Date.now();
        }
    }
}

/**
 * 添加作品到画廊
 * @param {Object} creation - 作品数据
 */
export function addToGallery(creation) {
    const newCreation = {
        id: creation.id || generateId(),
        text: creation.text,
        originalText: creation.originalText,
        evolution: creation.evolution,
        mode: creation.mode,
        grade: formatExamGoalLabel(state.currentExamGoal),
        author: creation.author || '我',
        createdAt: Date.now(),
        likes: 0,
        tags: creation.tags || []
    };
    
    state.gallery.myCreations.unshift(newCreation);
    saveUserData('gallery', state.gallery);
    notify('galleryUpdate', state.gallery);
    
    return newCreation;
}

/**
 * 收藏句子
 * @param {string} sentenceId - 句子ID
 */
export function favoriteSentence(sentenceId) {
    if (!state.gallery.favorites.includes(sentenceId)) {
        state.gallery.favorites.push(sentenceId);
        saveUserData('gallery', state.gallery);
        notify('favoriteAdd', sentenceId);
    }
}

/**
 * 取消收藏
 * @param {string} sentenceId - 句子ID
 */
export function unfavoriteSentence(sentenceId) {
    const index = state.gallery.favorites.indexOf(sentenceId);
    if (index > -1) {
        state.gallery.favorites.splice(index, 1);
        saveUserData('gallery', state.gallery);
        notify('favoriteRemove', sentenceId);
    }
}

/**
 * 点赞句子
 * @param {string} sentenceId - 句子ID
 */
export function likeSentence(sentenceId) {
    if (!state.gallery.likes.includes(sentenceId)) {
        state.gallery.likes.push(sentenceId);
        state.stats.totalLikes++;
        saveUserData('gallery', state.gallery);
        saveUserData('stats', state.stats);
        notify('likeAdd', sentenceId);
    }
}

/**
 * 更新连续打卡
 */
export function updateStreak() {
    const today = new Date().toDateString();
    const lastActive = state.streak.lastActive ? new Date(state.streak.lastActive).toDateString() : null;
    
    if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive === yesterday.toDateString()) {
            // 连续打卡
            state.streak.current++;
        } else if (lastActive !== today) {
            // 断签，重新开始
            state.streak.current = 1;
        }
        
        state.streak.lastActive = Date.now();
        state.streak.history.push(Date.now());
        
        saveUserData('streak', state.streak);
        notify('streakUpdate', state.streak);
    }
}

/**
 * 设置临时状态
 * @param {string} key - 键
 * @param {any} value - 值
 */
export function setTemp(key, value) {
    state.temp[key] = value;
}

/**
 * 获取临时状态
 * @param {string} key - 键
 * @returns {any}
 */
export function getTemp(key) {
    return state.temp[key];
}

/**
 * 清除临时状态
 * @param {string} key - 键
 */
export function clearTemp(key) {
    delete state.temp[key];
}

// ========== 初始化 ==========

/**
 * 初始化状态
 */
export function initState() {
    // 从存储加载数据
    const savedProgress = loadUserData('userProgress');
    if (savedProgress) {
        state.userProgress = { ...state.userProgress, ...savedProgress };
    }
    
    const savedGallery = loadUserData('gallery');
    if (savedGallery) {
        state.gallery = { ...state.gallery, ...savedGallery };
    }
    
    const savedStreak = loadUserData('streak');
    if (savedStreak) {
        state.streak = { ...state.streak, ...savedStreak };
    }
    
    const savedStats = loadUserData('stats');
    if (savedStats) {
        state.stats = { ...state.stats, ...savedStats };
    }
    
    const savedSettings = loadUserData('settings');
    if (savedSettings) {
        state.settings = { ...state.settings, ...savedSettings };
    }
    
    const savedGrade = loadUserData('currentGrade');
    if (savedGrade) {
        state.currentGrade = savedGrade;
    }

    const savedExamGoal = loadUserData('currentExamGoal');
    if (savedExamGoal) {
        state.currentExamGoal = savedExamGoal;
    }
    
    const savedAchievements = loadUserData('unlockedAchievements');
    if (savedAchievements) {
        state.unlockedAchievements = savedAchievements;
    }
    
    // 检查并更新连续打卡
    updateStreak();
    
    console.log('State initialized:', state);
}

/**
 * 重置所有状态（谨慎使用）
 */
export function resetState() {
    Object.keys(state).forEach(key => {
        if (key !== 'temp') {
            state[key] = Array.isArray(state[key]) ? [] : 
                         typeof state[key] === 'object' ? {} : null;
        }
    });
    
    // 重新初始化
    initState();
}

// ========== 辅助函数 ==========

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ========== 导出默认对象 ==========
export default {
    state,
    subscribe,
    unsubscribe,
    setMode,
    setGrade,
    setExamGoal,
    setCurrentExercise,
    updateProgress,
    incrementCompleted,
    recordWordCount,
    unlockAchievement,
    addToGallery,
    favoriteSentence,
    unfavoriteSentence,
    likeSentence,
    updateStreak,
    setTemp,
    getTemp,
    clearTemp,
    initState,
    resetState
};
