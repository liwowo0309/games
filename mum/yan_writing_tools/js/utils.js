/**
 * English Writing Studio - Utils
 * 工具函数库
 */

import { EXAM_GOAL_GRADE_RANGES } from './config.js';

// ========== DOM操作工具 ==========

/**
 * 获取单个DOM元素
 * @param {string} selector - CSS选择器
 * @returns {Element|null}
 */
export function $(selector) {
    return document.querySelector(selector);
}

/**
 * 获取多个DOM元素
 * @param {string} selector - CSS选择器
 * @returns {NodeList}
 */
export function $$(selector) {
    return document.querySelectorAll(selector);
}

/**
 * 创建DOM元素
 * @param {string} tag - 标签名
 * @param {Object} attrs - 属性对象
 * @param {string} content - 内容
 * @returns {Element}
 */
export function createElement(tag, attrs = {}, content = '') {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                el.dataset[dataKey] = dataValue;
            });
        } else {
            el.setAttribute(key, value);
        }
    });
    if (content) {
        el.innerHTML = content;
    }
    return el;
}

/**
 * 显示元素
 * @param {Element|string} el - DOM元素或选择器
 */
export function show(el) {
    const element = typeof el === 'string' ? $(el) : el;
    if (element) {
        element.classList.remove('hidden');
    }
}

/**
 * 隐藏元素
 * @param {Element|string} el - DOM元素或选择器
 */
export function hide(el) {
    const element = typeof el === 'string' ? $(el) : el;
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * 切换元素显示状态
 * @param {Element|string} el - DOM元素或选择器
 */
export function toggle(el) {
    const element = typeof el === 'string' ? $(el) : el;
    if (element) {
        element.classList.toggle('hidden');
    }
}

// ========== 数据操作工具 ==========

/**
 * 随机打乱数组
 * @param {Array} array
 * @returns {Array}
 */
export function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

/**
 * 按年级过滤数据
 * @param {Array} data - 数据数组
 * @param {string} grade - 年级
 * @returns {Array}
 */
export function filterByGrade(data, grade) {
    if (!grade || grade === 'all') return data;
    return data.filter(item => item.grades?.includes(grade));
}

/**
 * 按考试目标过滤写作素材（支持多标签 overlap：素材含任一目标即命中）
 * @param {Array<{ examGoals?: string[] }>} data
 * @param {string} examGoalId - config.EXAM_GOALS 中的 id，或 'all'
 * @returns {Array}
 */
export function filterByExamGoal(data, examGoalId) {
    if (!examGoalId || examGoalId === 'all') return data;
    return data.filter(item => item.examGoals?.includes(examGoalId));
}

/**
 * 按考试目标筛「带 grades 数组」的练习题（与 config.EXAM_GOAL_GRADE_RANGES 对齐）
 * @param {Array<{ grades?: string[] }>} data
 * @param {string} examGoalId
 * @returns {Array}
 */
export function filterByPracticeTarget(data, examGoalId) {
    if (!examGoalId || examGoalId === 'all') return data;
    const grades = EXAM_GOAL_GRADE_RANGES[examGoalId];
    if (!grades?.length) return data;
    return data.filter(
        item => Array.isArray(item.grades) && item.grades.some(g => grades.includes(g))
    );
}

/**
 * 随机获取一个练习
 * @param {Array} data - 数据数组
 * @param {string} grade - 年级（可选）
 * @returns {Object|null}
 */
export function getRandomExercise(data, grade = null) {
    const filtered = grade ? filterByGrade(data, grade) : data;
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * 深拷贝对象
 * @param {Object} obj
 * @returns {Object}
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========== 字符串处理工具 ==========

/**
 * 高亮显示差异
 * @param {string} original - 原文
 * @param {string} modified - 修改后的文本
 * @returns {string} - 带高亮标记的HTML
 */
export function highlightDiff(original, modified) {
    // 简化的差异高亮实现
    if (original === modified) return modified;
    
    // 找出新增的部分
    const words1 = original.split(/\s+/);
    const words2 = modified.split(/\s+/);
    
    let result = [];
    let i = 0, j = 0;
    
    while (j < words2.length) {
        if (i < words1.length && words1[i] === words2[j]) {
            result.push(words2[j]);
            i++;
            j++;
        } else {
            // 可能是新增的词
            result.push(`<span class="added-text">${words2[j]}</span>`);
            j++;
        }
    }
    
    return result.join(' ');
}

/**
 * 计算字符串相似度（简单的Levenshtein距离）
 * @param {string} str1
 * @param {string} str2
 * @returns {number} - 0-1之间的相似度
 */
export function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];
    
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    
    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
}

/**
 * 统计词数
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * 统计句子数
 * @param {string} text
 * @returns {number}
 */
export function countSentences(text) {
    return text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0).length;
}

/**
 * 首字母大写
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== 动画工具 ==========

/**
 * 添加动画类
 * @param {Element} element
 * @param {string} animationClass
 * @param {number} duration
 */
export function animate(element, animationClass, duration = 500) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration);
}

/**
 * 滚动到元素
 * @param {Element|string} target
 * @param {string} behavior
 */
export function scrollTo(target, behavior = 'smooth') {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        element.scrollIntoView({ behavior, block: 'center' });
    }
}

// ========== 时间工具 ==========

/**
 * 格式化日期
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date = new Date()) {
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 获取本周开始日期
 * @returns {Date}
 */
export function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
}

/**
 * 获取相对时间描述
 * @param {Date} date
 * @returns {string}
 */
export function getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return formatDate(date);
}

// ========== 随机工具 ==========

/**
 * 随机整数
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机取一个
 * @param {Array} arr
 * @returns {any}
 */
export function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 生成唯一ID
 * @returns {string}
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========== 验证工具 ==========

/**
 * 验证邮箱
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 验证非空
 * @param {string} value
 * @returns {boolean}
 */
export function isNotEmpty(value) {
    return value && value.trim().length > 0;
}

// ========== 导出默认对象 ==========
export default {
    $, $$, createElement,
    show, hide, toggle,
    shuffleArray, filterByGrade, filterByExamGoal, filterByPracticeTarget, getRandomExercise, deepClone,
    debounce, throttle,
    highlightDiff, calculateSimilarity, countWords, countSentences, capitalize,
    animate, scrollTo,
    formatDate, getWeekStart, getRelativeTime,
    randomInt, randomPick, generateId,
    isValidEmail, isNotEmpty
};
