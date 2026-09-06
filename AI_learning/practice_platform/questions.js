/**
 * 表情特工学院 · 闯关题库
 * 参考信息素养大赛决赛「人脸表情识别」实操样题
 */

const EMOTIONS = [
  { key: "happy", label: "喜悦" },
  { key: "angry", label: "愤怒" },
  { key: "sad", label: "悲伤" },
  { key: "surprised", label: "惊喜" },
  { key: "fearful", label: "恐惧" },
  { key: "disgusted", label: "厌恶" },
  { key: "neutral", label: "平静" },
];

function labelOf(key) {
  const found = EMOTIONS.find((e) => e.key === key);
  return found ? found.label : key;
}

const LEVELS = [
  {
    id: "lv1",
    stage: 1,
    icon: "😊",
    title: "微笑训练营",
    subtitle: "学会让 AI 认出「喜悦」",
    story:
      "小智导师：特工新人，第一课很简单——对着镜头开心笑一笑。AI 看脸时，会给每种表情打一个「置信度」分数。",
    tip: "置信度越高，AI 越确定那是该表情。嘴角上扬、露出牙齿，更容易被识别为「喜悦」。",
    mission: "主表情为「喜悦」，且喜悦置信度 ≥ 45%。最多识别 4 次。",
    prompt:
      "请拍摄人脸完成表情识别，面部表情识别结果为「喜悦」，且「喜悦」置信度需不低于 45%，全程识别操作次数不可超过 4 次。",
    learnAfter: "你学会了：AI 用百分比表示「有多确定」。想提高分数，就让表情更明显一点。",
    maxAttempts: 4,
    scoring: [
      "主表情为「喜悦」且喜悦 ≥ 45% 即可通关。",
      "剩余次数越多，星级越高（3星 / 2星 / 1星）。",
      "微笑时嘴角上扬、露出牙齿更容易成功。",
    ],
    check(result) {
      const happy = result.expressions.happy;
      const pass = result.topEmotion === "happy" && happy >= 0.45;
      if (!pass) {
        return {
          pass: false,
          message: `当前喜悦 ${(happy * 100).toFixed(1)}%，最高是「${labelOf(result.topEmotion)}」。再开心地笑一笑！`,
        };
      }
      return { pass: true, message: "太棒了！AI 认出了你的喜悦。" };
    },
  },
  {
    id: "lv2",
    stage: 2,
    icon: "😌",
    title: "平静湖畔",
    subtitle: "学会放松面部",
    story:
      "小智导师：有时候比赛会要求「平静」。这关练的是——不笑、不夸张，让脸自然放松。",
    tip: "「平静」不等于没表情，而是面部肌肉放松。光线均匀、正对摄像头，分数更稳。",
    mission: "主表情为「平静」，且平静 ≥ 55%。最多识别 4 次。",
    prompt:
      "请拍摄人脸完成表情识别，面部表情识别结果为「平静」，且「平静」置信度需不低于 55%，全程识别操作次数不可超过 4 次。",
    learnAfter: "你学会了：同样一张脸，表情一变，AI 的判断就会变。输入变了，输出也会变。",
    maxAttempts: 4,
    scoring: [
      "主表情为「平静」且平静 ≥ 55% 通关。",
      "尽量放松面部，不要微笑或张嘴。",
      "次数越少星级越高。",
    ],
    check(result) {
      const neutral = result.expressions.neutral;
      const pass = result.topEmotion === "neutral" && neutral >= 0.55;
      if (!pass) {
        return {
          pass: false,
          message: `当前平静 ${(neutral * 100).toFixed(1)}%。请放松面部、自然看镜头。`,
        };
      }
      return { pass: true, message: "湖面一样平静——通关！" };
    },
  },
  {
    id: "lv3",
    stage: 3,
    icon: "😲",
    title: "惊喜洞窟",
    subtitle: "第一次挑战「惊喜」",
    story:
      "小智导师：决赛样题常考「惊喜」。睁大眼睛、嘴巴微张——但别用力过猛，否则其它表情会抢戏。",
    tip: "惊喜 ≈ 睁大眼 + 嘴巴张开。练的时候可以对着镜子先找感觉，再面对摄像头。",
    mission: "主表情为「惊喜」，且惊喜 ≥ 35%。最多识别 4 次。",
    prompt:
      "请拍摄人脸完成表情识别，面部表情识别结果为「惊喜」，且「惊喜」置信度需不低于 35%，全程识别操作次数不可超过 4 次。",
    learnAfter: "你学会了：一个任务往往对应一个「主表情」。主表情 = 置信度最高的那一项。",
    maxAttempts: 4,
    scoring: [
      "主表情为「惊喜」且惊喜 ≥ 35% 通关。",
      "睁大眼、嘴微张；过度夸张可能被判成其它表情。",
    ],
    check(result) {
      const surprise = result.expressions.surprised;
      const pass = result.topEmotion === "surprised" && surprise >= 0.35;
      if (!pass) {
        return {
          pass: false,
          message: `当前惊喜 ${(surprise * 100).toFixed(1)}%，最高「${labelOf(result.topEmotion)}」。再试一次惊喜表情！`,
        };
      }
      return { pass: true, message: "惊喜洞窟亮起了——成功！" };
    },
  },
  {
    id: "lv4",
    stage: 4,
    icon: "🎯",
    title: "样题试炼",
    subtitle: "惊喜 + 平静≥20%（决赛同款）",
    story:
      "小智导师：这一关几乎就是决赛真题套路——既要「惊喜」当主表情，又要「平静」别太低。难度上来了！",
    tip: "诀窍：惊喜要够，但别夸张到把平静压没。略微睁眼张嘴，保持一点自然感。",
    mission: "主表情「惊喜」（建议≥35%），且「平静」≥20%。最多 3 次。",
    prompt:
      "请拍摄人脸完成表情识别，面部表情识别结果为「惊喜」，且「平静」置信度需不低于 20%，全程识别操作次数不可超过 3 次。",
    learnAfter: "你学会了：决赛经常「主条件 + 附加条件」一起考。读题时把两个条件都圈出来。",
    maxAttempts: 3,
    scoring: [
      "主表情为「惊喜」（惊喜最高且 ≥ 35%）。",
      "「平静」置信度 ≥ 20%。",
      "识别次数 ≤ 3；两次都满足才通关。",
      "这是最接近决赛样题的一关！",
    ],
    check(result) {
      const surprise = result.expressions.surprised;
      const calm = result.expressions.neutral;
      const topOk = result.topEmotion === "surprised" && surprise >= 0.35;
      const calmOk = calm >= 0.2;
      if (topOk && calmOk) {
        return { pass: true, message: "样题试炼通过！你已经摸到决赛手感了。" };
      }
      if (topOk) {
        return {
          pass: false,
          message: `惊喜达标，但平静仅 ${(calm * 100).toFixed(1)}%（需≥20%）。表情稍微收一点再试。`,
        };
      }
      return {
        pass: false,
        message: `最高是「${labelOf(result.topEmotion)}」。需要惊喜为主，同时保留一点平静。`,
      };
    },
  },
  {
    id: "lv5",
    stage: 5,
    icon: "🌈",
    title: "双情峡谷",
    subtitle: "惊喜里再加一点喜悦",
    story:
      "小智导师：有的题目会要求两种表情同时出现。这关练「惊喜为主，喜悦别太低」。",
    tip: "可以想成：收到礼物又惊又喜——眼睛睁大，嘴角带一点笑。",
    mission: "主表情「惊喜」（≥30%），且「喜悦」≥10%。最多 4 次。",
    prompt:
      "请拍摄人脸完成表情识别，面部表情识别结果为「惊喜」，且「喜悦」置信度需不低于 10%，全程识别操作次数不可超过 4 次。",
    learnAfter: "你学会了：附加条件不一定是「平静」，也可能是喜悦、悲伤等。一定要看清题干。",
    maxAttempts: 4,
    scoring: [
      "主表情为「惊喜」且惊喜 ≥ 30%。",
      "「喜悦」≥ 10%。",
      "惊喜又带笑意，两者兼顾。",
    ],
    check(result) {
      const surprise = result.expressions.surprised;
      const happy = result.expressions.happy;
      const topOk = result.topEmotion === "surprised" && surprise >= 0.3;
      const happyOk = happy >= 0.1;
      if (topOk && happyOk) {
        return { pass: true, message: "双情峡谷跨越成功！" };
      }
      if (topOk) {
        return {
          pass: false,
          message: `惊喜够了，喜悦只有 ${(happy * 100).toFixed(1)}%。加点笑意！`,
        };
      }
      return {
        pass: false,
        message: `需要惊喜为主。当前最高「${labelOf(result.topEmotion)}」。`,
      };
    },
  },
  {
    id: "lv6",
    stage: 6,
    icon: "🌧️",
    title: "悲伤迷雾",
    subtitle: "控制次数与表情强度",
    story:
      "小智导师：悲伤不一定要哭。轻微皱眉、嘴角下垂就行。记住：次数有限，一次识别都珍贵。",
    tip: "决赛会限制识别次数。先摆好表情，再点按钮——不要慌乱连点。",
    mission: "主表情「悲伤」，悲伤 ≥ 35%。最多 3 次。",
    prompt:
      "请拍摄人脸完成表情识别，面部表情识别结果为「悲伤」，且「悲伤」置信度需不低于 35%，全程识别操作次数不可超过 3 次。",
    learnAfter: "你学会了：次数也是评分规则的一部分。先准备，再识别，成功率更高。",
    maxAttempts: 3,
    scoring: [
      "主表情为「悲伤」且悲伤 ≥ 35% 通关。",
      "轻微皱眉、嘴角下垂即可，不必过度夸张。",
      "最多 3 次——想清楚再点。",
    ],
    check(result) {
      const sad = result.expressions.sad;
      const pass = result.topEmotion === "sad" && sad >= 0.35;
      if (!pass) {
        return {
          pass: false,
          message: `当前悲伤 ${(sad * 100).toFixed(1)}%。轻微做出悲伤表情后再识别。`,
        };
      }
      return { pass: true, message: "迷雾散开，通关！" };
    },
  },
  {
    id: "lv7",
    stage: 7,
    icon: "🏆",
    title: "特工毕业考",
    subtitle: "高标准喜悦挑战",
    story:
      "小智导师：最后一关！把「喜悦」拉到更高置信度。毕业后，你就能更从容地面对决赛实操界面了。",
    tip: "回顾全程：读题 → 看清主表情与附加条件 → 控制次数 → 看右侧置信度条调整。",
    mission: "主表情「喜悦」，喜悦 ≥ 60%。最多 3 次。",
    prompt:
      "请拍摄人脸完成表情识别，面部表情识别结果为「喜悦」，且「喜悦」置信度需不低于 60%，全程识别操作次数不可超过 3 次。",
    learnAfter: "毕业知识：决赛平台会自动判分。你要做的是理解规则、稳定操作、读懂置信度。",
    maxAttempts: 3,
    scoring: [
      "主表情为「喜悦」且喜悦 ≥ 60%。",
      "这是毕业考，标准更高，次数更紧。",
      "露出灿烂笑容，一次过关拿满星！",
    ],
    check(result) {
      const happy = result.expressions.happy;
      const pass = result.topEmotion === "happy" && happy >= 0.6;
      if (!pass) {
        return {
          pass: false,
          message: `当前喜悦 ${(happy * 100).toFixed(1)}%（需≥60%）。再灿烂一点！`,
        };
      }
      return { pass: true, message: "毕业考通过！你是合格的表情特工！" };
    },
  },
];
