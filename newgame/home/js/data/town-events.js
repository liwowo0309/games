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
    clinicAsk: {
      id: "clinicAsk",
      title: "诊所看病",
      startNpc: "doctor",
      startRoom: "clinic",
      photo: { emoji: "🩺", caption: "去诊所说哪里不舒服" },
      resultKind: "clinic",
      packs: {
        2: [
          say("doctor", "How do you feel today?", "说 I have a cold / My head hurts / I'm fine", ["feel", "cold", "head", "hurt", "fine", "sick", "ok"], ["I have a cold.", "My head hurts.", "I'm fine."], {
            result: { ok: "医生点点头，给了你一杯温水。", funny: "你说得很大，听诊器自己跳了一下。" }
          })
        ],
        4: [
          say("doctor", "What's wrong? Do you have a headache?", "说 I have a headache / I feel sick", ["headache", "sick", "fever", "cold", "hurt", "feel"], ["I have a headache.", "I feel sick.", "I have a cold."], {
            result: { ok: "医生记下了你的症状。", funny: "你把发烧说成了好热，医生还是听懂了。" }
          })
        ],
        6: [
          say("doctor", "How long have you felt like this? Can you tell me more?", "说 I have… because… / since yesterday", ["have", "because", "yesterday", "fever", "headache", "since", "feel"], ["I have a fever since yesterday.", "I have a headache because I didn't sleep.", "I feel sick."], {
            result: { ok: "你把情况说清楚了，医生开了休息条。", funny: "故事有点长，医生笑着让你先喝水。" }
          })
        ]
      }
    },

    cafeOrder: {
      id: "cafeOrder",
      title: "餐厅点餐",
      startNpc: "waiter",
      startRoom: "cafe",
      photo: { emoji: "🍜", caption: "在餐厅点了吃的" },
      resultKind: "cafe",
      packs: {
        2: [
          say("waiter", "Hello! What would you like?", "说 noodles / rice / water", ["noodle", "noodles", "rice", "water", "please", "like"], ["Noodles, please.", "Rice.", "Water, please."], {
            result: { ok: "服务员把你点的东西端了上来。", funny: "你点得很小声，他却端来了一大碗。" }
          })
        ],
        4: [
          say("waiter", "Would you like noodles or rice?", "说 I'd like… please", ["i'd like", "i like", "noodle", "noodles", "rice", "please", "water"], ["I'd like noodles, please.", "I'd like rice, please.", "Water, please."], {
            result: { ok: "礼貌点餐成功。", funny: "两个都想要，服务员给了个迷你拼盘。" }
          })
        ],
        6: [
          say("waiter", "What would you like to eat, and what would you like to drink?", "说 I'd like… and…", ["i'd like", "noodle", "rice", "water", "juice", "and", "please"], ["I'd like noodles and water, please.", "I'd like rice and juice.", "Noodles and water, please."], {
            result: { ok: "饭和饮料都说清了。", funny: "饮料说成了汤，服务员笑着帮你改。" }
          })
        ]
      }
    },

    parkPlay: {
      id: "parkPlay",
      title: "公园里玩",
      startNpc: "ben",
      startRoom: "park",
      photo: { emoji: "🌳", caption: "公园里说了一句" },
      resultKind: "park",
      packs: {
        2: [
          say("ben", "Shall we play?", "说 Yes / Let's play", ["yes", "play", "ok", "let's", "lets"], ["Yes.", "Let's play.", "OK."], {
            yesNo: true,
            refuseLine: "OK.",
            result: { ok: "你们在树下跑了起来。", funny: "你答应得太快，小鸟都飞走了。" }
          })
        ],
        4: [
          say("ben", "What can you see in the park?", "说 I can see…", ["see", "bird", "flower", "tree", "can"], ["I can see a bird.", "I can see flowers.", "I can see a tree."], {
            result: { ok: "Ben 顺着你指的方向看过去。", funny: "你把树说成了花，他还是点了点头。" }
          })
        ],
        6: [
          say("ben", "What shall we play, and why?", "说 Let's play… because…", ["let's", "lets", "play", "because", "hide", "football", "run"], ["Let's play football because it's fun.", "Let's run because I like it.", "Shall we play hide and seek?"], {
            result: { ok: "公园里的游戏开始了。", funny: "理由太妙，秋千都像在鼓掌。" }
          })
        ]
      }
    },

    busRide: {
      id: "busRide",
      title: "车站问路",
      startNpc: "driver",
      startRoom: "bus",
      photo: { emoji: "🚌", caption: "在车站说去哪里" },
      resultKind: "bus",
      packs: {
        2: [
          say("driver", "Where are you going?", "说 school / home / park", ["school", "home", "shop", "park", "clinic", "cafe", "library", "playground", "restaurant", "hospital", "going"], ["School.", "Home.", "The park."], {
            result: { ok: "司机点点头，车门开了。", funny: "你报站报得很快，车子一下子就开了。" }
          })
        ],
        4: [
          say("driver", "Where are you going? Please say I'm going to…", "说 I'm going to the park", ["going", "school", "home", "shop", "park", "library", "clinic", "cafe", "playground", "restaurant"], ["I'm going to the park.", "I'm going home.", "I'm going to school."], {
            result: { ok: "司机点点头，车子开了。", funny: "你报站报得很快，车子一下子就开了。" }
          })
        ],
        6: [
          say("driver", "Where are you going, and why?", "说 I'm going to… because…", ["going", "because", "school", "library", "home", "park", "clinic", "cafe", "shop"], ["I'm going to the park because I want to play.", "I'm going to school because I have a class.", "I'm going home because it's late."], {
            result: { ok: "司机听懂了，车子开了。", funny: "理由说成了故事，全车都在听。" }
          })
        ]
      }
    }
  });
})();
