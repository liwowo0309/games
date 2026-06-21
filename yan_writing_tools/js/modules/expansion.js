/**
 * English Writing Studio - 句子变形记模块
 * Sentence Expansion Module
 */

import { $, $$, show, hide, filterByPracticeTarget } from '../utils.js';
import { state, setCurrentExercise, incrementCompleted, addToGallery } from '../state.js';
import { generateFeedback } from '../core/feedback.js';
import { expansionData, LEVELS } from '../../data/expansionData.js';

// ========== 模块状态 ==========
let currentExercise = null;
let currentLevel = 1;
let userInput = '';

// ========== 渲染模块 ==========
export function render() {
    return `
        <div id="expansionMode" class="practice-mode">
            <div class="expansion-container">
                
                <!-- 关卡选择 - 视觉引导 -->
                <div class="level-selector" id="levelSelector">
                    ${renderLevels()}
                </div>

                <!-- 练习区域 -->
                <div class="expansion-workspace">
                    <div class="original-sentence-box">
                        <div class="original-sentence-label">📝 基础句子</div>
                        <p class="original-sentence" id="expansionSentence">
                            <span class="loading-text">⏳ 加载中...</span>
                        </p>
                    </div>
                    
                    <!-- 词汇魔法盒 -->
                    <div class="word-magic-box" id="wordMagicBox">
                        <div class="magic-box-title">✨ 点击词汇，自动完成扩写</div>
                        <div class="magic-words" id="magicWords"></div>
                        <div class="magic-hint">👆 点击上方词汇，系统自动帮你完成句子变形</div>
                    </div>
                    
                    <!-- 对比展示区 -->
                    <div class="expansion-compare hidden" id="expansionCompare">
                        <div class="compare-box">
                            <div class="compare-label">原句</div>
                            <div class="compare-text" id="compareOriginal"></div>
                        </div>
                        <div class="compare-arrow">→</div>
                        <div class="compare-box expanded">
                            <div class="compare-label">扩写后 ✨</div>
                            <div class="compare-text" id="compareExpanded"></div>
                        </div>
                    </div>
                    
                    <div class="expansion-input-area">
                        <div class="expansion-input-label">✏️ 或者自己在这里写</div>
                        <textarea class="expansion-textarea" id="expansionInput" placeholder="点击上方词汇自动填充，或自己手动改写..."></textarea>
                    </div>
                </div>

                <!-- 按钮组 -->
                <div class="btn-group">
                    <button class="btn btn-primary" id="checkExpansionBtn" disabled>✓ 提交变形</button>
                    <button class="btn btn-secondary" id="hintBtn">💡 提示</button>
                    <button class="btn btn-success" id="nextExerciseBtn">🎲 换一题</button>
                    <button class="btn btn-success hidden" id="saveCreationBtn">💾 保存</button>
                </div>

                <!-- 提示框 -->
                <div class="expansion-hints hidden" id="expansionHintBox">
                    <div class="expansion-hints-content" id="hintContent"></div>
                </div>

                <!-- 反馈区域 -->
                <div id="expansionFeedback"></div>

                <!-- 进化图谱 -->
                <div class="evolution-map hidden" id="evolutionMap"></div>

                <!-- 进度条 -->
                <div class="level-progress">
                    <div class="level-progress-bar" id="levelProgress">
                        ${renderProgressBar()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== 渲染关卡选择 ==========
function renderLevels() {
    return LEVELS.map(level => `
        <div class="level-item ${level.id === currentLevel ? 'active' : ''} ${level.id > currentLevel ? 'locked' : ''}" 
             data-level="${level.id}" title="${level.description}">
            <div class="level-icon">${level.icon}</div>
            <div class="level-name">${level.name}</div>
        </div>
    `).join('');
}

// ========== 渲染进度条 ==========
function renderProgressBar() {
    return LEVELS.map((level, index) => `
        <div class="level-progress-step ${level.id < currentLevel ? 'completed' : level.id === currentLevel ? 'current' : ''}" 
             title="${level.name}"></div>
    `).join('');
}

// ========== 初始化模块 ==========
export function init() {
    bindEvents();
    loadExercise();
    console.log('Expansion module initialized');
}

// ========== 绑定事件 ==========
function bindEvents() {
    // 关卡选择
    $$('.level-item').forEach(item => {
        item.addEventListener('click', () => {
            const level = parseInt(item.dataset.level);
            if (level <= currentLevel) {
                currentLevel = level;
                loadExercise();
                updateLevelUI();
            }
        });
    });

    // 提交按钮
    $('#checkExpansionBtn')?.addEventListener('click', checkExpansion);

    // 提示按钮
    $('#hintBtn')?.addEventListener('click', toggleHint);

    // 随机一题按钮
    $('#nextExerciseBtn')?.addEventListener('click', () => {
        loadExercise();
        clearFeedback();
        
        const checkBtn = $('#checkExpansionBtn');
        if (checkBtn) checkBtn.disabled = false;
    });

    // 保存到画廊
    $('#saveCreationBtn')?.addEventListener('click', saveToGallery);
}

// ========== 加载练习 ==========
function loadExercise() {
    const examGoal = state.currentExamGoal || 'all';
    const exercise = getRandomExerciseByLevel(currentLevel, examGoal);
    
    if (!exercise) {
        showMessage('当前考试目标下暂无此关卡题目，试试选「全部目标」');
        return;
    }
    
    currentExercise = exercise;
    setCurrentExercise(exercise);
    
    // 更新UI
    const sentenceEl = $('#expansionSentence');
    if (sentenceEl) {
        sentenceEl.innerHTML = `<strong>${exercise.sentence}</strong>`;
    }
    
    // 清空输入
    const inputEl = $('#expansionInput');
    if (inputEl) {
        inputEl.value = '';
        inputEl.placeholder = `在 "${exercise.sentence}" 的基础上添加词语...`;
    }
    
    // 更新词汇选择器
    updateWordSelector(exercise);
    
    // 隐藏之前的反馈
    clearFeedback();
}

// ========== 根据等级获取练习 ==========
function getRandomExerciseByLevel(level, examGoal) {
    let data = expansionData.filter(item => item.level === level);
    data = filterByPracticeTarget(data, examGoal || 'all');
    if (data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

// ========== 更新词汇魔法盒 ==========
function updateWordSelector(exercise) {
    const magicBox = $('#wordMagicBox');
    const magicWords = $('#magicWords');
    
    if (!magicBox || !magicWords) return;
    
    const words = generateWordOptions(exercise);
    
    if (words.length > 0) {
        magicBox.classList.remove('hidden');
        magicWords.innerHTML = words.map(word => `
            <button class="magic-word-btn" data-word="${word}">${word}</button>
        `).join('');
        
        // 绑定点击事件
        $$('.magic-word-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                applyMagicWord(btn.dataset.word, exercise);
            });
        });
    } else {
        magicBox.classList.add('hidden');
    }
}

// ========== 生成词汇选项 ==========
function generateWordOptions(exercise) {
    const options = [];
    const sentence = exercise.sentence || '';
    
    switch (exercise.level) {
        case 1: // 加形容词/副词
            options.push('a happy', 'a lazy', 'a beautiful', 'quickly', 'slowly', 'carefully');
            break;
        case 2: // 加时间
            options.push('every morning', 'often', 'on weekends', 'in the evening', 'yesterday', 'last week');
            break;
        case 3: // 加地点
            options.push('in the park', 'at school', 'near the river', 'under the tree', 'in my room', 'at home');
            break;
        case 4: // 加原因/结果
            options.push('because...', 'since...', 'so...', 'therefore...', 'as a result...');
            break;
        case 5: // 加定语从句
            options.push('who is...', 'which is...', 'that is...', 'where...', 'when...');
            break;
    }
    
    return options;
}

// ========== 应用魔法词汇 ==========
function applyMagicWord(word, exercise) {
    if (!exercise) return;
    
    const original = exercise.sentence;
    let expanded = '';
    
    // 根据关卡类型自动构建扩写句子
    switch (exercise.level) {
        case 1: // 形容词/副词
            if (word.includes('a ')) {
                // 在名词前加形容词
                expanded = original.replace(/\ba\b/, word);
            } else {
                // 在动词后加副词
                const words = original.split(' ');
                // 简单策略：在最后一个词前加副词
                words.splice(words.length - 1, 0, word);
                expanded = words.join(' ');
            }
            break;
        case 2: // 时间
            expanded = `${word}, ${original}`;
            break;
        case 3: // 地点
            if (original.includes('in ') || original.includes('at ')) {
                expanded = original.replace(/\b(in |at )\w+/, word);
            } else {
                expanded = `${original} ${word}`;
            }
            break;
        case 4: // 原因
            if (word.includes('...')) {
                const reason = word.replace('...', '');
                expanded = `${original} ${reason} it is interesting`;
            } else {
                expanded = `${original} ${word}`;
            }
            break;
        case 5: // 定语从句
            if (word.includes('...')) {
                const connector = word.replace('...', '');
                expanded = `${original} ${connector} very nice`;
            } else {
                expanded = `${original} ${word}`;
            }
            break;
        default:
            expanded = `${original} ${word}`;
    }
    
    // 填充到输入框
    const input = $('#expansionInput');
    if (input) {
        input.value = expanded;
    }
    
    userInput = expanded;
    
    // 显示对比
    showCompare(original, expanded);
    
    // 启用提交按钮
    const checkBtn = $('#checkExpansionBtn');
    if (checkBtn) checkBtn.disabled = false;
}

// ========== 显示对比 ==========
function showCompare(original, expanded) {
    const compare = $('#expansionCompare');
    const compareOriginal = $('#compareOriginal');
    const compareExpanded = $('#compareExpanded');
    
    if (!compare || !compareOriginal || !compareExpanded) return;
    
    show(compare);
    compareOriginal.textContent = original;
    compareExpanded.textContent = expanded;
}

// ========== 检查变形 ==========
function checkExpansion() {
    const inputEl = $('#expansionInput');
    const userText = inputEl?.value?.trim();
    
    if (!userText) {
        showMessage('请先写出你的变形句子');
        return;
    }
    
    if (!currentExercise) {
        showMessage('请先加载题目');
        return;
    }
    
    userInput = userText;
    
    // 显示对比
    showCompare(currentExercise.sentence, userText);
    
    // 生成反馈
    const feedback = generateFeedback(userText, currentExercise.sentence);
    
    // 显示反馈
    displayFeedback(feedback);
    
    // 显示进化图谱
    displayEvolutionChart();
    
    // 显示保存按钮
    show($('#saveCreationBtn'));
    
    // 更新进度
    incrementCompleted('expansion');
    
    // 检查是否解锁下一关
    if (feedback.score.total >= 70 && currentLevel < 5) {
        setTimeout(() => {
            showMessage(`🎉 得分 ${feedback.score.total} 分，解锁下一关卡！`);
            currentLevel++;
            updateLevelUI();
        }, 500);
    }
}

// ========== 显示反馈 ==========
function displayFeedback(feedback) {
    const container = $('#expansionFeedback');
    if (!container) return;
    
    container.innerHTML = `
        <div class="sandwich-feedback">
            <div class="feedback-score">
                <div class="feedback-score-value score-${feedback.score.total >= 80 ? 'excellent' : feedback.score.total >= 60 ? 'good' : 'poor'}">${feedback.score.total}</div>
                <div class="feedback-score-label">得分</div>
            </div>
            <div class="feedback-praise">
                <div class="feedback-praise-content">${feedback.praise?.text || '完成！'}</div>
            </div>
            ${feedback.suggestion ? `
                <div class="feedback-suggestion">
                    <div class="feedback-suggestion-content">${feedback.suggestion.text}</div>
                </div>
            ` : ''}
        </div>
    `;
}

// ========== 显示进化图谱 ==========
function displayEvolutionChart() {
    const map = $('#evolutionMap');
    
    if (!map || !currentExercise) return;
    
    show(map);
    
    map.innerHTML = `
        <div class="evolution-map-title">📊 句子进化</div>
        <div class="evolution-steps">
            <div class="evolution-step original">
                <div class="evolution-step-label">原始</div>
                <div class="evolution-step-content">${currentExercise.sentence}</div>
            </div>
            <div class="evolution-arrow">→</div>
            <div class="evolution-step added">
                <div class="evolution-step-label">变形后</div>
                <div class="evolution-step-content">${userInput}</div>
            </div>
        </div>
    `;
}

// ========== 切换提示 ==========
function toggleHint() {
    const hintBox = $('#expansionHintBox');
    const hintContent = $('#hintContent');
    
    if (!hintBox || !currentExercise) {
        showMessage('请先加载题目');
        return;
    }
    
    if (hintBox.classList.contains('hidden')) {
        hintContent.innerHTML = currentExercise.hints.map(hint => 
            `<div class="expansion-hint-item">💡 ${hint}</div>`
        ).join('');
        show(hintBox);
    } else {
        hide(hintBox);
    }
}

// ========== 保存到画廊 ==========
function saveToGallery() {
    if (!userInput || !currentExercise) return;
    
    addToGallery({
        text: userInput,
        originalText: currentExercise.sentence,
        mode: 'expansion',
        tags: currentExercise.tags || []
    });
    
    showMessage('已保存到画廊！');
    hide($('#saveCreationBtn'));
}

// ========== 更新关卡UI ==========
function updateLevelUI() {
    const selector = $('#levelSelector');
    const progress = $('#levelProgress');
    
    if (selector) {
        selector.innerHTML = renderLevels();
    }
    if (progress) {
        progress.innerHTML = renderProgressBar();
    }
    
    // 重新绑定事件
    $$('.level-item').forEach(item => {
        item.addEventListener('click', () => {
            const level = parseInt(item.dataset.level);
            if (level <= currentLevel) {
                currentLevel = level;
                loadExercise();
                updateLevelUI();
            }
        });
    });
}

// ========== 清空反馈 ==========
function clearFeedback() {
    const feedback = $('#expansionFeedback');
    const evolution = $('#evolutionMap');
    const saveBtn = $('#saveCreationBtn');
    const compare = $('#expansionCompare');
    
    if (feedback) feedback.innerHTML = '';
    if (evolution) hide(evolution);
    if (saveBtn) hide(saveBtn);
    if (compare) hide(compare);
}

// ========== 显示消息 ==========
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

// ========== 清理函数 ==========
export function cleanup() {
    currentExercise = null;
    userInput = '';
}

export default { render, init, cleanup };
