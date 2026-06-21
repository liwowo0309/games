/**
 * English Writing Studio - Grading System
 * AI评分算法
 */

import { SCORING_WEIGHTS } from '../config.js';
import { calculateSimilarity, countWords } from '../utils.js';

// ========== 多维度评分 ==========

/**
 * 综合评分
 * @param {string} userInput - 用户输入
 * @param {string} reference - 参考答案（可选）
 * @param {Object} options - 评分选项
 * @returns {Object} 评分结果
 */
export function gradeWriting(userInput, reference = null, options = {}) {
    const analysis = {
        wordCount: countWords(userInput),
        charCount: userInput.length,
        dimensions: {},
        details: {}
    };
    
    // 各维度评分
    analysis.dimensions.creativity = scoreCreativity(userInput, analysis);
    analysis.dimensions.fluency = scoreFluency(userInput, analysis);
    analysis.dimensions.complexity = scoreComplexity(userInput, analysis);
    analysis.dimensions.accuracy = scoreAccuracy(userInput, analysis);
    analysis.dimensions.completeness = scoreCompleteness(userInput, reference, analysis);
    
    // 计算总分
    const total = calculateWeightedScore(analysis.dimensions);
    
    // 生成评语
    const comment = generateComment(analysis.dimensions, total);
    
    return {
        score: Math.round(total),
        dimensions: analysis.dimensions,
        details: analysis.details,
        comment,
        wordCount: analysis.wordCount,
        analysis
    };
}

/**
 * 计算加权总分
 * @param {Object} dimensions
 * @returns {number}
 */
function calculateWeightedScore(dimensions) {
    let total = 0;
    for (const [key, value] of Object.entries(dimensions)) {
        const weight = SCORING_WEIGHTS[key] || 0.2;
        total += value * weight;
    }
    return Math.min(100, Math.max(0, total));
}

// ========== 创意度评分 (25%) ==========

/**
 * 评分创意度
 * @param {string} text
 * @param {Object} analysis
 * @returns {number}
 */
function scoreCreativity(text, analysis) {
    let score = 50; // 基础分
    const details = [];
    const lowerText = text.toLowerCase();
    
    // 检查独特词汇使用（非基础词汇）
    const advancedWords = [
        'fascinating', 'intriguing', 'captivating', 'mesmerizing',
        'significant', 'crucial', 'essential', 'vital',
        'demonstrate', 'illustrate', 'manifest', 'emerge',
        'contemplate', 'ponder', 'reflect', 'deliberate'
    ];
    
    const foundAdvanced = advancedWords.filter(word => lowerText.includes(word));
    score += foundAdvanced.length * 5;
    if (foundAdvanced.length > 0) {
        details.push(`使用了${foundAdvanced.length}个高级词汇`);
    }
    
    // 检查修辞手法
    const rhetoricalDevices = detectRhetoricalDevices(text);
    score += rhetoricalDevices.length * 8;
    if (rhetoricalDevices.length > 0) {
        details.push(`使用了${rhetoricalDevices.length}种修辞手法`);
    }
    
    // 检查独特表达（不常见搭配）
    const uniqueExpressions = detectUniqueExpressions(text);
    score += uniqueExpressions.length * 4;
    
    // 检查多样性（词汇不重复）
    const vocabularyDiversity = calculateVocabularyDiversity(text);
    score += vocabularyDiversity.score;
    details.push(`词汇多样性: ${vocabularyDiversity.ratio.toFixed(2)}`);
    
    analysis.details.creativity = details;
    return Math.min(100, score);
}

/**
 * 检测修辞手法
 * @param {string} text
 * @returns {Array}
 */
function detectRhetoricalDevices(text) {
    const devices = [];
    const lowerText = text.toLowerCase();
    
    // 明喻
    if (/\blike\s+a\b|\bas\s+\w+\s+as\b/.test(lowerText)) {
        devices.push({ type: 'simile', name: '明喻' });
    }
    
    // 隐喻
    const metaphorPatterns = [
        /\bis\s+a\s+\w+\s+of/,
        /\b(the|a)\s+\w+\s+of\s+\w+/,
        /\b\w+\s+is\s+my\s+\w+/
    ];
    if (metaphorPatterns.some(p => p.test(text))) {
        devices.push({ type: 'metaphor', name: '隐喻' });
    }
    
    // 排比
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length >= 3) {
        const patterns = sentences.map(s => s.trim().split(' ')[0].toLowerCase());
        const repetition = patterns.filter((p, i) => patterns.indexOf(p) !== i);
        if (repetition.length > 0) {
            devices.push({ type: 'parallelism', name: '排比' });
        }
    }
    
    // 头韵
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
        if (words[i][0]?.toLowerCase() === words[i + 1][0]?.toLowerCase() && 
            words[i].length > 3 && words[i + 1].length > 3) {
            devices.push({ type: 'alliteration', name: '头韵' });
            break;
        }
    }
    
    return devices;
}

/**
 * 检测独特表达
 * @param {string} text
 * @returns {Array}
 */
function detectUniqueExpressions(text) {
    const expressions = [];
    const uniquePatterns = [
        /\bthe\s+more.*the\s+more/i, // the more...the more
        /\bnot\s+only.*but\s+also/i, // not only...but also
        /\bit\s+is.*that/i, // it is...that强调句
        /\bwhat\s+.*is/i, // what引导的名词性从句
        /\bthere\s+(is|are|was|were)/i // there be句型
    ];
    
    uniquePatterns.forEach(pattern => {
        if (pattern.test(text)) {
            expressions.push(pattern.toString());
        }
    });
    
    return expressions;
}

/**
 * 计算词汇多样性
 * @param {string} text
 * @returns {Object}
 */
function calculateVocabularyDiversity(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    const ratio = words.length > 0 ? uniqueWords.length / words.length : 0;
    
    return {
        ratio,
        unique: uniqueWords.length,
        total: words.length,
        score: Math.min(20, Math.round(ratio * 40))
    };
}

// ========== 流畅度评分 (25%) ==========

/**
 * 评分流畅度
 * @param {string} text
 * @param {Object} analysis
 * @returns {number}
 */
function scoreFluency(text, analysis) {
    let score = 80; // 基础分较高
    const details = [];
    const issues = [];
    
    // 检查语法错误
    const grammarIssues = checkGrammarIssues(text);
    score -= grammarIssues.length * 8;
    issues.push(...grammarIssues);
    
    // 检查流畅度标记
    const fluencyMarkers = checkFluencyMarkers(text);
    score += fluencyMarkers.bonus;
    if (fluencyMarkers.positive.length > 0) {
        details.push(...fluencyMarkers.positive);
    }
    
    // 检查句子长度平衡
    const sentenceBalance = checkSentenceBalance(text);
    score += sentenceBalance.score;
    details.push(`句子长度平衡度: ${sentenceBalance.rating}`);
    
    // 检查连接词使用
    const transitionUsage = checkTransitionUsage(text);
    score += transitionUsage.score;
    if (transitionUsage.variety > 3) {
        details.push(`使用了${transitionUsage.variety}种连接词`);
    }
    
    analysis.details.fluency = details;
    analysis.details.fluencyIssues = issues;
    
    return Math.max(40, Math.min(100, score));
}

/**
 * 检查语法问题
 * @param {string} text
 * @returns {Array}
 */
function checkGrammarIssues(text) {
    const issues = [];
    
    // 检查大小写
    if (text[0] !== text[0]?.toUpperCase()) {
        issues.push({ type: 'capitalization', message: '句首未大写' });
    }
    
    // 检查标点
    if (!/[.!?。！？]$/.test(text.trim())) {
        issues.push({ type: 'punctuation', message: '缺少句末标点' });
    }
    
    // 检查连续重复词
    const repeatedPattern = /\b(\w+)\s+\1\b/gi;
    const repeated = text.match(repeatedPattern);
    if (repeated) {
        issues.push({ type: 'repetition', message: `重复使用了"${repeated[0]}"` });
    }
    
    return issues;
}

/**
 * 检查流畅度标记
 * @param {string} text
 * @returns {Object}
 */
function checkFluencyMarkers(text) {
    const positive = [];
    let bonus = 0;
    const lowerText = text.toLowerCase();
    
    // 好的连接词使用
    const goodTransitions = [
        'however', 'therefore', 'furthermore', 'moreover',
        'nevertheless', 'consequently', 'meanwhile'
    ];
    const foundTransitions = goodTransitions.filter(t => lowerText.includes(t));
    if (foundTransitions.length > 0) {
        positive.push(`流畅的连接词: ${foundTransitions.join(', ')}`);
        bonus += foundTransitions.length * 2;
    }
    
    // 检查指代一致性（简单检查）
    const pronouns = text.match(/\b(he|she|it|they|this|that|these|those)\b/gi);
    if (pronouns && pronouns.length > 0) {
        bonus += 2;
        positive.push('使用了恰当的指代');
    }
    
    return { positive, bonus };
}

/**
 * 检查句子长度平衡
 * @param {string} text
 * @returns {Object}
 */
function checkSentenceBalance(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return { score: 0, rating: '不足' };
    
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // 标准差适中表示平衡
    let score = 0;
    let rating = '';
    
    if (stdDev < 3) {
        score = 10;
        rating = '非常平衡';
    } else if (stdDev < 6) {
        score = 5;
        rating = '较为平衡';
    } else {
        score = 0;
        rating = '需要调整';
    }
    
    return { score, rating, avg: avg.toFixed(1), stdDev: stdDev.toFixed(1) };
}

/**
 * 检查连接词使用
 * @param {string} text
 * @returns {Object}
 */
function checkTransitionUsage(text) {
    const transitions = {
        additive: ['also', 'furthermore', 'moreover', 'in addition'],
        adversative: ['however', 'nevertheless', 'nonetheless', 'on the contrary'],
        causal: ['therefore', 'consequently', 'thus', 'as a result'],
        sequential: ['first', 'second', 'then', 'next', 'finally'],
        exemplifying: ['for example', 'for instance', 'such as']
    };
    
    const lowerText = text.toLowerCase();
    const foundTypes = [];
    let totalCount = 0;
    
    for (const [type, words] of Object.entries(transitions)) {
        const found = words.filter(w => lowerText.includes(w));
        if (found.length > 0) {
            foundTypes.push(type);
            totalCount += found.length;
        }
    }
    
    return {
        variety: foundTypes.length,
        count: totalCount,
        types: foundTypes,
        score: Math.min(10, foundTypes.length * 3)
    };
}

// ========== 复杂度评分 (20%) ==========

/**
 * 评分复杂度
 * @param {string} text
 * @param {Object} analysis
 * @returns {number}
 */
function scoreComplexity(text, analysis) {
    let score = 40; // 基础分
    const details = [];
    const lowerText = text.toLowerCase();
    
    // 检查从句使用
    const clauses = detectClauses(text);
    score += clauses.length * 8;
    if (clauses.length > 0) {
        details.push(`使用了${clauses.length}种从句`);
    }
    
    // 检查句式多样性
    const sentencePatterns = detectSentencePatterns(text);
    score += sentencePatterns.length * 5;
    if (sentencePatterns.length > 2) {
        details.push(`${sentencePatterns.length}种不同句式`);
    }
    
    // 检查平均词长（反映词汇复杂度）
    const avgWordLength = calculateAvgWordLength(text);
    if (avgWordLength > 5) {
        score += 5;
        details.push(`平均词长${avgWordLength.toFixed(1)}，词汇较复杂`);
    }
    
    // 检查非谓语动词使用
    const nonFiniteVerbs = detectNonFiniteVerbs(text);
    score += nonFiniteVerbs.length * 3;
    if (nonFiniteVerbs.length > 0) {
        details.push(`使用了非谓语动词`);
    }
    
    analysis.details.complexity = details;
    return Math.min(100, score);
}

/**
 * 检测从句
 * @param {string} text
 * @returns {Array}
 */
function detectClauses(text) {
    const clauses = [];
    const patterns = [
        { pattern: /\b(that|which|who|whom|whose)\b/gi, name: '定语从句' },
        { pattern: /\b(when|while|as|before|after|since|until)\b/gi, name: '状语从句' },
        { pattern: /\b(because|since|as|for)\b.*\b(so|therefore)\b|\b(so|therefore)\b.*\b(because|since)\b/gi, name: '因果从句' },
        { pattern: /\b(if|unless|provided that|as long as)\b/gi, name: '条件从句' },
        { pattern: /\b(although|though|even though|even if)\b/gi, name: '让步从句' },
        { pattern: /\b(what|whatever|whoever|whichever)\b/gi, name: '名词性从句' }
    ];
    
    patterns.forEach(({ pattern, name }) => {
        if (pattern.test(text)) {
            clauses.push(name);
        }
    });
    
    return clauses;
}

/**
 * 检测句式模式
 * @param {string} text
 * @returns {Array}
 */
function detectSentencePatterns(text) {
    const patterns = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        
        // 倒装句
        if (/^(never|seldom|rarely|hardly|scarcely|no sooner|not only|only|so|such)/i.test(trimmed)) {
            patterns.push('inversion');
        }
        // 强调句
        else if (/^it\s+is/i.test(trimmed) && /that/i.test(trimmed)) {
            patterns.push('cleft');
        }
        // 被动句
        else if (/\b(is|are|was|were|been|being)\s+\w+ed\b/i.test(trimmed)) {
            patterns.push('passive');
        }
        // 祈使句
        else if (/^\w+\s+/.test(trimmed) && !/^(I|you|he|she|it|we|they|the|a|an)/i.test(trimmed)) {
            patterns.push('imperative');
        }
        else {
            patterns.push('declarative');
        }
    });
    
    return [...new Set(patterns)];
}

/**
 * 计算平均词长
 * @param {string} text
 * @returns {number}
 */
function calculateAvgWordLength(text) {
    const words = text.match(/\b[a-zA-Z]+\b/g) || [];
    if (words.length === 0) return 0;
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return totalLength / words.length;
}

/**
 * 检测非谓语动词
 * @param {string} text
 * @returns {Array}
 */
function detectNonFiniteVerbs(text) {
    const nonFinite = [];
    const patterns = [
        { pattern: /\b\w+ing\b(?!\s+is|\s+are)/, name: '现在分词' },
        { pattern: /\b\w+ed\b\s+\w+/, name: '过去分词' },
        { pattern: /\bto\s+\w+\b/, name: '不定式' }
    ];
    
    patterns.forEach(({ pattern, name }) => {
        if (pattern.test(text)) {
            nonFinite.push(name);
        }
    });
    
    return nonFinite;
}

// ========== 准确性评分 (20%) ==========

/**
 * 评分准确性
 * @param {string} text
 * @param {Object} analysis
 * @returns {number}
 */
function scoreAccuracy(text, analysis) {
    let score = 90; // 基础分很高
    const details = [];
    const errors = [];
    
    // 拼写检查（简化版）
    const spellingIssues = checkSpelling(text);
    score -= spellingIssues.length * 5;
    errors.push(...spellingIssues);
    
    // 语法检查
    const grammarIssues = checkGrammar(text);
    score -= grammarIssues.length * 6;
    errors.push(...grammarIssues);
    
    // 标点检查
    const punctuationIssues = checkPunctuation(text);
    score -= punctuationIssues.length * 3;
    errors.push(...punctuationIssues);
    
    // 一致性检查
    const consistencyIssues = checkConsistency(text);
    score -= consistencyIssues.length * 4;
    errors.push(...consistencyIssues);
    
    if (errors.length === 0) {
        details.push('没有明显的语法错误！');
    } else {
        details.push(`发现${errors.length}处可以改进的地方`);
    }
    
    analysis.details.accuracy = details;
    analysis.details.errors = errors.slice(0, 3); // 只显示前3个错误
    
    return Math.max(50, Math.min(100, score));
}

/**
 * 检查拼写（简化）
 * @param {string} text
 * @returns {Array}
 */
function checkSpelling(text) {
    // 实际应用中应该调用拼写检查API
    // 这里只做简单的常见错误检查
    const commonMisspellings = [
        { wrong: 'teh', correct: 'the' },
        { wrong: 'recieve', correct: 'receive' },
        { wrong: 'seperate', correct: 'separate' },
        { wrong: 'occured', correct: 'occurred' },
        { wrong: 'definately', correct: 'definitely' }
    ];
    
    const issues = [];
    const lowerText = text.toLowerCase();
    
    commonMisspellings.forEach(({ wrong, correct }) => {
        if (lowerText.includes(wrong)) {
            issues.push({ type: 'spelling', word: wrong, suggestion: correct });
        }
    });
    
    return issues;
}

/**
 * 检查语法
 * @param {string} text
 * @returns {Array}
 */
function checkGrammar(text) {
    const issues = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    sentences.forEach((sentence, index) => {
        const trimmed = sentence.trim();
        
        // 检查主谓一致（简化规则）
        const heSheItPattern = /\b(he|she|it)\s+(go|do|have|make|eat|play|work|live)/i;
        if (heSheItPattern.test(trimmed)) {
            const match = trimmed.match(heSheItPattern);
            if (match && !match[2].endsWith('s') && !match[2].endsWith('es')) {
                issues.push({
                    type: 'subject-verb-agreement',
                    message: `第${index + 1}句：第三人称单数动词应加-s/-es`,
                    suggestion: `${match[2]} → ${match[2]}s`
                });
            }
        }
        
        // 检查冠词使用
        if (/\b(a)\s+[aeiou]/i.test(trimmed)) {
            issues.push({
                type: 'article',
                message: `第${index + 1}句：元音前应用"an"`,
                suggestion: 'a → an'
            });
        }
    });
    
    return issues;
}

/**
 * 检查标点
 * @param {string} text
 * @returns {Array}
 */
function checkPunctuation(text) {
    const issues = [];
    
    // 缺少句末标点
    if (!/[.!?。！？]$/.test(text.trim())) {
        issues.push({ type: 'punctuation', message: '缺少句末标点' });
    }
    
    // 空格问题
    if (/\w\s{2,}\w/.test(text)) {
        issues.push({ type: 'spacing', message: '多余的空格' });
    }
    
    // 标点前空格
    if (/\s+[.!?。！？,;:，；：]/.test(text)) {
        issues.push({ type: 'spacing', message: '标点前不应有空格' });
    }
    
    return issues;
}

/**
 * 检查一致性
 * @param {string} text
 * @returns {Array}
 */
function checkConsistency(text) {
    const issues = [];
    const lowerText = text.toLowerCase();
    
    // 时态一致性（简单检查）
    const pastTense = /\b(was|were|had|did|went|came|saw|did)\b/i.test(lowerText);
    const presentTense = /\b(is|are|am|do|does|go|come|see)\b/i.test(lowerText);
    
    if (pastTense && presentTense) {
        // 可能有意识地在对比过去和现在，不算错误
        // issues.push({ type: 'tense', message: '注意时态一致性' });
    }
    
    return issues;
}

// ========== 完整度评分 (10%) ==========

/**
 * 评分完整度
 * @param {string} text
 * @param {string} reference
 * @param {Object} analysis
 * @returns {number}
 */
function scoreCompleteness(text, reference, analysis) {
    let score = 70; // 基础分
    const details = [];
    
    // 检查字数
    const wordCount = analysis.wordCount;
    if (wordCount >= 10) {
        score += 15;
        details.push(`字数充足(${wordCount}词)`);
    } else if (wordCount >= 5) {
        score += 5;
        details.push(`字数适中(${wordCount}词)`);
    } else {
        score -= 10;
        details.push(`内容较短(${wordCount}词)，可以尝试扩充`);
    }
    
    // 检查是否完整回答问题（如果有参考答案）
    if (reference) {
        const similarity = calculateSimilarity(text.toLowerCase(), reference.toLowerCase());
        const coverage = Math.min(100, similarity * 100);
        
        if (coverage > 80) {
            score += 15;
            details.push('很好地回应了要点');
        } else if (coverage > 50) {
            score += 5;
            details.push('基本回应了要点');
        } else {
            details.push('可以尝试包含更多要点');
        }
    }
    
    // 检查是否有开头和结尾
    const hasIntroduction = /^\w{5,}/.test(text);
    const hasConclusion = /[.!?。！？]$/.test(text.trim());
    
    if (hasIntroduction && hasConclusion) {
        score += 5;
        details.push('结构完整');
    }
    
    analysis.details.completeness = details;
    return Math.min(100, score);
}

// ========== 评语生成 ==========

/**
 * 生成评语
 * @param {Object} dimensions
 * @param {number} total
 * @returns {string}
 */
function generateComment(dimensions, total) {
    const { creativity, fluency, complexity, accuracy, completeness } = dimensions;
    
    // 找出最高分维度
    const maxDimension = Object.entries(dimensions).reduce((max, [key, val]) => 
        val > max.value ? { name: key, value: val } : max
    , { name: '', value: 0 });
    
    const dimensionNames = {
        creativity: '创意',
        fluency: '流畅度',
        complexity: '复杂度',
        accuracy: '准确性',
        completeness: '完整度'
    };
    
    let comment = '';
    
    if (total >= 90) {
        comment = `太棒了！你的${dimensionNames[maxDimension.name]}尤其出色。`;
    } else if (total >= 80) {
        comment = `很好！${dimensionNames[maxDimension.name]}是你的亮点。`;
    } else if (total >= 70) {
        comment = `不错！在${dimensionNames[maxDimension.name]}方面表现很好，继续加油。`;
    } else if (total >= 60) {
        comment = `还可以，试试提升${dimensionNames[Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0][0]]}。`;
    } else {
        comment = '继续练习，你会越来越好的！';
    }
    
    return comment;
}

// ========== 导出默认对象 ==========
export default {
    gradeWriting,
    scoreCreativity,
    scoreFluency,
    scoreComplexity,
    scoreAccuracy,
    scoreCompleteness
};
