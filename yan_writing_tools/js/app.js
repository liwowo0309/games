/**
 * English Writing Studio - App Entry
 * 应用主入口
 */

import { initStorage } from './storage.js';
import { initState } from './state.js';
import { initRouter, navigateTo, goBack, getCurrentRoute } from './router-simple.js';
import { $, $$ } from './utils.js';
import { APP_INFO, EXAM_GOALS } from './config.js';

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
}

// ========== 应用状态 ==========
let appInitialized = false;

// ========== 初始化应用 ==========

/**
 * 初始化应用
 */
async function initApp() {
    if (appInitialized) {
        console.warn('App already initialized');
        return;
    }
    
    console.log(`Initializing ${APP_INFO.name} v${APP_INFO.version}`);
    
    try {
        // 1. 初始化存储系统
        const storageReady = await initStorage();
        if (!storageReady) {
            console.warn('Storage initialization failed, continuing with in-memory mode');
        }
        
        // 2. 初始化状态管理
        initState();
        
        // 3. 初始化路由系统
        initRouter();
        
        // 4. 初始化UI组件
        initUI();
        
        // 5. 绑定全局事件
        bindGlobalEvents();

        // 6. 考试目标变化时刷新素材库
        import('./state.js').then(({ subscribe }) => {
            subscribe('currentExamGoal', () => {
                renderPromptBankPanel();
            });
        });
        
        // 7. 加载首页
        loadHomePage();
        
        appInitialized = true;
        console.log('App initialized successfully');
        
    } catch (error) {
        console.error('App initialization failed:', error);
        showInitError(error);
    }
}

// ========== UI初始化 ==========

/**
 * 初始化UI组件
 */
function initUI() {
    initExamGoalDropdown();
    
    // 初始化模式卡片
    initModeCards();
    
    // 初始化统计栏
    initStatsBar();
    
    // 初始化返回按钮
    initBackButton();
}

/**
 * 同步考试目标下拉按钮文案
 * @param {string} goalId
 */
function syncExamGoalUI(goalId) {
    const id = goalId || 'all';
    const allMeta = {
        name: '全部考试目标',
        icon: '🎯',
        cefr: '',
        wordBand: '六大模块与素材库显示全部难度'
    };
    const meta = id === 'all' ? allMeta : EXAM_GOALS.find(g => g.id === id);
    if (!meta) return;

    const iconEl = $('#examGoalDropdownIcon');
    const textEl = $('#examGoalDropdownText');
    const badgeEl = $('#examGoalBadge');

    if (iconEl) iconEl.textContent = meta.icon || '🎯';
    if (textEl) textEl.textContent = meta.name;
    if (badgeEl) {
        badgeEl.textContent = meta.cefr
            ? `${meta.cefr} · ${meta.wordBand}`
            : meta.wordBand;
    }

    const content = $('#examGoalDropdownContent');
    if (content) {
        content.querySelectorAll('.grade-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.examGoal === id);
        });
    }
}

/**
 * @param {string} goalId
 */
function selectExamGoal(goalId) {
    const id = goalId || 'all';
    syncExamGoalUI(id);
    import('./state.js').then(({ setExamGoal }) => {
        setExamGoal(id);
    });
    console.log('Selected exam goal:', id);
}

/**
 * 初始化考试目标选择器 + 首次同步状态
 */
function initExamGoalDropdown() {
    const dropdown = $('#examGoalDropdown');
    const content = $('#examGoalDropdownContent');

    if (!dropdown || !content) return;

    const allRow = `
        <div class="grade-option" data-exam-goal="all">
            <div class="grade-option-left">
                <span class="grade-icon">🎯</span>
                <div>
                    <div class="grade-option-name">全部考试目标</div>
                    <div class="grade-option-level">不筛选难度</div>
                </div>
            </div>
        </div>`;

    content.innerHTML = allRow + EXAM_GOALS.map(ex => `
        <div class="grade-option" data-exam-goal="${ex.id}">
            <div class="grade-option-left">
                <span class="grade-icon">${ex.icon}</span>
                <div>
                    <div class="grade-option-name">${ex.name}</div>
                    <div class="grade-option-level">${ex.note}</div>
                </div>
            </div>
            <span class="grade-option-lexile">${ex.cefr}</span>
        </div>
    `).join('');

    dropdown.addEventListener('click', (e) => {
        if (e.target.closest('.grade-dropdown-btn')) {
            dropdown.classList.toggle('open');
        }
    });

    content.addEventListener('click', (e) => {
        const option = e.target.closest('.grade-option');
        if (option && option.dataset.examGoal != null) {
            selectExamGoal(option.dataset.examGoal);
            dropdown.classList.remove('open');
        }
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    import('./state.js').then(({ state }) => {
        syncExamGoalUI(state.currentExamGoal || 'all');
    });
}

/**
 * 首页：按当前考试目标渲染写作素材列表
 */
async function renderPromptBankPanel() {
    const list = $('#promptBankList');
    const countEl = $('#promptBankCount');
    if (!list) return;

    const { state } = await import('./state.js');
    const { getWritingPromptsByExamGoal } = await import('../data/promptBankData.js');
    const goal = state.currentExamGoal || 'all';
    const prompts = getWritingPromptsByExamGoal(goal);

    if (countEl) countEl.textContent = String(prompts.length);

    if (prompts.length === 0) {
        list.innerHTML = '<p class="prompt-bank-empty">当前目标下暂无素材，请切换为「全部考试目标」。</p>';
        return;
    }

    list.innerHTML = prompts.slice(0, 16).map(p => {
        const tags = (p.tags || []).map(t => `<span class="prompt-tag">${escapeHtml(t)}</span>`).join('');
        const goals = (p.examGoals || []).map(gid => {
            const ex = EXAM_GOALS.find(x => x.id === gid);
            return `<span class="prompt-goal-tag">${escapeHtml(ex ? ex.shortName : gid)}</span>`;
        }).join('');
        const bullets = (p.bulletPointsZh || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
        const note = escapeHtml(p.authenticity?.noteZh || '');
        const stub = p.readingStubEn
            ? `<pre class="prompt-stub">${escapeHtml(p.readingStubEn)}</pre>`
            : '';
        const bulletsHtml = bullets ? `<ul class="prompt-bullets">${bullets}</ul>` : '';

        return `
<details class="prompt-bank-card">
    <summary class="prompt-bank-summary">
        <span class="prompt-card-title">${escapeHtml(p.title)}</span>
        <span class="prompt-card-meta">${escapeHtml(p.wordCount?.hint || '')}</span>
    </summary>
    <div class="prompt-card-body">
        <p class="prompt-situation">${escapeHtml(p.situationZh || '')}</p>
        ${stub}
        ${bulletsHtml}
        <div class="prompt-goals" aria-label="适用考试">${goals}</div>
        <div class="prompt-tags">${tags}</div>
        <p class="prompt-authenticity"><strong>素材说明：</strong>${note}</p>
    </div>
</details>`;
    }).join('');
}

/**
 * 初始化模式卡片
 */
function initModeCards() {
    const cards = $$('.mode-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode || getModeFromCard(card);
            if (mode) {
                navigateTo(mode);
            }
        });
    });
}

/**
 * 从卡片获取模式
 * @param {Element} card
 * @returns {string|null}
 */
function getModeFromCard(card) {
    // 根据onclick属性推断模式
    const onclick = card.getAttribute('onclick') || '';
    const match = onclick.match(/startMode\('(\w+)'\)/);
    return match ? match[1] : null;
}

/**
 * 初始化统计栏
 */
function initStatsBar() {
    updateStatsDisplay();
}

/**
 * 更新统计显示
 */
function updateStatsDisplay() {
    import('./state.js').then(({ state }) => {
        const totalCreations = $('#totalCreations');
        const streakDays = $('#streakDays');
        const totalLikes = $('#totalLikes');
        
        if (totalCreations) {
            const total = Object.values(state.userProgress).reduce(
                (sum, mode) => sum + (mode.completed || 0), 0
            );
            totalCreations.textContent = total;
        }
        
        if (streakDays) {
            streakDays.textContent = state.streak.current;
        }
        
        if (totalLikes) {
            totalLikes.textContent = state.gallery.likes.length;
        }
    });
}

/**
 * 初始化返回按钮
 */
function initBackButton() {
    const backBtn = $('#backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            goBack();
        });
    }
}

// ========== 全局事件绑定 ==========

/**
 * 绑定全局事件
 */
function bindGlobalEvents() {
    // 窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 页面可见性变化（用于计算使用时长）
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboard);
    
    // 错误处理
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
    // 可以在这里处理响应式布局的调整
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // 页面隐藏时保存状态
        import('./state.js').then(({ state }) => {
            import('./storage.js').then(({ saveUserData }) => {
                saveUserData('lastActive', Date.now());
            });
        });
    } else {
        // 页面显示时更新连续打卡
        import('./state.js').then(({ updateStreak }) => {
            updateStreak();
        });
    }
}

/**
 * 处理键盘快捷键
 * @param {KeyboardEvent} e
 */
function handleKeyboard(e) {
    // ESC 返回首页
    if (e.key === 'Escape') {
        if (getCurrentRoute() !== 'home') {
            goBack();
        }
    }
    
    // Ctrl/Cmd + Enter 提交（在输入框内）
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('writing-area')) {
            // 触发提交
            const submitBtn = activeElement.closest('form, .practice-mode')?.querySelector('.btn-primary');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }
}

/**
 * 处理全局错误
 * @param {ErrorEvent} e
 */
function handleError(e) {
    console.error('Global error:', e.error);
    // 可以在这里上报错误
}

/**
 * 处理未捕获的Promise错误
 * @param {PromiseRejectionEvent} e
 */
function handleUnhandledRejection(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // 可以在这里上报错误
}

// ========== 页面加载 ==========

/**
 * 加载首页
 */
function loadHomePage() {
    const modeSelection = $('#modeSelection');
    if (modeSelection) {
        modeSelection.classList.remove('hidden');
    }
    
    // 隐藏返回按钮
    const backBtn = $('#backBtn');
    if (backBtn) {
        backBtn.classList.add('hidden');
    }
    
    // 更新统计
    updateStatsDisplay();

    renderPromptBankPanel();
}

// ========== 错误处理 ==========

/**
 * 显示初始化错误
 * @param {Error} error
 */
function showInitError(error) {
    const app = $('#app') || document.body;
    app.innerHTML = `
        <div class="init-error">
            <div class="init-error-content">
                <h2>应用加载失败</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()">重新加载</button>
            </div>
        </div>
    `;
}

// ========== 公共API ==========

/**
 * 获取应用信息
 * @returns {Object}
 */
export function getAppInfo() {
    return APP_INFO;
}

/**
 * 检查应用是否已初始化
 * @returns {boolean}
 */
export function isAppReady() {
    return appInitialized;
}

/**
 * 重新初始化应用
 */
export async function reinitApp() {
    appInitialized = false;
    await initApp();
}

// 供 router-simple 在返回首页时刷新
window.updateStatsDisplay = updateStatsDisplay;
window.renderPromptBankPanel = renderPromptBankPanel;

// ========== 启动应用 ==========

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ========== 导出默认对象 ==========
export default {
    initApp,
    getAppInfo,
    isAppReady,
    reinitApp,
    loadHomePage,
    updateStatsDisplay
};
