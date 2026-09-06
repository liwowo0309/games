/**
 * English Writing Studio - Router
 * 页面路由系统
 */

import { $, show, hide } from './utils.js';
import { setMode, setTemp } from './state.js';

// ========== 路由表 ==========
const routes = {
    'home': {
        name: '首页',
        icon: '🏠',
        render: renderHome,
        init: null
    },
    'expansion': {
        name: '句子变形记',
        icon: '✨',
        module: './modules/expansion.js',
        init: initModule
    },
    'translation': {
        name: '翻译侦探社',
        icon: '🕵️',
        module: './modules/translation.js',
        init: initModule
    },
    'grammar': {
        name: '找茬大作战',
        icon: '🎯',
        module: './modules/grammar.js',
        init: initModule
    },
    'vocabulary': {
        name: '词汇换装间',
        icon: '👗',
        module: './modules/vocabulary.js',
        init: initModule
    },
    'transformation': {
        name: '句型变变变',
        icon: '🎭',
        module: './modules/transformation.js',
        init: initModule
    },
    'transition': {
        name: '连接词魔法',
        icon: '🪄',
        module: './modules/transition.js',
        init: initModule
    },
    'gallery': {
        name: '句子画廊',
        icon: '🖼️',
        component: './components/gallery.js',
        init: initComponent
    },
    'weekly-report': {
        name: '创作周刊',
        icon: '📊',
        component: './components/weeklyReport.js',
        init: initComponent
    },
    'achievements': {
        name: '成就中心',
        icon: '🏆',
        component: './components/achievements.js',
        init: initComponent
    }
};

// ========== 当前路由状态 ==========
let currentRoute = 'home';
let currentModule = null;

// ========== 路由方法 ==========

/**
 * 初始化路由系统
 */
export function initRouter() {
    // 监听浏览器后退/前进
    window.addEventListener('popstate', handlePopState);
    
    // 监听页面加载完成
    window.addEventListener('DOMContentLoaded', () => {
        const initialRoute = getRouteFromHash();
        navigateTo(initialRoute, false);
    });
    
    console.log('Router initialized');
}

/**
 * 导航到指定路由
 * @param {string} routeName - 路由名称
 * @param {boolean} pushState - 是否添加历史记录
 * @param {Object} params - 路由参数
 */
export async function navigateTo(routeName, pushState = true, params = {}) {
    const route = routes[routeName];
    
    if (!route) {
        console.error(`Route not found: ${routeName}`);
        navigateTo('home');
        return;
    }
    
    // 保存当前路由参数
    setTemp('routeParams', params);
    
    // 更新状态
    if (routeName !== 'home' && routeName !== 'gallery' && routeName !== 'weekly-report') {
        setMode(routeName);
    }
    
    // 隐藏当前页面
    hideCurrentPage();
    
    // 显示加载状态
    showLoading();
    
    try {
        // 渲染新页面
        if (route.render) {
            // 直接渲染
            await route.render();
        } else if (route.module) {
            // 加载模块
            await route.init(route.module, routeName);
        } else if (route.component) {
            // 加载组件
            await route.init(route.component, routeName);
        }
        
        // 更新当前路由
        currentRoute = routeName;
        
        // 更新浏览器历史
        if (pushState) {
            window.history.pushState({ route: routeName, params }, '', `#${routeName}`);
        }
        
        // 更新页面标题
        updatePageTitle(route);
        
        // 更新导航状态
        updateNavigation(routeName);
        
        // 隐藏加载状态
        hideLoading();
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error(`Navigation to ${routeName} failed:`, error);
        hideLoading();
        showError('页面加载失败，请重试');
    }
}

/**
 * 返回上一页
 */
export function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        navigateTo('home');
    }
}

/**
 * 获取当前路由
 * @returns {string}
 */
export function getCurrentRoute() {
    return currentRoute;
}

/**
 * 检查是否在某个路由
 * @param {string} routeName
 * @returns {boolean}
 */
export function isRoute(routeName) {
    return currentRoute === routeName;
}

// ========== 私有方法 ==========

/**
 * 从hash获取路由
 * @returns {string}
 */
function getRouteFromHash() {
    const hash = window.location.hash.slice(1);
    return routes[hash] ? hash : 'home';
}

/**
 * 处理浏览器后退/前进
 * @param {PopStateEvent} event
 */
function handlePopState(event) {
    if (event.state && event.state.route) {
        navigateTo(event.state.route, false, event.state.params);
    } else {
        const route = getRouteFromHash();
        if (route !== currentRoute) {
            navigateTo(route, false);
        }
    }
}

/**
 * 隐藏当前页面
 */
function hideCurrentPage() {
    // 隐藏所有主要区域
    const sections = [
        '#modeSelection',
        '#expansionMode',
        '#translationMode',
        '#grammarMode',
        '#vocabularyMode',
        '#transformationMode',
        '#transitionMode'
    ];
    
    sections.forEach(selector => {
        const el = $(selector);
        if (el) {
            el.classList.add('hidden');
        }
    });
    
    // 清理当前模块
    if (currentModule && currentModule.cleanup) {
        currentModule.cleanup();
    }
    currentModule = null;
}

/**
 * 初始化模块
 * @param {string} modulePath - 模块路径
 * @param {string} routeName - 路由名称
 */
async function initModule(modulePath, routeName) {
    try {
        const module = await import(modulePath);
        currentModule = module;
        
        // 渲染模块
        if (module.render) {
            const container = $('#app') || document.body;
            const content = await module.render();
            
            // 检查是否已存在该模块容器
            let moduleContainer = $(`#${routeName}Mode`);
            if (!moduleContainer) {
                moduleContainer = document.createElement('div');
                moduleContainer.id = `${routeName}Mode`;
                container.appendChild(moduleContainer);
            }
            
            moduleContainer.innerHTML = content;
            moduleContainer.classList.remove('hidden');
        }
        
        // 初始化模块
        if (module.init) {
            await module.init();
        }
        
    } catch (error) {
        console.error(`Failed to load module ${modulePath}:`, error);
        throw error;
    }
}

/**
 * 初始化组件
 * @param {string} componentPath - 组件路径
 * @param {string} routeName - 路由名称
 */
async function initComponent(componentPath, routeName) {
    try {
        const component = await import(componentPath);
        
        if (component.render) {
            const container = $('#app') || document.body;
            const content = await component.render();
            
            // 创建组件容器
            let componentContainer = $(`#${routeName}Component`);
            if (!componentContainer) {
                componentContainer = document.createElement('div');
                componentContainer.id = `${routeName}Component`;
                componentContainer.className = 'component-container';
                container.appendChild(componentContainer);
            }
            
            componentContainer.innerHTML = content;
            componentContainer.classList.remove('hidden');
            
            // 显示返回按钮
            const backBtn = $('#backBtn');
            if (backBtn) {
                backBtn.classList.remove('hidden');
            }
        }
        
        // 初始化组件
        if (component.init) {
            await component.init();
        }
        
    } catch (error) {
        console.error(`Failed to load component ${componentPath}:`, error);
        throw error;
    }
}

/**
 * 渲染首页
 */
async function renderHome() {
    const modeSelection = $('#modeSelection');
    if (modeSelection) {
        modeSelection.classList.remove('hidden');
    }
    
    // 隐藏返回按钮
    const backBtn = $('#backBtn');
    if (backBtn) {
        backBtn.classList.add('hidden');
    }
    
    // 更新统计数据
    updateHomeStats();
}

/**
 * 更新首页统计
 */
function updateHomeStats() {
    // 这里可以调用状态管理获取最新统计
    // 并更新首页的统计显示
}

/**
 * 更新页面标题
 * @param {Object} route
 */
function updatePageTitle(route) {
    const baseTitle = 'English Writing Studio';
    document.title = route.name === '首页' 
        ? baseTitle 
        : `${route.icon} ${route.name} - ${baseTitle}`;
}

/**
 * 更新导航状态
 * @param {string} routeName
 */
function updateNavigation(routeName) {
    // 更新导航栏激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.route === routeName);
    });
}

/**
 * 显示加载状态
 */
function showLoading() {
    let loader = $('#pageLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'pageLoader';
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <p>加载中...</p>
        `;
        document.body.appendChild(loader);
    }
    loader.classList.remove('hidden');
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    const loader = $('#pageLoader');
    if (loader) {
        loader.classList.add('hidden');
    }
}

/**
 * 显示错误信息
 * @param {string} message
 */
function showError(message) {
    // 创建错误提示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'route-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">关闭</button>
        </div>
    `;
    document.body.appendChild(errorDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// ========== 辅助导航方法 ==========

/**
 * 导航到句子画廊
 * @param {string} tab - 默认标签
 */
export function goToGallery(tab = 'hot') {
    navigateTo('gallery', true, { tab });
}

/**
 * 导航到创作周刊
 */
export function goToWeeklyReport() {
    navigateTo('weekly-report');
}

/**
 * 导航到成就中心
 */
export function goToAchievements() {
    navigateTo('achievements');
}

// ========== 导出默认对象 ==========
export default {
    routes,
    initRouter,
    navigateTo,
    goBack,
    getCurrentRoute,
    isRoute,
    goToGallery,
    goToWeeklyReport,
    goToAchievements
};
