/**
 * English Writing Studio - 连接词魔法模块
 */

import { $, $$, show, hide } from '../utils.js';
import { state, incrementCompleted, addToGallery } from '../state.js';
import { TRANSITION_TYPES, getRandomExercise } from '../../data/transitionData.js';

let currentExercise = null;
let selectedTransitions = [];

export function render() {
    return `
        <div id="transitionMode" class="practice-mode">
            <!-- 连接词类型 -->
            <div class="transition-type-bar">
                <div class="type-label">连接类型（可选）：</div>
                <div class="type-chips">
                    ${renderTypeChips()}
                </div>
            </div>

            <!-- 原句 -->
            <div class="sentences-box">
                <div class="sentences-label">📝 两个句子 <span class="sentences-hint">👇 点击下方按钮开始</span></div>
                <div class="sentence-list" id="sentenceList">
                    <span class="loading-text">⏳ 加载中...</span>
                </div>
            </div>

            <!-- 连接词池 -->
            <div class="word-pool hidden" id="wordPool">
                <div class="pool-label">🔗 选择连接词</div>
                <div class="pool-words" id="poolWords"></div>
            </div>

            <!-- 结果 -->
            <div class="result-box hidden" id="resultBox">
                <div class="result-label">✨ 连接后</div>
                <div class="result-text" id="resultText"></div>
            </div>

            <!-- 按钮 -->
            <div class="btn-group">
                <button class="btn btn-primary hidden" id="connectBtn">🔗 连接</button>
                <button class="btn btn-secondary hidden" id="resetBtn">↺ 重置</button>
                <button class="btn btn-success hidden" id="saveBtn">💾 保存</button>
                <button class="btn btn-success" id="getSentencesBtn">🎲 换一题</button>
            </div>

            <!-- 反馈 -->
            <div id="feedbackArea"></div>
        </div>
    `;
}

function renderTypeChips() {
    return Object.entries(TRANSITION_TYPES).map(([key, type]) => `
        <button class="type-chip" data-type="${key}">
            ${type.name}
        </button>
    `).join('') + '<button class="type-chip selected" data-type="">🎲 随机</button>';
}

export function init() {
    bindEvents();
    loadExercise();
}

function bindEvents() {
    $$('.type-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            $$('.type-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
        });
    });

    $('#getSentencesBtn')?.addEventListener('click', () => {
        loadExercise();
        clearFeedback();
    });

    $('#connectBtn')?.addEventListener('click', connectSentences);
    $('#resetBtn')?.addEventListener('click', resetSelection);
    $('#saveBtn')?.addEventListener('click', saveResult);
}

/**
 * 将段落填空题库折成「两句 + 连接词池」供本页简易 UI 使用
 * @param {object|null} raw
 */
function coercePairExercise(raw) {
    if (!raw) return null;
    if (raw.sentence1 && raw.sentence2) return raw;
    const p0 = raw.paragraphs?.[0];
    if (!p0?.sentences || p0.sentences.length < 2) return null;
    const strip = s => String(s).replace(/\(\d+\)_______/g, '______');
    const transitions = p0.blanks?.[0]?.options || ['and', 'but', 'so', 'because', 'however'];
    const bt = p0.blanks?.[0]?.type || '';
    const type = bt.includes('contrast') ? 'contrast' : bt.includes('cause') ? 'cause' : 'add';
    return {
        ...raw,
        sentence1: strip(p0.sentences[0]),
        sentence2: strip(p0.sentences[1]),
        transitions,
        type
    };
}

function loadExercise() {
    const examGoal = state.currentExamGoal || 'all';
    const exercise = coercePairExercise(getRandomExercise(null, examGoal));
    if (!exercise) {
        showMessage('当前考试目标下暂无题目，试试选「全部考试目标」');
        return;
    }

    currentExercise = exercise;
    selectedTransitions = [];
    
    const list = $('#sentenceList');
    if (list) {
        list.innerHTML = `
            <div class="sentence-item">1. ${exercise.sentence1}</div>
            <div class="sentence-connector">${exercise.type === 'contrast' ? '↔️' : exercise.type === 'cause' ? '→' : '+'}</div>
            <div class="sentence-item">2. ${exercise.sentence2}</div>
        `;
    }
    
    // 显示连接词池
    showWordPool(exercise);
    
    hide($('#resultBox'));
    hide($('#connectBtn'));
    hide($('#resetBtn'));
    hide($('#saveBtn'));
    show($('#wordPool'));
}

function showWordPool(exercise) {
    const pool = $('#poolWords');
    if (!pool) return;
    
    const words = exercise.transitions || [];
    pool.innerHTML = words.map(word => `
        <button class="pool-word" data-word="${word}">${word}</button>
    `).join('');
    
    $$('.pool-word').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            updateSelection();
        });
    });
}

function updateSelection() {
    const selected = $$('.pool-word.selected');
    selectedTransitions = Array.from(selected).map(btn => btn.dataset.word);
    
    if (selectedTransitions.length > 0) {
        show($('#connectBtn'));
    }
}

function connectSentences() {
    if (!currentExercise || selectedTransitions.length === 0) return;
    
    const transition = selectedTransitions[0];
    const connected = `${currentExercise.sentence1} ${transition}, ${currentExercise.sentence2}`;
    
    const resultBox = $('#resultBox');
    const resultText = $('#resultText');
    
    if (!resultBox || !resultText) return;
    
    show(resultBox);
    resultText.textContent = connected;
    
    show($('#resetBtn'));
    show($('#saveBtn'));
    hide($('#wordPool'));
    hide($('#connectBtn'));
    
    // 显示反馈
    const container = $('#feedbackArea');
    if (container) {
        container.innerHTML = `
            <div class="sandwich-feedback">
                <div class="feedback-praise">👍 连接成功！</div>
            </div>
        `;
    }
    
    incrementCompleted('transition');
    
    addToGallery({
        text: connected,
        originalText: currentExercise.sentence1,
        mode: 'transition',
        tags: ['连接词']
    });
}

function resetSelection() {
    selectedTransitions = [];
    if (currentExercise) {
        showWordPool(currentExercise);
        hide($('#resultBox'));
        hide($('#resetBtn'));
        hide($('#saveBtn'));
        hide($('#connectBtn'));
        show($('#wordPool'));
    }
}

function saveResult() {
    showMessage('已保存！');
}

function clearFeedback() {
    const feedback = $('#feedbackArea');
    if (feedback) feedback.innerHTML = '';
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
    selectedTransitions = [];
}

export default { render, init, cleanup };
