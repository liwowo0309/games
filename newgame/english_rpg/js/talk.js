(() => {
  const $ = (id) => document.getElementById(id);
  const dialogue = $("dialogue");
  const ask = $("ask");
  const cards = $("cards");
  const cue = $("cue");
  const heard = $("heard");
  const mic = $("mic");

  const miaLines = [
    {
      en: "My kite is across the river!",
      zh: "我的风筝飞到河对面了。"
    },
    {
      en: "This red apple is for the wolf.",
      zh: "这个红苹果是给那只狼的。",
      apple: true
    }
  ];

  const replies = {
    bridge: {
      en: "The bridge is there. The wolf is on it.",
      zh: "桥就在那边，狼蹲在上面。"
    },
    shop: {
      en: "The shop is here. The bridge is over there.",
      zh: "商店在这边。桥在那边。"
    }
  };

  let index = 0;
  let mode = "mia";
  let misses = 0;
  let listening = false;
  let picked = "";

  function say(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.92;
    window.speechSynthesis.speak(utter);
  }

  function showMia(line) {
    $("who").src = "assets/mia.png";
    $("name").textContent = "Mia";
    $("line").textContent = line.en;
    $("zh").textContent = line.zh;
    $("zh").hidden = false;
    ask.hidden = true;
    cue.hidden = false;
    if (line.apple) $("pocket").hidden = false;
    say(line.en);
  }

  function showReply(kind) {
    mode = "done";
    showMia(replies[kind]);
    cue.hidden = true;
    dialogue.classList.remove("wait");
  }

  function showAsk() {
    mode = "ask";
    $("name").textContent = "你";
    $("line").textContent = "问她桥在哪。";
    $("zh").textContent = Rec
      ? "按住说话。说不出来就看卡片。"
      : "这个浏览器不能听英语。看卡片也能继续。";
    ask.hidden = false;
    cue.hidden = true;
    cards.hidden = true;
    heard.textContent = "";
    dialogue.classList.add("wait");
  }

  function advance() {
    if (mode !== "mia") return;
    index += 1;
    if (index < miaLines.length) showMia(miaLines[index]);
    else showAsk();
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/[^a-z\s]/g, " ");
  }

  function judge(text) {
    const t = normalize(text);
    const bridge = /\bbridge\b/.test(t);
    const where = /\bwhere\b/.test(t) || /\bwheres\b/.test(t);
    const shop = /\bshop\b/.test(t);
    if (picked === "bridge") return bridge && where ? "bridge" : "";
    if (picked === "shop") return shop ? "shop" : "";
    if (bridge && where) return "bridge";
    if (shop && !bridge) return "shop";
    return "";
  }

  function miss(text) {
    misses += 1;
    heard.textContent = text
      ? "听到：" + text
      : "没听到。按住不放，把一句说完再松手。";
    if (misses >= 2) openCards();
  }

  function finish(kind, said) {
    heard.textContent = said ? "你说：" + said : "";
    showReply(kind);
  }

  function openCards() {
    cards.hidden = false;
    cards.innerHTML = "";
    [
      ["Where is the bridge?", "bridge"],
      ["Where is the shop?", "shop"]
    ].forEach(([en, kind]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card";
      btn.textContent = en;
      btn.addEventListener("click", () => {
        picked = kind;
        cards.querySelectorAll(".card").forEach((node) => node.classList.remove("on"));
        btn.classList.add("on");
        if (!Rec) finish(kind, en);
        else heard.textContent = "按住说话，把这一句跟读一遍。";
      });
      cards.appendChild(btn);
    });
  }

  dialogue.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    advance();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== " " && event.key !== "Enter") return;
    if (event.target.closest("button, input, textarea")) return;
    if (mode !== "mia") return;
    event.preventDefault();
    advance();
  });

  $("cards-open").addEventListener("click", openCards);

  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;

  function explain(code) {
    if (code === "not-allowed" || code === "service-not-allowed") {
      return "浏览器拦住了麦克风。允许之后再按住说话，或先看卡片。";
    }
    if (code === "no-speech") return "没听到。按住不放，把一句说完再松手。";
    if (code === "network") return "英语识别连不上。看卡片也能继续。";
    return "这次没录上。再按住说一次，或看卡片。";
  }

  if (!Rec) {
    mic.hidden = true;
  } else {
    const rec = new Rec();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    let buffer = "";

    rec.onresult = (event) => {
      buffer = Array.from(event.results)
        .map((item) => item[0].transcript)
        .join(" ")
        .trim();
      if (buffer) heard.textContent = "听到：" + buffer;
    };

    rec.onerror = (event) => {
      listening = false;
      mic.classList.remove("hot");
      mic.textContent = "按住说话";
      if (event.error === "aborted" || event.error === "no-speech") return;
      heard.textContent = explain(event.error);
      misses += 1;
      if (misses >= 2) openCards();
    };

    rec.onend = () => {
      const said = buffer;
      listening = false;
      mic.classList.remove("hot");
      mic.textContent = "按住说话";
      if (!said) {
        miss("");
        return;
      }
      const kind = judge(said);
      if (kind) finish(kind, said);
      else miss(said);
      buffer = "";
    };

    const start = (event) => {
      if (mode !== "ask" || listening) return;
      if (event.button && event.button !== 0) return;
      event.preventDefault();
      buffer = "";
      listening = true;
      mic.classList.add("hot");
      mic.textContent = "松开结束";
      heard.textContent = "对着麦克风说。";
      try {
        rec.start();
      } catch (err) {
        listening = false;
        mic.classList.remove("hot");
        mic.textContent = "按住说话";
      }
    };

    const stop = (event) => {
      if (!listening) return;
      event.preventDefault();
      try {
        rec.stop();
      } catch (err) {
        listening = false;
      }
    };

    mic.addEventListener("pointerdown", start);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    mic.addEventListener("click", (event) => event.preventDefault());
  }

  showMia(miaLines[0]);
})();
