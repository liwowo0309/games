/**
 * English Writing Studio - Storage Management
 * 本地存储管理
 */

// ========== 存储键名常量 ==========
export const STORAGE_KEYS = {
    USER_DATA: 'ews_user_data',
    PROGRESS: 'ews_progress',
    GALLERY: 'ews_gallery',
    STREAK: 'ews_streak',
    STATS: 'ews_stats',
    SETTINGS: 'ews_settings',
    ACHIEVEMENTS: 'ews_achievements',
    CURRENT_GRADE: 'ews_current_grade',
    VERSION: 'ews_version'
};

// 当前数据版本（用于迁移）
const CURRENT_VERSION = '2.0.0';

// ========== 初始化存储 ==========

/**
 * 初始化存储系统
 * @returns {Promise<boolean>}
 */
export async function initStorage() {
    try {
        // 检查存储可用性
        if (!isStorageAvailable()) {
            console.warn('localStorage is not available');
            return false;
        }
        
        // 检查版本（数据迁移）
        const savedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
        if (savedVersion && savedVersion !== CURRENT_VERSION) {
            await migrateData(savedVersion, CURRENT_VERSION);
        }
        
        // 设置当前版本
        localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
        
        // 初始化默认数据结构
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA);
        if (!userData) {
            setStorageItem(STORAGE_KEYS.USER_DATA, createDefaultUserData());
        }
        
        console.log('Storage initialized successfully');
        return true;
    } catch (error) {
        console.error('Storage initialization failed:', error);
        return false;
    }
}

/**
 * 检查存储是否可用
 * @returns {boolean}
 */
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 创建默认用户数据
 * @returns {Object}
 */
function createDefaultUserData() {
    return {
        userId: generateUserId(),
        createdAt: Date.now(),
        lastActive: Date.now(),
        preferences: {
            theme: 'dark',
            soundEnabled: true,
            notificationsEnabled: true
        }
    };
}

/**
 * 生成用户ID
 * @returns {string}
 */
function generateUserId() {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ========== 数据迁移 ==========

/**
 * 迁移数据到新版本
 * @param {string} fromVersion - 旧版本
 * @param {string} toVersion - 新版本
 */
async function migrateData(fromVersion, toVersion) {
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
    
    try {
        // v1.x -> v2.x 迁移
        if (fromVersion.startsWith('1.')) {
            // 迁移旧数据结构到新结构
            const oldData = localStorage.getItem('ews_data');
            if (oldData) {
                const parsed = JSON.parse(oldData);
                // 重新组织数据结构
                setStorageItem(STORAGE_KEYS.PROGRESS, parsed.progress || {});
                setStorageItem(STORAGE_KEYS.GALLERY, parsed.gallery || { favorites: [], myCreations: [] });
                setStorageItem(STORAGE_KEYS.STATS, parsed.stats || {});
                // 删除旧数据
                localStorage.removeItem('ews_data');
            }
        }
        
        console.log('Data migration completed');
    } catch (error) {
        console.error('Data migration failed:', error);
    }
}

// ========== 基础存储操作 ==========

/**
 * 获取存储项
 * @param {string} key - 存储键
 * @returns {any}
 */
export function getStorageItem(key) {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return null;
    }
}

/**
 * 设置存储项
 * @param {string} key - 存储键
 * @param {any} value - 值
 */
export function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('Storage quota exceeded');
            // 尝试清理旧数据
            cleanupOldData();
            // 重试
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (retryError) {
                console.error('Storage write failed after cleanup:', retryError);
            }
        } else {
            console.error(`Error writing ${key}:`, error);
        }
    }
}

/**
 * 删除存储项
 * @param {string} key - 存储键
 */
export function removeStorageItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing ${key}:`, error);
    }
}

/**
 * 清理旧数据释放空间
 */
function cleanupOldData() {
    // 清理超过30天的临时数据
    const keysToCheck = [
        STORAGE_KEYS.GALLERY,
        STORAGE_KEYS.STATS
    ];
    
    keysToCheck.forEach(key => {
        const data = getStorageItem(key);
        if (data && data.history) {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            data.history = data.history.filter(item => item.timestamp > thirtyDaysAgo);
            setStorageItem(key, data);
        }
    });
}

// ========== 用户数据操作 ==========

/**
 * 保存用户数据
 * @param {string} key - 数据键
 * @param {any} data - 数据值
 */
export function saveUserData(key, data) {
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA) || createDefaultUserData();
    userData[key] = data;
    userData.lastActive = Date.now();
    setStorageItem(STORAGE_KEYS.USER_DATA, userData);
}

/**
 * 加载用户数据
 * @param {string} key - 数据键
 * @returns {any}
 */
export function loadUserData(key) {
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return null;
    return userData[key];
}

/**
 * 更新用户偏好设置
 * @param {Object} preferences - 偏好设置对象
 */
export function updatePreferences(preferences) {
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA) || createDefaultUserData();
    userData.preferences = { ...userData.preferences, ...preferences };
    setStorageItem(STORAGE_KEYS.USER_DATA, userData);
}

/**
 * 获取用户偏好设置
 * @returns {Object|null}
 */
export function getPreferences() {
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA);
    return userData?.preferences || null;
}

// ========== 进度数据操作 ==========

/**
 * 保存进度数据
 * @param {string} mode - 模式
 * @param {Object} progress - 进度对象
 */
export function saveProgress(mode, progress) {
    const allProgress = getStorageItem(STORAGE_KEYS.PROGRESS) || {};
    allProgress[mode] = {
        ...progress,
        lastUpdated: Date.now()
    };
    setStorageItem(STORAGE_KEYS.PROGRESS, allProgress);
}

/**
 * 加载进度数据
 * @param {string} mode - 模式（可选，不传则返回全部）
 * @returns {Object}
 */
export function loadProgress(mode = null) {
    const allProgress = getStorageItem(STORAGE_KEYS.PROGRESS) || {};
    if (mode) {
        return allProgress[mode] || null;
    }
    return allProgress;
}

// ========== 画廊数据操作 ==========

/**
 * 保存画廊数据
 * @param {Object} galleryData - 画廊数据
 */
export function saveGallery(galleryData) {
    setStorageItem(STORAGE_KEYS.GALLERY, galleryData);
}

/**
 * 加载画廊数据
 * @returns {Object}
 */
export function loadGallery() {
    return getStorageItem(STORAGE_KEYS.GALLERY) || {
        favorites: [],
        myCreations: [],
        likes: []
    };
}

// ========== 统计数据操作 ==========

/**
 * 保存统计数据
 * @param {Object} stats - 统计数据
 */
export function saveStats(stats) {
    const currentStats = getStorageItem(STORAGE_KEYS.STATS) || {};
    setStorageItem(STORAGE_KEYS.STATS, { ...currentStats, ...stats });
}

/**
 * 加载统计数据
 * @returns {Object}
 */
export function loadStats() {
    return getStorageItem(STORAGE_KEYS.STATS) || {
        totalCreations: 0,
        totalWords: 0,
        totalSentences: 0,
        totalLikes: 0
    };
}

// ========== 成就数据操作 ==========

/**
 * 保存已解锁成就
 * @param {Array} achievements - 成就ID数组
 */
export function saveAchievements(achievements) {
    setStorageItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
}

/**
 * 加载已解锁成就
 * @returns {Array}
 */
export function loadAchievements() {
    return getStorageItem(STORAGE_KEYS.ACHIEVEMENTS) || [];
}

// ========== 连续打卡操作 ==========

/**
 * 保存打卡数据
 * @param {Object} streak - 打卡数据
 */
export function saveStreak(streak) {
    setStorageItem(STORAGE_KEYS.STREAK, streak);
}

/**
 * 加载打卡数据
 * @returns {Object}
 */
export function loadStreak() {
    return getStorageItem(STORAGE_KEYS.STREAK) || {
        current: 0,
        lastActive: null,
        history: []
    };
}

// ========== 导出/导入 ==========

/**
 * 导出所有用户数据
 * @returns {Object}
 */
export function exportAllData() {
    const data = {};
    Object.values(STORAGE_KEYS).forEach(key => {
        data[key] = getStorageItem(key);
    });
    return data;
}

/**
 * 导入用户数据
 * @param {Object} data - 导入的数据
 * @returns {boolean}
 */
export function importAllData(data) {
    try {
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                setStorageItem(key, value);
            }
        });
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        return false;
    }
}

// ========== 清除数据 ==========

/**
 * 清除所有数据
 * @param {boolean} confirm - 确认清除
 */
export function clearAllData(confirm = false) {
    if (!confirm) {
        console.warn('Please confirm to clear all data');
        return false;
    }
    
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    
    // 重新初始化
    initStorage();
    return true;
}

// ========== 存储状态检查 ==========

/**
 * 获取存储使用情况
 * @returns {Object}
 */
export function getStorageUsage() {
    let totalSize = 0;
    const items = {};
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        totalSize += size;
        items[key] = size;
    }
    
    return {
        totalSize: (totalSize / 1024).toFixed(2) + ' KB',
        itemCount: localStorage.length,
        items
    };
}

// ========== 导出默认对象 ==========
export default {
    STORAGE_KEYS,
    initStorage,
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    saveUserData,
    loadUserData,
    updatePreferences,
    getPreferences,
    saveProgress,
    loadProgress,
    saveGallery,
    loadGallery,
    saveStats,
    loadStats,
    saveAchievements,
    loadAchievements,
    saveStreak,
    loadStreak,
    exportAllData,
    importAllData,
    clearAllData,
    getStorageUsage
};
