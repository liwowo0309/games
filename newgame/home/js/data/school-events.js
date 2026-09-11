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
    lesson: {
      id: "lesson",
      title: "英语课",
      startNpc: "teacher",
      startRoom: "school",
      photo: { emoji: "📘", caption: "英语课上开口了" },
      resultKind: "class",
      packs: {
        2: [
          say("teacher", "Let's start the class.", "", ["ok", "okay", "yes", "start", "begin", "ready", "let's", "lets"], ["OK.", "Yes.", "Let's start."], {
            yesNo: true,
            refuseLine: "OK. Sit down first."
          }),
          say("teacher", "Class begins. What's this? It's a book. Can you say it?", "说 It's a book 或 Book", ["book", "it's", "it is", "this"], ["It's a book.", "Book.", "This is a book."], {
            result: { ok: "老师在黑板上画了一本书。", funny: "你说成了书包，老师笑着指了指书。" }
          })
        ],
        4: [
          say("teacher", "Good morning. Let's start the class.", "", ["ok", "okay", "yes", "start", "begin", "ready", "morning", "let's", "lets"], ["OK.", "Good morning.", "Let's start."], {
            yesNo: true,
            refuseLine: "OK. Please sit down."
          }),
          say("teacher", "What are you doing now? Please use -ing.", "说 I'm sitting / I'm listening", ["sitting", "listening", "reading", "doing", "i'm", "i am"], ["I'm sitting.", "I'm listening.", "I am reading."], {
            result: { ok: "进行时写上了黑板。", funny: "你先愣了一下，后来还是把 -ing 说出来了。" }
          })
        ],
        6: [
          say("teacher", "Good morning, class. Let's start today's lesson.", "", ["ok", "okay", "yes", "start", "begin", "ready", "morning", "let's", "lets"], ["OK.", "Good morning.", "Let's start."], {
            yesNo: true,
            refuseLine: "OK. We can wait a minute."
          }),
          say("teacher", "What did you do yesterday? Please use the past tense.", "说 I played / I went / I did", ["played", "went", "did", "yesterday", "was"], ["I played football yesterday.", "I went to school.", "I did my homework."], {
            result: { ok: "过去时练完了，下课铃还没响。", funny: "时态绕了一圈，老师把 yesterday 写得很大。" }
          })
        ]
      }
    },

    ballAsk: {
      id: "ballAsk",
      title: "能不能一起打球",
      startNpc: "ken",
      startRoom: "playground",
      photo: { emoji: "🏀", caption: "操场上打球" },
      resultKind: "ball",
      packs: {
        2: [
          say("ken", "We are playing basketball. Can I play?", "说 Yes / Let's play", ["yes", "play", "ok", "let's", "basketball"], ["Yes.", "Let's play.", "OK."], {
            yesNo: true,
            refuseLine: "OK.",
            result: { ok: "球传到你手上了。", funny: "你先抱住球，Ken 笑着教你拍。" }
          })
        ],
        4: [
          say("ken", "Can I play basketball with you?", "说 Yes, you can / Let's play together", ["yes", "can", "play", "together", "sure", "let's"], ["Yes, you can.", "Let's play together.", "Sure."], {
            yesNo: true,
            refuseLine: "OK.",
            result: { ok: "你们组队了，操场中间响起拍球声。", funny: "你答应得太大声，球自己滚过来了。" }
          })
        ],
        6: [
          say("ken", "Could I join your game? I can play as a guard.", "说 Yes, you can join / Let's play together", ["could", "join", "can", "play", "guard", "yes", "together"], ["Yes, you can join.", "Let's play together.", "Sure, you can be a guard."], {
            yesNo: true,
            refuseLine: "OK.",
            result: { ok: "Ken 让你上场了。", funny: "位置名说漏了，他仍把球抛了过来。" }
          })
        ]
      }
    },

    ballPass: {
      id: "ballPass",
      title: "传球和投篮",
      startNpc: "ken",
      startRoom: "playground",
      photo: { emoji: "⛹️", caption: "传了一记好球" },
      resultKind: "ball",
      packs: {
        2: [
          say("ken", "Pass the ball! Shoot!", "说 Pass / Shoot / OK", ["pass", "shoot", "ball", "ok", "yes"], ["Pass!", "Shoot!", "OK."], {
            result: { ok: "球进了，Ken 举起双手。", funny: "你传歪了，球去找了小鸟。" }
          })
        ],
        4: [
          say("ken", "Pass me the ball, please. Then you can shoot.", "说 Pass me the ball / I can shoot", ["pass", "ball", "please", "shoot", "can"], ["Pass me the ball, please.", "I can shoot.", "Here you are."], {
            result: { ok: "一两个来回，篮筐响了一下。", funny: "先投后传，Ken 笑着把顺序画在地上。" }
          })
        ],
        6: [
          say("ken", "If I pass to you, what will you do next?", "说 I will shoot / I will pass it back", ["will", "shoot", "pass", "back", "then"], ["I will shoot.", "I will pass it back.", "I will run and then shoot."], {
            result: { ok: "战术说清楚了，这一球配合上了。", funny: "计划太长，球已经先到了。" }
          })
        ]
      }
    },

    ballTurn: {
      id: "ballTurn",
      title: "轮到谁上场",
      startNpc: "amy",
      startRoom: "playground",
      photo: { emoji: "🥇", caption: "轮流上场" },
      resultKind: "ball",
      packs: {
        2: [
          say("amy", "It's your turn! Are you ready?", "说 Yes / My turn / I'm ready", ["yes", "turn", "ready", "i'm", "ok"], ["Yes.", "My turn!", "I'm ready."], {
            result: { ok: "Amy 把上场机会让给你。", funny: "你喊 turn 喊了两遍，大家都笑了。" }
          })
        ],
        4: [
          say("amy", "Whose turn is it? Can you wait a minute?", "说 It's my turn / I can wait", ["turn", "wait", "my", "your", "can"], ["It's my turn.", "I can wait.", "It's your turn."], {
            result: { ok: "顺序说清了，比赛继续。", funny: "抢回合，Amy 用石头剪刀布解决了。" }
          })
        ],
        6: [
          say("amy", "How many points did you get? Who scored more?", "说 I got… / I scored more", ["points", "got", "scored", "more", "than", "two", "three"], ["I got two points.", "I scored more.", "I got three points."], {
            result: { ok: "比分被记在操场边的小本上。", funny: "分数报成了十，Amy 让你重新数。" }
          })
        ]
      }
    },

    libraryAsk: {
      id: "libraryAsk",
      title: "图书室借书",
      startNpc: "librarian",
      startRoom: "library",
      photo: { emoji: "📚", caption: "借到一本书" },
      resultKind: "book",
      packs: {
        2: [
          say("librarian", "Please be quiet. What book do you like?", "说 animal / story / this book", ["quiet", "animal", "story", "book", "like", "this"], ["This book.", "I like story books.", "Animal book."], {
            result: { ok: "一本故事书到了你手里。", funny: "你大声说喜欢，老师把手指放在嘴边。" }
          })
        ],
        4: [
          say("librarian", "Can I help you? You can borrow one book.", "说 Can I borrow this book?", ["borrow", "book", "please", "can", "this"], ["Can I borrow this book?", "This book, please.", "I want to borrow a book."], {
            result: { ok: "借书卡盖了章。", funny: "你抱了两本，老师笑着说一次一本。" }
          })
        ],
        6: [
          say("librarian", "What kind of book are you looking for, and why?", "说 I'm looking for… because…", ["looking", "story", "science", "because", "animal", "book"], ["I'm looking for a story book because I like stories.", "I want a science book.", "I'm looking for an animal book."], {
            result: { ok: "老师按你的理由找到了书架。", funny: "理由太长，她先递过来一本最薄的。" }
          })
        ]
      }
    }
  });
})();
