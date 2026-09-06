/**
 * English Writing Studio - Feedback System
 * 三明治反馈系统：夸赞-建议-邀请
 */

import { FEEDBACK_TEMPLATES, SCORING_WEIGHTS } from '../config.js';
import { randomPick, calculateSimilarity } from '../utils.js';

// ========== 反馈生成器 ==========

/**
 * 生成三明治反馈
 * @param {string} userInput - 用户输入
 * @param {string} originalText - 原文（可选）
 * @param {Object} analysis - 分析结果
 * @returns {Object} 反馈对象
 */
export function generateFeedback(userInput, originalText = null, analysis = null) {
    // 如果没有提供分析结果，进行分析
    if (!analysis) {
        analysis = analyzeInput(userInput, originalText);
    }
    
    return {
        // 第一层：夸赞
        praise: generatePraise(analysis),
        
        // 第二层：建议
        suggestion: generateSuggestion(analysis),
        
        // 第三层：邀请
        invitation: generateInvitation(),
        
        // 分数（PRD v2多维度）
        score: calculateScore(analysis),
        
        // 亮点
        highlights: analysis.highlights,
        
        // 改进点
        improvements: analysis.improvements,
        
        // 详细分析
        analysis: analysis
    };
}

/**
 * 分析用户输入
 * @param {string} userInput - 用户输入
 * @param {string} originalText - 原文
 * @returns {Object} 分析结果
 */
function analyzeInput(userInput, originalText) {
    const analysis = {
        wordCount: userInput.trim().split(/\s+/).filter(w => w.length > 0).length,
        sentenceCount: userInput.split(/[.!?。！？]+/).filter(s => s.trim().length > 0).length,
        highlights: [],
        improvements: [],
        grammar: [],
        dimensions: {
            creativity: 50,
            fluency: 50,
            complexity: 50,
            accuracy: 50,
            completeness: 50
        }
    };
    
    // 分析亮点
    analyzeHighlights(userInput, originalText, analysis);
    
    // 分析改进点
    analyzeImprovements(userInput, originalText, analysis);
    
    // 分析语法
    analyzeGrammar(userInput, analysis);
    
    // 计算各维度分数
    calculateDimensions(analysis);
    
    return analysis;
}

// ========== 亮点分析 ==========

/**
 * 分析句子亮点
 * @param {string} userInput
 * @param {string} originalText
 * @param {Object} analysis
 */
function analyzeHighlights(userInput, originalText, analysis) {
    const highlights = [];
    const text = userInput.toLowerCase();
    
    // 检查从句使用
    const clausePatterns = [
        { pattern: /\b(because|since|as)\b/g, name: '原因从句', effect: '故事感', score: 15 },
        { pattern: /\b(that|which|who|whom)\b/g, name: '定语从句', effect: '细节感', score: 15 },
        { pattern: /\b(when|while|after|before)\b/g, name: '时间从句', effect: '画面感', score: 15 },
        { pattern: /\b(if|unless|provided that)\b/g, name: '条件从句', effect: '逻辑性', score: 15 },
        { pattern: /\b(although|though|even though)\b/g, name: '让步从句', effect: '深度', score: 20 }
    ];
    
    clausePatterns.forEach(({ pattern, name, effect, score }) => {
        const matches = text.match(pattern);
        if (matches) {
            highlights.push({
                type: 'clause',
                name,
                text: matches[0],
                count: matches.length,
                effect,
                score
            });
        }
    });
    
    // 检查高级词汇
    const advancedVocabulary = [
        { words: ['significant', 'essential', 'crucial', 'vital'], type: 'important' },
        { words: ['fascinating', 'intriguing', 'captivating'], type: 'interesting' },
        { words: ['demonstrate', 'illustrate', 'indicate'], type: 'show' },
        { words: ['consequently', 'therefore', 'thus'], type: 'so' },
        { words: ['nevertheless', 'however', 'nonetheless'], type: 'but' }
    ];
    
    advancedVocabulary.forEach(({ words, type }) => {
        words.forEach(word => {
            if (text.includes(word)) {
                highlights.push({
                    type: 'vocabulary',
                    name: '高级词汇',
                    text: word,
                    original: type,
                    effect: '专业感',
                    score: 10
                });
            }
        });
    });
    
    // 检查修辞手法
    if (text.includes('like') || text.includes('as')) {
        const similePattern = /\b\w+\s+like\s+a\b|\b\w+\s+as\s+\w+\s+as\b/g;
        if (similePattern.test(userInput)) {
            highlights.push({
                type: 'rhetoric',
                name: '比喻',
                text: '明喻',
                effect: '画面感',
                score: 25
            });
        }
    }
    
    // 检查倒装句
    if (/^(never|seldom|rarely|hardly|scarcely|no sooner|not only)/i.test(userInput.trim())) {
        highlights.push({
            type: 'structure',
            name: '倒装句',
            text: '句首倒装',
            effect: '强调感',
            score: 20
        });
    }
    
    // 检查句子长度变化（如果比原文更长）
    if (originalText) {
        const originalLength = originalText.trim().split(/\s+/).length;
        if (analysis.wordCount > originalLength * 1.5) {
            highlights.push({
                type: 'expansion',
                name: '扩写',
                text: `${originalLength}词 → ${analysis.wordCount}词`,
                effect: '丰富度',
                score: 10
            });
        }
    }
    
    // 检查多样性（不同词性）
    const posVariety = checkPOSVariety(userInput);
    if (posVariety.score > 7) {
        highlights.push({
            type: 'variety',
            name: '词性多样性',
            text: `${posVariety.types}种词性`,
            effect: '层次感',
            score: posVariety.score * 2
        });
    }
    
    analysis.highlights = highlights;
}

/**
 * 检查词性多样性
 * @param {string} text
 * @returns {Object}
 */
function checkPOSVariety(text) {
    const types = [];
    
    // 简单检查（实际应该使用NLP库）
    if (/\b(the|a|an)\b/gi.test(text)) types.push('article');
    if (/\b(he|she|it|they|we|I)\b/gi.test(text)) types.push('pronoun');
    if (/\b(happy|sad|beautiful|large|small)\b/gi.test(text)) types.push('adjective');
    if (/\b(quickly|slowly|carefully)\b/gi.test(text)) types.push('adverb');
    if (/\b(in|on|at|under|over)\b/gi.test(text)) types.push('preposition');
    if (/\b(and|but|or|because|if)\b/gi.test(text)) types.push('conjunction');
    
    return { types: types.length, score: types.length };
}

// ========== 改进建议分析 ==========

/**
 * 分析改进点
 * @param {string} userInput
 * @param {string} originalText
 * @param {Object} analysis
 */
function analyzeImprovements(userInput, originalText, analysis) {
    const improvements = [];
    const text = userInput.toLowerCase();
    
    // 检查简单重复
    const words = text.split(/\s+/);
    const wordFreq = {};
    words.forEach(w => {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    
    const repeated = Object.entries(wordFreq).filter(([w, f]) => f > 2 && w.length > 2);
    if (repeated.length > 0) {
        improvements.push({
            type: 'repetition',
            issue: '词汇重复',
            suggestion: `试着用同义词替换"${repeated[0][0]}"，比如${getSynonym(repeated[0][0]) || '其他词'}`,
            example: `${repeated[0][0]} → ${getSynonym(repeated[0][0]) || '替换词'}`
        });
    }
    
    // 检查简单句（没有从句）
    if (analysis.highlights.filter(h => h.type === 'clause').length === 0 && analysis.wordCount > 5) {
        improvements.push({
            type: 'complexity',
            issue: '可以尝试更复杂的句式',
            suggestion: '试试加一个从句，比如用"because"说明原因，或者用"which"添加细节',
            example: 'The cat sleeps. → The cat sleeps because he is tired.'
        });
    }
    
    // 检查简单词汇升级建议
    const simpleWords = [
        { word: 'good', better: 'excellent/outstanding/beneficial' },
        { word: 'bad', better: 'harmful/detrimental/unfavorable' },
        { word: 'big', better: 'enormous/immense/substantial' },
        { word: 'small', better: 'tiny/minute/minimal' },
        { word: 'said', better: 'claimed/argued/mentioned' }
    ];
    
    simpleWords.forEach(({ word, better }) => {
        if (text.includes(word)) {
            improvements.push({
                type: 'vocabulary',
                issue: '可以用更高级的词汇',
                suggestion: `"${word}"可以换成${better.split('/')[0]}`,
                example: `${word} → ${better.split('/')[0]}`
            });
        }
    });
    
    // 检查缺少连接词
    if (analysis.sentenceCount > 1) {
        const hasTransitions = /\b(however|therefore|furthermore|moreover|in addition)\b/gi.test(text);
        if (!hasTransitions) {
            improvements.push({
                type: 'coherence',
                issue: '句子之间可以加连接词',
                suggestion: '试试用"However"转折，或者用"Therefore"引出结论',
                example: '...句号。→ ...句号。However, ...'
            });
        }
    }
    
    analysis.improvements = improvements;
}

/**
 * 获取简单同义词
 * @param {string} word
 * @returns {string|null}
 */
function getSynonym(word) {
    const synonyms = {
        'good': 'great',
        'bad': 'poor',
        'big': 'large',
        'small': 'tiny',
        'happy': 'joyful'
    };
    return synonyms[word] || null;
}

// ========== 语法分析 ==========

/**
 * 分析语法
 * @param {string} userInput
 * @param {Object} analysis
 */
function analyzeGrammar(userInput, analysis) {
    const issues = [];
    const text = userInput.trim();
    
    // 检查首字母大写
    if (text.length > 0 && text[0] !== text[0].toUpperCase()) {
        issues.push({
            type: 'capitalization',
            message: '句子首字母需要大写',
            severity: 'minor'
        });
    }
    
    // 检查句末标点
    if (!/[.!?。！？]$/.test(text)) {
        issues.push({
            type: 'punctuation',
            message: '句子末尾需要标点符号',
            severity: 'minor'
        });
    }
    
    // 检查三单（简单规则）
    const thirdPersonPattern = /\b(he|she|it|the\s+\w+)\s+(go|do|have|make|take|eat|sleep|run|play)/gi;
    const matches = text.match(thirdPersonPattern);
    if (matches) {
        // 提示检查动词形式
        issues.push({
            type: 'grammar',
            message: '注意第三人称单数动词要加-s/-es',
            suggestion: '检查动词形式是否正确',
            severity: 'suggestion'
        });
    }
    
    analysis.grammar = issues;
}

// ========== 分数计算 ==========

/**
 * 计算各维度分数
 * @param {Object} analysis
 */
function calculateDimensions(analysis) {
    // 创意度（亮点数量和种类）
    const highlightScore = Math.min(analysis.highlights.reduce((sum, h) => sum + h.score, 0), 100);
    analysis.dimensions.creativity = Math.max(50, 50 + highlightScore / 2);
    
    // 流畅度（语法错误少）
    const grammarPenalty = analysis.grammar.filter(g => g.severity === 'minor').length * 5;
    analysis.dimensions.fluency = Math.max(50, 100 - grammarPenalty);
    
    // 复杂度（从句、高级词汇）
    const complexityBonus = analysis.highlights.filter(h => 
        h.type === 'clause' || h.type === 'structure'
    ).length * 10;
    analysis.dimensions.complexity = Math.min(100, 50 + complexityBonus);
    
    // 准确性（基于语法错误）
    const accuracyPenalty = analysis.grammar.length * 8;
    analysis.dimensions.accuracy = Math.max(50, 100 - accuracyPenalty);
    
    // 完整度（基于长度）
    analysis.dimensions.completeness = Math.min(100, 50 + analysis.wordCount * 2);
}

/**
 * 计算总分
 * @param {Object} analysis
 * @returns {Object}
 */
function calculateScore(analysis) {
    const { creativity, fluency, complexity, accuracy, completeness } = analysis.dimensions;
    
    // 加权计算总分
    const total = 
        creativity * SCORING_WEIGHTS.creativity +
        fluency * SCORING_WEIGHTS.fluency +
        complexity * SCORING_WEIGHTS.complexity +
        accuracy * SCORING_WEIGHTS.accuracy +
        completeness * SCORING_WEIGHTS.completeness;
    
    return {
        total: Math.round(total),
        dimensions: analysis.dimensions,
        breakdown: {
            creativity: Math.round(creativity),
            fluency: Math.round(fluency),
            complexity: Math.round(complexity),
            accuracy: Math.round(accuracy),
            completeness: Math.round(completeness)
        }
    };
}

// ========== 反馈内容生成 ==========

/**
 * 生成夸赞内容
 * @param {Object} analysis
 * @returns {Object|null}
 */
function generatePraise(analysis) {
    const highlights = analysis.highlights;
    
    if (highlights.length === 0) {
        // 没有明显亮点时给鼓励
        return {
            type: 'encouragement',
            text: randomPick([
                '很好！这是一个完整的句子，继续加油！',
                '不错！尝试添加更多细节会让句子更生动！',
                '很好开始！下一步可以尝试使用从句。'
            ]),
            icon: '👍'
        };
    }
    
    // 选择最突出的亮点
    const bestHighlight = highlights.reduce((best, current) => 
        current.score > best.score ? current : best
    );
    
    // 根据亮点类型生成夸赞
    let praiseText = '';
    
    switch (bestHighlight.type) {
        case 'clause':
            praiseText = `你使用的"${bestHighlight.text}"让句子有了${bestHighlight.effect}！`;
            break;
        case 'vocabulary':
            praiseText = `"${bestHighlight.text}"这个词选得真好，${bestHighlight.effect}！`;
            break;
        case 'rhetoric':
            praiseText = `这个${bestHighlight.text}用得很有创意，让句子充满${bestHighlight.effect}！`;
            break;
        case 'structure':
            praiseText = `你用了${bestHighlight.name}，这种句式让表达更有${bestHighlight.effect}！`;
            break;
        case 'expansion':
            praiseText = `你把句子从${bestHighlight.text}，让内容更加丰富！`;
            break;
        default:
            praiseText = randomPick(FEEDBACK_TEMPLATES.praise)
                .replace('{highlight}', bestHighlight.text)
                .replace('{effect}', bestHighlight.effect);
    }
    
    return {
        type: bestHighlight.type,
        text: praiseText,
        highlight: bestHighlight,
        icon: getIconForType(bestHighlight.type)
    };
}

/**
 * 生成建议内容
 * @param {Object} analysis
 * @returns {Object|null}
 */
function generateSuggestion(analysis) {
    const improvements = analysis.improvements;
    
    if (improvements.length === 0) {
        // 没有改进建议时
        if (analysis.highlights.length > 2) {
            return {
                type: 'advanced',
                text: '已经很棒了！如果想挑战更高难度，可以尝试加入倒装句或虚拟语气。',
                example: 'Never have I seen such a beautiful sunset.',
                icon: '🚀'
            };
        }
        return null;
    }
    
    // 选择最重要的改进点
    const improvement = improvements[0];
    
    let suggestionText = improvement.suggestion;
    
    // 如果有很多亮点，语气可以更积极
    if (analysis.highlights.length >= 3) {
        suggestionText = `如果想让句子更上一层楼，可以${improvement.suggestion.toLowerCase()}`;
    }
    
    return {
        type: improvement.type,
        text: suggestionText,
        example: improvement.example,
        icon: '💡'
    };
}

/**
 * 生成邀请
 * @returns {Object}
 */
function generateInvitation() {
    return {
        text: randomPick(FEEDBACK_TEMPLATES.invitation),
        options: ['试试看', '先保持这样', '我想了解更多']
    };
}

/**
 * 获取类型对应的图标
 * @param {string} type
 * @returns {string}
 */
function getIconForType(type) {
    const icons = {
        clause: '🔀',
        vocabulary: '💎',
        rhetoric: '🎨',
        structure: '🏗️',
        expansion: '📈',
        variety: '🌈'
    };
    return icons[type] || '✨';
}

// ========== 渲染反馈UI ==========

/**
 * 渲染反馈HTML
 * @param {Object} feedback
 * @returns {string}
 */
export function renderFeedback(feedback) {
    const { praise, suggestion, invitation, score } = feedback;
    
    let html = '<div class="sandwich-feedback">';
    
    // 分数展示
    html += renderScore(score);
    
    // 夸赞层
    if (praise) {
        html += `
            <div class="feedback-praise">
                <div class="feedback-praise-header">
                    <span>${praise.icon}</span>
                    <span>写得好！</span>
                </div>
                <div class="feedback-praise-content">
                    ${praise.text}
                    ${praise.highlight ? `<span class="feedback-praise-highlight">${praise.highlight.text}</span>` : ''}
                </div>
            </div>
        `;
    }
    
    // 建议层
    if (suggestion) {
        html += `
            <div class="feedback-suggestion">
                <div class="feedback-suggestion-header">
                    <span>${suggestion.icon}</span>
                    <span>进阶建议</span>
                </div>
                <div class="feedback-suggestion-content">
                    ${suggestion.text}
                </div>
                ${suggestion.example ? `<div class="feedback-suggestion-example">${suggestion.example}</div>` : ''}
            </div>
        `;
    }
    
    // 邀请层
    html += `
        <div class="feedback-invitation">
            <span class="feedback-invitation-text">${invitation.text}</span>
            <button class="feedback-invitation-btn" onclick="acceptSuggestion()">试试看</button>
        </div>
    `;
    
    html += '</div>';
    
    return html;
}

/**
 * 渲染分数
 * @param {Object} score
 * @returns {string}
 */
function renderScore(score) {
    const { total, breakdown } = score;
    const scoreClass = total >= 85 ? 'excellent' : total >= 70 ? 'good' : 'poor';
    
    return `
        <div class="feedback-score">
            <div class="feedback-score-value score-${scoreClass}">${total}</div>
            <div class="feedback-score-label">综合评分</div>
            <div class="feedback-score-breakdown">
                <div class="score-dimension dimension-creativity">
                    <span class="score-dimension-value">${breakdown.creativity}</span>
                    <span class="score-dimension-label">创意</span>
                </div>
                <div class="score-dimension dimension-fluency">
                    <span class="score-dimension-value">${breakdown.fluency}</span>
                    <span class="score-dimension-label">流畅</span>
                </div>
                <div class="score-dimension dimension-complexity">
                    <span class="score-dimension-value">${breakdown.complexity}</span>
                    <span class="score-dimension-label">复杂</span>
                </div>
                <div class="score-dimension dimension-accuracy">
                    <span class="score-dimension-value">${breakdown.accuracy}</span>
                    <span class="score-dimension-label">准确</span>
                </div>
            </div>
        </div>
    `;
}

// ========== 导出默认对象 ==========
export default {
    generateFeedback,
    renderFeedback,
    analyzeInput
};
