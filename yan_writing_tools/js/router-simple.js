/**
 * English Writing Studio - Simple Router
 * 简化的路由系统（适用于本地文件系统）
 */

import { $, show, hide } from './utils.js';
import { setMode } from './state.js';

// 导入所有模块
import * as expansionModule from './modules/expansion.js';
import * as translationModule from './modules/translation.js';
import * as grammarModule from './modules/grammar.js';
import * as vocabularyModule from './modules/vocabulary.js';
import * as transformationModule from './modules/transformation.js';
import * as transitionModule from './modules/transition.js';
import * as galleryComponent from './components/gallery.js';
import * as weeklyReportComponent from './components/weeklyReport.js';
import * as achievementsComponent from './components/achievements.js';

// ========== 模块映射 ==========
const modules = {
    'expansion': expansionModule,
    'translation': translationModule,
    'grammar': grammarModule,
    'vocabulary': vocabularyModule,
    'transformation': transformationModule,
    'transition': transitionModule,
    'gallery': galleryComponent,
    'weekly-report': weeklyReportComponent,
    'achievements': achievementsComponent
};

// ========== 当前状态 ==========
let currentRoute = 'home';
let currentModule = null;

// ========== 初始化路由 ==========
export function initRouter() {
    // 监听hash变化
    window.addEventListener('hashchange', handleHashChange);
    
    // 初始化时检查hash
    handleHashChange();

    // 返回按钮由 app.js 统一绑定，避免与 router-simple 的 goBack 重复监听
    
    console.log('Router initialized');
}

// ========== 处理hash变化 ==========
function handleHashChange() {
    const hash = window.location.hash.slice(1) || 'home';
    navigateTo(hash);
}

/**
 * 将地址栏 hash 与当前路由对齐，便于「返回主页」与刷新后直达子页
 * @param {string} routeName
 */
function syncHashForRoute(routeName) {
    if (routeName === 'home') {
        if (window.location.hash) {
            window.location.hash = '';
        }
        return;
    }
    const next = `#${routeName}`;
    if (window.location.hash !== next) {
        window.location.hash = routeName;
    }
}

// ========== 导航到指定路由 ==========
/**
 * @param {string} routeName
 * @param {{ force?: boolean }} [options] - force: 为 true 时即使与 currentRoute 相同也执行（一般不用）
 */
export function navigateTo(routeName, options = {}) {
    if (!routeName) return;
    if (!options.force && routeName === currentRoute) return;
    
    console.log('Navigating to:', routeName);
    
    // 隐藏当前页面
    hideCurrentPage();
    
    if (routeName === 'home') {
        // 返回首页
        showHome();
    } else if (modules[routeName]) {
        // 加载模块
        loadModule(routeName);
    } else {
        console.error('Unknown route:', routeName);
        navigateTo('home', { force: true });
        return;
    }
    
    currentRoute = routeName;
    
    // 显示返回按钮
    const backBtn = $('#backBtn');
    if (backBtn) {
        backBtn.classList.toggle('hidden', routeName === 'home');
    }
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    syncHashForRoute(routeName);
}

// ========== 显示首页 ==========
function showHome() {
    const modeSelection = $('#modeSelection');
    if (modeSelection) {
        modeSelection.classList.remove('hidden');
    }
    
    // 更新统计
    updateHomeStats();

    if (typeof window.renderPromptBankPanel === 'function') {
        window.renderPromptBankPanel();
    }
}

// ========== 加载模块 ==========
function loadModule(moduleName) {
    const module = modules[moduleName];
    if (!module) return;
    
    // 设置当前模式
    setMode(moduleName);
    
    // 获取容器
    const container = $('#moduleContainer');
    if (!container) return;
    
    // 渲染模块内容
    if (module.render) {
        container.innerHTML = module.render();
        container.classList.remove('hidden');
    }
    
    // 初始化模块
    if (module.init) {
        try {
            module.init();
        } catch (error) {
            console.error('Module init failed:', error);
        }
    }
    
    currentModule = module;
}

// ========== 隐藏当前页面 ==========
function hideCurrentPage() {
    // 隐藏首页
    const modeSelection = $('#modeSelection');
    if (modeSelection) {
        modeSelection.classList.add('hidden');
    }
    
    // 隐藏模块容器
    const moduleContainer = $('#moduleContainer');
    if (moduleContainer) {
        moduleContainer.innerHTML = '';
        moduleContainer.classList.add('hidden');
    }
    
    // 清理当前模块
    if (currentModule && currentModule.cleanup) {
        try {
            currentModule.cleanup();
        } catch (error) {
            console.error('Module cleanup failed:', error);
        }
    }
    currentModule = null;
}

// ========== 返回主页 ==========
/**
 * 优先通过清空 hash 触发 hashchange 回到首页；若无 hash 则强制 navigateTo('home')
 */
export function goBack() {
    if (window.location.hash && window.location.hash !== '#') {
        window.location.hash = '';
        return;
    }
    navigateTo('home', { force: true });
}

// ========== 获取当前路由 ==========
export function getCurrentRoute() {
    return currentRoute;
}

// ========== 更新首页统计 ==========
function updateHomeStats() {
    // 触发app.js中的更新
    if (window.updateStatsDisplay) {
        window.updateStatsDisplay();
    }
}

export default { initRouter, navigateTo, goBack, getCurrentRoute };
