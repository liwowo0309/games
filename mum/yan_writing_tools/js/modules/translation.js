/**
 * English Writing Studio - 翻译侦探社模块
 */

import { $, $$, show, hide } from '../utils.js';
import { state, setCurrentExercise, incrementCompleted, addToGallery } from '../state.js';
import { generateFeedback } from '../core/feedback.js';
import { translationData, getRandomExercise, getDetectiveLevel } from '../../data/translationData.js';

let currentExercise = null;
let userTranslation = '';
let currentMode = 'practice';

export function render() {
    return `
        <div id="translationMode" class="practice-mode">
            <!-- 模式切换 -->
            <div class="mode-tabs">
                <button class="mode-tab ${currentMode === 'practice' ? 'active' : ''}" data-mode="practice">📝 练习</button>
                <button class="mode-tab ${currentMode === 'custom' ? 'active' : ''}" data-mode="custom">✨ 自定义</button>
            </div>

            <!-- 练习模式 -->
            <div class="translation-practice ${currentMode !== 'practice' ? 'hidden' : ''}" id="translationPractice">
                <div class="detective-header">
                    <div class="detective-badge">🕵️ <span id="detectiveLevel">见习侦探</span></div>
                    <div class="case-number">案件 #<span id="caseNumber">---</span></div>
                </div>

                <div class="exercise-box">
                    <div class="exercise-label">🔍 中文 <span class="exercise-hint">👇 翻译成英文</span></div>
                    <p class="base-sentence" id="translationChinese">
                        <span class="loading-text">⏳ 加载中...</span>
                    </p>
                </div>

                <div class="clues-box hidden" id="cluesBox">
                    <div class="clues-title">💡 线索</div>
                    <div class="clues-list" id="cluesList"></div>
                </div>

                <div class="translation-box">
                    <div class="translation-label">📝 英文翻译</div>
                    <textarea class="translation-input" id="translationInput" placeholder="在这里输入英文翻译..."></textarea>
                </div>

                <div class="reference-box hidden" id="referenceBox"></div>

                <div class="btn-group">
                    <button class="btn btn-primary" id="checkTranslationBtn" disabled>✓ 提交</button>
                    <button class="btn btn-secondary" id="showCluesBtn">💡 线索</button>
                    <button class="btn btn-secondary hidden" id="showReferenceBtn">📖 参考</button>
                    <button class="btn btn-success" id="nextCaseBtn">🎲 换一题</button>
                </div>

                <div id="translationFeedback"></div>
            </div>

            <!-- 自定义模式 -->
            <div class="translation-custom ${currentMode !== 'custom' ? 'hidden' : ''}" id="translationCustom">
                <div class="custom-box">
                    <div class="custom-label">输入中文</div>
                    <textarea class="translation-input" id="customChineseInput" placeholder="输入要翻译的中文..."></textarea>
                    <button class="btn btn-primary" id="translateCustomBtn">🔄 翻译</button>
                </div>
                <div class="custom-result hidden" id="customResult"></div>
            </div>
        </div>
    `;
}

export function init() {
    bindEvents();
    loadCase();
}

function bindEvents() {
    $$('.mode-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentMode = tab.dataset.mode;
            switchMode();
        });
    });

    $('#nextCaseBtn')?.addEventListener('click', () => {
        loadCase();
        clearFeedback();
        const checkBtn = $('#checkTranslationBtn');
        if (checkBtn) checkBtn.disabled = false;
    });

    $('#checkTranslationBtn')?.addEventListener('click', checkTranslation);
    $('#showCluesBtn')?.addEventListener('click', showClues);
    $('#showReferenceBtn')?.addEventListener('click', showReference);
    $('#translateCustomBtn')?.addEventListener('click', translateCustom);
}

function switchMode() {
    const practice = $('#translationPractice');
    const custom = $('#translationCustom');
    
    if (currentMode === 'practice') {
        show(practice);
        hide(custom);
    } else {
        hide(practice);
        show(custom);
    }
    
    $$('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === currentMode);
    });
}

function loadCase() {
    const examGoal = state.currentExamGoal || 'all';
    const exercise = getRandomExercise(null, null, examGoal);
    
    if (!exercise) {
        showMessage('当前考试目标下暂无案件，试试选「全部目标」');
        return;
    }
    
    currentExercise = exercise;
    setCurrentExercise(exercise);
    
    $('#translationChinese').innerHTML = `<strong>${exercise.chinese}</strong>`;
    
    const cluesList = $('#cluesList');
    if (cluesList) {
        cluesList.innerHTML = exercise.clues.map(clue => 
            `<span class="clue-tag">${clue}</span>`
        ).join('');
    }
    
    const caseNum = Math.floor(Math.random() * 1000) + 1;
    $('#caseNumber').textContent = caseNum;
    
    const input = $('#translationInput');
    if (input) {
        input.value = '';
        input.placeholder = '把上面中文翻译成英文...';
    }
    
    hide($('#referenceBox'));
    hide($('#cluesBox'));
}

function showClues() {
    if (!currentExercise) {
        showMessage('请先点击"新案件"');
        return;
    }
    const cluesBox = $('#cluesBox');
    if (cluesBox) {
        cluesBox.classList.toggle('hidden');
    }
}

function checkTranslation() {
    const inputEl = $('#translationInput');
    const userText = inputEl?.value?.trim();
    
    if (!userText) {
        showMessage('请输入翻译');
        return;
    }
    
    if (!currentExercise) return;
    
    userTranslation = userText;
    
    const score = calculateScore(userText, currentExercise);
    displayFeedback(score);
    
    updateDetectiveLevel(score.total);
    incrementCompleted('translation');
    
    show($('#showReferenceBtn'));
    
    if (score.total >= 85) {
        saveGoldenSentence();
    }
}

function calculateScore(userText, exercise) {
    let simple = calculateSimilarity(userText.toLowerCase(), exercise.simpleTranslation.toLowerCase());
    let advanced = calculateSimilarity(userText.toLowerCase(), exercise.advancedTranslation.toLowerCase());
    let total = Math.max(simple, advanced) * 100;
    
    return { total: Math.min(100, Math.round(total)) };
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(/\s+/).filter(w => w.length > 2);
    const words2 = str2.split(/\s+/).filter(w => w.length > 2);
    const common = words1.filter(w => words2.includes(w));
    return common.length / Math.max(words1.length, words2.length, 1);
}

function displayFeedback(score) {
    const container = $('#translationFeedback');
    if (!container) return;
    
    let message = score.total >= 80 ? '翻译得很棒！' : score.total >= 60 ? '翻译得不错！' : '继续练习！';
    
    container.innerHTML = `
        <div class="sandwich-feedback">
            <div class="feedback-score">
                <div class="feedback-score-value score-${score.total >= 80 ? 'excellent' : score.total >= 60 ? 'good' : 'poor'}">${score.total}</div>
                <div class="feedback-score-label">得分</div>
            </div>
            <div class="feedback-praise">${message}</div>
        </div>
    `;
}

function showReference() {
    if (!currentExercise) return;
    
    const refBox = $('#referenceBox');
    if (!refBox) return;
    
    show(refBox);
    refBox.innerHTML = `
        <div class="reference-title">参考答案</div>
        <div class="reference-simple">${currentExercise.simpleTranslation}</div>
        <div class="reference-advanced">${currentExercise.advancedTranslation}</div>
    `;
}

function translateCustom() {
    const input = $('#customChineseInput');
    const text = input?.value?.trim();
    
    if (!text) {
        showMessage('请输入中文');
        return;
    }
    
    const result = $('#customResult');
    if (result) {
        show(result);
        result.innerHTML = `
            <div class="result-simple">[翻译] ${text}</div>
            <div class="result-advanced">[高级] ${text} (高级表达)</div>
        `;
    }
}

function updateDetectiveLevel(score) {
    const level = getDetectiveLevel(score);
    const levelEl = $('#detectiveLevel');
    if (levelEl) {
        levelEl.textContent = level.name;
    }
}

function saveGoldenSentence() {
    if (!userTranslation || !currentExercise) return;
    
    addToGallery({
        text: userTranslation,
        originalText: currentExercise.chinese,
        mode: 'translation',
        tags: ['翻译', '金句']
    });
    
    showMessage('⭐ 金句已收藏！');
}

function clearFeedback() {
    const feedback = $('#translationFeedback');
    if (feedback) feedback.innerHTML = '';
    hide($('#referenceBox'));
    hide($('#showReferenceBtn'));
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
    userTranslation = '';
}

export default { render, init, cleanup };
