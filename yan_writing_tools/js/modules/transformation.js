/**
 * English Writing Studio - 句型变变变模块
 */

import { $, $$, show, hide } from '../utils.js';
import { state, incrementCompleted, addToGallery } from '../state.js';
import { transformationData, TRANSFORMATION_TYPES, getRandomExercise } from '../../data/transformationData.js';

let currentExercise = null;
let userTransformation = '';

export function render() {
    return `
        <div id="transformationMode" class="practice-mode">
            <!-- 转换类型选择（可选） -->
            <div class="type-selector-bar">
                <div class="type-label">转换类型（可选）：</div>
                <div class="type-chips">
                    ${renderTypeChips()}
                </div>
            </div>

            <!-- 原句 -->
            <div class="transform-box">
                <div class="box-label">📄 原句 <span class="box-hint">👇 点击下方按钮开始</span></div>
                <div class="box-content" id="originalText">
                    <span class="loading-text">⏳ 加载中...</span>
                </div>
            </div>

            <!-- 输入区 -->
            <div class="transform-box">
                <div class="box-label">✏️ 变形后</div>
                <textarea class="transform-input" id="transformInput" placeholder="在这里写转换后的句子..."></textarea>
            </div>

            <!-- 参考 -->
            <div class="reference-area hidden" id="referenceArea"></div>

            <!-- 按钮 -->
            <div class="btn-group">
                <button class="btn btn-primary" id="submitBtn" disabled>✓ 提交</button>
                <button class="btn btn-secondary hidden" id="showRefBtn">📖 参考</button>
                <button class="btn btn-success" id="nextBtn">🎲 换一题</button>
            </div>

            <!-- 反馈 -->
            <div id="feedbackArea"></div>
        </div>
    `;
}

function renderTypeChips() {
    return Object.entries(TRANSFORMATION_TYPES).map(([key, type]) => `
        <button class="type-chip" data-type="${key}">
            ${type.icon} ${type.name}
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

    $('#getExerciseBtn')?.addEventListener('click', () => {
        loadExercise();
        clearFeedback();
        const submitBtn = $('#submitBtn');
        if (submitBtn) submitBtn.disabled = false;
    });

    $('#submitBtn')?.addEventListener('click', checkTransformation);
    $('#showRefBtn')?.addEventListener('click', showReference);
    $('#nextBtn')?.addEventListener('click', () => {
        loadExercise();
        clearFeedback();
    });
}

function loadExercise() {
    const examGoal = state.currentExamGoal || 'all';
    const selectedType = $('.type-chip.selected')?.dataset.type;

    const exercise = getRandomExercise(null, selectedType || null, examGoal);
    if (!exercise) {
        showMessage('当前考试目标下暂无题目，试试选「全部考试目标」');
        return;
    }
    
    currentExercise = exercise;
    
    const original = exercise.active || exercise.direct || exercise.normal || exercise.original;
    $('#originalText').innerHTML = `<strong>${original}</strong>`;
    
    const input = $('#transformInput');
    if (input) {
        input.value = '';
        const targetType = TRANSFORMATION_TYPES[exercise.type]?.name || '转换';
        input.placeholder = `转换成${targetType}...`;
    }
    
    hide($('#referenceArea'));
    hide($('#showRefBtn'));
}

function checkTransformation() {
    const input = $('#transformInput');
    const text = input?.value?.trim();
    
    if (!text) {
        showMessage('请输入转换后的句子');
        return;
    }
    
    if (!currentExercise) return;
    
    userTransformation = text;
    
    // 简单评分
    const target = currentExercise.passive || currentExercise.indirect || currentExercise.cleft;
    const similarity = calculateSimilarity(text.toLowerCase(), target.toLowerCase());
    const score = Math.round(similarity * 100);
    
    displayFeedback(score);
    
    incrementCompleted('transformation');
    
    show($('#showRefBtn'));
    
    if (score >= 80) {
        addToGallery({
            text: userTransformation,
            originalText: currentExercise.active || currentExercise.direct || currentExercise.normal || currentExercise.original,
            mode: 'transformation',
            tags: ['变形']
        });
    }
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(/\s+/).filter(w => w.length > 2);
    const words2 = str2.split(/\s+/).filter(w => w.length > 2);
    const common = words1.filter(w => words2.includes(w));
    return common.length / Math.max(words1.length, words2.length, 1);
}

function displayFeedback(score) {
    const container = $('#feedbackArea');
    if (!container) return;
    
    const message = score >= 80 ? '完美！' : score >= 60 ? '很好！' : '完成！';
    
    container.innerHTML = `
        <div class="sandwich-feedback">
            <div class="feedback-score">
                <div class="feedback-score-value score-${score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'poor'}">${score}</div>
                <div class="feedback-score-label">得分</div>
            </div>
            <div class="feedback-praise">${message}</div>
        </div>
    `;
}

function showReference() {
    if (!currentExercise) return;
    
    const area = $('#referenceArea');
    if (!area) return;
    
    show(area);
    
    const from = currentExercise.active || currentExercise.direct || currentExercise.normal || currentExercise.original;
    const to = currentExercise.passive || currentExercise.indirect || currentExercise.cleft;
    
    area.innerHTML = `
        <div class="ref-title">参考答案</div>
        <div class="ref-from">${from}</div>
        <div class="ref-arrow">↓</div>
        <div class="ref-to">${to}</div>
    `;
}

function clearFeedback() {
    const feedback = $('#feedbackArea');
    if (feedback) feedback.innerHTML = '';
    hide($('#referenceArea'));
    hide($('#showRefBtn'));
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
    userTransformation = '';
}

export default { render, init, cleanup };
