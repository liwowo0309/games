/**
 * English Writing Studio - Weekly Report Component
 * 创作周刊组件
 */

import { $, $$, show, hide } from '../utils.js';
import { state } from '../state.js';

// ========== 渲染周刊 ==========
export function render() {
    const report = generateWeeklyReport();
    
    return `
        <div id="weeklyReportComponent" class="weekly-report">
            <div class="weekly-report-header">
                <h2 class="weekly-report-title">📊 创作周刊</h2>
                <p class="weekly-report-subtitle">这是你本周的写作成就，继续保持！</p>
                <span class="weekly-report-date">${report.dateRange}</span>
            </div>

            <!-- 统计数据 -->
            <div class="weekly-stats-grid">
                <div class="weekly-stat-card">
                    <div class="weekly-stat-value">${report.wordCount}</div>
                    <div class="weekly-stat-label">写作词数</div>
                    <div class="weekly-stat-change ${report.wordChange >= 0 ? 'positive' : 'negative'}">
                        ${report.wordChange >= 0 ? '↑' : '↓'} ${Math.abs(report.wordChange)}%
                    </div>
                </div>
                <div class="weekly-stat-card">
                    <div class="weekly-stat-value">${report.sentenceCount}</div>
                    <div class="weekly-stat-label">创作句子</div>
                    <div class="weekly-stat-change positive">
                        +${report.newSentences} 新增
                    </div>
                </div>
                <div class="weekly-stat-card">
                    <div class="weekly-stat-value">${report.avgScore}</div>
                    <div class="weekly-stat-label">平均得分</div>
                    <div class="weekly-stat-change ${report.scoreChange >= 0 ? 'positive' : 'negative'}">
                        ${report.scoreChange >= 0 ? '↑' : '↓'} ${Math.abs(report.scoreChange)}
                    </div>
                </div>
                <div class="weekly-stat-card">
                    <div class="weekly-stat-value">${report.streakDays}</div>
                    <div class="weekly-stat-label">连续打卡</div>
                    <div class="weekly-stat-change positive">
                        ${report.streakDays >= 7 ? '🔥 很棒！' : '继续加油！'}
                    </div>
                </div>
            </div>

            <!-- 进化曲线 -->
            <div class="weekly-evolution">
                <div class="weekly-evolution-title">📈 本周进化曲线</div>
                <div class="weekly-evolution-chart">
                    ${renderEvolutionChart(report.dailyStats)}
                </div>
            </div>

            <!-- 最佳作品 -->
            ${report.bestWork ? `
                <div class="weekly-best-work">
                    <div class="weekly-best-work-title">🏆 本周最佳作品</div>
                    <div class="weekly-best-work-content">"${report.bestWork.text}"</div>
                    <div class="weekly-best-work-meta">
                        <span>得分：${report.bestWork.score}分</span>
                        <span>获得 ${report.bestWork.likes} 个赞</span>
                    </div>
                </div>
            ` : ''}

            <!-- 新成就 -->
            ${report.newAchievements.length > 0 ? `
                <div class="weekly-achievements">
                    <div class="weekly-achievements-title">🎉 本周解锁成就</div>
                    <div class="achievements-list">
                        ${report.newAchievements.map(ach => `
                            <div class="achievement-badge">
                                <div class="achievement-badge-icon">${ach.icon}</div>
                                <div class="achievement-badge-info">
                                    <div class="achievement-badge-name">${ach.name}</div>
                                    <div class="achievement-badge-desc">${ach.desc}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- 分享按钮 -->
            <div class="weekly-share">
                <div class="weekly-share-title">📤 分享你的成就</div>
                <div class="weekly-share-buttons">
                    <button class="share-btn share-btn-wechat" id="shareWechatBtn">💬 分享到微信</button>
                    <button class="share-btn share-btn-copy" id="shareCopyBtn">📋 复制周报</button>
                </div>
            </div>
        </div>
    `;
}

// ========== 生成周刊数据 ==========
function generateWeeklyReport() {
    const now = new Date();
    const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    // 计算本周数据
    const weekCreations = state.gallery.myCreations.filter(c => 
        c.createdAt >= weekStart.getTime()
    );
    
    const wordCount = weekCreations.reduce((sum, c) => {
        return sum + (c.text?.split(/\s+/).length || 0);
    }, 0);
    
    // 模拟一些统计数据
    return {
        dateRange: `${formatDate(weekStart)} - ${formatDate(now)}`,
        wordCount: wordCount || Math.floor(Math.random() * 500) + 100,
        wordChange: Math.floor(Math.random() * 40) - 10,
        sentenceCount: weekCreations.length || Math.floor(Math.random() * 20) + 5,
        newSentences: weekCreations.length || Math.floor(Math.random() * 10) + 2,
        avgScore: Math.floor(Math.random() * 20) + 75,
        scoreChange: Math.floor(Math.random() * 10) - 3,
        streakDays: state.streak.current || Math.floor(Math.random() * 5) + 1,
        dailyStats: generateDailyStats(),
        bestWork: weekCreations.length > 0 ? {
            text: weekCreations[0].text,
            score: Math.floor(Math.random() * 20) + 80,
            likes: Math.floor(Math.random() * 30)
        } : null,
        newAchievements: checkNewAchievements()
    };
}

// ========== 生成每日统计 ==========
function generateDailyStats() {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days.map(day => ({
        day,
        value: Math.floor(Math.random() * 80) + 20
    }));
}

// ========== 检查新成就 ==========
function checkNewAchievements() {
    const achievements = [];
    
    // 根据本周表现生成成就
    if (state.streak.current >= 7) {
        achievements.push({ icon: '🔥', name: '坚持不懈', desc: '连续打卡7天' });
    }
    
    if (state.gallery.myCreations.length >= 10) {
        achievements.push({ icon: '✍️', name: '文思泉涌', desc: '创作10个句子' });
    }
    
    if (state.gallery.likes.length >= 10) {
        achievements.push({ icon: '⭐', name: '小有名气', desc: '获得10个赞' });
    }
    
    // 如果没有真实成就，显示示例
    if (achievements.length === 0) {
        achievements.push(
            { icon: '📝', name: '初出茅庐', desc: '创作第一个句子' }
        );
    }
    
    return achievements;
}

// ========== 渲染进化曲线 ==========
function renderEvolutionChart(dailyStats) {
    const maxValue = Math.max(...dailyStats.map(d => d.value));
    
    return dailyStats.map(stat => `
        <div class="evolution-bar" style="height: ${(stat.value / maxValue) * 100}%;" title="${stat.day}: ${stat.value}分">
            <div class="evolution-bar-label">${stat.day.slice(1)}</div>
        </div>
    `).join('');
}

// ========== 初始化周刊 ==========
export function init() {
    bindEvents();
    console.log('Weekly report initialized');
}

// ========== 绑定事件 ==========
function bindEvents() {
    $('#shareWechatBtn')?.addEventListener('click', () => {
        shareReport('wechat');
    });
    
    $('#shareCopyBtn')?.addEventListener('click', () => {
        shareReport('copy');
    });
}

// ========== 分享周报 ==========
function shareReport(type) {
    const reportText = generateShareText();
    
    if (type === 'wechat') {
        // 生成分享图片（简化版）
        alert('生成分享图片中...\n\n' + reportText);
    } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(reportText).then(() => {
            alert('周报已复制到剪贴板！');
        }).catch(() => {
            alert(reportText);
        });
    }
}

// ========== 生成分享文本 ==========
function generateShareText() {
    return `【English Writing Studio 创作周刊】

本周我创作了 ${state.gallery.myCreations.length || 0} 个句子
连续打卡 ${state.streak.current || 0} 天
平均得分 ${Math.floor(Math.random() * 20) + 75} 分

坚持练习，每天进步一点点！💪

快来一起学习英语写作吧！`;
}

// ========== 格式化日期 ==========
function formatDate(date) {
    const d = new Date(date);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ========== 清理函数 ==========
export function cleanup() {
    // 清理工作
}

export default { render, init, cleanup };
