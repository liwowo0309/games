# English Writing Studio

让每个孩子都能写出让自己骄傲的英文

## 项目概述

English Writing Studio 是一款专为8-18岁中国青少年设计的英语写作智能训练平台。产品以"scaffolding（支架式教学）"为核心理念，通过六大模块化训练，帮助学生从基础句子构建到复杂篇章写作，系统化提升英语写作能力。

## 功能模块

### 1. 句子变形记 ✨
给简单句施魔法，看它如何一步步变得更酷、更有故事感
- 关卡1：添加师（形容词/副词）
- 关卡2：时间法师（时间状语）
- 关卡3：地点术士（地点状语）
- 关卡4：原因巫师（原因从句）
- 关卡5：复合大师（自由组合）

### 2. 翻译侦探社 🕵️
你是翻译侦探，把中文"案发现场"还原成最地道的英文
- 见习侦探：日常对话
- 正式侦探：校园故事
- 特级侦探：诗歌名言

### 3. 找茬大作战 🎯
帮别人检查作文里的问题，你会发现自己也在悄悄进步
- 普通模式
- 限时挑战（60秒）
- 错误盲盒

### 4. 词汇换装间 👗
给词汇换上不同风格的衣服——正式装、休闲装、华丽装
- 休闲装：日常交流风格
- 正式装：学术写作风格
- 学术装：专业论文风格
- 华丽装：文学创作风格

### 5. 句型变变变 🎭
同一个意思，用不同方式说，比谁的版本更有创意
- 主动变被动
- 直接变间接引语
- 陈述变倒装
- 强调句型
- 创意改写（诗意版/幽默版/正式版）

### 6. 连接词魔法 🪄
用魔法胶水把句子粘在一起，让文字流畅得像小溪
- 学徒：基础连接词
- 法师：进阶连接词
- 大法师：高级连接词

## 文件结构

```
yan_writing_tools/
├── index.html                  # 主入口
├── css/                        # 样式文件
│   ├── variables.css          # CSS变量
│   ├── reset.css              # 重置样式
│   ├── layout.css             # 布局样式
│   ├── components.css         # 组件样式
│   ├── feedback.css           # 反馈系统样式
│   ├── gallery.css            # 画廊样式
│   └── modules/
│       └── expansion.css      # 句子变形记样式
├── js/                         # JavaScript文件
│   ├── app.js                 # 应用入口
│   ├── router-simple.js       # 路由系统
│   ├── state.js               # 状态管理
│   ├── storage.js             # 本地存储
│   ├── utils.js               # 工具函数
│   ├── config.js              # 配置常量
│   ├── core/                  # 核心功能
│   │   ├── feedback.js        # 三明治反馈系统
│   │   └── grading.js         # 评分算法
│   ├── modules/               # 功能模块
│   │   ├── expansion.js       # 句子变形记
│   │   ├── translation.js     # 翻译侦探社
│   │   ├── grammar.js         # 找茬大作战
│   │   ├── vocabulary.js      # 词汇换装间
│   │   ├── transformation.js # 句型变变变
│   │   └── transition.js      # 连接词魔法
│   └── components/            # 社交组件
│       ├── gallery.js         # 句子画廊
│       ├── weeklyReport.js    # 创作周刊
│       └── achievements.js    # 成就中心
└── data/                      # 数据文件
    ├── expansionData.js      # 句子变形记题库
    ├── translationData.js    # 翻译题库
    ├── grammarData.js        # 语法题库
    ├── vocabularyData.js     # 词汇题库
    ├── transformationData.js # 句型转换题库
    ├── transitionData.js     # 过渡词题库
    └── galleryData.js        # 画廊示例数据
```

## 使用方法

### 本地打开

1. 直接使用浏览器打开 `index.html` 文件
2. 建议使用 Chrome、Edge 或 Firefox 浏览器
3. 由于使用了 ES 模块，建议在本地服务器环境下运行：
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 或使用 Node.js
   npx serve
   ```

### 在线部署

将所有文件上传到 Web 服务器即可。

## 核心特性

### 三明治反馈系统
每个反馈包含三层：
1. **夸赞层**：具体指出哪里写得好
2. **建议层**：给出可操作的改进建议
3. **邀请层**：邀请用户尝试改进

### 多维度评分模型
- 创意度 (25%)
- 流畅度 (25%)
- 复杂度 (20%)
- 准确性 (20%)
- 完整度 (10%)

### 社交展示系统
- 句子画廊：展示优秀作品
- 创作周刊：每周生成个人报告
- 成就系统：解锁学习成就
- 点赞收藏：互动功能

## 年级覆盖

- 小学3-6年级
- 初中1-3年级
- 高中1-3年级

## 技术栈

- HTML5
- CSS3 (CSS Variables, Flexbox, Grid)
- ES6+ JavaScript (Modules)
- LocalStorage 数据存储

## 浏览器兼容性

- Chrome 60+
- Edge 79+
- Firefox 60+
- Safari 12+

## 开发团队

York Coding

## 许可证

MIT License
