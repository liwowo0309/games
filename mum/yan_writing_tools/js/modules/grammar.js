/**
 * English Writing Studio - 找茬大作战模块
 * Grammar Error Detection Module - 语法分类练习
 */

import { $, $$, show, hide } from '../utils.js';
import { state, setCurrentExercise, incrementCompleted } from '../state.js';
import { grammarData, GRAMMAR_CATEGORIES, getRandomExercise } from '../../data/grammarData.js';

// ========== 模块状态 ==========
let currentExercise = null;
let selectedCategories = [];
let userAnswer = '';
let score = 0;

// ========== 渲染模块 ==========
export function render() {
    return `
        <div id="grammarMode" class="practice-mode">
            
            <!-- 第一步：语法分类选择 -->
            <div class="category-selection" id="categorySelection">
                <div class="section-header">
                    <div class="section-icon">🎯</div>
                    <div class="section-title">选择要练习的语法板块</div>
                </div>
                <p class="section-subtitle">勾选你想练习的语法类型，可以多选</p>
                
                <div class="category-grid" id="categoryGrid">
                    ${renderCategoryGrid()}
                </div>
                
                <div class="selection-actions">
                    <button class="btn btn-secondary" id="selectAllBtn">全选</button>
                    <button class="btn btn-secondary" id="clearAllBtn">清空</button>
                </div>
                
                <button class="btn btn-primary btn-large" id="startPracticeBtn" disabled>
                    ✓ 开始练习
                </button>
            </div>

            <!-- 第二步：练习界面 -->
            <div class="grammar-practice hidden" id="grammarPractice">
                <!-- 当前分类标签 -->
                <div class="current-category-tags" id="currentCategoryTags"></div>
                
                <!-- 题目区域 -->
                <div class="grammar-question-box">
                    <div class="question-label">
                        📄 找出下列句子中的语法错误
                        <span class="question-hint">在下方写出正确的句子</span>
                    </div>
                    <div class="question-text" id="questionText">
                        <span class="loading-text">⏳ 加载中...</span>
                    </div>
                </div>

                <!-- 答题区域 -->
                <div class="answer-section">
                    <div class="answer-label">✏️ 改正后的句子</div>
                    <textarea class="grammar-answer-input" id="grammarAnswerInput" 
                        placeholder="在这里写出正确的句子..."></textarea>
                </div>

                <!-- 提示区域 -->
                <div class="hint-box hidden" id="hintBox">
                    <div class="hint-title">💡 提示</div>
                    <div class="hint-content" id="hintContent"></div>
                </div>

                <!-- 答案解析 -->
                <div class="grammar-explanation hidden" id="grammarExplanation">
                    <div class="explanation-title">📖 答案解析</div>
                    <div class="explanation-content" id="explanationContent"></div>
                </div>

                <!-- 按钮组 -->
                <div class="btn-group">
                    <button class="btn btn-primary" id="submitAnswerBtn" disabled>✓ 提交答案</button>
                    <button class="btn btn-secondary" id="showHintBtn">💡 提示</button>
                    <button class="btn btn-secondary hidden" id="showExplanationBtn">📖 答案</button>
                    <button class="btn btn-success" id="nextQuestionBtn">🎲 换一题</button>
                    <button class="btn btn-outline" id="backToCategoryBtn">← 换分类</button>
                </div>

                <!-- 得分 -->
                <div class="grammar-score hidden" id="grammarScore">
                    <div class="score-circle">
                        <span class="score-value" id="scoreValue">0</span>
                        <span class="score-label">分</span>
                    </div>
                    <div class="score-message" id="scoreMessage"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== 渲染语法分类网格 ==========
function renderCategoryGrid() {
    return Object.entries(GRAMMAR_CATEGORIES).map(([key, category]) => `
        <div class="category-card" data-category="${key}">
            <div class="category-icon" style="background: ${category.color}20; color: ${category.color}">
                ${category.icon}
            </div>
            <div class="category-name">${category.name}</div>
            <div class="category-check">✓</div>
        </div>
    `).join('');
}

// ========== 初始化模块 ==========
export function init() {
    bindEvents();
    console.log('Grammar module initialized');
}

// ========== 绑定事件 ==========
function bindEvents() {
    // 分类选择
    $$('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            updateSelectedCategories();
        });
    });

    // 全选/清空
    $('#selectAllBtn')?.addEventListener('click', () => {
        $$('.category-card').forEach(card => card.classList.add('selected'));
        updateSelectedCategories();
    });

    $('#clearAllBtn')?.addEventListener('click', () => {
        $$('.category-card').forEach(card => card.classList.remove('selected'));
        updateSelectedCategories();
    });

    // 开始练习
    $('#startPracticeBtn')?.addEventListener('click', startPractice);

    // 练习界面按钮
    $('#nextQuestionBtn')?.addEventListener('click', () => {
        loadQuestion();
        resetUI();
    });

    $('#submitAnswerBtn')?.addEventListener('click', submitAnswer);
    $('#showHintBtn')?.addEventListener('click', toggleHint);
    $('#showExplanationBtn')?.addEventListener('click', showExplanation);
    $('#backToCategoryBtn')?.addEventListener('click', backToCategory);

    // 输入框监听
    $('#grammarAnswerInput')?.addEventListener('input', (e) => {
        const submitBtn = $('#submitAnswerBtn');
        if (submitBtn) {
            submitBtn.disabled = !e.target.value.trim();
        }
    });
}

// ========== 更新已选分类 ==========
function updateSelectedCategories() {
    const selected = $$('.category-card.selected');
    selectedCategories = Array.from(selected).map(card => card.dataset.category);
    
    const startBtn = $('#startPracticeBtn');
    if (startBtn) {
        startBtn.disabled = selectedCategories.length === 0;
    }
}

// ========== 开始练习 ==========
function startPractice() {
    if (selectedCategories.length === 0) return;
    
    // 隐藏分类选择，显示练习界面
    hide($('#categorySelection'));
    show($('#grammarPractice'));
    
    // 显示当前分类标签
    renderCategoryTags();
    
    // 自动加载第一题
    loadQuestion();
    resetUI();
}

// ========== 渲染当前分类标签 ==========
function renderCategoryTags() {
    const container = $('#currentCategoryTags');
    if (!container) return;
    
    container.innerHTML = selectedCategories.map(cat => {
        const info = GRAMMAR_CATEGORIES[cat];
        return `<span class="category-tag" style="background: ${info.color}20; color: ${info.color}; border-color: ${info.color}">
            ${info.icon} ${info.name}
        </span>`;
    }).join('');
}

// ========== 加载题目 ==========
function loadQuestion() {
    if (selectedCategories.length === 0) return;
    
    // 随机选择一个分类
    const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
    
    // 从该分类获取题目
    const exercise = getRandomExercise(null, randomCategory, state.currentExamGoal);
    
    if (!exercise) {
        showMessage('该分类下暂无题目');
        return;
    }
    
    currentExercise = exercise;
    setCurrentExercise(exercise);
    
    // 显示题目
    const questionText = $('#questionText');
    if (questionText) {
        questionText.innerHTML = `<strong>${exercise.text}</strong>`;
    }
    
    // 清空输入
    const input = $('#grammarAnswerInput');
    if (input) {
        input.value = '';
        input.placeholder = '在这里写出正确的句子...';
    }
    
    // 隐藏提示和答案
    hide($('#hintBox'));
    hide($('#grammarExplanation'));
    hide($('#showExplanationBtn'));
    hide($('#grammarScore'));
    
    // 禁用提交按钮
    const submitBtn = $('#submitAnswerBtn');
    if (submitBtn) submitBtn.disabled = true;
}

// ========== 提交答案 ==========
function submitAnswer() {
    const input = $('#grammarAnswerInput');
    const userText = input?.value?.trim();
    
    if (!userText || !currentExercise) return;
    
    userAnswer = userText;
    
    // 计算得分（简单对比）
    score = calculateScore(userText, currentExercise);
    
    // 显示得分
    showScore();
    
    // 显示答案按钮
    show($('#showExplanationBtn'));
    
    // 显示答案
    showExplanation();
    
    // 记录完成
    incrementCompleted('grammar');
}

// ========== 计算得分 ==========
function calculateScore(userText, exercise) {
    const errors = exercise.errors || [];
    let fixedCount = 0;
    
    const userLower = userText.toLowerCase();
    
    errors.forEach(err => {
        // 检查用户答案是否包含正确的单词
        if (err.correct && userLower.includes(err.correct.toLowerCase())) {
            fixedCount++;
        }
        // 检查用户答案是否不包含错误单词
        if (!userLower.includes(err.word.toLowerCase())) {
            fixedCount++;
        }
    });
    
    // 简单计分：找出所有错误得100分，找出一半得50分
    const totalErrors = errors.length || 1;
    const ratio = fixedCount / (totalErrors * 2); // 每个错误有两个检查点
    return Math.min(100, Math.round(ratio * 100));
}

// ========== 显示得分 ==========
function showScore() {
    const scoreContainer = $('#grammarScore');
    const scoreValue = $('#scoreValue');
    const scoreMessage = $('#scoreMessage');
    
    if (!scoreContainer) return;
    
    show(scoreContainer);
    
    if (scoreValue) scoreValue.textContent = score;
    
    if (scoreMessage) {
        if (score >= 80) {
            scoreMessage.textContent = '🎉 太棒了！全部改对了！';
        } else if (score >= 50) {
            scoreMessage.textContent = '👍 不错！找到部分错误！';
        } else {
            scoreMessage.textContent = '💪 再看看，还有错误没发现哦！';
        }
    }
}

// ========== 切换提示 ==========
function toggleHint() {
    if (!currentExercise) {
        showMessage('请先加载题目');
        return;
    }
    
    const hintBox = $('#hintBox');
    const hintContent = $('#hintContent');
    
    if (!hintBox || !hintContent) return;
    
    if (hintBox.classList.contains('hidden')) {
        hintContent.textContent = currentExercise.hint || '仔细检查句子中的每个单词';
        show(hintBox);
    } else {
        hide(hintBox);
    }
}

// ========== 显示答案解析 ==========
function showExplanation() {
    if (!currentExercise) return;
    
    const explanation = $('#grammarExplanation');
    const content = $('#explanationContent');
    
    if (!explanation || !content) return;
    
    show(explanation);
    show($('#showExplanationBtn'));
    
    const errors = currentExercise.errors || [];
    
    content.innerHTML = `
        <div class="correct-answer">
            <div class="correct-answer-label">✅ 正确答案</div>
            <div class="correct-answer-text">${getCorrectText()}</div>
        </div>
        <div class="error-analysis">
            <div class="error-analysis-title">🔍 错误分析</div>
            ${errors.map((err, i) => `
                <div class="error-item">
                    <div class="error-item-header">
                        <span class="error-num">${i + 1}</span>
                        <span class="error-type-badge" style="background: ${GRAMMAR_CATEGORIES[err.type]?.color || '#6366f1'}20; color: ${GRAMMAR_CATEGORIES[err.type]?.color || '#6366f1'}">
                            ${GRAMMAR_CATEGORIES[err.type]?.icon || '🔍'} ${GRAMMAR_CATEGORIES[err.type]?.name || err.type}
                        </span>
                    </div>
                    <div class="error-fix">
                        <span class="error-word">${err.word}</span>
                        <span class="fix-arrow">→</span>
                        <span class="correct-word">${err.correct || '删除'}</span>
                    </div>
                    <div class="error-reason">${currentExercise.explanation}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== 获取正确答案文本 ==========
function getCorrectText() {
    if (!currentExercise) return '';
    
    let text = currentExercise.text;
    const errors = currentExercise.errors || [];
    
    // 按顺序替换错误单词
    errors.forEach(err => {
        if (err.correct) {
            text = text.replace(err.word, err.correct);
        }
    });
    
    return text;
}

// ========== 返回分类选择 ==========
function backToCategory() {
    show($('#categorySelection'));
    hide($('#grammarPractice'));
    
    // 清空当前题目
    currentExercise = null;
    userAnswer = '';
    score = 0;
}

// ========== 重置UI ==========
function resetUI() {
    hide($('#hintBox'));
    hide($('#grammarExplanation'));
    hide($('#showExplanationBtn'));
    hide($('#grammarScore'));
    
    const submitBtn = $('#submitAnswerBtn');
    if (submitBtn) submitBtn.disabled = true;
    
    const input = $('#grammarAnswerInput');
    if (input) input.value = '';
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
    selectedCategories = [];
    userAnswer = '';
    score = 0;
}

export default { render, init, cleanup };
