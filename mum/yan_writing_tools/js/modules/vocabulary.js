/**
 * English Writing Studio - 词汇换装间模块
 */

import { $, $$, show, hide } from '../utils.js';
import { state, incrementCompleted, addToGallery } from '../state.js';
import { vocabularyData, VOCAB_STYLES, getRandomExercise } from '../../data/vocabularyData.js';

let currentExercise = null;
let selectedStyle = 'formal';
let upgradedSentence = '';

export function render() {
    return `
        <div id="vocabularyMode" class="practice-mode">
            <!-- 风格选择 -->
            <div class="style-selector-bar">
                <div class="style-label">换装风格：</div>
                <div class="style-chips">
                    ${renderStyleChips()}
                </div>
            </div>

            <!-- 原句 -->
            <div class="vocab-sentence-box">
                <div class="sentence-label">原句 <span class="sentence-hint">👇 点击高亮词汇换装</span></div>
                <div class="sentence-text" id="originalSentence">
                    <span class="loading-text">⏳ 加载中...</span>
                </div>
            </div>

            <!-- 衣橱 -->
            <div class="wardrobe-box hidden" id="wardrobeBox">
                <div class="wardrobe-title">👗 选择高级词汇 <span class="wardrobe-hint">点击换装</span></div>
                <div class="wardrobe-items" id="wardrobeItems"></div>
            </div>

            <!-- 结果 -->
            <div class="result-box hidden" id="resultBox">
                <div class="result-label">✨ 换装后</div>
                <div class="result-text" id="resultText"></div>
            </div>

            <!-- 按钮 -->
            <div class="btn-group">
                <button class="btn btn-primary hidden" id="applyStyleBtn">✓ 应用</button>
                <button class="btn btn-secondary hidden" id="resetBtn">↺ 重置</button>
                <button class="btn btn-success hidden" id="saveBtn">💾 保存</button>
                <button class="btn btn-success" id="randomSentenceBtn">🎲 换一题</button>
            </div>
        </div>
    `;
}

function renderStyleChips() {
    return Object.entries(VOCAB_STYLES).map(([key, style]) => `
        <button class="style-chip ${key === selectedStyle ? 'selected' : ''}" data-style="${key}">
            ${style.icon} ${style.name}
        </button>
    `).join('');
}

export function init() {
    bindEvents();
    loadExercise();
}

function bindEvents() {
    $$('.style-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            selectedStyle = chip.dataset.style;
            updateStyleUI();
        });
    });

    $('#randomSentenceBtn')?.addEventListener('click', () => {
        loadExercise();
        resetResult();
    });

    $('#applyStyleBtn')?.addEventListener('click', applyStyle);
    $('#resetBtn')?.addEventListener('click', resetStyle);
    $('#saveBtn')?.addEventListener('click', saveResult);
}

function updateStyleUI() {
    $$('.style-chip').forEach(chip => {
        chip.classList.toggle('selected', chip.dataset.style === selectedStyle);
    });
}

function loadExercise() {
    const examGoal = state.currentExamGoal || 'all';
    const exercise = getRandomExercise(null, examGoal);
    
    if (!exercise) {
        showMessage('当前考试目标下暂无题目，试试选「全部目标」');
        return;
    }
    
    currentExercise = exercise;
    
    const sentenceEl = $('#originalSentence');
    if (sentenceEl) {
        const word = exercise.word;
        const context = exercise.context;
        const highlighted = context.replace(word, `<span class="highlight-word" data-word="${word}">${word}</span>`);
        sentenceEl.innerHTML = highlighted;
    }
    
    // 绑定点击
    $$('.highlight-word').forEach(word => {
        word.addEventListener('click', () => {
            showWardrobe(word.dataset.word);
        });
    });
    
    hide($('#wardrobeBox'));
}

function showWardrobe(word) {
    if (!currentExercise) return;
    
    const wardrobe = $('#wardrobeBox');
    const items = $('#wardrobeItems');
    
    if (!wardrobe || !items) return;
    
    show(wardrobe);
    
    const options = currentExercise.options.filter(opt => 
        opt.style.includes(selectedStyle)
    );
    
    items.innerHTML = options.map(opt => `
        <div class="wardrobe-item" data-word="${opt.word}">
            <div class="item-word">${opt.word}</div>
            <div class="item-meaning">${opt.meaning}</div>
        </div>
    `).join('');
    
    $$('.wardrobe-item').forEach(item => {
        item.addEventListener('click', () => {
            upgradedSentence = currentExercise.context.replace(word, item.dataset.word);
            $$('.wardrobe-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            showResult();
        });
    });
}

function showResult() {
    const resultBox = $('#resultBox');
    const resultText = $('#resultText');
    
    if (!resultBox || !resultText) return;
    
    show(resultBox);
    resultText.textContent = upgradedSentence;
    
    show($('#applyStyleBtn'));
    show($('#resetBtn'));
    show($('#saveBtn'));
    hide($('#randomSentenceBtn'));
}

function applyStyle() {
    if (!upgradedSentence) return;
    
    incrementCompleted('vocabulary');
    showMessage('✨ 换装成功！');
}

function resetStyle() {
    upgradedSentence = '';
    hide($('#resultBox'));
    hide($('#wardrobeBox'));
    hide($('#applyStyleBtn'));
    hide($('#resetBtn'));
    hide($('#saveBtn'));
    show($('#randomSentenceBtn'));
    
    if (currentExercise) {
        loadExercise();
    }
}

function saveResult() {
    if (!upgradedSentence || !currentExercise) return;
    
    addToGallery({
        text: upgradedSentence,
        originalText: currentExercise.context,
        mode: 'vocabulary',
        tags: ['词汇', VOCAB_STYLES[selectedStyle]?.name]
    });
    
    showMessage('已保存！');
}

function resetResult() {
    upgradedSentence = '';
    hide($('#wardrobeBox'));
    hide($('#resultBox'));
    hide($('#applyStyleBtn'));
    hide($('#resetBtn'));
    hide($('#saveBtn'));
    show($('#randomSentenceBtn'));
}

function showMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'toast-message';
    msgDiv.innerHTML = text;
    document.body.appendChild(msgDiv);
    setTimeout(() => {
        msgDiv.style.opacity = '0';
        setTimeout(() => msgDiv.remove(), 500);
    }, 3000);
}

export function cleanup() {
    currentExercise = null;
    upgradedSentence = '';
}

export default { render, init, cleanup };
