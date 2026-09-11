(function () {
  function say(npc, line, hint, words, choices, extra) {
    return Object.assign(
      {
        npc,
        line,
        hint,
        accept: [{ any: words }],
        choices: choices.map((text) => ({ text, target: true }))
      },
      extra || {}
    );
  }

  Object.assign(window.LifeEvents, {
    enterSchool: {
      id: "enterSchool",
      title: "要不要进学校",
      startNpc: "classmate",
      startRoom: "town",
      photo: { emoji: "🏫", caption: "走进教室" },
      resultKind: "school",
      packs: {
        2: [
          say("classmate", "Do you want to go to the school?", "说 Yes, I want 或 Yes", ["yes", "want", "school", "go", "ok", "okay"], ["Yes, I want.", "Yes.", "I want to go."], { enterRoom: "school", startEvent: "lesson", yesNo: true, refuseLine: "OK." })
        ],
        4: [
          say("classmate", "Do you want to go to school now?", "说 Yes, I want to go 或 Let's go", ["yes", "want", "school", "go", "let's"], ["Yes, I want to go to school.", "Let's go to school.", "Yes, I want."], { enterRoom: "school", startEvent: "lesson", yesNo: true, refuseLine: "OK." })
        ],
        6: [
          say(
            "classmate",
            "Would you like to go to school now? Why?",
            "说 Yes, I want to go to school because…",
            ["yes", "want", "school", "because", "class", "go"],
            ["Yes, I want to go to school because I have a class.", "I want to go to school now.", "Yes, I want to go."],
            { enterRoom: "school", startEvent: "lesson", yesNo: true, refuseLine: "OK." }
          )
        ]
      }
    },

    classAsk: {
      id: "classAsk",
      title: "课堂上说想法",
      startNpc: "teacher",
      startRoom: "school",
      photo: { emoji: "🙋", caption: "课堂上举手" },
      resultKind: "class",
      packs: {
        2: [
          say("teacher", "What colour is the sky?", "说 blue 或 I think it's blue", ["blue", "think", "sky", "i don't know", "dont know"], ["Blue.", "I think it's blue.", "I don't know."], {
            result: { ok: "老师点点头，黑板上出现了一片蓝天。", funny: "你说不知道，老师换了个更简单的说法。" }
          })
        ],
        4: [
          say("teacher", "What do you think? Can you say it again?", "说 I think… 或 Can you say that again?", ["think", "again", "i don't know", "dont know", "can you"], ["I think it is good.", "Can you say that again?", "I don't know."], {
            result: { ok: "你把想法说出来了，老师把句子写在黑板上。", funny: "你请老师再说一遍，全班一起慢速说了一遍。" }
          })
        ],
        6: [
          say("teacher", "Why do we go to school? What do you think?", "用 I think 和 because", ["think", "because", "learn", "school", "don't know", "dont know"], ["I think we go to school because we learn.", "I think it is important.", "I don't know. Can you say that again?"], {
            result: { ok: "你的理由被写在了黑板角落。", funny: "你卡了一下，老师把问题拆成了两句。" }
          })
        ]
      }
    },

    helloMia: {
      id: "helloMia",
      title: "和新同学打招呼",
      startNpc: "mia",
      startRoom: "school",
      photo: { emoji: "🤝", caption: "认识 Mia" },
      resultKind: "friend",
      packs: {
        2: [
          say("mia", "Hi! What's your name?", "说出你的名字，或说 My name is…", ["name", "i am", "i'm", "hi", "hello"], ["My name is Xiaoyu.", "I am Xiaoyu.", "Hi!"], {
            result: { ok: "Mia 记住了你的名字，课桌被推到了一起。", funny: "名字说得太快，她笑着请你再说一遍。" }
          })
        ],
        4: [
          say("mia", "Hi! What's your name? What do you like?", "说名字，再加 I like…", ["name", "like", "i am", "hi"], ["My name is Xiaoyu. I like football.", "I like drawing.", "Hi, I am Xiaoyu."], {
            result: { ok: "Mia 说她也喜欢，下课要一起玩。", funny: "爱好对不上，两个人还是成了同桌。" }
          })
        ],
        6: [
          say("mia", "Nice to meet you. What do you like doing after school?", "说 I like … after school", ["like", "after", "school", "play", "read", "nice"], ["I like playing football after school.", "I like reading after school.", "Nice to meet you. I like drawing."], {
            result: { ok: "你们约好放学后再见。", funny: "计划排得太满，Mia 笑着说先从一句 Hello 开始。" }
          })
        ]
      }
    },

    findBag: {
      id: "findBag",
      title: "家里找书包",
      startNpc: "dad",
      startRoom: "home",
      photo: { emoji: "🎒", caption: "书包找到了" },
      resultKind: "find",
      packs: {
        2: [
          say("dad", "Where is your bag?", "说 on the sofa / in the kitchen / under the table", ["sofa", "kitchen", "table", "on", "in", "under", "bag"], ["On the sofa.", "In the kitchen.", "Under the table."], {
            result: { ok: "书包从沙发后面冒出来了。", funny: "你指错了地方，爸爸从冰箱旁把书包拎了出来。" }
          })
        ],
        4: [
          say("dad", "I can't find your bag. Where is it?", "说 It's on / in / under…", ["it's", "its", "sofa", "kitchen", "table", "on", "in", "under"], ["It's on the sofa.", "It's in the kitchen.", "It's under the table."], {
            result: { ok: "爸爸按你说的地方找到了书包。", funny: "方位说反了，你们把客厅找成了寻宝。" }
          })
        ],
        6: [
          say("dad", "Where did you put your bag, and why is it there?", "说 I put it… because…", ["put", "sofa", "kitchen", "because", "on", "in", "under"], ["I put it on the sofa because I was tired.", "It's under the table because I was playing.", "I put it in the kitchen."], {
            result: { ok: "书包找到了，爸爸夸你说清楚了。", funny: "原因太妙，书包自己都像在笑。" }
          })
        ]
      }
    },

    dadTalk: {
      id: "dadTalk",
      title: "跟爸爸说今天",
      startNpc: "dad",
      startRoom: "home",
      photo: { emoji: "📰", caption: "和爸爸聊一会儿" },
      resultKind: "talk",
      packs: {
        2: [
          say("dad", "How are you today?", "说 I'm fine 或 Happy", ["fine", "happy", "good", "ok", "i'm", "i am"], ["I'm fine.", "I'm happy.", "Good."], {
            result: { ok: "爸爸给你倒了杯水，报纸先放下了。", funny: "你说得很大声，爸爸把报纸举成了帽子。" }
          })
        ],
        4: [
          say("dad", "What do you like doing?", "说 I like…", ["like", "play", "read", "draw", "football"], ["I like football.", "I like reading.", "I like drawing."], {
            result: { ok: "爸爸记住了你的爱好。", funny: "爱好清单太长，他把报纸折成了记事本。" }
          })
        ],
        6: [
          say("dad", "How was your day? What did you do?", "用过去时：I played / I went…", ["was", "played", "went", "did", "school", "good"], ["It was good. I went to school.", "I played with my sister.", "I did my homework."], {
            result: { ok: "今天的事被爸爸听完了。", funny: "故事说得太热闹，沙发都像在鼓掌。" }
          })
        ]
      }
    },

    chores: {
      id: "chores",
      title: "帮忙做家务",
      startNpc: "mom",
      startRoom: "home",
      photo: { emoji: "🧹", caption: "帮了一次忙" },
      resultKind: "chores",
      packs: {
        2: [
          say("mom", "Can you help me, please?", "说 Yes 或 I can help", ["yes", "help", "can", "ok", "okay"], ["Yes.", "I can help.", "OK."], {
            yesNo: true,
            refuseLine: "OK.",
            result: { ok: "碗被送回了厨房。", funny: "你帮倒忙，妈妈还是亲了你一下。" }
          })
        ],
        4: [
          say("mom", "Can you help me? First wash, then dry.", "说 First… then… 或 Yes, I can", ["first", "then", "help", "yes", "wash", "dry"], ["First wash, then dry.", "Yes, I can help.", "OK, first then then."], {
            result: { ok: "先洗后擦，台面亮了。", funny: "顺序反了，妈妈笑着把步骤画给你看。" }
          })
        ],
        6: [
          say("mom", "Can you help me with dinner? What can you do first?", "说 I can… first, then…", ["can", "first", "then", "help", "wash", "cut"], ["I can wash the veggies first, then cut them.", "I can help you with dinner.", "First I can wash, then I can dry."], {
            result: { ok: "晚饭因为你的帮忙提前好了。", funny: "步骤说成了一首绕口令，厨房里全是笑。" }
          })
        ]
      }
    },

    bedtime: {
      id: "bedtime",
      title: "跟奶奶说晚安",
      startNpc: "grandma",
      startRoom: "home",
      photo: { emoji: "🌙", caption: "晚安" },
      resultKind: "bed",
      packs: {
        2: [
          say("grandma", "How do you feel? Good night.", "说 Happy / Tired 和 Good night", ["happy", "tired", "good night", "night", "fine"], ["I'm happy. Good night.", "I'm tired.", "Good night."], {
            result: { ok: "灯关了，奶奶的椅子轻轻摇。", funny: "你说了好多遍 good night，奶奶跟着点头。" }
          })
        ],
        4: [
          say("grandma", "Are you happy or tired? Say good night.", "说 I am… Good night", ["happy", "tired", "good night", "night", "i am", "i'm"], ["I am tired. Good night.", "I am happy. Good night.", "Good night, Grandma."], {
            result: { ok: "你把今天的感觉说给奶奶听了。", funny: "又开心又困，奶奶说那就笑着睡觉。" }
          })
        ],
        6: [
          say("grandma", "How do you feel tonight, and why?", "说 I feel… because… Good night", ["feel", "because", "happy", "tired", "night", "good"], ["I feel happy because I played.", "I feel tired because I went to school.", "I feel good. Good night."], {
            result: { ok: "奶奶听完才关灯。", funny: "原因讲成了故事，晚安说了三次。" }
          })
        ]
      }
    },

    snack: {
      id: "snack",
      title: "小摊点吃的",
      startNpc: "vendor",
      startRoom: "town",
      photo: { emoji: "🍦", caption: "路边的甜筒" },
      resultKind: "snack",
      packs: {
        2: [
          say("vendor", "Hello! What would you like?", "说 ice cream / juice / cake", ["ice", "cream", "juice", "cake", "please"], ["Ice cream.", "Juice, please.", "Cake."], {
            result: { ok: "摊主把你点的东西递了过来。", funny: "点得太花，帽子上先插了一支甜筒。" }
          })
        ],
        4: [
          say("vendor", "Would you like ice cream or juice?", "说 I'd like… please", ["i'd like", "i like", "ice", "juice", "please", "cream"], ["I'd like ice cream, please.", "I'd like juice, please.", "Ice cream, please."], {
            result: { ok: "礼貌点单成功。", funny: "两个都想要，摊主给了个迷你拼盘。" }
          })
        ],
        6: [
          say("vendor", "What would you like, and how many?", "说 I'd like two… please", ["i'd like", "two", "one", "please", "ice", "juice"], ["I'd like two ice creams, please.", "I'd like one juice, please.", "Two, please."], {
            result: { ok: "数量说清了，袋子提在手里。", funny: "数字说飘了，摊主笑着帮你数。" }
          })
        ]
      }
    }
  });
})();
