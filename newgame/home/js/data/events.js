window.LifeEvents = {
  veggies: {
    id: "veggies",
    title: "妈妈拜托买菜",
    startNpc: "mom",
    startRoom: "home",
    photo: { emoji: "🥕", caption: "去买菜的一天" },
    resultKind: "cook",
    packs: {
      2: [
        {
          npc: "mom",
          line: "Please go to the shopping mall to buy some veggies.",
          hint: "先答应妈妈，可以说 OK 或 Sure",
          accept: [{ any: ["ok", "okay", "okey", "sure", "yes", "yeah", "i'll go", "i will go", "mum", "mom"] }],
          choices: [
            { text: "OK.", target: true },
            { text: "Sure, Mum.", target: true },
            { text: "Yes, I'll go.", target: true }
          ],
          travelTo: "shop",
          yesNo: true,
          refuseLine: "OK."
        },
        {
          npc: "clerk",
          line: "Hello! What would you like?",
          hint: "指一种蔬菜，说 carrots 或 tomatoes",
          accept: [{ any: ["carrot", "carrots", "tomato", "tomatoes", "veggie", "veggies", "spinach"] }],
          choices: [
            { text: "Carrots.", target: true },
            { text: "Tomatoes.", target: true },
            { text: "Veggies, please.", target: true }
          ],
          result: { ok: "妈妈用你买的菜做了热汤。", funny: "妈妈把买回来的东西做成了搞笑沙拉。" }
        }
      ],
      4: [
        {
          npc: "mom",
          line: "Please go to the shop and buy some tomatoes.",
          hint: "说你要去买西红柿",
          accept: [{ any: ["tomato", "tomatoes", "buy", "shop", "ok", "okay", "sure", "yes"] }],
          choices: [
            { text: "OK, I'll buy some tomatoes.", target: true },
            { text: "I need some tomatoes.", target: true },
            { text: "Sure, I will go.", target: true }
          ],
          travelTo: "shop",
          yesNo: true,
          refuseLine: "OK."
        },
        {
          npc: "clerk",
          line: "Hello! Can I help you?",
          hint: "问价钱，或说 I need some tomatoes",
          accept: [{ any: ["how much", "tomato", "tomatoes", "need", "please"] }],
          choices: [
            { text: "How much are the tomatoes?", target: true },
            { text: "I need some tomatoes.", target: true },
            { text: "Tomatoes, please.", target: true }
          ]
        },
        {
          npc: "clerk",
          line: "Two yuan, please.",
          hint: "付钱：Here you are 或 Two yuan, please",
          accept: [{ any: ["here", "yuan", "please", "thank", "two"] }],
          choices: [
            { text: "Here you are.", target: true },
            { text: "Two yuan, please.", target: true },
            { text: "Thank you.", target: true }
          ],
          result: { ok: "西红柿买回来了，妈妈进了厨房。", funny: "钱没说清，店员笑着送了你一小袋搞笑沙拉菜。" }
        }
      ],
      6: [
        {
          npc: "mom",
          line: "We need veggies for dinner. Can you go to the shop?",
          hint: "不要只说 OK，要说买什么、买多少",
          rejectOnlyOk: true,
          followUpLine: "What will you buy?",
          accept: [{ any: ["tomato", "tomatoes", "spinach", "carrot", "carrots", "veggie", "veggies", "dinner", "two", "some"] }],
          choices: [
            { text: "I need two tomatoes and some spinach for dinner.", target: true },
            { text: "I will buy some tomatoes and spinach.", target: true },
            { text: "I need veggies for dinner.", target: true }
          ],
          travelTo: "shop",
          yesNo: true,
          refuseLine: "OK."
        },
        {
          npc: "clerk",
          line: "What would you like today?",
          hint: "说明数量和蔬菜",
          accept: [{ any: ["tomato", "tomatoes", "spinach", "carrot", "carrots", "two", "some", "need"] }],
          choices: [
            { text: "I need two tomatoes and some spinach, please.", target: true },
            { text: "Two tomatoes and spinach, please.", target: true },
            { text: "I'd like some veggies for dinner.", target: true }
          ],
          result: { ok: "晚饭的菜买齐了，妈妈开始做饭。", funny: "你没说清楚，妈妈只好做了一盘搞笑沙拉。" }
        }
      ]
    }
  },

  breakfast: {
    id: "breakfast",
    title: "早餐选吃的",
    startNpc: "mom",
    startRoom: "home",
    photo: { emoji: "🍳", caption: "早餐时间" },
    resultKind: "breakfast",
    packs: {
      2: [
        {
          npc: "mom",
          line: "What would you like for breakfast?",
          hint: "说一种食物：bread, milk, eggs, apple",
          accept: [{ any: ["bread", "milk", "egg", "eggs", "apple", "like", "i'd like"] }],
          choices: [
            { text: "Bread.", target: true },
            { text: "Milk.", target: true },
            { text: "I'd like eggs.", target: true }
          ],
          meal: "breakfast",
          result: { ok: "你点的早餐上桌了。", funny: "冰淇淋当早餐？角色做了个鬼脸，但还是吃完了。" }
        }
      ],
      4: [
        {
          npc: "mom",
          line: "What would you like for breakfast? We have bread, eggs and milk.",
          hint: "用 I'd like 说出你想吃的",
          accept: [{ any: ["i'd like", "i like", "bread", "egg", "eggs", "milk", "please"] }],
          choices: [
            { text: "I'd like bread and milk.", target: true },
            { text: "I'd like eggs, please.", target: true },
            { text: "I like milk.", target: true }
          ],
          meal: "breakfast",
          result: { ok: "早餐按你说的摆好了。", funny: "奇怪搭配让大家都笑了。" }
        }
      ],
      6: [
        {
          npc: "mom",
          line: "Breakfast time. What would you like, and why?",
          hint: "说想吃什么，并加上 because",
          accept: [{ any: ["because", "i'd like", "i like", "bread", "egg", "milk", "hungry", "healthy"] }],
          choices: [
            { text: "I'd like eggs because I am hungry.", target: true },
            { text: "I'd like bread and milk because they are yummy.", target: true },
            { text: "I like milk because it is healthy.", target: true }
          ],
          meal: "breakfast",
          result: { ok: "妈妈点点头，按你的理由做了早餐。", funny: "理由太妙，餐桌上出现了搞笑拼盘。" }
        }
      ]
    }
  },

  jump: {
    id: "jump",
    title: "和妹妹蹦啊蹦",
    startNpc: "sister",
    startRoom: "home",
    photo: { emoji: "🤸", caption: "院子里蹦得老高" },
    resultKind: "jump",
    packs: {
      2: [
        {
          npc: "sister",
          line: "Let's go outside and jump!",
          hint: "说 OK, let's go 或 Yes",
          accept: [{ any: ["ok", "okay", "yes", "go", "outside", "jump", "let's"] }],
          choices: [
            { text: "OK, let's go!", target: true },
            { text: "Yes.", target: true },
            { text: "Let's go outside.", target: true }
          ],
          travelTo: "yard",
          yesNo: true,
          refuseLine: "OK."
        },
        {
          npc: "sister",
          line: "Let's jump! My turn!",
          hint: "说 jump 或 my turn",
          accept: [{ any: ["jump", "my turn", "let's", "ok", "okay"] }],
          choices: [
            { text: "Jump!", target: true },
            { text: "My turn!", target: true },
            { text: "Let's jump!", target: true }
          ]
        },
        {
          npc: "sister",
          line: "Jump higher!",
          hint: "说 higher 或 jump higher",
          accept: [{ any: ["higher", "high", "jump"] }],
          choices: [
            { text: "Higher!", target: true },
            { text: "Jump higher!", target: true },
            { text: "I can jump!", target: true }
          ],
          result: { ok: "你们越跳越高，院子都跟着晃。", funny: "跳歪了，妹妹笑得蹲在草地上。" }
        }
      ],
      4: [
        {
          npc: "sister",
          line: "Let's go outside. I want to jump!",
          hint: "说 Let's go 或 OK",
          accept: [{ any: ["ok", "okay", "yes", "go", "outside", "jump", "let's"] }],
          choices: [
            { text: "Let's go outside.", target: true },
            { text: "OK, let's jump.", target: true },
            { text: "Yes, I want to jump.", target: true }
          ],
          travelTo: "yard",
          yesNo: true,
          refuseLine: "OK."
        },
        {
          npc: "sister",
          line: "Can you jump higher than me?",
          hint: "说 I can jump higher 或 Let's jump",
          accept: [{ any: ["higher", "can", "jump", "let's", "yes"] }],
          choices: [
            { text: "I can jump higher.", target: true },
            { text: "Let's jump higher!", target: true },
            { text: "Yes, I can!", target: true }
          ]
        },
        {
          npc: "sister",
          line: "It's my turn!",
          hint: "轮流：Your turn 或 My turn",
          accept: [{ any: ["turn", "your", "my", "go"] }],
          choices: [
            { text: "Your turn!", target: true },
            { text: "My turn!", target: true },
            { text: "Let's take turns.", target: true }
          ],
          result: { ok: "轮流跳，妹妹几乎要跳过小树了。", funny: "抢回合，两个人撞成一团笑。" }
        }
      ],
      6: [
        {
          npc: "sister",
          line: "Do you want to go outside and jump?",
          hint: "说 Yes, I want 或 Let's go",
          accept: [{ any: ["yes", "want", "go", "outside", "jump", "let's"] }],
          choices: [
            { text: "Yes, I want to go outside.", target: true },
            { text: "Let's go outside and jump.", target: true },
            { text: "Yes, I want.", target: true }
          ],
          travelTo: "yard",
          yesNo: true,
          refuseLine: "OK."
        },
        {
          npc: "sister",
          line: "I jumped so high just now! Can you jump higher?",
          hint: "比较一下，谁跳得更高",
          accept: [{ any: ["higher", "than", "i can", "let's see", "jumped"] }],
          choices: [
            { text: "I can jump higher than you.", target: true },
            { text: "Let's see who jumps higher.", target: true },
            { text: "I jumped higher just now.", target: true }
          ],
          result: { ok: "跳高比赛开始，妹妹的辫子都飞起来了。", funny: "你说得很大，落地却软软的，妹妹笑弯了腰。" }
        }
      ]
    }
  },

  rain: {
    id: "rain",
    title: "突然下雨",
    startNpc: "sister",
    startRoom: "town",
    photo: { emoji: "🌧️", caption: "下雨的院子" },
    resultKind: "rain",
    packs: {
      2: [
        {
          npc: "sister",
          line: "It's raining! Shall we go home?",
          hint: "说 yes, go home 或 home",
          accept: [{ any: ["yes", "home", "go", "ok", "okay", "shall"] }],
          choices: [
            { text: "Yes.", target: true },
            { text: "Go home!", target: true },
            { text: "OK, let's go home.", target: true }
          ],
          noMeansFunny: true,
          result: { ok: "你们跑回家，鞋子上都是水花。", funny: "决定再玩一会儿，雨把头发浇成了海草。" }
        }
      ],
      4: [
        {
          npc: "sister",
          line: "It's raining. Shall we go home or play a little more?",
          hint: "建议一句：Let's go home 或 Let's play",
          accept: [{ any: ["home", "play", "shall", "let's", "go"] }],
          choices: [
            { text: "Let's go home.", target: true },
            { text: "Shall we go home?", target: true },
            { text: "Let's play a little more.", target: true }
          ],
          result: { ok: "说回家就回家，门还没关上雨就大了。", funny: "说再玩一会儿，两个人在雨里跳了最后一下。" }
        }
      ],
      6: [
        {
          npc: "sister",
          line: "It's raining hard. What should we do?",
          hint: "说计划：We should go home 或 We can play…",
          accept: [{ any: ["should", "home", "can", "let's", "because", "rain"] }],
          choices: [
            { text: "We should go home now.", target: true },
            { text: "Let's go home because it is raining hard.", target: true },
            { text: "We can play in the rain for a minute.", target: true }
          ],
          result: { ok: "你们做了决定，雨里的路变成一条水滑梯。", funny: "计划是再玩一分钟，结果鞋漂起来了。" }
        }
      ]
    }
  },

  borrow: {
    id: "borrow",
    title: "向同学借文具",
    startNpc: "classmate",
    startRoom: "school",
    photo: { emoji: "✏️", caption: "教室里的借用" },
    resultKind: "borrow",
    packs: {
      2: [
        {
          npc: "classmate",
          line: "Hi! What do you need?",
          hint: "说 eraser, ruler 或 pencil",
          accept: [{ any: ["eraser", "ruler", "pencil", "pen", "borrow"] }],
          choices: [
            { text: "Eraser.", target: true },
            { text: "Ruler.", target: true },
            { text: "Pencil, please.", target: true }
          ],
          result: { ok: "借到了，你们一起把画折完了。", funny: "说成了恐龙，同学还是把橡皮递了过来。" }
        }
      ],
      4: [
        {
          npc: "classmate",
          line: "I have an eraser and a ruler. What do you need?",
          hint: "说 May I borrow your eraser?",
          accept: [{ any: ["borrow", "may i", "eraser", "ruler", "pencil", "please"] }],
          choices: [
            { text: "May I borrow your eraser?", target: true },
            { text: "May I borrow your ruler?", target: true },
            { text: "Can I borrow a pencil, please?", target: true }
          ],
          result: { ok: "礼貌借到了，画上的线一下子直了。", funny: "句子差一点点，同学笑着把尺子递过来。" }
        }
      ],
      6: [
        {
          npc: "classmate",
          line: "Sure, I can help. What do you need it for?",
          hint: "说明要借什么，以及用来做什么",
          accept: [{ any: ["borrow", "ruler", "eraser", "pencil", "math", "maths", "draw", "need"] }],
          choices: [
            { text: "May I borrow your ruler? I need it for maths.", target: true },
            { text: "May I borrow your eraser? I need it to draw.", target: true },
            { text: "I need a pencil for my homework.", target: true }
          ],
          result: { ok: "同学把文具借给你，作业页马上整齐了。", funny: "理由太长，两个人先笑了一场再开始画。" }
        }
      ]
    }
  },

  checkout: {
    id: "checkout",
    title: "超市称重结账",
    startNpc: "clerk",
    startRoom: "shop",
    photo: { emoji: "🛒", caption: "小店结账" },
    resultKind: "checkout",
    packs: {
      2: [
        {
          npc: "clerk",
          line: "That's five yuan, please.",
          hint: "说 please, five 或 here you are",
          accept: [{ any: ["please", "five", "yuan", "here", "thank"] }],
          choices: [
            { text: "Five yuan, please.", target: true },
            { text: "Here you are.", target: true },
            { text: "Thank you.", target: true }
          ],
          result: { ok: "钱说对了，袋子提在手里。", funny: "说成了两块，店员开玩笑多给了你一颗糖。" }
        }
      ],
      4: [
        {
          npc: "clerk",
          line: "How many apples? They are three yuan.",
          hint: "说数量：two please，或问 How much",
          accept: [{ any: ["two", "three", "one", "how much", "apple", "apples", "please", "yuan"] }],
          choices: [
            { text: "Two, please.", target: true },
            { text: "How much are the apples?", target: true },
            { text: "Three yuan, please.", target: true }
          ],
          result: { ok: "苹果称好了，你可以回家了。", funny: "数字说少了，店员笑着让你再数一遍，还是把袋子给了你。" }
        }
      ],
      6: [
        {
          npc: "clerk",
          line: "These tomatoes are six yuan. How would you like to pay?",
          hint: "把价钱说完整：Here you are / Six yuan, please",
          accept: [{ any: ["six", "yuan", "here", "please", "pay", "thank"] }],
          choices: [
            { text: "Here you are. Six yuan, please.", target: true },
            { text: "I'll take them. Here you are.", target: true },
            { text: "Six yuan, please. Thank you.", target: true }
          ],
          result: { ok: "结清了，帆布袋鼓鼓的。", funny: "你说成了两块，店员笑着说差得可不少，但今天先记在本子上。" }
        }
      ]
    }
  }
};

window.LifeNpcs = {
  mom: { id: "mom", name: "妈妈", nameEn: "Mum", color: "#e07a9a" },
  dad: { id: "dad", name: "爸爸", nameEn: "Dad", color: "#3d5a80" },
  grandma: { id: "grandma", name: "奶奶", nameEn: "Grandma", color: "#b08968" },
  sister: { id: "sister", name: "妹妹", nameEn: "Lily", color: "#9b5de5" },
  clerk: { id: "clerk", name: "店员", nameEn: "Shopkeeper", color: "#2a9d8f" },
  vendor: { id: "vendor", name: "摊主", nameEn: "Vendor", color: "#e9c46a" },
  classmate: { id: "classmate", name: "同学 Leo", nameEn: "Leo", color: "#f4a261" },
  teacher: { id: "teacher", name: "老师", nameEn: "Ms Chen", color: "#457b9d" },
  mia: { id: "mia", name: "同学 Mia", nameEn: "Mia", color: "#ef476f" },
  ken: { id: "ken", name: "Ken", nameEn: "Ken", color: "#e76f51" },
  amy: { id: "amy", name: "Amy", nameEn: "Amy", color: "#2a9d8f" },
  librarian: { id: "librarian", name: "图书老师", nameEn: "Ms Lin", color: "#6d5843" },
  doctor: { id: "doctor", name: "医生", nameEn: "Doctor", color: "#4cc9f0" },
  waiter: { id: "waiter", name: "服务员", nameEn: "Waiter", color: "#e07a5f" },
  ben: { id: "ben", name: "Ben", nameEn: "Ben", color: "#40916c" },
  driver: { id: "driver", name: "司机", nameEn: "Driver", color: "#1d3557" }
};

window.LifePlaces = {
  home: { id: "home", name: "家里" },
  yard: { id: "yard", name: "院子" },
  shop: { id: "shop", name: "小店" },
  school: { id: "school", name: "教室" },
  playground: { id: "playground", name: "操场" },
  library: { id: "library", name: "图书室" },
  schoolGate: { id: "schoolGate", name: "学校门口" },
  homeDoor: { id: "homeDoor", name: "家门口" },
  clinic: { id: "clinic", name: "诊所" },
  cafe: { id: "cafe", name: "餐厅" },
  park: { id: "park", name: "公园" },
  bus: { id: "bus", name: "车站" }
};
