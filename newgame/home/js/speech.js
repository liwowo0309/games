const LifeSpeech = (() => {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let active = false;

  const ERRORS = {
    "no-speech-api": "这个浏览器没有英语识别。请用 Chrome 或 Edge。",
    insecure: "语音只能在 localhost 或 https 里用。",
    denied: "浏览器拦住了麦克风。请允许麦克风后再按住说话。",
    "not-allowed": "浏览器拦住了麦克风。请允许麦克风后再按住说话。",
    "mic-fail": "打不开麦克风。请检查是不是别的软件占用了它。",
    "no-media": "这台设备没有麦克风接口。",
    network: "英语识别连不上网（常见于连不上谷歌）。开了 VPN 再按住说话。",
    "no-speech": "没听到声音。请按住按钮，对着麦克风把话说完再松手。",
    aborted: "这次没录上。请重新按住说话。",
    "audio-capture": "找不到麦克风。请检查有没有接麦、有没有被禁用。",
    "service-not-allowed": "浏览器不让用语音识别。请换 Chrome 或 Edge。"
  };

  const STOP = new Set([
    "a", "an", "the", "to", "of", "for", "with", "and", "or", "is", "it", "do", "did",
    "are", "be", "me", "we", "he", "she", "this", "that", "some", "your", "my", "i"
  ]);

  const ROOT = {
    ok: "yes",
    okay: "yes",
    okey: "yes",
    yeah: "yes",
    yep: "yes",
    yup: "yes",
    sure: "yes",
    yes: "yes",
    please: "please",
    want: "want",
    wanna: "want",
    wanted: "want",
    need: "want",
    needed: "want",
    like: "want",
    coat: "coat",
    jacket: "coat",
    jump: "jump",
    jumping: "jump",
    jumped: "jump",
    high: "high",
    higher: "high",
    go: "go",
    going: "go",
    gone: "go",
    lets: "go",
    home: "home",
    house: "home",
    thank: "thank",
    thanks: "thank",
    carrot: "carrot",
    carrots: "carrot",
    tomato: "tomato",
    tomatoes: "tomato",
    spinach: "spinach",
    veggie: "veggie",
    veggies: "veggie",
    vegetable: "veggie",
    vegetables: "veggie",
    ice: "ice",
    cream: "cream",
    icecream: "ice",
    juice: "juice",
    cake: "cake",
    apple: "apple",
    apples: "apple",
    banana: "banana",
    bananas: "banana",
    bread: "bread",
    milk: "milk",
    cereal: "cereal",
    oatmeal: "oatmeal",
    porridge: "porridge",
    toast: "toast",
    yogurt: "yogurt",
    yoghurt: "yogurt",
    pancake: "pancake",
    egg: "egg",
    eggs: "egg",
    yuan: "yuan",
    here: "here",
    borrow: "borrow",
    eraser: "eraser",
    ruler: "ruler",
    pencil: "pencil",
    play: "play",
    playing: "play",
    basketball: "basketball",
    ball: "ball",
    book: "book",
    books: "book",
    quiet: "quiet",
    because: "because",
    turn: "turn",
    sit: "sit",
    sitting: "sit",
    school: "school",
    run: "run",
    running: "run",
    cold: "cold",
    mum: "mum",
    mom: "mum",
    two: "two",
    three: "three",
    one: "one",
    five: "five",
    six: "six",
    much: "much",
    take: "take",
    pay: "pay",
    left: "left",
    right: "right",
    straight: "straight",
    birthday: "birthday",
    happy: "happy",
    dog: "dog",
    brown: "brown",
    black: "black",
    white: "white",
    yellow: "yellow",
    big: "big",
    small: "small",
    wash: "wash",
    hands: "hands",
    plant: "plant",
    water: "water",
    cheer: "cheer",
    come: "come"
  };

  function available() {
    return Boolean(Rec);
  }

  function secure() {
    return window.isSecureContext;
  }

  function canListen() {
    return available() && secure();
  }

  function explain(code) {
    return ERRORS[code] || "这次没听清。再按住，用自己的话说一遍。";
  }

  function fatalError(code) {
    return ["network", "denied", "not-allowed", "insecure", "no-speech-api", "no-media", "service-not-allowed"].includes(code);
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function onlyOk(text) {
    return /^(ok|okay|okey|yes|yeah|yep|sure)( mum| mom)?$/.test(text);
  }

  function isDontKnow(text) {
    return /\b(don'?t|do not|dont)\s+know\b/.test(text) || /\bi\s+don'?t\s+know\b/.test(text);
  }

  function isRefuse(text) {
    const n = normalize(text);
    if (!n) return false;
    if (isDontKnow(n)) return false;
    if (/^(no|nope|nah|no thanks|no thank you|not now|later|maybe later)$/.test(n)) return true;
    if (/\b(no|nope|nah)\b/.test(n) && !/\b(yes|yeah|yep|ok|okay|sure)\b/.test(n)) return true;
    if (/\b(don'?t|dont|do not|won'?t|wont|never)\s+(want|like|go|need|come|play|join|help)\b/.test(n)) return true;
    if (/\bnot\s+(now|yet|really|today)\b/.test(n)) return true;
    return false;
  }

  function isAffirm(text) {
    return /\b(yes|yeah|yep|yup|ok|okay|sure|please|let'?s|lets)\b/.test(normalize(text));
  }

  function isYesNoStep(step) {
    if (!step) return false;
    if (step.yesNo === false) return false;
    if (step.yesNo) return true;
    const line = normalize(step.line || "");
    if (!line) return false;
    if (/\bor\b/.test(line)) return false;
    return /do you want|would you like to|shall we go|shall we play|can i play|could i join|can you come|can you help me|can you go to/.test(line);
  }

  function matchRule(text, rule) {
    if (typeof rule === "string") return text.includes(normalize(rule));
    if (rule.any) return rule.any.some((word) => text.includes(normalize(word)));
    if (rule.all) return rule.all.every((word) => text.includes(normalize(word)));
    return false;
  }

  function funnyFood(text) {
    return /ice cream|icecream|chocolate|candy|cake|cola|pizza/.test(text);
  }

  function hasVeggie(text) {
    return /carrot|tomato|spinach|veggie|vegetable/.test(text);
  }

  function hasBreakfastFood(text) {
    return /cereal|oatmeal|porridge|muesli|granola|bread|toast|bagel|egg|omelet|omelette|milk|yogurt|yoghurt|juice|apple|banana|orange|fruit|rice|congee|noodle|dumpling|bao|pancake|waffle|sandwich|cheese|ham|sausage|bacon|bun|mantou|soy/.test(text);
  }

  const BUS_STOPS = [
    { room: "playground", keys: ["playground", "操场"] },
    { room: "library", keys: ["library", "图书"] },
    { room: "clinic", keys: ["clinic", "hospital", "doctor", "诊所", "医院"] },
    { room: "cafe", keys: ["cafe", "restaurant", "餐厅", "饭店"] },
    { room: "park", keys: ["park", "garden", "公园"] },
    { room: "shop", keys: ["shop", "store", "mall", "supermarket", "market", "小店", "商店"] },
    { room: "school", keys: ["school", "class", "classroom", "学校", "教室"] },
    { room: "home", keys: ["home", "house", "家里"] }
  ];

  function findStop(spoken) {
    const text = normalize(spoken);
    const raw = String(spoken || "");
    if (!text && !raw) return "";
    const hits = [];
    BUS_STOPS.forEach((stop) => {
      stop.keys.forEach((key) => {
        const n = normalize(key);
        let idx = n ? text.indexOf(n) : -1;
        if (idx < 0 && key && raw.includes(key)) idx = raw.indexOf(key);
        if (idx >= 0) hits.push({ room: stop.room, idx });
      });
    });
    if (!hits.length) return "";
    hits.sort((a, b) => a.idx - b.idx);
    return hits[0].room;
  }

  function stem(word) {
    if (ROOT[word]) return ROOT[word];
    if (word.length > 4 && word.endsWith("ing")) return ROOT[word.slice(0, -3)] || word.slice(0, -3);
    if (word.length > 3 && word.endsWith("ed")) return ROOT[word.slice(0, -2)] || word.slice(0, -2);
    if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
      const cut = word.slice(0, -1);
      return ROOT[cut] || cut;
    }
    return word;
  }

  function contentRoots(text) {
    return normalize(text)
      .split(" ")
      .map(stem)
      .filter((word) => word && word.length > 1 && !STOP.has(word));
  }

  function expectedLines(step) {
    const lines = [];
    (step.choices || []).forEach((card) => {
      if (card && card.text) lines.push(card.text);
    });
    (step.accept || []).forEach((rule) => {
      if (typeof rule === "string") lines.push(rule);
      if (rule && rule.any) rule.any.forEach((word) => lines.push(word));
      if (rule && rule.all) lines.push(rule.all.join(" "));
    });
    return lines;
  }

  function closeMeaning(spoken, step) {
    const said = contentRoots(spoken);
    if (!said.length) return false;
    const saidSet = new Set(said);
    const lines = expectedLines(step);
    for (let i = 0; i < lines.length; i += 1) {
      const need = contentRoots(lines[i]);
      if (!need.length) continue;
      const hit = need.filter((word) => saidSet.has(word)).length;
      if (need.length === 1 && hit === 1) return true;
      if (need.length === 2 && hit === 2) return true;
      if (need.length >= 3 && hit >= 2) return true;
    }
    const pool = new Set();
    lines.forEach((line) => contentRoots(line).forEach((word) => pool.add(word)));
    const shared = said.filter((word) => pool.has(word));
    if (shared.length >= 2) return true;
    return false;
  }

  function acceptHas(step, word) {
    return (step.accept || []).some((rule) => {
      if (typeof rule === "string") return normalize(rule).includes(word);
      return (rule.any || rule.all || []).some((item) => normalize(item).includes(word));
    });
  }

  function match(spoken, step) {
    const text = normalize(spoken);
    if (!text) return { pass: false, refuse: false, onlyOk: false, text: "" };

    const ok = onlyOk(text);
    if (step.rejectOnlyOk && ok) {
      return { pass: false, refuse: false, onlyOk: true, text };
    }
    if (isDontKnow(text) && acceptHas(step, "know")) {
      return { pass: true, refuse: false, onlyOk: false, text };
    }
    if (step.noMeansFunny && isRefuse(text)) {
      return { pass: true, refuse: false, funny: true, onlyOk: false, text };
    }
    if (isYesNoStep(step) && isRefuse(text)) {
      return { pass: false, refuse: true, onlyOk: false, text };
    }
    if (isRefuse(text) && !step.allowNo && !acceptHas(step, "no")) {
      return { pass: false, refuse: false, onlyOk: false, text };
    }
    if (step.meal === "breakfast" && hasBreakfastFood(text)) {
      return { pass: true, refuse: false, onlyOk: false, text };
    }
    if (isYesNoStep(step)) {
      const wants = /\b(want|like|come|join|help)\b/.test(text);
      const pass = isAffirm(text) || wants || closeMeaning(spoken, step);
      return { pass, refuse: false, onlyOk: ok, text };
    }
    const pass = (step.accept || []).some((rule) => matchRule(text, rule)) || closeMeaning(spoken, step);
    return { pass, refuse: false, onlyOk: ok, text };
  }

  function speak(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.92;
    window.speechSynthesis.speak(utter);
  }

  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function listen({ onresult, onpartial, onend, onerror }) {
    if (!canListen()) {
      const reason = !secure() ? "insecure" : "no-speech-api";
      if (onerror) onerror({ error: reason });
      return false;
    }
    hardStop();
    stopSpeak();
    rec = new Rec();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = true;
    let delivered = false;
    rec.onresult = (event) => {
      let finalText = "";
      let partial = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += " " + piece;
        else partial += " " + piece;
      }
      if (partial.trim() && onpartial) onpartial(partial.trim());
      if (finalText.trim() && onresult) {
        delivered = true;
        onresult(finalText.trim());
      }
    };
    rec.onerror = (event) => {
      const code = event && event.error;
      if (code === "no-speech" || code === "aborted") return;
      active = false;
      if (onerror) onerror(event);
    };
    rec.onend = () => {
      active = false;
      if (!delivered && onend) onend();
    };
    try {
      rec.start();
      active = true;
      return true;
    } catch (err) {
      active = false;
      if (onerror) onerror({ error: "aborted" });
      return false;
    }
  }

  function hardStop() {
    if (rec) {
      try {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch (err) {
        /* ignore */
      }
    }
    rec = null;
    active = false;
  }

  function stop() {
    if (!rec) {
      active = false;
      return;
    }
    try {
      rec.stop();
    } catch (err) {
      hardStop();
    }
    active = false;
  }

  return {
    available,
    canListen,
    explain,
    fatalError,
    normalize,
    match,
    isRefuse,
    funnyFood,
    hasVeggie,
    findStop,
    speak,
    stopSpeak,
    listen,
    stop,
    get listening() {
      return active;
    }
  };
})();
window.LifeSpeech = LifeSpeech;
