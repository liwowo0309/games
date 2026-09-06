(() => {
  const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
  const STORAGE_KEY = "emotion-agent-academy-v1";

  const state = {
    levelIndex: 0,
    attempts: 0,
    passed: false,
    modelsReady: false,
    stream: null,
    detecting: false,
    progress: loadProgress(),
  };

  const els = {
    map: document.getElementById("view-map"),
    brief: document.getElementById("view-brief"),
    play: document.getElementById("view-play"),
    clear: document.getElementById("view-clear"),
    ending: document.getElementById("view-ending"),
    levelPath: document.getElementById("level-path"),
    mentorText: document.getElementById("mentor-text"),
    mentorTitle: document.getElementById("mentor-title"),
    hudStars: document.getElementById("hud-stars"),
    hudCleared: document.getElementById("hud-cleared"),
    hudTotal: document.getElementById("hud-total"),
    briefStage: document.getElementById("brief-stage"),
    briefTitle: document.getElementById("brief-title"),
    briefStory: document.getElementById("brief-story"),
    briefTip: document.getElementById("brief-tip"),
    briefMission: document.getElementById("brief-mission"),
    playLevelText: document.getElementById("play-level-text"),
    playProgressBar: document.getElementById("play-progress-bar"),
    lives: document.getElementById("lives"),
    promptLabel: document.getElementById("prompt-label"),
    promptText: document.getElementById("prompt-text"),
    attemptCount: document.getElementById("attempt-count"),
    attemptMax: document.getElementById("attempt-max"),
    statusText: document.getElementById("status-text"),
    emotionList: document.getElementById("emotion-list"),
    resultGender: document.getElementById("result-gender"),
    resultAge: document.getElementById("result-age"),
    verdict: document.getElementById("verdict"),
    video: document.getElementById("video"),
    overlay: document.getElementById("overlay"),
    placeholder: document.getElementById("camera-placeholder"),
    modelLoading: document.getElementById("model-loading"),
    btnStart: document.getElementById("btn-start"),
    btnRestart: document.getElementById("btn-restart"),
    btnScoring: document.getElementById("btn-scoring"),
    btnBackMap: document.getElementById("btn-back-map"),
    btnBriefBack: document.getElementById("btn-brief-back"),
    btnBriefStart: document.getElementById("btn-brief-start"),
    btnClearMap: document.getElementById("btn-clear-map"),
    btnClearNext: document.getElementById("btn-clear-next"),
    btnEndingMap: document.getElementById("btn-ending-map"),
    btnReset: document.getElementById("btn-reset-progress"),
    clearTitle: document.getElementById("clear-title"),
    clearMsg: document.getElementById("clear-msg"),
    clearLearn: document.getElementById("clear-learn"),
    starRow: document.getElementById("star-row"),
    endingStars: document.getElementById("ending-stars"),
    endingRank: document.getElementById("ending-rank"),
    scoringDialog: document.getElementById("scoring-dialog"),
    scoringContent: document.getElementById("scoring-content"),
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { unlocked: 0, stars: {}, bestAttempts: {} };
      const data = JSON.parse(raw);
      return {
        unlocked: data.unlocked ?? 0,
        stars: data.stars || {},
        bestAttempts: data.bestAttempts || {},
      };
    } catch {
      return { unlocked: 0, stars: {}, bestAttempts: {} };
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  }

  function currentLevel() {
    return LEVELS[state.levelIndex];
  }

  function maxUnlocked() {
    return Math.min(state.progress.unlocked, LEVELS.length - 1);
  }

  function isUnlocked(index) {
    return index <= state.progress.unlocked;
  }

  function totalStars() {
    return Object.values(state.progress.stars).reduce((a, b) => a + b, 0);
  }

  function clearedCount() {
    return Object.keys(state.progress.stars).length;
  }

  function calcStars(attempts, maxAttempts) {
    const left = maxAttempts - attempts;
    if (left >= maxAttempts - 1) return 3;
    if (left >= 1) return 2;
    return 1;
  }

  function rankName(stars) {
    if (stars >= 18) return "表情大师";
    if (stars >= 12) return "资深特工";
    if (stars >= 6) return "实习特工";
    return "表情学徒";
  }

  function showView(name) {
    els.map.classList.toggle("hidden", name !== "map");
    els.brief.classList.toggle("hidden", name !== "brief");
    els.play.classList.toggle("hidden", name !== "play");
    els.clear.classList.toggle("hidden", name !== "clear");
    els.ending.classList.toggle("hidden", name !== "ending");
  }

  function updateHud() {
    els.hudStars.textContent = String(totalStars());
    els.hudCleared.textContent = String(clearedCount());
    els.hudTotal.textContent = String(LEVELS.length);

    const next = state.progress.unlocked;
    if (clearedCount() >= LEVELS.length) {
      els.mentorTitle.textContent = "导师小智 · 毕业寄语";
      els.mentorText.textContent =
        "全部关卡已通关！可以回放任意关卡刷星星，继续打磨决赛手感。";
    } else if (next === 0 && clearedCount() === 0) {
      els.mentorTitle.textContent = "导师小智";
      els.mentorText.textContent =
        "欢迎加入表情特工学院！通关每一关，学会像决赛一样操作 AI 表情识别。先从第 1 关开始吧！";
    } else {
      const lv = LEVELS[Math.min(next, LEVELS.length - 1)];
      els.mentorTitle.textContent = "导师小智 · 下一关提示";
      els.mentorText.textContent = `下一关「${lv.title}」已解锁：${lv.subtitle}。点地图上的关卡继续闯！`;
    }
  }

  function renderMap() {
    els.levelPath.innerHTML = LEVELS.map((lv, i) => {
      const unlocked = isUnlocked(i);
      const stars = state.progress.stars[lv.id] || 0;
      const cleared = stars > 0;
      const current = unlocked && i === state.progress.unlocked && !cleared;
      const starHtml = [1, 2, 3]
        .map((n) => `<span class="${n <= stars ? "on" : ""}">★</span>`)
        .join("");

      return `
        <button type="button" class="level-node ${unlocked ? "unlocked" : "locked"} ${
          cleared ? "cleared" : ""
        } ${current ? "current" : ""}" data-index="${i}" ${
          unlocked ? "" : "disabled"
        }>
          <span class="node-icon">${unlocked ? lv.icon : "🔒"}</span>
          <span class="node-stage">第 ${lv.stage} 关</span>
          <span class="node-title">${lv.title}</span>
          <span class="node-stars">${starHtml}</span>
          ${current ? '<span class="node-badge">可挑战</span>' : ""}
          ${cleared && unlocked ? '<span class="node-badge done">已通关</span>' : ""}
        </button>`;
    }).join("");

    els.levelPath.querySelectorAll("[data-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        if (!isUnlocked(index)) return;
        openBrief(index);
      });
    });

    updateHud();
  }

  function openBrief(index) {
    state.levelIndex = index;
    const lv = currentLevel();
    els.briefStage.textContent = `第 ${lv.stage} 关`;
    els.briefTitle.textContent = `${lv.icon} ${lv.title}`;
    els.briefStory.textContent = lv.story;
    els.briefTip.textContent = lv.tip;
    els.briefMission.textContent = lv.mission;
    showView("brief");
  }

  function startLevel() {
    const lv = currentLevel();
    state.attempts = 0;
    state.passed = false;
    state.detecting = false;

    els.playLevelText.textContent = `第 ${lv.stage} 关 · ${lv.title}`;
    els.playProgressBar.style.width = `${(lv.stage / LEVELS.length) * 100}%`;
    els.promptLabel.textContent = `第 ${lv.stage} 关任务`;
    els.promptText.textContent = lv.prompt;
    els.attemptMax.textContent = String(lv.maxAttempts);
    els.attemptCount.textContent = "0";
    els.statusText.textContent = "等待识别";
    els.statusText.className = "status-idle";
    els.resultGender.textContent = "—";
    els.resultAge.textContent = "—";
    els.verdict.className = "verdict";
    els.verdict.textContent = "摆好表情后点击「开始识别」。读右侧置信度条，像玩闯关一样调整！";
    els.btnStart.disabled = false;
    els.btnStart.textContent = "开始识别";
    renderLives();
    renderEmotionBars(null);
    clearOverlay();
    showView("play");
    ensureCameraAndModels();
  }

  function renderLives() {
    const lv = currentLevel();
    const left = Math.max(0, lv.maxAttempts - state.attempts);
    els.lives.innerHTML = Array.from({ length: lv.maxAttempts }, (_, i) => {
      const on = i < left;
      return `<span class="life ${on ? "on" : "off"}" title="识别机会">●</span>`;
    }).join("");
  }

  function renderEmotionBars(expressions) {
    els.emotionList.innerHTML = EMOTIONS.map((emotion) => {
      const value = expressions ? expressions[emotion.key] || 0 : 0;
      const pct = Math.round(value * 1000) / 10;
      const top =
        expressions &&
        emotion.key ===
          Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
      return `
        <li class="emotion-item ${top ? "highlight" : ""}">
          <span>${emotion.label}</span>
          <div class="bar"><span style="width:${pct}%"></span></div>
          <span class="pct">${pct.toFixed(1)}%</span>
        </li>`;
    }).join("");
  }

  async function ensureCameraAndModels() {
    els.modelLoading.classList.remove("hidden");
    els.placeholder.classList.add("hidden");
    try {
      if (!state.modelsReady) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        state.modelsReady = true;
      }
      if (!state.stream) {
        state.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        els.video.srcObject = state.stream;
        await els.video.play();
      }
      els.modelLoading.classList.add("hidden");
      els.placeholder.classList.add("hidden");
    } catch (err) {
      console.error(err);
      els.modelLoading.classList.add("hidden");
      els.placeholder.classList.remove("hidden");
      els.placeholder.querySelector("p").textContent =
        "无法开启摄像头或加载模型。请用 Chrome/Edge，允许摄像头后刷新。";
      els.btnStart.disabled = true;
    }
  }

  function clearOverlay() {
    const ctx = els.overlay.getContext("2d");
    ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
  }

  function drawBox(box) {
    const video = els.video;
    const canvas = els.overlay;
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const resized = faceapi.resizeResults(box, {
      width: canvas.width,
      height: canvas.height,
    });
    ctx.strokeStyle = "#3cb371";
    ctx.lineWidth = 3;
    ctx.strokeRect(resized.x, resized.y, resized.width, resized.height);
  }

  async function runDetection() {
    const lv = currentLevel();
    if (state.detecting || state.passed) return;
    if (state.attempts >= lv.maxAttempts) {
      els.verdict.className = "verdict fail";
      els.verdict.textContent = `次数用尽！点「重新挑战」再来一次。`;
      els.statusText.textContent = "失败";
      els.statusText.className = "status-fail";
      return;
    }
    if (!state.modelsReady || !state.stream) {
      await ensureCameraAndModels();
      if (!state.modelsReady || !state.stream) return;
    }

    state.detecting = true;
    els.btnStart.disabled = true;
    els.btnStart.textContent = "识别中…";
    els.statusText.textContent = "识别中";
    els.statusText.className = "status-warn";

    try {
      const detection = await faceapi
        .detectSingleFace(
          els.video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })
        )
        .withFaceExpressions()
        .withAgeAndGender();

      state.attempts += 1;
      els.attemptCount.textContent = String(state.attempts);
      renderLives();

      if (!detection) {
        els.statusText.textContent = "未检测到人脸";
        els.statusText.className = "status-fail";
        els.verdict.className = "verdict fail";
        els.verdict.textContent =
          "没有检测到人脸（仍扣次数）。请正对摄像头、光线充足后再试。";
        clearOverlay();
        finishAttemptUi();
        return;
      }

      drawBox(detection.detection.box);
      const expressions = detection.expressions;
      const topEmotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
      els.resultGender.textContent =
        detection.gender === "male" ? "男" : detection.gender === "female" ? "女" : "—";
      els.resultAge.textContent = String(Math.round(detection.age));
      renderEmotionBars(expressions);

      const judged = lv.check({
        expressions,
        topEmotion,
        gender: detection.gender,
        age: detection.age,
      });

      els.verdict.textContent = judged.message;
      els.verdict.className = `verdict ${judged.pass ? "pass" : "fail"}`;
      els.statusText.textContent = judged.pass ? "通关！" : "未达标";
      els.statusText.className = judged.pass ? "status-ok" : "status-fail";

      if (judged.pass) {
        state.passed = true;
        onLevelClear();
      }
    } catch (err) {
      console.error(err);
      els.verdict.className = "verdict fail";
      els.verdict.textContent = "识别出错，请刷新重试。";
    } finally {
      state.detecting = false;
      finishAttemptUi();
    }
  }

  function finishAttemptUi() {
    const lv = currentLevel();
    const left = lv.maxAttempts - state.attempts;
    if (state.passed) {
      els.btnStart.disabled = true;
      els.btnStart.textContent = "已通关";
    } else if (left <= 0) {
      els.btnStart.disabled = true;
      els.btnStart.textContent = "次数用尽";
      els.verdict.textContent += " 可以点「重新挑战」。";
    } else {
      els.btnStart.disabled = false;
      els.btnStart.textContent = "开始识别";
    }
  }

  function onLevelClear() {
    const lv = currentLevel();
    const stars = calcStars(state.attempts, lv.maxAttempts);
    const prev = state.progress.stars[lv.id] || 0;
    state.progress.stars[lv.id] = Math.max(prev, stars);
    state.progress.bestAttempts[lv.id] = Math.min(
      state.attempts,
      state.progress.bestAttempts[lv.id] || 99
    );
    if (state.levelIndex >= state.progress.unlocked) {
      state.progress.unlocked = Math.min(state.levelIndex + 1, LEVELS.length - 1);
      // 若刚通最后一关，unlocked 保持最后一关索引，用 stars 数量判断全通
      if (state.levelIndex === LEVELS.length - 1) {
        state.progress.unlocked = LEVELS.length - 1;
      }
    }
    // 通关后解锁下一关：unlocked 指向下一可挑战索引
    if (state.levelIndex + 1 < LEVELS.length) {
      state.progress.unlocked = Math.max(state.progress.unlocked, state.levelIndex + 1);
    }
    saveProgress();

    setTimeout(() => showClearScreen(stars), 650);
  }

  function showClearScreen(stars) {
    stopCamera();
    const lv = currentLevel();
    const isLast = state.levelIndex >= LEVELS.length - 1;
    els.clearTitle.textContent = isLast ? "毕业关通过！" : "关卡通过！";
    els.clearMsg.textContent = `${lv.title} · 用了 ${state.attempts} 次识别 · 获得 ${stars} 星`;
    els.clearLearn.textContent = lv.learnAfter;
    els.starRow.innerHTML = [1, 2, 3]
      .map(
        (n) =>
          `<span class="big-star ${n <= stars ? "on" : ""}" style="animation-delay:${
            n * 0.12
          }s">★</span>`
      )
      .join("");
    els.btnClearNext.textContent = isLast ? "领取毕业证书" : "下一关 →";
    els.btnClearNext.dataset.last = isLast ? "1" : "0";
    showView("clear");
  }

  function goNextFromClear() {
    if (els.btnClearNext.dataset.last === "1") {
      showEnding();
      return;
    }
    openBrief(state.levelIndex + 1);
  }

  function showEnding() {
    els.endingStars.textContent = String(totalStars());
    els.endingRank.textContent = rankName(totalStars());
    showView("ending");
  }

  function restartLevel() {
    startLevel();
  }

  function openScoring() {
    const lv = currentLevel();
    els.scoringContent.innerHTML = `
      <ul>${lv.scoring.map((line) => `<li>${line}</li>`).join("")}</ul>
      <p class="dialog-note">最多识别 ${lv.maxAttempts} 次 · 次数越少星越多</p>
    `;
    els.scoringDialog.showModal();
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
      els.video.srcObject = null;
    }
  }

  function backToMap() {
    stopCamera();
    renderMap();
    showView("map");
  }

  function resetProgress() {
    if (!confirm("确定重置全部闯关进度吗？")) return;
    state.progress = { unlocked: 0, stars: {}, bestAttempts: {} };
    saveProgress();
    renderMap();
  }

  // events
  els.btnBriefStart.addEventListener("click", startLevel);
  els.btnBriefBack.addEventListener("click", backToMap);
  els.btnBackMap.addEventListener("click", backToMap);
  els.btnStart.addEventListener("click", runDetection);
  els.btnRestart.addEventListener("click", restartLevel);
  els.btnScoring.addEventListener("click", openScoring);
  els.btnClearMap.addEventListener("click", backToMap);
  els.btnClearNext.addEventListener("click", goNextFromClear);
  els.btnEndingMap.addEventListener("click", backToMap);
  els.btnReset.addEventListener("click", resetProgress);

  // init
  els.hudTotal.textContent = String(LEVELS.length);
  renderMap();
  showView("map");
})();
