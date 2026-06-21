/**
 * English Writing Studio - Gallery Component
 * 句子画廊组件
 */

import { $, $$, show, hide } from '../utils.js';
import { state, favoriteSentence, unfavoriteSentence, likeSentence } from '../state.js';
import { galleryData } from '../../data/galleryData.js';
import { GALLERY_CONFIG } from '../config.js';

// ========== 当前标签页 ==========
let currentTab = 'hot';
let currentTopic = null;

// ========== 渲染画廊 ==========
export function render() {
    return `
        <div id="galleryComponent" class="gallery-container">
            <div class="gallery-header">
                <h2>🖼️ 句子画廊</h2>
                <p>欣赏大家的创意作品，点赞收藏你喜欢的句子</p>
            </div>

            <!-- 标签页 -->
            <div class="gallery-tabs">
                ${GALLERY_CONFIG.tabs.map(tab => `
                    <button class="gallery-tab ${tab.id === currentTab ? 'active' : ''}" data-tab="${tab.id}">
                        ${tab.icon} ${tab.name}
                        ${tab.id === 'my' ? `<span class="gallery-tab-badge">${state.gallery.favorites.length}</span>` : ''}
                    </button>
                `).join('')}
            </div>

            <!-- 话题筛选 -->
            <div class="topic-filter">
                <button class="topic-chip all-chip ${!currentTopic ? 'selected' : ''}" data-topic="">全部</button>
                ${GALLERY_CONFIG.topics.map(topic => `
                    <button class="topic-chip ${currentTopic === topic.id ? 'selected' : ''}" data-topic="${topic.id}">
                        ${topic.icon} ${topic.name}
                    </button>
                `).join('')}
            </div>

            <!-- 画廊网格 -->
            <div class="gallery-grid" id="galleryGrid">
                <!-- 动态加载 -->
            </div>

            <!-- 加载更多 -->
            <div class="load-more">
                <button class="btn btn-secondary" id="loadMoreBtn">加载更多</button>
            </div>
        </div>
    `;
}

// ========== 初始化画廊 ==========
export function init() {
    bindEvents();
    loadGalleryData();
    console.log('Gallery initialized');
}

// ========== 绑定事件 ==========
function bindEvents() {
    // 标签切换
    $$('.gallery-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentTab = tab.dataset.tab;
            updateTabUI();
            loadGalleryData();
        });
    });

    // 话题筛选
    $$('.topic-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            currentTopic = chip.dataset.topic || null;
            updateTopicUI();
            loadGalleryData();
        });
    });

    // 加载更多
    $('#loadMoreBtn')?.addEventListener('click', loadMore);
}

// ========== 更新标签UI ==========
function updateTabUI() {
    $$('.gallery-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === currentTab);
    });
}

// ========== 更新话题UI ==========
function updateTopicUI() {
    $$('.topic-chip').forEach(chip => {
        chip.classList.toggle('selected', 
            (chip.dataset.topic === '' && !currentTopic) || chip.dataset.topic === currentTopic
        );
    });
}

// ========== 加载画廊数据 ==========
function loadGalleryData() {
    const grid = $('#galleryGrid');
    if (!grid) return;

    let data = [];

    // 根据标签获取数据
    switch (currentTab) {
        case 'hot':
            data = [...galleryData.hot];
            break;
        case 'editor':
            data = [...galleryData.editor];
            break;
        case 'my':
            // 我的收藏
            data = state.gallery.favorites.map(id => findSentenceById(id)).filter(Boolean);
            break;
        case 'creations':
            // 我的作品
            data = [...state.gallery.myCreations];
            break;
    }

    // 话题筛选
    if (currentTopic) {
        data = data.filter(item => item.tags?.includes(currentTopic));
    }

    // 渲染
    if (data.length === 0) {
        grid.innerHTML = `
            <div class="empty-gallery">
                <div class="empty-icon">📝</div>
                <p>这里还没有句子，快来创作第一个吧！</p>
            </div>
        `;
    } else {
        grid.innerHTML = data.map((item, index) => renderSentenceCard(item, index)).join('');
        bindCardEvents();
    }
}

// ========== 渲染句子卡片 ==========
function renderSentenceCard(sentence, index) {
    const isLiked = state.gallery.likes.includes(sentence.id);
    const isFavorited = state.gallery.favorites.includes(sentence.id);
    const isMine = sentence.author === '我' || state.gallery.myCreations.some(c => c.id === sentence.id);

    return `
        <div class="sentence-card ${sentence.isEditorPick ? 'editor-pick' : ''}" data-id="${sentence.id}">
            ${sentence.isEditorPick ? '<div class="editor-pick-badge">✨ 编辑精选</div>' : ''}
            ${index < 3 ? `<div class="hot-rank ${index < 3 ? 'top3' : ''}">${index + 1}</div>` : ''}
            
            <div class="sentence-card-header">
                <div class="sentence-card-author">
                    <div class="sentence-card-avatar">${sentence.avatar || '👤'}</div>
                    <div class="sentence-card-author-info">
                        <div class="sentence-card-author-name">${sentence.author || '匿名'}</div>
                        <div class="sentence-card-date">${formatDate(sentence.createdAt)}</div>
                    </div>
                </div>
                ${isMine ? '<span class="sentence-card-badge">我的作品</span>' : ''}
            </div>

            <div class="sentence-card-content">"${sentence.text}"</div>

            ${sentence.evolution ? `
                <div class="sentence-card-evolution">
                    <div class="sentence-card-evolution-label">进化过程</div>
                    <div class="sentence-card-evolution-content">${sentence.evolution}</div>
                </div>
            ` : ''}

            <div class="sentence-card-footer">
                <div class="sentence-card-tags">
                    ${(sentence.tags || []).map(tag => `
                        <span class="sentence-card-tag">${tag}</span>
                    `).join('')}
                </div>
                <div class="sentence-card-actions">
                    <span class="sentence-card-action ${isLiked ? 'liked' : ''}" data-action="like">
                        ${isLiked ? '❤️' : '🤍'} ${sentence.likes || 0}
                    </span>
                    <span class="sentence-card-action ${isFavorited ? 'saved' : ''}" data-action="favorite">
                        ${isFavorited ? '⭐' : '☆'}
                    </span>
                    <span class="sentence-card-action" data-action="share">📤</span>
                </div>
            </div>
        </div>
    `;
}

// ========== 绑定卡片事件 ==========
function bindCardEvents() {
    // 点赞
    $$('.sentence-card-action[data-action="like"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.sentence-card');
            const id = card?.dataset.id;
            if (id) {
                if (btn.classList.contains('liked')) {
                    // 取消点赞（暂不实现）
                } else {
                    likeSentence(id);
                    btn.classList.add('liked');
                    btn.innerHTML = `❤️ ${parseInt(btn.textContent) + 1}`;
                }
            }
        });
    });

    // 收藏
    $$('.sentence-card-action[data-action="favorite"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.sentence-card');
            const id = card?.dataset.id;
            if (id) {
                if (btn.classList.contains('saved')) {
                    unfavoriteSentence(id);
                    btn.classList.remove('saved');
                    btn.innerHTML = '☆';
                } else {
                    favoriteSentence(id);
                    btn.classList.add('saved');
                    btn.innerHTML = '⭐';
                }
                // 如果在"我的收藏"标签下，刷新列表
                if (currentTab === 'my') {
                    loadGalleryData();
                }
            }
        });
    });

    // 分享
    $$('.sentence-card-action[data-action="share"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.sentence-card');
            const text = card?.querySelector('.sentence-card-content')?.textContent;
            if (text) {
                shareSentence(text);
            }
        });
    });
}

// ========== 查找句子 ==========
function findSentenceById(id) {
    const allSentences = [
        ...galleryData.hot,
        ...galleryData.editor,
        ...Object.values(galleryData.topics).flat()
    ];
    return allSentences.find(s => s.id === id);
}

// ========== 分享句子 ==========
function shareSentence(text) {
    if (navigator.share) {
        navigator.share({
            title: 'English Writing Studio - 精彩句子',
            text: text
        });
    } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(text).then(() => {
            alert('句子已复制到剪贴板！');
        });
    }
}

// ========== 加载更多 ==========
function loadMore() {
    // 模拟加载更多数据
    showMessage('已加载更多句子');
}

// ========== 格式化日期 ==========
function formatDate(timestamp) {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
    });
}

// ========== 清理函数 ==========
export function cleanup() {
    currentTab = 'hot';
    currentTopic = null;
}

export default { render, init, cleanup };
