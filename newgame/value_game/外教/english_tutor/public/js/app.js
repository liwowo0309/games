const STORAGE_KEY = "english-tutor-v1";
const GRADES = ["", "一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  screen: "who",
  children: [],
  activeId: null,
  draft: "",
  pending: false,
  fail: null,
  listening: false,
  heard: "",
  micOff: !SpeechRec,
  engine: null,
  healthError: false,
  keyProblem: false,
  sheet: null,
  form: { nickname: "", grade: 1, error: "" },
  focusNick: false,
};

let reqSeq = 0;
let session = null;
let voices = [];
let speakToken = 0;

const app = document.getElementById("app");

function uid() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return "c-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && Array.isArray(saved.children)) {
      state.children = saved.children.filter((child) => child && child.id && child.nickname);
    }
  } catch {
    state.children = [];
  }
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ children: state.children })
  );
}

function childById(id) {
  return state.children.find((child) => child.id === id) || null;
}

function activeChild() {
  return childById(state.activeId);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);
}

function initial(name) {
  return [...name][0] || "孩";
}

function hue(name) {
  const hues = [18, 152, 200, 32, 262, 340];
  let n = 0;
  for (const ch of name) n += ch.codePointAt(0);
  return hues[n % hues.length];
}

function tutorFace(size) {
  return `<svg class="face" width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="40" fill="#f6c7a4"/>
    <path d="M14 36c1-14 12-24 26-24s25 10 26 24c-8 8-44 8-52 0z" fill="#3e2c28"/>
    <path d="M16 34c8 8 40 8 48 0v6c-8 6-40 6-48 0z" fill="#f6c7a4"/>
    <circle cx="30" cy="42" r="3.1" fill="#3e2c28"/>
    <circle cx="50" cy="42" r="3.1" fill="#3e2c28"/>
    <path d="M33 54c2.4 3.2 11.6 3.2 14 0" fill="none" stroke="#c46b58" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="22" cy="50" r="3.5" fill="#f0b2a4"/>
    <circle cx="58" cy="50" r="3.5" fill="#f0b2a4"/>
  </svg>`;
}

function sortedChildren() {
  return [...state.children].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function lastPreview(child) {
  const last = child.messages?.[child.messages.length - 1];
  if (!last) return { text: "还没开始说", empty: true };
  if (last.from === "tutor") return { text: last.english, empty: false };
  return { text: last.text, empty: false };
}

function renderWho() {
  const cards = sortedChildren().map((child) => {
    const preview = lastPreview(child);
    return `<div class="kid-row">
      <button type="button" class="kid" data-action="open" data-id="${esc(child.id)}">
        <span class="avatar" style="background:hsl(${hue(child.nickname)} 42% 38%)">${esc(initial(child.nickname))}</span>
        <span class="kid-main">
          <strong>${esc(child.nickname)}</strong>
          <small>${GRADES[child.grade] || ""}</small>
          <p class="preview${preview.empty ? " empty" : ""}">${esc(preview.text)}</p>
        </span>
      </button>
      <button type="button" class="linkish" data-action="grade" data-id="${esc(child.id)}">改年级</button>
    </div>`;
  }).join("");

  const empty = state.children.length
    ? ""
    : `<div class="empty-home"><p>还没有孩子。<br>加一个，就可以开始说。</p></div>`;

  let note = "";
  if (state.healthError) note = "外教服务没连上。请在这台电脑上打开 english_tutor。";
  else if (state.keyProblem) note = "钥匙没通过。请检查 english_tutor 里的 .env。";
  else if (state.engine === "local") note = "没找到 llm_providers 里的钥匙，所以先由这台电脑简单接话。";

  return `<section class="who">
    <div class="who-scroll">
      <div class="hero">
        ${tutorFace(72)}
        <div>
          <h1>英语外教</h1>
          <p>选好自己，就可以把英语说下去。</p>
        </div>
      </div>
      ${empty}
      <div class="kid-list">${cards}</div>
    </div>
    <div class="dock">
      <button type="button" class="primary" data-action="add">添加孩子</button>
      ${note ? `<p class="engine-note">${esc(note)}</p>` : ""}
    </div>
  </section>`;
}

function renderMessages(child) {
  const rows = (child.messages || []).map((message, index) => {
    if (message.from === "child") {
      return `<div class="row child"><div class="bubble child">${esc(message.text)}</div></div>`;
    }
    return `<div class="row">
      ${tutorFace(36)}
      <div class="bubble tutor">
        <p class="en" lang="en">${esc(message.english)}</p>
        <p class="zh">${esc(message.chinese || "")}</p>
        <button type="button" class="replay" data-action="replay" data-index="${index}" aria-label="再听一遍">听</button>
      </div>
    </div>`;
  }).join("");

  const waiting = state.pending
    ? `<div class="row">${tutorFace(36)}<div class="bubble tutor waiting" aria-label="外教在想"><i></i><i></i><i></i></div></div>`
    : "";

  const unanswered = !state.pending && child.messages?.length && child.messages[child.messages.length - 1].from === "child";
  const needGreet = !state.pending && !child.messages?.length && state.fail;
  let fail = "";
  if (state.fail || unanswered) {
    const text = state.fail === "bad_key"
      ? "钥匙不对，这句先没接上。"
      : state.fail === "busy"
        ? "外教这会儿忙，等一下再说。"
        : "没接上。再说一次就好。";
    const label = needGreet || !child.messages?.length ? "请外教先说" : "请外教接这一句";
    fail = `<p class="miss">${state.fail ? esc(text) : "这句话还没接上。"}</p>
      <button type="button" class="retry" data-action="retry">${label}</button>`;
  }
  return rows + waiting + fail;
}

function renderChat(child) {
  const micNote = state.micOff ? `<p class="mic-note">这台设备听不了，打出来就好。</p>` : "";
  const hold = state.micOff
    ? ""
    : `<button type="button" class="hold${state.listening ? " listening" : ""}" id="hold" ${state.pending ? "disabled" : ""}>按住说话</button>`;
  return `<section class="chat">
    <header class="chat-bar">
      <button type="button" class="back" data-action="back">换人</button>
      <div class="who-label">
        ${tutorFace(40)}
        <div>
          <span>外教</span>
          <button type="button" class="grade-btn" data-action="grade" data-id="${esc(child.id)}">${esc(child.nickname)} · ${GRADES[child.grade]}</button>
        </div>
      </div>
    </header>
    <div class="log" id="log" aria-live="polite">${renderMessages(child)}</div>
    <form class="composer" id="composer">
      <p class="heard" id="heard" ${state.heard ? "" : "hidden"}>${esc(state.heard)}</p>
      ${micNote}
      <div class="composer-row">
        <textarea id="draft" rows="1" maxlength="200" placeholder="打字也行" enterkeyhint="send" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" ${state.pending ? "disabled" : ""}>${esc(state.draft)}</textarea>
        <button type="submit" class="send" aria-label="发送" ${state.pending ? "disabled" : ""}>↑</button>
      </div>
      ${hold}
    </form>
  </section>`;
}

function renderSheet() {
  if (!state.sheet) return "";
  if (state.sheet.name === "add" || state.sheet.name === "grade") {
    const adding = state.sheet.name === "add";
    const title = adding ? "添加孩子" : `${esc(state.form.nickname)} 现在几年级？`;
    const nameField = adding
      ? `<label class="field"><span>家里怎么叫</span><input id="nick" maxlength="8" placeholder="比如豆豆" value="${esc(state.form.nickname)}" /></label>`
      : "";
    const chips = [1, 2, 3, 4, 5, 6].map((grade) => {
      const on = grade === state.form.grade ? " on" : "";
      return `<button type="button" class="chip${on}" data-action="pick-grade" data-grade="${grade}">${GRADES[grade]}</button>`;
    }).join("");
    const error = state.form.error ? `<p class="form-error">${esc(state.form.error)}</p>` : "";
    const extra = adding
      ? ""
      : `<button type="button" class="danger" data-action="ask-delete">删掉这个孩子</button>`;
    const submit = adding ? "开始说" : "好，按这个年级说";
    return `<div class="sheet-back" data-action="cancel">
      <div class="sheet" data-action="stop">
        <h2>${title}</h2>
        ${nameField}
        <p class="field"><span>几年级</span></p>
        <div class="grades">${chips}</div>
        ${error}
        <div class="sheet-actions">
          <button type="button" class="primary" data-action="${adding ? "create" : "save-grade"}">${submit}</button>
          ${extra}
        </div>
      </div>
    </div>`;
  }
  const child = childById(state.sheet.id);
  const name = child ? child.nickname : "这个孩子";
  return `<div class="sheet-back" data-action="cancel">
    <div class="sheet" data-action="stop">
      <h2>删掉「${esc(name)}」和这段对话？</h2>
      <p class="mic-note">删了就找不回来。</p>
      <div class="sheet-actions">
        <button type="button" class="danger" data-action="delete">删掉</button>
        <button type="button" class="ghost" data-action="cancel">再想想</button>
      </div>
    </div>
  </div>`;
}

function render() {
  const child = state.screen === "chat" ? activeChild() : null;
  if (state.screen === "chat" && !child) state.screen = "who";
  const page = state.screen === "chat" && child ? renderChat(child) : renderWho();
  app.innerHTML = page + renderSheet();
  const draft = document.getElementById("draft");
  if (draft) fitDraft(draft);
  const log = document.getElementById("log");
  if (log) log.scrollTop = log.scrollHeight;
  if (state.focusNick) {
    state.focusNick = false;
    document.getElementById("nick")?.focus();
  }
}

function fitDraft(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 96) + "px";
}

function pickVoice() {
  return (
    voices.find((voice) => voice.lang === "en-US" && /aria|jenny|samantha|natural|neural/i.test(voice.name)) ||
    voices.find((voice) => /^en-US/i.test(voice.lang)) ||
    voices.find((voice) => /^en/i.test(voice.lang)) ||
    null
  );
}

function speak(english) {
  if (!window.speechSynthesis || !english) return;
  const token = ++speakToken;
  speechSynthesis.cancel();
  window.setTimeout(() => {
    if (token !== speakToken) return;
    const utter = new SpeechSynthesisUtterance(english);
    utter.lang = "en-US";
    utter.rate = 0.84;
    utter.pitch = 1;
    const voice = pickVoice();
    if (voice) utter.voice = voice;
    speechSynthesis.speak(utter);
  }, 60);
}

function unlockSpeech() {
  if (!window.speechSynthesis) return;
  try { speechSynthesis.resume(); } catch { /* 有的浏览器没开过声音 */ }
}

function stopVoice() {
  speakToken += 1;
  if (window.speechSynthesis) speechSynthesis.cancel();
  if (session && !session.done) {
    session.done = true;
    try { session.rec.abort(); } catch { /* 已经停了 */ }
    clearTimeout(session.timer);
    session = null;
  }
  state.listening = false;
  state.heard = "";
}

async function refreshHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error("health");
    const data = await res.json();
    state.engine = data.engine || "local";
    state.healthError = false;
  } catch {
    state.healthError = true;
  }
}

async function postChat(child) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grade: child.grade,
      nickname: child.nickname,
      messages: (child.messages || []).slice(-12),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "unavailable");
    error.code = data.error || "unavailable";
    throw error;
  }
  if (!data.english) {
    const error = new Error("unavailable");
    error.code = "unavailable";
    throw error;
  }
  return data;
}

async function ask(childId) {
  const seq = ++reqSeq;
  const child = childById(childId);
  if (!child) return;
  state.pending = true;
  state.fail = null;
  render();
  try {
    const reply = await postChat(child);
    if (seq !== reqSeq) return;
    const current = childById(childId);
    if (!current) return;
    current.messages = current.messages || [];
    current.messages.push({
      from: "tutor",
      english: reply.english,
      chinese: reply.chinese || "",
    });
    if (current.messages.length > 200) current.messages.splice(0, current.messages.length - 200);
    current.updatedAt = Date.now();
    save();
    state.pending = false;
    state.keyProblem = false;
    render();
    if (state.screen === "chat" && state.activeId === childId) speak(reply.english);
  } catch (error) {
    if (seq !== reqSeq) return;
    state.pending = false;
    state.fail = error.code || "unavailable";
    if (state.fail === "bad_key") state.keyProblem = true;
    render();
  }
}

function openChild(id) {
  stopVoice();
  state.screen = "chat";
  state.activeId = id;
  state.fail = null;
  state.draft = "";
  state.sheet = null;
  const child = childById(id);
  render();
  unlockSpeech();
  if (!child) return;
  if (!child.messages?.length) {
    ask(id);
    return;
  }
  const lastTutor = [...child.messages].reverse().find((message) => message.from === "tutor");
  if (lastTutor) speak(lastTutor.english);
}

function sendChild(text, spoken) {
  const child = activeChild();
  const saying = text.trim();
  if (!child || !saying || state.pending) return;
  if (!spoken) state.draft = "";
  child.messages = child.messages || [];
  child.messages.push({ from: "child", text: saying.slice(0, 200) });
  child.updatedAt = Date.now();
  save();
  state.heard = "";
  ask(child.id);
}

function openAdd() {
  state.sheet = { name: "add" };
  state.form = { nickname: "", grade: 1, error: "" };
  state.focusNick = true;
  render();
}

function openGrade(id) {
  const child = childById(id);
  if (!child) return;
  state.sheet = { name: "grade", id };
  state.form = { nickname: child.nickname, grade: child.grade, error: "" };
  render();
}

function readNick() {
  const input = document.getElementById("nick");
  if (input) state.form.nickname = input.value;
}

function createChild() {
  readNick();
  const nickname = state.form.nickname.trim().slice(0, 8);
  if (!nickname) {
    state.form.error = "先写一个昵称";
    state.focusNick = true;
    render();
    return;
  }
  if (state.children.length >= 20) {
    state.form.error = "先删掉一个再加";
    render();
    return;
  }
  const child = {
    id: uid(),
    nickname,
    grade: state.form.grade,
    messages: [],
    updatedAt: Date.now(),
  };
  state.children.push(child);
  save();
  openChild(child.id);
}

function saveGrade() {
  const child = childById(state.sheet?.id);
  if (!child) return;
  child.grade = state.form.grade;
  child.updatedAt = Date.now();
  save();
  state.sheet = null;
  render();
}

function deleteChild() {
  const id = state.sheet?.id;
  stopVoice();
  reqSeq += 1;
  state.pending = false;
  state.children = state.children.filter((child) => child.id !== id);
  save();
  if (state.activeId === id) {
    state.activeId = null;
    state.screen = "who";
  }
  state.sheet = null;
  render();
}

function setHolding(on) {
  state.listening = on;
  const button = document.getElementById("hold");
  if (!button) return;
  button.classList.toggle("listening", on);
  button.textContent = on ? "松手发送" : "按住说话";
}

function startHold(event) {
  if (state.micOff || state.pending || state.listening || !SpeechRec) return;
  event.preventDefault();
  if (window.speechSynthesis) speechSynthesis.cancel();
  const rec = new SpeechRec();
  const current = { rec, text: "", done: false, stopping: false, timer: 0 };
  session = current;
  rec.lang = "en-US";
  rec.interimResults = true;
  rec.continuous = true;
  rec.onresult = (ev) => {
    let text = "";
    for (let i = 0; i < ev.results.length; i += 1) text += ev.results[i][0].transcript;
    current.text = text.trim();
    state.heard = current.text;
    const heard = document.getElementById("heard");
    if (heard) {
      heard.hidden = !current.text;
      heard.textContent = current.text;
    }
  };
  rec.onerror = (ev) => {
    if (["not-allowed", "service-not-allowed", "audio-capture", "language-not-supported"].includes(ev.error)) {
      state.micOff = true;
    }
  };
  rec.onend = () => finishHold(current);
  try {
    rec.start();
    state.listening = true;
    state.heard = "";
    setHolding(true);
    current.timer = setTimeout(() => stopHold(), 20000);
  } catch {
    state.micOff = true;
    session = null;
    render();
  }
}

function finishHold(current) {
  if (current.done) return;
  current.done = true;
  clearTimeout(current.timer);
  if (session === current) session = null;
  state.listening = false;
  const text = current.text.trim();
  state.heard = "";
  if (text) sendChild(text, true);
  else render();
}

function stopHold() {
  if (!session || session.stopping) return;
  const current = session;
  current.stopping = true;
  try { current.rec.stop(); } catch { /* 识别还没真正开始 */ }
  setTimeout(() => finishHold(current), 1200);
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target || !app.contains(target)) return;
  const action = target.dataset.action;
  if (action === "stop") return;
  unlockSpeech();
  if (action === "add") openAdd();
  else if (action === "open") openChild(target.dataset.id);
  else if (action === "grade") openGrade(target.dataset.id);
  else if (action === "cancel") {
    state.sheet = null;
    state.form.error = "";
    render();
  } else if (action === "pick-grade") {
    readNick();
    state.form.grade = Number(target.dataset.grade);
    render();
  } else if (action === "create") createChild();
  else if (action === "save-grade") saveGrade();
  else if (action === "ask-delete") {
    state.sheet = { name: "confirm-delete", id: state.sheet.id };
    render();
  } else if (action === "delete") deleteChild();
  else if (action === "back") {
    stopVoice();
    state.screen = "who";
    state.fail = null;
    render();
    refreshHealth().then(() => {
      if (state.screen === "who" && !state.sheet) render();
    });
  } else if (action === "retry") {
    const child = activeChild();
    if (child) ask(child.id);
  } else if (action === "replay") {
    const child = activeChild();
    const message = child?.messages?.[Number(target.dataset.index)];
    if (message?.english) speak(message.english);
  }
});

app.addEventListener("contextmenu", (event) => {
  if (event.target.closest("#hold")) event.preventDefault();
});

app.addEventListener("pointerdown", (event) => {
  const hold = event.target.closest("#hold");
  if (!hold || hold.disabled) return;
  startHold(event);
});

window.addEventListener("pointerup", stopHold);
window.addEventListener("pointercancel", stopHold);

app.addEventListener("input", (event) => {
  if (event.target.id === "draft") {
    state.draft = event.target.value;
    fitDraft(event.target);
  } else if (event.target.id === "nick") {
    state.form.nickname = event.target.value;
    state.form.error = "";
  }
});

app.addEventListener("submit", (event) => {
  if (event.target.id !== "composer") return;
  event.preventDefault();
  sendChild(state.draft, false);
});

app.addEventListener("keydown", (event) => {
  if (event.target.id === "draft" && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendChild(state.draft, false);
  }
});

if (window.speechSynthesis) {
  const loadVoices = () => { voices = speechSynthesis.getVoices(); };
  loadVoices();
  speechSynthesis.addEventListener("voiceschanged", loadVoices);
}

load();
refreshHealth().then(render);
render();
