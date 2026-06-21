/**
 * English Writing Studio - Achievements Component
 * 成就系统组件
 */

import { $, $$ } from '../utils.js';
import { state, unlockAchievement } from '../state.js';
import { ACHIEVEMENTS } from '../config.js';

// ========== 渲染成就中心 ==========
export function render() {
    return `
        <div id="achievementsComponent" class="achievements-container">
            <div class="achievements-header">
                <h2>🏆 成就中心</h2>
                <p>解锁成就，记录你的学习足迹</p>
                <div class="achievements-progress">
                    <div class="progress-text">
                        已解锁 ${state.unlockedAchievements.length} / ${getTotalAchievements()} 个成就
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(state.unlockedAchievements.length / getTotalAchievements() * 100)}%"></div>
                    </div>
                </div>
            </div>

            <!-- 成就分类 -->
            <div class="achievement-categories">
                ${renderAchievementCategories()}
            </div>
        </div>
    `;
}

// ========== 获取总成就数 ==========
function getTotalAchievements() {
    return Object.values(ACHIEVEMENTS).flat().length;
}

// ========== 渲染成就分类 ==========
function renderAchievementCategories() {
    return Object.entries(ACHIEVEMENTS).map(([category, achievements]) => `
        <div class="achievement-category">
            <div class="category-header">
                <span class="category-icon">${getCategoryIcon(category)}</span>
                <span class="category-name">${getCategoryName(category)}</span>
                <span class="category-count">
                    ${achievements.filter(a => state.unlockedAchievements.includes(a.id)).length}/${achievements.length}
                </span>
            </div>
            <div class="achievements-list">
                ${achievements.map(ach => renderAchievementItem(ach)).join('')}
            </div>
        </div>
    `).join('');
}

// ========== 获取分类图标 ==========
function getCategoryIcon(category) {
    const icons = {
        creation: '📝',
        streak: '🔥',
        skill: '🎯',
        social: '💫'
    };
    return icons[category] || '🏆';
}

// ========== 获取分类名称 ==========
function getCategoryName(category) {
    const names = {
        creation: '创作成就',
        streak: '打卡成就',
        skill: '技能成就',
        social: '社交成就'
    };
    return names[category] || '其他成就';
}

// ========== 渲染单个成就 ==========
function renderAchievementItem(achievement) {
    const isUnlocked = state.unlockedAchievements.includes(achievement.id);
    
    return `
        <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}" data-id="${achievement.id}">
            <div class="achievement-icon">${isUnlocked ? achievement.icon : '🔒'}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
                ${isUnlocked && achievement.unlockedAt ? `
                    <div class="achievement-date">解锁于 ${formatDate(achievement.unlockedAt)}</div>
                ` : ''}
            </div>
            ${isUnlocked ? '<div class="achievement-badge">✓</div>' : ''}
        </div>
    `;
}

// ========== 初始化成就中心 ==========
export function init() {
    checkAchievements();
    console.log('Achievements initialized');
}

// ========== 检查并解锁成就 ==========
function checkAchievements() {
    // 检查创作类成就
    ACHIEVEMENTS.creation.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id)) {
            const count = state.gallery.myCreations.length;
            if (count >= ach.requirement) {
                unlockAchievement(ach.id);
            }
        }
    });
    
    // 检查打卡类成就
    ACHIEVEMENTS.streak.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id)) {
            if (state.streak.current >= ach.requirement) {
                unlockAchievement(ach.id);
            }
        }
    });
    
    // 检查社交类成就
    ACHIEVEMENTS.social.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id)) {
            if (state.gallery.likes.length >= ach.requirement) {
                unlockAchievement(ach.id);
            }
        }
    });
}

// ========== 格式化日期 ==========
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// ========== 清理函数 ==========
export function cleanup() {
    // 清理工作
}

export default { render, init, cleanup };
