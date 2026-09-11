const LifeDialogue = (() => {
  let root;
  let session = null;
  let fails = 0;
  let followMode = false;
  let micBroken = false;
  let lastMicReason = "";
  const HINT_AFTER = 5;

  function init(node) {
    root = node;
  }

  function packOf(event) {
    const grade = LifeState.packGrade();
    return event.packs[grade] || event.packs[2];
  }

  function open(eventId, fromNpc) {
    const event = LifeEvents[eventId];
    if (!event) return;
    if (window.LifeMarket) LifeMarket.hide();
    const steps = packOf(event);
    session = {
      event,
      steps,
      index: 0,
      spoken: "",
      funny: false,
      resolved: {}
    };
    fails = 0;
    followMode = false;
    micBroken = !LifeSpeech.canListen();
    lastMicReason = micBroken ? (window.isSecureContext ? "no-speech-api" : "insecure") : "";
    render();
    talkCurrent();
  }

  function pickAlt(step, eventId, index) {
    const alts = step.alts && step.alts.length ? step.alts : [step];
    const pick = alts[LifeState.nextVariant(eventId + ":" + LifeState.packGrade() + ":" + index, alts.length)];
    return Object.assign({}, step, pick);
  }

  function currentStep() {
    if (!session) return null;
    const raw = session.steps[session.index];
    if (!raw) return null;
    if (!session.resolved[session.index]) {
      session.resolved[session.index] = pickAlt(raw, session.event.id, session.index);
    }
    return session.resolved[session.index];
  }

  function talkCurrent() {
    const step = currentStep();
    if (!step) return;
    const line = followMode && step.followUpLine ? step.followUpLine : step.line;
    LifeSpeech.speak(line);
  }

  function render() {
    const step = currentStep();
    if (!session || !step) {
      root.hidden = true;
      root.innerHTML = "";
      return;
    }
    const npc = LifeNpcs[step.npc];
    const line = followMode && step.followUpLine ? step.followUpLine : step.line;
    const micLabel = LifeSpeech.canListen() ? "按住说话" : "";

    root.hidden = false;
    root.innerHTML = `
      <div class="talk-sheet">
        <div class="talk-npc">
          <span class="dot" style="background:${npc.color}"></span>
          <div>
            <strong>${npc.name}</strong>
            <em>${npc.nameEn}</em>
          </div>
          <button type="button" class="ghost" data-act="replay">再听一遍</button>
          <button type="button" class="ghost" data-act="close">先走开</button>
        </div>
        <p class="talk-line"${LifeState.data.captions ? "" : " hidden"}>${escapeHtml(line)}</p>
        ${fails >= HINT_AFTER ? `<p class="talk-hint">${escapeHtml(hintText(step))}</p>` : ""}
        <p class="talk-heard" id="talk-heard">${lastMicReason ? LifeSpeech.explain(lastMicReason) : micLabel ? "" : "请用 Chrome 或 Edge，对着麦克风自己回答。"}</p>
        <div class="talk-actions">
          ${micLabel ? `<button type="button" class="mic" id="mic-btn">${micLabel}</button>` : ""}
        </div>
      </div>
    `;

    root.querySelector('[data-act="replay"]').onclick = () => talkCurrent();
    root.querySelector('[data-act="close"]').onclick = () => abort();
    bindMic();
  }

  function bindMic() {
    const btn = root.querySelector("#mic-btn");
    if (!btn || !LifeSpeech.canListen()) return;
    let holding = false;
    let heard = "";
    const idleText = "按住说话";

    const cool = () => {
      holding = false;
      btn.classList.remove("hot");
      btn.textContent = idleText;
    };

    const start = (event) => {
      if (event.button && event.button !== 0) return;
      event.preventDefault();
      if (holding) return;
      holding = true;
      heard = "";
      if (btn.setPointerCapture && event.pointerId != null) {
        try {
          btn.setPointerCapture(event.pointerId);
        } catch (err) {
          /* ignore */
        }
      }
      btn.classList.add("hot");
      btn.textContent = "松开结束";
      note("按住，对着麦克风说英语。");
      const ok = LifeSpeech.listen({
        onpartial: (text) => {
          heard = text;
          note("听到：" + text);
        },
        onresult: (text) => {
          heard = text;
          cool();
          handleSpoken(text);
        },
        onend: () => {
          if (heard) {
            cool();
            handleSpoken(heard);
            return;
          }
          cool();
          if (!lastMicReason) note("没听到。请按住不放，把一句英语说完再松手。");
        },
        onerror: (event) => {
          const code = (event && event.error) || "aborted";
          lastMicReason = code;
          micBroken = LifeSpeech.fatalError(code);
          cool();
          note(LifeSpeech.explain(code));
        }
      });
      if (!ok) {
        cool();
      }
    };

    const end = (event) => {
      if (!holding) return;
      holding = false;
      event.preventDefault();
      LifeSpeech.stop();
    };

    btn.addEventListener("pointerdown", start);
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointercancel", end);
    btn.addEventListener("lostpointercapture", end);
    btn.addEventListener("click", (event) => event.preventDefault());
  }

  function handleSpoken(spoken) {
    const step = currentStep();
    session.spoken = spoken;
    LifeState.data.lastSpoken = spoken;
    LifeState.addSpeak();
    note("你说：" + spoken);

    const result = LifeSpeech.match(spoken, step);
    if (result.onlyOk && step.rejectOnlyOk) {
      followMode = true;
      fails = 0;
      render();
      LifeSpeech.speak(step.followUpLine);
      note("只说 OK 还不够，妈妈在问你买什么。");
      return;
    }
    if (result.refuse) {
      refuseOut(spoken, step);
      return;
    }
    if (result.funny) session.funny = true;
    if (result.pass) {
      succeed(spoken);
      return;
    }
    fails += 1;
    if (fails >= HINT_AFTER) {
      render();
      note("试了好几次了。看这一句提示，再说一次。");
      return;
    }
    note(fails >= 2 ? "意思还不太对。再听一遍，用自己的话说。" : "意思还不太对。再说一次也行。");
  }

  function refuseOut(spoken, step) {
    const line = step.refuseLine || "OK.";
    const event = session.event;
    LifeSpeech.speak(line);
    note("他说：" + line);
    setTimeout(() => {
      close();
      session = null;
      document.dispatchEvent(
        new CustomEvent("life-refuse", {
          detail: { eventId: event.id, spoken, line }
        })
      );
    }, 650);
  }

  function succeed(spoken) {
    const step = currentStep();
    const text = LifeSpeech.normalize(spoken);
    if (LifeSpeech.funnyFood(text)) session.funny = true;
    if (step.result && !LifeSpeech.hasVeggie(text) && session.event.id === "veggies") {
      session.funny = session.funny || !LifeSpeech.hasVeggie(text + " " + session.spoken);
    }
    if (/play|minute|more/.test(text) && session.event.id === "rain") session.funny = true;
    if (/two yuan|two, please/.test(text) && session.event.id === "checkout" && LifeState.packGrade() === 6) {
      session.funny = true;
    }
    if (session.event.id === "askWay" && /right/.test(text) && /left/.test(LifeSpeech.normalize(step.line || ""))) {
      session.funny = true;
    }
    if (session.event.id === "findDog" && /green|blue|purple|pink/.test(text)) session.funny = true;
    LifeState.data.lastFood = text;

    if (step.enterRoom) {
      LifeWorld.setRoom(step.enterRoom);
      if (step.startEvent) {
        const nextId = step.startEvent;
        const dest = step.enterRoom;
        close();
        session = null;
        setTimeout(() => {
          if (dest && LifeWorld.room !== dest) return;
          if (LifeDialogue.busy()) return;
          LifeDialogue.open(nextId);
        }, 280);
        return;
      }
      session.index += 1;
      followMode = false;
      fails = 0;
      if (!currentStep()) {
        finish(step.result || { ok: "你进去了。", funny: "你进去了。" });
        return;
      }
      render();
      talkCurrent();
      return;
    }

    if (step.travelTo) {
      close();
      document.dispatchEvent(
        new CustomEvent("life-travel", {
          detail: { place: step.travelTo, eventId: session.event.id, nextIndex: session.index + 1 }
        })
      );
      session.index += 1;
      return;
    }
    if (step.result) {
      finish(step.result);
      return;
    }
    session.index += 1;
    followMode = false;
    fails = 0;
    if (!currentStep()) {
      finish({ ok: "这件事说完了。", funny: "这件事说完了，大家都笑了。" });
      return;
    }
    render();
    talkCurrent();
  }

  function resumeTravel() {
    if (!session) return;
    fails = 0;
    followMode = false;
    render();
    talkCurrent();
  }

  function busDrop(spoken, result) {
    const dest = LifeSpeech.findStop(spoken);
    if (dest) {
      const name = (window.LifePlaces[dest] && LifePlaces[dest].name) || dest;
      return {
        dest,
        result: {
          ok: "车子把你送到了" + name + "。",
          funny: "你报站报得很快，一下子就到了" + name + "。"
        }
      };
    }
    const text = LifeSpeech.normalize(spoken);
    if (/\b(go|going)\b/.test(text) || /去/.test(String(spoken || ""))) {
      return {
        dest: "town",
        result: {
          ok: "司机点点头，车子开了一站。",
          funny: "车子开得很快，你在下一站下了车。"
        }
      };
    }
    return {
      dest: "",
      result: result || { ok: "司机点点头，车门开了。", funny: "你指了指前面，司机笑着开车门。" }
    };
  }

  function finish(result) {
    const event = session.event;
    let dest = "";
    if (event.id === "busRide") {
      const drop = busDrop(session.spoken, result);
      dest = drop.dest;
      result = drop.result;
    }
    const funny = session.funny;
    const text = funny ? result.funny : result.ok;
    LifeState.addPhoto({
      eventId: event.id,
      title: event.title,
      emoji: event.photo.emoji,
      caption: event.photo.caption,
      line: session.spoken,
      grade: LifeState.data.grade,
      funny,
      at: Date.now()
    });
    LifeState.addCoins(8);
    close();
    document.dispatchEvent(
      new CustomEvent("life-result", {
        detail: { kind: event.resultKind, text, funny, eventId: event.id, spoken: session.spoken, dest }
      })
    );
    session = null;
  }

  function abort() {
    session = null;
    close();
    document.dispatchEvent(new CustomEvent("life-abort"));
  }

  function close() {
    LifeSpeech.stop();
    LifeSpeech.stopSpeak();
    if (root) {
      root.hidden = true;
      root.innerHTML = "";
    }
  }

  function kidLine(text) {
    return String(text || "").replace(/Xiaoyu/g, LifeState.data.name || "Xiaoyu");
  }

  function hintText(step) {
    if (step.hint) return step.hint;
    const card = (step.choices || [])[0];
    if (card && card.text) return "可以试试：" + kidLine(card.text);
    return "再听一遍对方的话，用自己的英语回答。";
  }

  function note(text) {
    const node = root && root.querySelector("#talk-heard");
    if (node) node.textContent = text;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function busy() {
    return Boolean(session) && !root.hidden;
  }

  function peek() {
    return session;
  }

  return { init, open, close, abort, resumeTravel, busy, peek };
})();
