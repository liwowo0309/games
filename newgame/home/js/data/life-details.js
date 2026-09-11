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
    findDog: {
      id: "findDog",
      title: "公园找小狗",
      startNpc: "ben",
      startRoom: "park",
      photo: { emoji: "🐶", caption: "按你说的样子找到了狗" },
      resultKind: "dog",
      packs: {
        2: [
          say("ben", "I lost my dog! What colour is it?", "说 brown / black / white / yellow", ["brown", "black", "white", "yellow", "colour", "color", "dog"], ["Brown.", "Black.", "It's white."], {
            result: { ok: "一只按你说的颜色的小狗从树后跑出来了。", funny: "颜色说飘了，跑出来一只戴帽子的狗。" }
          })
        ],
        4: [
          say("ben", "My dog is lost. Is it big or small? What colour?", "说 It's a big brown dog / small white dog", ["big", "small", "brown", "black", "white", "yellow", "dog", "colour", "color"], ["It's a big brown dog.", "It's a small white dog.", "It's black and small."], {
            result: { ok: "Ben 按你的描述吹了口哨，小狗摇着尾巴回来了。", funny: "大小说反了，先来了一只迷你狗，又来了一只大狗。" }
          })
        ],
        6: [
          say(
            "ben",
            "Can you describe my dog? Colour, size, and where did you see it?",
            "说 It's a… dog. I saw it near…",
            ["brown", "black", "white", "yellow", "big", "small", "dog", "saw", "tree", "near", "park", "because"],
            ["It's a small brown dog. I saw it near the tree.", "It's a big black dog near the flowers.", "I saw a white dog by the gate."],
            {
              result: { ok: "描述清楚了，小狗从花丛里钻出来扑到 Ben 身上。", funny: "地点说成了车站，小狗还是闻着味找回来了。" }
            }
          )
        ]
      }
    },

    birthday: {
      id: "birthday",
      title: "生日派对",
      startNpc: "sister",
      startRoom: "home",
      photo: { emoji: "🎂", caption: "家里过生日" },
      resultKind: "party",
      packs: {
        2: [
          say("sister", "It's my birthday! Say happy birthday!", "说 Happy birthday", ["happy", "birthday", "happy birthday"], ["Happy birthday!", "Happy birthday, Lily!", "Happy birthday to you!"], {
            result: { ok: "蜡烛亮了，妹妹把蛋糕推到你面前。", funny: "祝福说得太快，蜡烛自己先灭了一根。" }
          })
        ],
        4: [
          say("sister", "It's my birthday party! Can you come?", "说 Yes / I'd love to", ["yes", "come", "party", "sure", "love", "ok"], ["Yes, I can come.", "I'd love to.", "Sure!"], {
            yesNo: true,
            refuseLine: "OK."
          }),
          say("sister", "What present do you like? A book or a ball?", "说 I'd like a book / a ball", ["book", "ball", "like", "i'd like", "present", "gift"], ["I'd like a book.", "I'd like a ball.", "A book, please."], {
            result: { ok: "礼物按你说的出现在桌子上，气球都飘起来了。", funny: "两个都想要，桌上出现了一本会弹跳的书。" }
          })
        ],
        6: [
          say("sister", "Today is my birthday. What did you get for me, and why?", "说 I got… because…", ["got", "get", "because", "book", "ball", "cake", "gift", "present"], ["I got a book because you like reading.", "I got a ball because we can play.", "I got a cake because it's your birthday."], {
            result: { ok: "妹妹拆开礼物，客厅变成小小派对。", funny: "理由太长，蜡烛等不及，先唱了一半歌。" }
          })
        ]
      }
    },

    cheer: {
      id: "cheer",
      title: "运动会加油",
      startNpc: "amy",
      startRoom: "playground",
      photo: { emoji: "📣", caption: "操场上加油" },
      resultKind: "cheer",
      packs: {
        2: [
          say("amy", "Ken is running! Say come on!", "说 Come on / You can do it", ["come", "on", "can", "do", "it", "go"], ["Come on!", "You can do it!", "Go, Ken!"], {
            result: { ok: "Ken 听了加油声，跑得更快了。", funny: "你喊得太用力，小鸟都跟着喊。" }
          })
        ],
        4: [
          say("amy", "Which sport is it, running or jumping?", "说 running / jumping", ["run", "running", "jump", "jumping", "sport"], ["Running.", "Jumping.", "It's running."]),
          say("amy", "Now cheer for them!", "说 Come on / You can do it", ["come", "on", "can", "do", "it", "go", "cheer"], ["Come on!", "You can do it!", "Go!"], {
            result: { ok: "加油声让跑道都亮了一下。", funny: "项目说混了，大家还是一起跳着加油。" }
          })
        ],
        6: [
          say(
            "amy",
            "Ken looks tired. What will you say to cheer him up, and why?",
            "说 You can do it because… / Come on…",
            ["can", "do", "come", "because", "strong", "try", "cheer", "run"],
            ["You can do it because you are strong.", "Come on, Ken! You can finish.", "Don't give up because you can do it."],
            {
              result: { ok: "Ken 点点头，最后冲刺过了终点。", funny: "鼓励写成了演讲，他笑着还是冲过了线。" }
            }
          )
        ]
      }
    },

    askWay: {
      id: "askWay",
      title: "小店问路",
      startNpc: "clerk",
      startRoom: "shop",
      photo: { emoji: "🧭", caption: "按指示走到货架" },
      resultKind: "way",
      packs: {
        2: [
          say("clerk", "Looking for milk? It's on the left. Can you say left?", "说 left / on the left", ["left", "right", "milk", "on"], ["Left.", "On the left.", "It's on the left."], {
            result: { ok: "你往左走，牛奶就在货架上。", funny: "左右说反了，先撞到了面包堆。" }
          })
        ],
        4: [
          say("clerk", "Excuse me, can I help you?", "说 Excuse me. Where is the bread?", ["excuse", "where", "bread", "milk", "fruit", "apple", "please"], ["Excuse me. Where is the bread?", "Where is the milk, please?", "Where are the apples?"], {
            result: { ok: "店员指了指右边，你走到了正确的货架。", funny: "你问得很礼貌，店员却先递了一张手绘地图。" }
          })
        ],
        6: [
          say(
            "clerk",
            "Where do you want to go in the shop, and how will you get there?",
            "说 I want… Go straight / Turn left…",
            ["want", "fruit", "bread", "milk", "left", "right", "straight", "turn", "next"],
            ["I want the fruit. Go straight and turn left.", "I want bread. It's next to the milk.", "Turn right to the apple shelf."],
            {
              result: { ok: "你按自己说的路线走到了货架前。", funny: "路线绕成了迷宫，最后还是找到了苹果。" }
            }
          )
        ]
      }
    },

    friendOver: {
      id: "friendOver",
      title: "朋友来家里玩",
      startNpc: "sister",
      startRoom: "home",
      photo: { emoji: "🏠", caption: "朋友来家里了" },
      resultKind: "friendHome",
      packs: {
        2: [
          say("sister", "Mia is here! Say hello!", "说 Hello / Hi, Mia", ["hello", "hi", "mia", "come"], ["Hello!", "Hi, Mia!", "Hello, come in."], {
            result: { ok: "Mia 进门了，鞋柜旁多了一双小鞋子。", funny: "你好说了三遍，门铃也跟着响了三遍。" }
          })
        ],
        4: [
          say("sister", "Mia is coming to our home. Shall we give her some snacks?", "说 Yes / Let's give her cake", ["yes", "snack", "cake", "juice", "give", "let's", "ok"], ["Yes.", "Let's give her some cake.", "OK, juice."], {
            yesNo: true,
            refuseLine: "OK."
          }),
          say("sister", "What shall we play, cards or football?", "说 Let's play…", ["play", "cards", "football", "let's", "ball"], ["Let's play cards.", "Let's play football.", "Football!"], {
            result: { ok: "零食摆好了，你们按说好的玩法开始玩。", funny: "玩法还没说清，沙发上已经开始蹦了。" }
          })
        ],
        6: [
          say("sister", "Mia is at the door. How shall we welcome her?", "说 Come in / Welcome / Nice to see you", ["come", "in", "welcome", "nice", "see", "hello"], ["Come in, please.", "Welcome to our home.", "Nice to see you, Mia."]),
          say(
            "sister",
            "What shall we play, and what snack shall we share?",
            "说 Let's play… and share…",
            ["play", "share", "snack", "cake", "juice", "cards", "football", "because"],
            ["Let's play cards and share some cake.", "Let's play football and drink juice.", "We can read and share snacks."],
            {
              result: { ok: "朋友留下了，客厅变成你们的小据点。", funny: "计划排满整晚，最后大家先笑着吃蛋糕。" }
            }
          )
        ]
      }
    },

    washHands: {
      id: "washHands",
      title: "吃饭前洗手",
      startNpc: "mom",
      startRoom: "home",
      photo: { emoji: "🧼", caption: "洗手再开饭" },
      resultKind: "wash",
      packs: {
        2: [
          say("mom", "Wash your hands, please.", "说 OK / I will wash", ["ok", "okay", "wash", "hands", "yes"], ["OK.", "I will wash.", "Yes, Mum."], {
            yesNo: true,
            refuseLine: "OK.",
            result: { ok: "水龙头开了，泡沫堆成小山。", funny: "水花溅到镜子上，妈妈还是笑着递毛巾。" }
          })
        ],
        4: [
          say("mom", "Dinner is ready. Did you wash your hands?", "说 Yes, I did / I washed my hands", ["yes", "wash", "washed", "hands", "did"], ["Yes, I did.", "I washed my hands.", "Yes, Mum."], {
            result: { ok: "双手干干净净，碗筷才上桌。", funny: "你甩手甩成了小雨，餐巾纸立刻出动。" }
          })
        ],
        6: [
          say("mom", "Why should we wash our hands before dinner?", "说 Because… / To keep clean", ["because", "clean", "germs", "wash", "hands", "healthy"], ["Because we should keep clean.", "To wash away germs.", "Because it is healthy."], {
            result: { ok: "理由说完，妈妈才揭开锅盖。", funny: "germs 说成了 worms，厨房里笑成一团。" }
          })
        ]
      }
    },

    packBag: {
      id: "packBag",
      title: "出门前收书包",
      startNpc: "dad",
      startRoom: "home",
      photo: { emoji: "📦", caption: "书包收好了" },
      resultKind: "pack",
      packs: {
        2: [
          say("dad", "What do you need in your bag?", "说 book / pencil / eraser", ["book", "pencil", "eraser", "ruler", "bag", "need"], ["A book.", "A pencil.", "An eraser."], {
            result: { ok: "铅笔和书进了书包，拉链拉上了。", funny: "你塞进一只袜子，爸爸笑着帮你换出来。" }
          })
        ],
        4: [
          say("dad", "Pack your bag. What do you need for school?", "说 I need… for school", ["need", "book", "pencil", "eraser", "ruler", "school"], ["I need a book and a pencil.", "I need an eraser for school.", "I need my ruler."], {
            result: { ok: "清单说完，书包立在门边。", funny: "东西报成了购物单，客厅变成临时小店。" }
          })
        ],
        6: [
          say("dad", "What will you put in your bag first, and why?", "说 I will put… first because…", ["put", "first", "because", "book", "pencil", "bag", "will"], ["I will put my book first because it is heavy.", "I will put my pencil first.", "First my book, then my pencil."], {
            result: { ok: "顺序说清楚了，书包一次收好。", funny: "because 说得太长，爸爸先帮你把拉链拉开。" }
          })
        ]
      }
    },

    waterPlant: {
      id: "waterPlant",
      title: "帮奶奶浇花",
      startNpc: "grandma",
      startRoom: "home",
      photo: { emoji: "🪴", caption: "花浇过了" },
      resultKind: "plant",
      packs: {
        2: [
          say("grandma", "The plant is thirsty. Can you water it?", "说 Yes / OK / I can", ["yes", "ok", "okay", "water", "can", "plant"], ["Yes.", "OK.", "I can water it."], {
            yesNo: true,
            refuseLine: "OK.",
            result: { ok: "花叶子抬起头，窗台亮了一点。", funny: "水浇多了，花盆脚边变成小河。" }
          })
        ],
        4: [
          say("grandma", "How much water does the plant need?", "说 a little / some water", ["little", "some", "water", "much", "plant"], ["A little water.", "Some water.", "Not too much."], {
            result: { ok: "水量刚好，叶子上闪着小水珠。", funny: "说成了很多，奶奶赶紧拿来抹布。" }
          })
        ],
        6: [
          say("grandma", "Why do plants need water?", "说 Because… / They need water to grow", ["because", "grow", "need", "water", "plant", "alive"], ["Because they need water to grow.", "Plants need water to live.", "Because water helps them grow."], {
            result: { ok: "奶奶点点头，把喷壶交给你保管。", funny: "解释成了科学课，喷壶都像在鼓掌。" }
          })
        ]
      }
    }
  });
})();
