const LifeApp = (() => {
  let pendingTravel = null;
  let schoolBell = 0;

  function boot() {
    LifeState.load();
    LifeDialogue.init(document.getElementById("dialogue"));
    LifeMarket.init(document.getElementById("market"));
    LifeWorld.init(document.getElementById("world"));
    bindUi();
    document.addEventListener("life-npc", (event) => onNpc(event.detail));
    document.addEventListener("life-travel", (event) => onTravel(event.detail));
    document.addEventListener("life-result", (event) => onResult(event.detail));
    document.addEventListener("life-room", (event) => {
      refreshHud();
      refreshBangs();
      setHint(roomHint());
      LifeMarket.hide();
      window.clearTimeout(schoolBell);
      const info = event.detail || {};
      const here = info.room || info;
      const from = info.from;
      if (here === "school" && from === "town" && info.how === "door") {
        schoolBell = window.setTimeout(() => {
          if (LifeWorld.room !== "school") return;
          if (LifeDialogue.busy()) return;
          if (!document.getElementById("result").hidden) return;
          LifeDialogue.open("lesson");
        }, 350);
      }
    });
    document.addEventListener("life-stall", (event) => {
      if (LifeDialogue.busy()) return;
      LifeMarket.open(event.detail);
      setHint(event.detail === "shop" ? "货架上的东西都可以用金币买。" : "摊上的甜筒、果汁和蛋糕都可以买。");
    });
    document.addEventListener("life-coins", () => {
      refreshHud();
      LifeMarket.syncCoins();
    });
    document.addEventListener("life-buy", (event) => {
      LifeWorld.setEffects({ bag: true });
      refreshHud();
      const item = event.detail && event.detail.item;
      if (item) setHint("买到了 " + item.emoji + " " + item.name + "。你说：" + item.say);
    });
    document.addEventListener("life-refuse", (event) => {
      const line = (event.detail && event.detail.line) || "OK.";
      refreshHud();
      refreshBangs();
      setHint("他说了 " + line + " 这件事先到这儿。你还可以找别人说话，或自己走进去。");
    });
    document.addEventListener("life-abort", () => {
      pendingTravel = null;
      LifeWorld.clearTravel();
      refreshBangs();
      setHint(roomHint());
    });
    LifeWorld.onArrive = () => {
      if (!pendingTravel || !LifeWorld.nearPlace(pendingTravel.place)) return;
      const next = pendingTravel;
      pendingTravel = null;
      const step = LifeEvents[next.eventId].packs[LifeState.packGrade()][next.nextIndex];
      const npcName = step && LifeNpcs[step.npc] ? LifeNpcs[step.npc].name : "对方";
      setHint("到了，听听" + npcName + "说什么。");
      LifeDialogue.resumeTravel();
    };
    if (LifeState.hasProfile()) show("world");
    else show("setup");
    refreshHud();
    refreshBangs();
    if (location.protocol.startsWith("http") && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js");
    }
  }

  function bindUi() {
    document.getElementById("setup-form").onsubmit = (event) => {
      event.preventDefault();
      const name = document.getElementById("kid-name").value;
      const grade = document.getElementById("kid-grade").value;
      LifeState.setProfile(name, grade);
      show("world");
      refreshHud();
      refreshBangs();
      setHint(roomHint());
    };
    bindPad();
    document.getElementById("btn-home").onclick = goHome;
    document.getElementById("btn-album").onclick = () => {
      renderAlbum();
      show("album");
    };
    document.getElementById("btn-parent").onclick = () => {
      renderParent();
      show("parent");
    };
    document.querySelectorAll("[data-back]").forEach((btn) => {
      btn.onclick = () => show("world");
    });
    document.getElementById("parent-save").onclick = saveParent;
    document.getElementById("parent-reset").onclick = () => {
      if (window.confirm("要重新开始这一家的生活吗？相册也会清空。")) {
        LifeState.reset();
        show("setup");
      }
    };
    document.getElementById("result-back").onclick = () => {
      document.getElementById("result").hidden = true;
    };
    document.getElementById("result-album").onclick = () => {
      document.getElementById("result").hidden = true;
      renderAlbum();
      show("album");
    };
  }

  function goHome() {
    window.clearTimeout(schoolBell);
    LifeDialogue.abort();
    LifeMarket.hide();
    document.getElementById("picker").hidden = true;
    document.getElementById("result").hidden = true;
    pendingTravel = null;
    LifeWorld.clearTravel();
    LifeWorld.setRoom("home");
    show("world");
    refreshHud();
    refreshBangs();
    setHint("回到家里了。想再出门，点橙色「出门」。");
  }

  function eventsFor(npcId) {
    const here = LifeWorld.room;
    return Object.values(LifeEvents).filter((event) => {
      if (event.startNpc !== npcId) return false;
      if (event.startRoom && event.startRoom !== here) return false;
      return true;
    });
  }

  function roomHint() {
    if (LifeWorld.room === "home") return "你在家里。点橙色「出门」到街上。走到带 ! 的人旁边说话。";
    if (LifeWorld.room === "shop") return "你进了小店。点绿色「看货架」用金币买东西，或找店员说话。";
    if (LifeWorld.room === "school") return "上课了。听老师讲，或点「去操场」「图书室」。";
    if (LifeWorld.room === "playground") return "你在操场。去问 Ken 能不能一起打篮球。";
    if (LifeWorld.room === "library") return "图书室要安静。问问老师想借什么书。";
    if (LifeWorld.room === "clinic") return "你在诊所。跟医生说说你哪里不舒服。";
    if (LifeWorld.room === "cafe") return "你在餐厅。跟服务员说你想吃什么。";
    if (LifeWorld.room === "park") return "你在公园。去找 Ben，说说要不要玩。";
    if (LifeWorld.room === "bus") return "你在车站。跟司机说你要去哪里。";
    return "你在街上。家、小店、诊所、餐厅、公园、车站和学校都散开了，走过去再进门。";
  }

  function onNpc(npcId) {
    if (LifeDialogue.busy()) return;
    if (pendingTravel) {
      const step = LifeEvents[pendingTravel.eventId].packs[LifeState.packGrade()][pendingTravel.nextIndex];
      if (step && step.npc === npcId && LifeWorld.nearPlace(pendingTravel.place)) {
        pendingTravel = null;
        LifeDialogue.resumeTravel();
      }
      return;
    }
    const session = LifeDialogue.peek();
    if (session && !document.getElementById("dialogue").hidden) return;

    const list = eventsFor(npcId);
    if (!list.length) return;
    const pick = list[LifeState.nextVariant("npc:" + LifeWorld.room + ":" + npcId, list.length)];
    LifeDialogue.open(pick.id, npcId);
  }

  function openPicker(npcId, list) {
    const box = document.getElementById("picker");
    const npc = LifeNpcs[npcId];
    box.hidden = false;
    box.innerHTML = `
      <div class="talk-sheet picker-sheet">
        <p class="talk-hint">${npc.name}在等你。今天做哪一件？</p>
        ${list.map((event) => `<button type="button" class="card" data-event="${event.id}">${event.title}</button>`).join("")}
        <button type="button" class="ghost" data-act="picker-close">先看看别处</button>
      </div>
    `;
    box.querySelectorAll("[data-event]").forEach((btn) => {
      btn.onclick = () => {
        box.hidden = true;
        LifeDialogue.open(btn.dataset.event, npcId);
      };
    });
    box.querySelector("[data-act='picker-close']").onclick = () => {
      box.hidden = true;
    };
  }

  function onTravel(detail) {
    pendingTravel = detail;
    LifeWorld.goTo(detail.place);
    const place = LifePlaces[detail.place] || { name: detail.place };
    setHint("去" + place.name + "把话说完。");
    refreshBangs(detail);
  }

  function onResult(detail) {
    const dogEmoji = (() => {
      const t = LifeSpeech.normalize(detail.spoken || "");
      if (/black/.test(t)) return "🐕";
      if (/white/.test(t)) return "🐩";
      if (/yellow/.test(t)) return "🦮";
      if (/brown/.test(t)) return "🐶";
      if (/big/.test(t)) return "🐕";
      if (/small|little/.test(t)) return "🐶";
      return "🐶";
    })();
    const fx = {
      cook: { cook: true },
      jump: { jump: 3 },
      breakfast: { breakfast: LifeState.data.lastFood || "bread" },
      rain: { rain: true },
      borrow: { borrow: "eraser" },
      checkout: { bag: true },
      snack: { bag: true },
      find: { pack: true },
      bed: { book: true },
      ball: { ball: true },
      book: { book: true },
      class: { borrow: true },
      clinic: { sticker: true },
      cafe: { bag: true },
      park: { jump: 2 },
      bus: {},
      dog: { dog: dogEmoji },
      party: { cake: true, party: true },
      cheer: { cheer: true, ball: true },
      way: { way: true },
      friendHome: { party: true, bag: true },
      wash: { wash: true },
      pack: { pack: true },
      plant: { plant: true },
      chores: { wash: true },
      talk: {},
      friend: { borrow: true },
      school: {}
    };
    LifeWorld.setEffects(fx[detail.kind] || {});
    if (detail.kind === "cook" || (detail.kind === "rain" && !detail.funny)) {
      LifeWorld.goTo("home");
    }
    if (detail.eventId === "busRide" && detail.dest) {
      LifeWorld.dropOff(detail.dest);
    }
    const box = document.getElementById("result");
    document.getElementById("result-emoji").textContent = LifeEvents[detail.eventId].photo.emoji;
    document.getElementById("result-text").textContent = detail.text;
    document.getElementById("result-line").textContent = "你说：" + (detail.spoken || "");
    const coins = document.getElementById("result-coins");
    if (coins) coins.textContent = "奖励 +8 金币，现在有 " + (LifeState.data.coins || 0) + " 枚";
    box.hidden = false;
    refreshHud();
    refreshBangs();
  }

  function refreshBangs(travel) {
    const bangs = {};
    if (travel) {
      const steps = LifeEvents[travel.eventId].packs[LifeState.packGrade()];
      const step = steps[travel.nextIndex];
      if (step) bangs[step.npc] = true;
    } else {
      Object.keys(LifeNpcs).forEach((id) => {
        if (eventsFor(id).length) bangs[id] = true;
      });
    }
    LifeWorld.setBangs(bangs);
  }

  function refreshHud() {
    const data = LifeState.data;
    document.getElementById("hud-name").textContent = data.name || "小朋友";
    document.getElementById("hud-grade").textContent = data.grade + "年级";
    document.getElementById("hud-speak").textContent = "本周开口 " + data.speakCount;
    const coins = document.getElementById("hud-coins");
    if (coins) coins.textContent = "🪙 " + (data.coins || 0);
    const place = document.getElementById("hud-place");
    if (place) place.textContent = LifeWorld.roomName();
  }

  function renderAlbum() {
    const list = document.getElementById("album-list");
    const album = LifeState.data.album;
    if (!album.length) {
      list.innerHTML = '<p class="empty">还没有照片。去把今天的第一句话说完。</p>';
      return;
    }
    list.innerHTML = album
      .map(
        (item) => `
        <article class="photo">
          <div class="emoji">${item.emoji}</div>
          <h3>${item.title}</h3>
          <p>${item.caption}</p>
          <blockquote>${item.line || ""}</blockquote>
          <small>${item.grade}年级 · ${new Date(item.at).toLocaleDateString()}${item.funny ? " · 好笑结局" : ""}</small>
        </article>`
      )
      .join("");
  }

  function renderParent() {
    const data = LifeState.data;
    document.getElementById("p-name").value = data.name;
    document.getElementById("p-grade").value = String(data.grade);
    document.getElementById("p-captions").checked = data.captions;
    document.getElementById("p-cloud").checked = data.cloudAsr;
    document.getElementById("p-speak").textContent = String(data.speakCount);
    document.getElementById("p-coins").textContent = String(data.coins || 0);
    document.getElementById("p-bag").textContent = LifeMarket.bagText();
    const scenes = Object.keys(data.done);
    document.getElementById("p-scenes").textContent = scenes.length
      ? scenes.map((id) => LifeEvents[id].title).join("、")
      : "还没有";
    const words = new Set();
    data.album.forEach((item) => {
      LifeSpeech.normalize(item.line)
        .split(" ")
        .filter((w) => w.length > 2)
        .forEach((w) => words.add(w));
    });
    document.getElementById("p-words").textContent = words.size ? Array.from(words).slice(0, 16).join(" · ") : "还没有";
  }

  function saveParent() {
    LifeState.setProfile(document.getElementById("p-name").value, document.getElementById("p-grade").value);
    LifeState.data.captions = document.getElementById("p-captions").checked;
    LifeState.data.cloudAsr = document.getElementById("p-cloud").checked;
    LifeState.save();
    refreshHud();
    show("world");
  }

  function bindPad() {
    const pad = document.getElementById("move-pad");
    if (!pad) return;
    const stop = () => LifeWorld.releaseMove();
    pad.querySelectorAll("[data-dx]").forEach((btn) => {
      const start = (event) => {
        event.preventDefault();
        LifeWorld.holdMove(Number(btn.dataset.dx), Number(btn.dataset.dy));
      };
      btn.addEventListener("pointerdown", start);
      btn.addEventListener("pointerup", stop);
      btn.addEventListener("pointerleave", stop);
      btn.addEventListener("pointercancel", stop);
    });
    window.addEventListener("pointerup", stop);
  }

  function show(name) {
    document.querySelectorAll(".screen").forEach((node) => {
      node.hidden = node.id !== "screen-" + name;
    });
    if (name === "world") {
      requestAnimationFrame(() => {
        LifeWorld.resize();
        refreshBangs();
      });
    }
  }

  function setHint(text) {
    document.getElementById("hint").textContent = text;
  }

  return { boot };
})();

window.addEventListener("DOMContentLoaded", () => LifeApp.boot());
