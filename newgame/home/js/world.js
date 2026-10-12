const LifeWorld = (() => {
  const VIEW = { w: 1100, h: 740 };
  const WORLD = { w: 2400, h: 1600 };
  const ROOM_NAMES = {
    home: "家里",
    town: "街上",
    school: "教室",
    playground: "操场",
    library: "图书室",
    shop: "小店",
    clinic: "诊所",
    cafe: "餐厅",
    park: "公园",
    bus: "车站"
  };
  const TOWN_HITS = [
    { id: "in-shop", x: 1860, y: 170, w: 340, h: 270 },
    { id: "in-clinic", x: 250, y: 780, w: 300, h: 240 },
    { id: "in-cafe", x: 1560, y: 540, w: 300, h: 240 },
    { id: "in-park", x: 540, y: 920, w: 340, h: 260 },
    { id: "in-bus", x: 1980, y: 780, w: 280, h: 220 }
  ];
  const ROOMS = {
    home: {
      spawn: { x: 540, y: 520 },
      npcs: {
        mom: { x: 210, y: 300 },
        dad: { x: 540, y: 360 },
        grandma: { x: 860, y: 320 },
        sister: { x: 380, y: 480 }
      },
      doors: [{ id: "out", to: "town", at: "homeDoor", x: 540, y: 660, label: "出门" }]
    },
    town: {
      spawn: { x: 360, y: 500 },
      npcs: {
        sister: { x: 520, y: 480 },
        classmate: { x: 1120, y: 1320 },
        vendor: { x: 1360, y: 900 }
      },
      doors: [
        { id: "in-home", to: "home", x: 280, y: 400, label: "进家" },
        { id: "in-school", to: "school", x: 1140, y: 1280, label: "进学校" },
        { id: "in-shop", to: "shop", x: 2020, y: 360, label: "进小店" },
        { id: "in-clinic", to: "clinic", x: 400, y: 920, label: "进诊所" },
        { id: "in-cafe", to: "cafe", x: 1720, y: 700, label: "进餐厅" },
        { id: "in-park", to: "park", x: 700, y: 1080, label: "进公园" },
        { id: "in-bus", to: "bus", x: 2140, y: 900, label: "上车" }
      ],
      stalls: [{ id: "snack", x: 1340, y: 820, label: "看摊" }]
    },
    school: {
      spawn: { x: 200, y: 580 },
      npcs: {
        teacher: { x: 550, y: 210 },
        classmate: { x: 360, y: 420 },
        mia: { x: 760, y: 420 }
      },
      doors: [
        { id: "out", to: "town", at: "schoolDoor", x: 140, y: 640, label: "出校门" },
        { id: "to-yard", to: "playground", x: 540, y: 660, label: "去操场" },
        { id: "to-lib", to: "library", x: 920, y: 640, label: "图书室" }
      ]
    },
    playground: {
      spawn: { x: 160, y: 600 },
      npcs: {
        ken: { x: 420, y: 390 },
        amy: { x: 740, y: 400 }
      },
      doors: [{ id: "back", to: "school", x: 140, y: 640, label: "回教室" }]
    },
    library: {
      spawn: { x: 180, y: 600 },
      npcs: {
        librarian: { x: 540, y: 280 }
      },
      doors: [{ id: "back", to: "school", x: 140, y: 640, label: "回教室" }]
    },
    shop: {
      spawn: { x: 200, y: 600 },
      npcs: {
        clerk: { x: 540, y: 360 }
      },
      doors: [{ id: "out", to: "town", at: "shopDoor", x: 160, y: 640, label: "出店" }],
      stalls: [
        { id: "shop", x: 200, y: 280, label: "看货架" },
        { id: "shop", x: 900, y: 280, label: "看货架" }
      ]
    },
    clinic: {
      spawn: { x: 200, y: 600 },
      npcs: { doctor: { x: 550, y: 340 } },
      doors: [{ id: "out", to: "town", at: "clinicDoor", x: 160, y: 640, label: "出诊所" }]
    },
    cafe: {
      spawn: { x: 200, y: 600 },
      npcs: { waiter: { x: 550, y: 360 } },
      doors: [{ id: "out", to: "town", at: "cafeDoor", x: 160, y: 640, label: "出餐厅" }]
    },
    park: {
      spawn: { x: 180, y: 600 },
      npcs: { ben: { x: 550, y: 360 } },
      doors: [{ id: "out", to: "town", at: "parkDoor", x: 160, y: 640, label: "出公园" }]
    },
    bus: {
      spawn: { x: 200, y: 600 },
      npcs: { driver: { x: 550, y: 340 } },
      doors: [{ id: "out", to: "town", at: "busDoor", x: 160, y: 640, label: "下车" }]
    }
  };
  const PLACE_INDEX = {
    shop: { room: "shop", x: 500, y: 400 },
    shopDoor: { room: "town", x: 2020, y: 400 },
    yard: { room: "town", x: 560, y: 500 },
    schoolGate: { room: "town", x: 1140, y: 1360 },
    schoolDoor: { room: "town", x: 1140, y: 1300 },
    homeDoor: { room: "town", x: 300, y: 460 },
    home: { room: "home", x: 540, y: 520 },
    school: { room: "school", x: 200, y: 580 },
    playground: { room: "playground", x: 160, y: 600 },
    library: { room: "library", x: 180, y: 600 },
    kitchen: { room: "home", x: 220, y: 320 },
    clinic: { room: "clinic", x: 500, y: 400 },
    clinicDoor: { room: "town", x: 400, y: 960 },
    cafe: { room: "cafe", x: 500, y: 400 },
    cafeDoor: { room: "town", x: 1720, y: 740 },
    park: { room: "park", x: 500, y: 400 },
    parkDoor: { room: "town", x: 700, y: 1120 },
    bus: { room: "bus", x: 500, y: 400 },
    busDoor: { room: "town", x: 2140, y: 940 }
  };

  let room = "home";
  let canvas;
  let ctx;
  let player = { x: 540, y: 520 };
  let target = null;
  let arrive = null;
  let effects = {
    jump: 0,
    rain: false,
    cook: false,
    breakfast: "",
    bag: false,
    borrow: "",
    book: false,
    ball: false,
    dog: "",
    cake: false,
    cheer: false,
    plant: false,
    wash: false,
    pack: false,
    party: false,
    sticker: false,
    way: false
  };
  let bangs = {};
  let rainBits = [];
  let last = 0;
  let hoverNpc = null;
  let pendingTalk = null;
  let pendingDoor = null;
  let pendingStall = null;
  let hold = null;
  let travelPlace = null;

  function roomNpcs() {
    return ROOMS[room].npcs;
  }

  function init(node) {
    canvas = node;
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onTap);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    for (let i = 0; i < 90; i += 1) {
      rainBits.push({
        x: Math.random() * WORLD.w,
        y: Math.random() * WORLD.h,
        z: 8 + Math.random() * 10
      });
    }
    last = performance.now();
    requestAnimationFrame(tick);
  }

  function resize() {
    canvas.width = VIEW.w;
    canvas.height = VIEW.h;
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
  }

  function bounds() {
    return room === "town" ? WORLD : VIEW;
  }

  function cam() {
    if (room !== "town") return { x: 0, y: 0 };
    return {
      x: clamp(player.x - VIEW.w / 2, 0, Math.max(0, WORLD.w - VIEW.w)),
      y: clamp(player.y - VIEW.h / 2, 0, Math.max(0, WORLD.h - VIEW.h))
    };
  }

  function setEffects(next) {
    effects = Object.assign({}, effects, next);
  }

  function setBangs(next) {
    bangs = next || {};
  }

  function dropOff(id) {
    if (id === "town") {
      setRoom("town", PLACE_INDEX.busDoor, "bus");
      return;
    }
    if (ROOMS[id]) setRoom(id, null, "bus");
  }

  function setRoom(id, at, how) {
    if (!ROOMS[id]) return;
    const from = room;
    room = id;
    const spot = at || ROOMS[id].spawn;
    player.x = spot.x;
    player.y = spot.y;
    target = null;
    pendingTalk = null;
    pendingDoor = null;
    pendingStall = null;
    travelPlace = null;
    document.dispatchEvent(new CustomEvent("life-room", { detail: { room: id, from, how: how || "" } }));
  }

  function goTo(placeId) {
    const spot = PLACE_INDEX[placeId];
    if (!spot) return;
    if (spot.room !== room) {
      setRoom(spot.room, { x: spot.x, y: spot.y });
      travelPlace = placeId;
      return;
    }
    target = { x: spot.x + 20, y: spot.y + 28 };
    travelPlace = placeId;
  }

  function clearTravel() {
    travelPlace = null;
  }

  function snapTo(placeId) {
    const spot = PLACE_INDEX[placeId];
    if (!spot) return;
    if (spot.room !== room) setRoom(spot.room, { x: spot.x + 20, y: spot.y + 28 });
    else {
      player.x = spot.x + 20;
      player.y = spot.y + 28;
    }
    target = null;
    if (travelPlace && nearPlace(travelPlace)) {
      const done = { place: travelPlace };
      travelPlace = null;
      if (arrive) arrive(done);
    }
  }

  function npcPos(id) {
    return roomNpcs()[id];
  }

  function nearNpc(id) {
    const spot = npcPos(id);
    return Boolean(spot && dist(player, spot) < 96);
  }

  function closestNpc() {
    let best = null;
    let bestD = 96;
    Object.keys(roomNpcs()).forEach((id) => {
      const d = dist(player, roomNpcs()[id]);
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    });
    return best;
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function talkTo(npc) {
    document.dispatchEvent(new CustomEvent("life-npc", { detail: npc }));
  }

  function hitDoor(x, y) {
    let found = null;
    let best = 56;
    (ROOMS[room].doors || []).forEach((door) => {
      const d = Math.hypot(x - door.x, y - door.y);
      if (d < best) {
        best = d;
        found = door;
      }
    });
    return found;
  }

  function useDoor(door) {
    if (door.at && PLACE_INDEX[door.at]) {
      const spot = PLACE_INDEX[door.at];
      setRoom(door.to, { x: spot.x, y: spot.y }, "door");
      return;
    }
    setRoom(door.to, null, "door");
  }

  function openStall(stall) {
    document.dispatchEvent(new CustomEvent("life-stall", { detail: stall.id }));
  }

  function hitStall(x, y) {
    let found = null;
    (ROOMS[room].stalls || []).forEach((stall) => {
      if (Math.abs(x - stall.x) < 72 && Math.abs(y - stall.y) < 42) found = stall;
    });
    return found;
  }

  function hitTownBuild(x, y) {
    if (room !== "town") return null;
    const hit = TOWN_HITS.find((box) => x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h);
    if (!hit) return null;
    return (ROOMS.town.doors || []).find((door) => door.id === hit.id) || null;
  }

  function onTap(event) {
    if (!canvas.getBoundingClientRect().width) return;
    const rect = canvas.getBoundingClientRect();
    const view = cam();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW.w + view.x;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW.h + view.y;
    const stall = hitStall(x, y);
    if (stall) {
      if (dist(player, stall) < 90) {
        pendingStall = null;
        openStall(stall);
      } else {
        pendingStall = stall;
        pendingTalk = null;
        pendingDoor = null;
        target = { x: stall.x, y: stall.y + 20 };
      }
      return;
    }
    const npc = hitNpc(x, y);
    if (npc) {
      if (nearNpc(npc)) {
        pendingTalk = null;
        talkTo(npc);
      } else {
        pendingTalk = npc;
        pendingDoor = null;
        pendingStall = null;
        const spot = npcPos(npc);
        target = { x: spot.x + 22, y: spot.y + 30 };
      }
      return;
    }
    const door = hitDoor(x, y) || hitTownBuild(x, y);
    if (door) {
      if (dist(player, door) < 90) useDoor(door);
      else {
        pendingDoor = door;
        pendingTalk = null;
        pendingStall = null;
        target = { x: door.x, y: door.y - 10 };
      }
      return;
    }
    pendingTalk = null;
    pendingDoor = null;
    pendingStall = null;
    const box = bounds();
    target = {
      x: clamp(x, 40, box.w - 40),
      y: clamp(y, 80, box.h - 30)
    };
  }

  function nearPlace(id) {
    const spot = PLACE_INDEX[id];
    if (!spot || spot.room !== room) return false;
    return dist(player, spot) < 120;
  }

  function hitNpc(x, y) {
    let found = null;
    let best = 64;
    Object.keys(roomNpcs()).forEach((id) => {
      const pos = roomNpcs()[id];
      const d = Math.hypot(x - pos.x, y - pos.y);
      if (d < best) {
        best = d;
        found = id;
      }
    });
    return found;
  }

  function keyVector(event) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const map = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      a: [-1, 0],
      s: [0, 1],
      d: [1, 0]
    };
    return map[key] || null;
  }

  function onKey(event) {
    if (event.repeat) return;
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
    const move = keyVector(event);
    if (!move) return;
    event.preventDefault();
    holdMove(move[0], move[1]);
  }

  function onKeyUp(event) {
    const move = keyVector(event);
    if (!move) return;
    event.preventDefault();
    releaseMove();
  }

  function holdMove(dx, dy) {
    hold = { x: dx, y: dy };
    pendingTalk = null;
    pendingStall = null;
  }

  function releaseMove() {
    hold = null;
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function tick(now) {
    try {
      const dt = Math.min(32, now - last || 16);
      last = now;
      if (hold) {
        const spd = 0.55 * dt;
        const box = bounds();
        player.x = clamp(player.x + hold.x * spd, 40, box.w - 40);
        player.y = clamp(player.y + hold.y * spd, 80, box.h - 30);
        target = null;
      } else if (target) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const d = Math.hypot(dx, dy);
        if (d < 6) {
          player.x = target.x;
          player.y = target.y;
          target = null;
          if (pendingTalk && nearNpc(pendingTalk)) {
            const npc = pendingTalk;
            pendingTalk = null;
            talkTo(npc);
          }
          if (pendingDoor && dist(player, pendingDoor) < 90) {
            const door = pendingDoor;
            pendingDoor = null;
            useDoor(door);
          }
          if (pendingStall && dist(player, pendingStall) < 90) {
            const stall = pendingStall;
            pendingStall = null;
            openStall(stall);
          }
        } else {
          const spd = 0.55 * dt;
          const box = bounds();
          player.x = clamp(player.x + (dx / d) * spd, 40, box.w - 40);
          player.y = clamp(player.y + (dy / d) * spd, 80, box.h - 30);
        }
      }
      if (travelPlace && nearPlace(travelPlace)) {
        const done = { place: travelPlace };
        travelPlace = null;
        target = null;
        if (arrive) arrive(done);
      }
      hoverNpc = closestNpc();
      draw(now);
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame(tick);
  }

  function draw(now) {
    const view = cam();
    ctx.clearRect(0, 0, VIEW.w, VIEW.h);
    ctx.save();
    ctx.translate(-view.x, -view.y);
    if (room === "home") drawHome(now);
    else if (room === "school") drawSchool(now);
    else if (room === "playground") drawPlayground(now);
    else if (room === "library") drawLibrary(now);
    else if (room === "shop") drawShopIn(now);
    else if (room === "clinic") drawClinic();
    else if (room === "cafe") drawCafe();
    else if (room === "park") drawPark();
    else if (room === "bus") drawBus();
    else drawTown(now);
    if (effects.rain && room === "town") rain();
    if (target) {
      ctx.fillStyle = "rgba(76,124,240,0.22)";
      ctx.beginPath();
      ctx.arc(target.x, target.y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    (ROOMS[room].doors || []).forEach(drawDoor);
    (ROOMS[room].stalls || []).forEach(drawStallMark);
    Object.keys(roomNpcs()).forEach((id) => {
      const jump = id === "sister" ? effects.jump : 0;
      drawNpc(id, roomNpcs()[id], now, jump);
    });
    drawCute(
      player.x,
      player.y,
      lookOf("player"),
      LifeState.data.name || "You",
      0,
      now,
      true,
      Boolean(hold || target)
    );
    labels();
    ctx.restore();
  }

  function drawTown() {
    sky();
    ctx.fillStyle = effects.rain ? "#6fa35a" : "#86c46a";
    ctx.fillRect(0, 360, WORLD.w, WORLD.h);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i < 40; i += 1) {
      ctx.beginPath();
      ctx.ellipse(80 + i * 60, 400 + (i % 5) * 180, 32, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#e8d5a3";
    ctx.lineWidth = 42;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(280, 420);
    ctx.lineTo(800, 700);
    ctx.lineTo(1960, 380);
    ctx.moveTo(800, 700);
    ctx.lineTo(1140, 1280);
    ctx.moveTo(800, 700);
    ctx.lineTo(400, 920);
    ctx.moveTo(1600, 620);
    ctx.lineTo(1720, 700);
    ctx.moveTo(1280, 780);
    ctx.lineTo(2140, 900);
    ctx.stroke();
    house();
    shop();
    schoolGate();
    stall();
    clinicOut();
    cafeOut();
    parkOut();
    busOut();
    [
      [360, 280],
      [640, 240],
      [900, 560],
      [1500, 420],
      [1800, 980],
      [500, 1280],
      [2200, 520]
    ].forEach(([x, y]) => {
      ctx.fillStyle = "#2d6a4f";
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b4226";
      ctx.fillRect(x - 5, y, 10, 38);
    });
  }

  function drawHome() {
    ctx.fillStyle = "#c9a27a";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#f6e6cf";
    ctx.fillRect(40, 70, 1020, 620);
    ctx.fillStyle = "#ead7b8";
    ctx.fillRect(40, 70, 1020, 70);
    ctx.fillStyle = "#3a2f27";
    ctx.font = "700 22px 'Nunito', sans-serif";
    ctx.fillText("家里", 70, 115);
    ctx.fillStyle = "#e7c7a0";
    roundRect(70, 200, 280, 220, 16);
    ctx.fillStyle = "#c96b4a";
    roundRect(90, 300, 180, 70, 8);
    if (effects.cook) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(140 + i * 12, 250 - (Date.now() / 180 + i * 8) % 24, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (effects.breakfast) {
      ctx.font = "28px sans-serif";
      ctx.fillText(foodEmoji(effects.breakfast), 160, 290);
    }
    ctx.fillStyle = "#7a6556";
    ctx.font = "700 16px 'Nunito', sans-serif";
    ctx.fillText("厨房", 170, 230);
    ctx.fillStyle = "#d9c4a5";
    roundRect(420, 240, 260, 160, 16);
    ctx.fillStyle = "#8d6e53";
    roundRect(450, 300, 200, 50, 10);
    ctx.fillStyle = "#7a6556";
    ctx.fillText("客厅", 520, 275);
    ctx.fillStyle = "#f0d5dc";
    roundRect(760, 210, 240, 200, 16);
    ctx.fillStyle = "#c97b84";
    roundRect(800, 280, 80, 70, 10);
    ctx.fillStyle = "#7a6556";
    ctx.fillText("奶奶的椅", 820, 245);
    if (effects.book) {
      ctx.font = "28px sans-serif";
      ctx.fillText("📚", 880, 270);
    }
    if (effects.cake || effects.party) {
      ctx.font = "32px sans-serif";
      ctx.fillText("🎂🎈", 500, 230);
    }
    if (effects.plant) {
      ctx.font = "28px sans-serif";
      ctx.fillText("🪴", 820, 200);
    }
    if (effects.wash) {
      ctx.font = "28px sans-serif";
      ctx.fillText("🧼", 200, 250);
    }
    if (effects.pack) {
      ctx.font = "28px sans-serif";
      ctx.fillText("🎒", 500, 280);
    }
  }

  function drawSchool() {
    ctx.fillStyle = "#8fb8c9";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#f4efe4";
    ctx.fillRect(50, 80, 1000, 600);
    ctx.fillStyle = "#2d6a4f";
    roundRect(280, 100, 540, 140, 12);
    ctx.fillStyle = "#f8f4e6";
    ctx.font = "700 28px 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Welcome to class", 550, 180);
    ctx.textAlign = "left";
    ctx.fillStyle = "#d7b48a";
    roundRect(250, 360, 180, 100, 10);
    roundRect(650, 360, 180, 100, 10);
    roundRect(450, 500, 180, 100, 10);
    ctx.fillStyle = "#1d3557";
    ctx.font = "700 16px 'Nunito', sans-serif";
    ctx.fillText("教室", 70, 130);
    if (effects.borrow) {
      ctx.font = "28px sans-serif";
      ctx.fillText("✏️", 320, 350);
    }
  }

  function drawPlayground() {
    ctx.fillStyle = "#7cb342";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#c8a45a";
    ctx.fillRect(220, 160, 660, 420);
    ctx.strokeStyle = "#fff8ee";
    ctx.lineWidth = 4;
    ctx.strokeRect(250, 190, 600, 360);
    ctx.beginPath();
    ctx.arc(550, 370, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e76f51";
    ctx.fillRect(250, 300, 18, 140);
    ctx.fillRect(832, 300, 18, 140);
    ctx.fillStyle = "#1d3557";
    ctx.font = "700 22px 'Nunito', sans-serif";
    ctx.fillText("操场", 70, 80);
    ctx.font = "26px sans-serif";
    ctx.fillText("🏀", effects.ball ? 500 : 390, 300);
    if (effects.cheer) {
      ctx.font = "30px sans-serif";
      ctx.fillText("📣", 620, 260);
      ctx.fillText("★", 480 + Math.sin(Date.now() / 200) * 8, 240);
    }
  }

  function drawLibrary() {
    ctx.fillStyle = "#6d5843";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#f3e6d0";
    ctx.fillRect(50, 70, 1000, 610);
    ctx.fillStyle = "#8d6e53";
    roundRect(80, 120, 200, 420, 10);
    roundRect(820, 120, 200, 420, 10);
    ctx.fillStyle = "#c9a227";
    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(100, 150 + i * 60, 160, 18);
      ctx.fillRect(840, 150 + i * 60, 160, 18);
    }
    ctx.fillStyle = "#d7b48a";
    roundRect(400, 400, 300, 90, 12);
    ctx.fillStyle = "#3a2f27";
    ctx.font = "700 22px 'Nunito', sans-serif";
    ctx.fillText("图书室", 70, 115);
    if (effects.book) {
      ctx.font = "32px sans-serif";
      ctx.fillText("📚", 520, 380);
    }
  }

  function sky() {
    const g = ctx.createLinearGradient(0, 0, 0, 380);
    g.addColorStop(0, effects.rain ? "#8aa4b8" : "#9ad7ea");
    g.addColorStop(1, effects.rain ? "#c5d4c4" : "#d9f0c7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  }

  function house() {
    const x = 160;
    const y = 200;
    ctx.fillStyle = "#f3d2a6";
    roundRect(x, y + 46, 200, 140, 16);
    ctx.fillStyle = "#e07a5f";
    ctx.beginPath();
    ctx.moveTo(108, y + 54);
    ctx.lineTo(220, y);
    ctx.lineTo(332, y + 54);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7ec8d4";
    roundRect(x + 24, y + 78, 44, 36, 6);
    ctx.fillStyle = "#c96b4a";
    roundRect(x + 118, y + 96, 40, 86, 6);
    ctx.fillStyle = "#3a2f27";
    ctx.font = "700 18px 'Nunito', sans-serif";
    ctx.fillText("家", x + 86, y + 40);
  }

  function shop() {
    const x = 1880;
    const y = 160;
    ctx.fillStyle = "#fff4cc";
    roundRect(x, y + 50, 190, 150, 16);
    ctx.fillStyle = "#f4a261";
    ctx.fillRect(x - 8, y + 36, 206, 28);
    ctx.fillStyle = "#2a9d8f";
    roundRect(x + 70, y + 110, 48, 86, 6);
    ctx.fillStyle = "#e76f51";
    ctx.font = "26px sans-serif";
    ctx.fillText("🥕🍅", x + 24, y + 112);
    if (effects.bag) {
      ctx.font = "28px sans-serif";
      ctx.fillText("🛍️", x + 130, y + 120);
    }
    ctx.fillStyle = "#3a2f27";
    ctx.font = "700 18px 'Nunito', sans-serif";
    ctx.fillText("小店", x + 70, y + 30);
  }

  function schoolGate() {
    const x = 1040;
    const y = 1160;
    ctx.fillStyle = "#a8dadc";
    roundRect(x, y, 200, 130, 16);
    ctx.fillStyle = "#457b9d";
    ctx.fillRect(x + 20, y - 36, 8, 36);
    ctx.fillStyle = "#e63946";
    ctx.beginPath();
    ctx.moveTo(x + 28, y - 36);
    ctx.lineTo(x + 62, y - 22);
    ctx.lineTo(x + 28, y - 10);
    ctx.fill();
    ctx.fillStyle = "#1d3557";
    roundRect(x + 78, y + 48, 44, 80, 6);
    ctx.font = "700 18px 'Nunito', sans-serif";
    ctx.fillText("学校门口", x + 58, y - 8);
  }

  function stall() {
    ctx.fillStyle = "#ffe08a";
    roundRect(1280, 780, 140, 80, 12);
    ctx.fillStyle = "#e76f51";
    ctx.fillRect(1270, 768, 160, 16);
    ctx.font = "22px sans-serif";
    ctx.fillText("🍦🧃🍰", 1300, 830);
    ctx.fillStyle = "#3a2f27";
    ctx.font = "700 16px 'Nunito', sans-serif";
    ctx.fillText("摊位", 1320, 760);
  }

  function clinicOut() {
    const x = 270;
    const y = 800;
    ctx.fillStyle = "#e8f4ff";
    roundRect(x, y, 260, 200, 16);
    ctx.fillStyle = "#4cc9f0";
    ctx.fillRect(x, y, 260, 36);
    ctx.fillStyle = "#fff";
    ctx.font = "700 20px 'Nunito', sans-serif";
    ctx.fillText("诊所", x + 96, y + 26);
    ctx.font = "28px sans-serif";
    ctx.fillText("✚", x + 110, y + 110);
  }

  function cafeOut() {
    const x = 1580;
    const y = 560;
    ctx.fillStyle = "#ffe8d6";
    roundRect(x, y, 260, 200, 16);
    ctx.fillStyle = "#e07a5f";
    ctx.fillRect(x, y, 260, 36);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "700 20px 'Nunito', sans-serif";
    ctx.fillText("餐厅", x + 96, y + 26);
    ctx.font = "28px sans-serif";
    ctx.fillText("🍜", x + 110, y + 120);
  }

  function parkOut() {
    const x = 560;
    const y = 940;
    ctx.fillStyle = "#b7e4c7";
    roundRect(x, y, 300, 220, 16);
    ctx.fillStyle = "#2d6a4f";
    ctx.font = "700 20px 'Nunito', sans-serif";
    ctx.fillText("公园", x + 114, y + 36);
    ctx.font = "28px sans-serif";
    ctx.fillText("🌳🐦", x + 100, y + 120);
  }

  function busOut() {
    const x = 2000;
    const y = 800;
    ctx.fillStyle = "#d0e8ff";
    roundRect(x, y, 240, 180, 16);
    ctx.fillStyle = "#1d3557";
    ctx.fillRect(x + 20, y + 50, 200, 90);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "700 18px 'Nunito', sans-serif";
    ctx.fillText("车站", x + 88, y + 32);
    ctx.fillText("BUS", x + 86, y + 104);
  }

  function drawShopIn() {
    ctx.fillStyle = "#c4a574";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#fff6e4";
    ctx.fillRect(40, 70, 1020, 620);
    ctx.fillStyle = "#f4a261";
    ctx.fillRect(40, 70, 1020, 70);
    ctx.fillStyle = "#3a2f27";
    ctx.font = "700 22px 'Nunito', sans-serif";
    ctx.fillText("小店", 70, 115);
    ctx.fillStyle = "#8d6e53";
    roundRect(80, 180, 220, 280, 12);
    roundRect(800, 180, 220, 280, 12);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "34px sans-serif";
    ctx.fillText("🥕 🍅", 120, 250);
    ctx.fillText("🥬 🍎", 120, 340);
    ctx.fillText("🥛 🍞", 120, 430);
    ctx.fillText("🥕 🍅", 840, 250);
    ctx.fillText("🥬 🍎", 840, 340);
    ctx.fillText("🥛 🍞", 840, 430);
    ctx.fillStyle = "#7a6556";
    ctx.font = "700 16px 'Nunito', sans-serif";
    ctx.fillText("货架", 150, 210);
    ctx.fillText("货架", 870, 210);
    ctx.fillStyle = "#d7b48a";
    roundRect(360, 300, 380, 140, 16);
    ctx.fillStyle = "#c96b4a";
    roundRect(400, 340, 300, 70, 10);
    ctx.fillStyle = "#7a6556";
    ctx.fillText("柜台", 520, 330);
    if (effects.bag) {
      ctx.font = "32px sans-serif";
      ctx.fillText("🛍️", 620, 390);
    }
    if (effects.way) {
      ctx.font = "28px sans-serif";
      ctx.fillText("👈 👉", 480, 280);
    }
  }

  function drawClinic() {
    ctx.fillStyle = "#c9dce8";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#eef7ff";
    ctx.fillRect(40, 70, 1020, 620);
    ctx.fillStyle = "#4cc9f0";
    ctx.fillRect(40, 70, 1020, 70);
    ctx.fillStyle = "#1d3557";
    ctx.font = "700 22px 'Nunito', sans-serif";
    ctx.fillText("诊所", 70, 115);
    ctx.fillStyle = "#dbeafe";
    roundRect(300, 220, 500, 220, 16);
    ctx.font = "40px sans-serif";
    ctx.fillText("✚", 520, 320);
    ctx.fillStyle = "#457b9d";
    ctx.font = "700 18px 'Nunito', sans-serif";
    ctx.fillText("How do you feel?", 430, 390);
    if (effects.sticker) {
      ctx.font = "28px sans-serif";
      ctx.fillText("🩹⭐", 700, 280);
    }
  }

  function drawCafe() {
    ctx.fillStyle = "#c4a574";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#fff4e6";
    ctx.fillRect(40, 70, 1020, 620);
    ctx.fillStyle = "#e07a5f";
    ctx.fillRect(40, 70, 1020, 70);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "700 22px 'Nunito', sans-serif";
    ctx.fillText("餐厅", 70, 115);
    ctx.fillStyle = "#ffe8d6";
    roundRect(90, 240, 240, 150, 16);
    roundRect(770, 240, 240, 150, 16);
    ctx.fillStyle = "#d7b48a";
    roundRect(360, 320, 380, 140, 16);
    ctx.fillStyle = "#7a6556";
    ctx.font = "700 18px 'Nunito', sans-serif";
    ctx.fillText("菜单 Menu", 480, 360);
    ctx.font = "28px sans-serif";
    ctx.fillText("🍜 🍚 🥤", 470, 420);
    if (effects.bag) {
      ctx.font = "30px sans-serif";
      ctx.fillText("🍜", 520, 300);
    }
  }

  function drawPark() {
    ctx.fillStyle = "#7cb342";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#95d5b2";
    ctx.fillRect(40, 70, 1020, 620);
    ctx.fillStyle = "#2d6a4f";
    ctx.font = "700 22px 'Nunito', sans-serif";
    ctx.fillText("公园", 70, 115);
    [
      [180, 220],
      [920, 230],
      [260, 480],
      [860, 500]
    ].forEach(([x, y]) => {
      ctx.fillStyle = "#2d6a4f";
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b4226";
      ctx.fillRect(x - 6, y, 12, 50);
    });
    ctx.font = "32px sans-serif";
    ctx.fillText("🐦 🌼", 500, 280);
    if (effects.dog) {
      const bob = Math.abs(Math.sin(Date.now() / 220)) * 10;
      ctx.font = "36px sans-serif";
      ctx.fillText(effects.dog, 520, 420 - bob);
    }
  }

  function drawBus() {
    ctx.fillStyle = "#8aa4b8";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = "#d0e8ff";
    ctx.fillRect(40, 70, 1020, 620);
    ctx.fillStyle = "#1d3557";
    ctx.fillRect(40, 70, 1020, 70);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "700 22px 'Nunito', sans-serif";
    ctx.fillText("车站", 70, 115);
    ctx.fillStyle = "#457b9d";
    roundRect(220, 220, 660, 280, 20);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "700 28px 'Nunito', sans-serif";
    ctx.fillText("BUS", 500, 300);
    ctx.fillStyle = "#a8dadc";
    roundRect(280, 340, 140, 110, 10);
    roundRect(480, 340, 140, 110, 10);
    roundRect(680, 340, 140, 110, 10);
  }

  function drawDoor(door) {
    ctx.fillStyle = "rgba(224, 122, 95, 0.92)";
    roundRect(door.x - 36, door.y - 18, 72, 36, 12);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "700 13px 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(door.label, door.x, door.y + 5);
    ctx.textAlign = "left";
  }

  function drawStallMark(stall) {
    ctx.fillStyle = "rgba(42, 157, 143, 0.94)";
    roundRect(stall.x - 40, stall.y - 18, 80, 36, 12);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "700 13px 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stall.label, stall.x, stall.y + 5);
    ctx.textAlign = "left";
  }

  function rain() {
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1.4;
    rainBits.forEach((drop) => {
      drop.y += drop.z;
      if (drop.y > WORLD.h) {
        drop.y = -10;
        drop.x = Math.random() * WORLD.w;
      }
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 2, drop.y + 12);
      ctx.stroke();
    });
  }

  const LOOKS = {
    player: {
      skin: "#ffd7b5",
      hair: "#5b3a29",
      shirt: "#5b8def",
      pants: "#3d5a80",
      shoe: "#2f3542",
      hairStyle: "kid",
      size: 1,
      cheeks: true,
      vibe: "happy"
    },
    mom: {
      skin: "#ffd7b5",
      hair: "#4a2f22",
      shirt: "#e07a9a",
      pants: "#c45d7a",
      shoe: "#7a4458",
      apron: "#fff3e8",
      hairStyle: "mom",
      size: 1.08,
      cheeks: true,
      vibe: "warm"
    },
    dad: {
      skin: "#f2c29b",
      hair: "#2f2a28",
      shirt: "#3d5a80",
      pants: "#2b3f58",
      shoe: "#1d2733",
      hairStyle: "dad",
      size: 1.12,
      glasses: true,
      vibe: "calm"
    },
    grandma: {
      skin: "#f6d2b0",
      hair: "#d9d2c5",
      shirt: "#c9a27a",
      pants: "#a98467",
      shoe: "#7a6556",
      hairStyle: "grandma",
      size: 1.02,
      glasses: true,
      cheeks: true,
      vibe: "kind"
    },
    sister: {
      skin: "#ffd7b5",
      hair: "#6b3fa0",
      shirt: "#c77dff",
      pants: "#9b5de5",
      shoe: "#5a2d91",
      hairStyle: "twin",
      size: 0.9,
      cheeks: true,
      bow: "#ff8fab",
      vibe: "spark"
    },
    clerk: {
      skin: "#f2c29b",
      hair: "#3a2f27",
      shirt: "#2a9d8f",
      pants: "#1d6f66",
      shoe: "#164e48",
      apron: "#fff8ee",
      hairStyle: "short",
      size: 1.05,
      vibe: "smile"
    },
    vendor: {
      skin: "#ffd7b5",
      hair: "#5b3a29",
      shirt: "#f4a261",
      pants: "#e76f51",
      shoe: "#9c4a34",
      hairStyle: "vendor",
      hat: "#e9c46a",
      size: 1.05,
      cheeks: true,
      vibe: "cheer"
    },
    classmate: {
      skin: "#f2c29b",
      hair: "#3a2f27",
      shirt: "#f4a261",
      pants: "#d0894a",
      shoe: "#6b4226",
      hairStyle: "boy",
      size: 0.98,
      vibe: "happy"
    },
    teacher: {
      skin: "#ffd7b5",
      hair: "#3d2b1f",
      shirt: "#457b9d",
      pants: "#2f5470",
      shoe: "#1d3557",
      hairStyle: "teacher",
      glasses: true,
      size: 1.08,
      vibe: "warm"
    },
    mia: {
      skin: "#ffd7b5",
      hair: "#6b2d4a",
      shirt: "#ef476f",
      pants: "#d62856",
      shoe: "#8b1e3f",
      hairStyle: "mia",
      size: 0.95,
      cheeks: true,
      clip: "#ffd166",
      vibe: "spark"
    },
    ken: {
      skin: "#f2c29b",
      hair: "#2f2a28",
      shirt: "#e76f51",
      pants: "#2a9d8f",
      shoe: "#1d3557",
      hairStyle: "sport",
      size: 1.02,
      ball: true,
      vibe: "cheer"
    },
    amy: {
      skin: "#ffd7b5",
      hair: "#3a2f27",
      shirt: "#2a9d8f",
      pants: "#1b7a70",
      shoe: "#14564f",
      hairStyle: "pony",
      size: 0.98,
      cheeks: true,
      vibe: "cheer"
    },
    librarian: {
      skin: "#f6d2b0",
      hair: "#5c4033",
      shirt: "#8d6e53",
      pants: "#6d5843",
      shoe: "#4a3728",
      hairStyle: "bun",
      glasses: true,
      book: true,
      size: 1.05,
      vibe: "kind"
    },
    doctor: {
      skin: "#ffd7b5",
      hair: "#3a2f27",
      shirt: "#4cc9f0",
      pants: "#3a86ff",
      shoe: "#1d3557",
      coat: "#f8fbff",
      hairStyle: "short",
      size: 1.08,
      cross: true,
      vibe: "calm"
    },
    waiter: {
      skin: "#f2c29b",
      hair: "#3a2f27",
      shirt: "#fff8ee",
      pants: "#e07a5f",
      shoe: "#7a3b2e",
      hairStyle: "neat",
      bow: "#e07a5f",
      tray: true,
      size: 1.05,
      vibe: "smile"
    },
    ben: {
      skin: "#f2c29b",
      hair: "#2f2a28",
      shirt: "#40916c",
      pants: "#2d6a4f",
      shoe: "#1b4332",
      hairStyle: "cap",
      hat: "#95d5b2",
      size: 1,
      vibe: "happy"
    },
    driver: {
      skin: "#f2c29b",
      hair: "#2f2a28",
      shirt: "#1d3557",
      pants: "#0d1b2a",
      shoe: "#000814",
      hairStyle: "cap",
      hat: "#457b9d",
      size: 1.08,
      vibe: "calm"
    }
  };

  function lookOf(id) {
    return LOOKS[id] || LOOKS.player;
  }

  function drawNpc(id, pos, now, jump = 0) {
    const bounce = jump ? Math.abs(Math.sin(now / 180)) * (18 + jump * 16) : 0;
    const idleHop = id === "sister" && !jump ? Math.abs(Math.sin(now / 260)) * 3 : Math.sin(now / 420 + pos.x) * 1.2;
    drawCute(pos.x, pos.y, lookOf(id), LifeNpcs[id].name, bounce + Math.max(0, idleHop), now, false, false);
    if (bangs[id]) {
      const top = pos.y - 70 - bounce;
      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.arc(pos.x + 22, top, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff8ee";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#3a2f27";
      ctx.font = "800 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", pos.x + 22, top + 5);
      ctx.textAlign = "left";
    }
  }

  function drawCute(x, y, look, label, bounce, now, isPlayer, walking) {
    const s = look.size || 1;
    const bob = isPlayer ? Math.sin(now / 160) * 2 : Math.sin(now / 380 + x) * 1.4;
    const py = y - bounce + bob;
    const swing = walking ? Math.sin(now / 90) : Math.sin(now / 320 + x * 0.01);
    const leg = walking ? Math.sin(now / 90) * 7 : Math.sin(now / 500 + x) * 2;

    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.beginPath();
    ctx.ellipse(x, y + 20 * s, 18 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // legs
    ctx.strokeStyle = look.pants;
    ctx.lineWidth = 7 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 5 * s, py + 10 * s);
    ctx.lineTo(x - 7 * s - leg, py + 24 * s);
    ctx.moveTo(x + 5 * s, py + 10 * s);
    ctx.lineTo(x + 7 * s + leg, py + 24 * s);
    ctx.stroke();
    ctx.fillStyle = look.shoe;
    ctx.beginPath();
    ctx.ellipse(x - 8 * s - leg, py + 26 * s, 7 * s, 3.2 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 8 * s + leg, py + 26 * s, 7 * s, 3.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = look.shirt;
    roundRect(x - 14 * s, py - 8 * s, 28 * s, 26 * s, 11 * s);
    if (look.apron) {
      ctx.fillStyle = look.apron;
      roundRect(x - 10 * s, py - 2 * s, 20 * s, 18 * s, 6 * s);
      ctx.fillStyle = look.shirt;
      ctx.fillRect(x - 1.5 * s, py - 2 * s, 3 * s, 16 * s);
    }
    if (look.coat) {
      ctx.fillStyle = look.coat;
      roundRect(x - 16 * s, py - 8 * s, 32 * s, 28 * s, 10 * s);
      ctx.fillStyle = look.shirt;
      roundRect(x - 8 * s, py - 4 * s, 16 * s, 18 * s, 6 * s);
    }
    if (look.cross) {
      ctx.fillStyle = "#ef476f";
      ctx.fillRect(x - 1.5 * s, py - 2 * s, 3 * s, 12 * s);
      ctx.fillRect(x - 5 * s, py + 2 * s, 10 * s, 3 * s);
    }

    // arms
    ctx.strokeStyle = look.shirt;
    ctx.lineWidth = 6 * s;
    ctx.beginPath();
    ctx.moveTo(x - 13 * s, py);
    ctx.lineTo(x - 20 * s, py + 8 * s + swing * 3);
    ctx.moveTo(x + 13 * s, py);
    ctx.lineTo(x + 20 * s, py + 8 * s - swing * 3);
    ctx.stroke();
    ctx.fillStyle = look.skin;
    ctx.beginPath();
    ctx.arc(x - 20 * s, py + 10 * s + swing * 3, 3.4 * s, 0, Math.PI * 2);
    ctx.arc(x + 20 * s, py + 10 * s - swing * 3, 3.4 * s, 0, Math.PI * 2);
    ctx.fill();

    if (look.ball) {
      ctx.fillStyle = "#e76f51";
      ctx.beginPath();
      ctx.arc(x + 24 * s, py + 6 * s - swing * 2, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff8ee";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x + 24 * s, py + 6 * s - swing * 2, 7 * s, 0, Math.PI * 2);
      ctx.moveTo(x + 17 * s, py + 6 * s - swing * 2);
      ctx.lineTo(x + 31 * s, py + 6 * s - swing * 2);
      ctx.stroke();
    }
    if (look.book) {
      ctx.fillStyle = "#c9a227";
      roundRect(x + 16 * s, py + 2 * s, 10 * s, 12 * s, 2 * s);
      ctx.fillStyle = "#fff8ee";
      ctx.fillRect(x + 18 * s, py + 4 * s, 6 * s, 2 * s);
    }
    if (look.tray) {
      ctx.fillStyle = "#d9c4a5";
      roundRect(x + 14 * s, py + 4 * s - swing * 2, 16 * s, 5 * s, 2 * s);
      ctx.fillStyle = "#ef476f";
      ctx.beginPath();
      ctx.arc(x + 22 * s, py + 2 * s - swing * 2, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    const hx = x;
    const hy = py - 22 * s;
    drawHairBack(hx, hy, look, s);
    ctx.fillStyle = look.skin;
    ctx.beginPath();
    ctx.arc(hx, hy, 15 * s, 0, Math.PI * 2);
    ctx.fill();
    drawHairFront(hx, hy, look, s);
    drawFace(hx, hy, look, s, now, isPlayer);
    if (look.hat) drawHat(hx, hy, look, s);
    if (look.glasses) drawGlasses(hx, hy, s);
    if (look.bow && look.hairStyle !== "twin") {
      ctx.fillStyle = look.bow;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 10 * s);
      ctx.lineTo(hx - 6 * s, hy + 16 * s);
      ctx.lineTo(hx + 6 * s, hy + 16 * s);
      ctx.closePath();
      ctx.fill();
    }

    // name chip
    const chipW = Math.max(46, String(label).length * 12 + 16);
    ctx.fillStyle = "rgba(255,248,238,0.92)";
    roundRect(x - chipW / 2, py + 30 * s, chipW, 18, 9);
    ctx.fillStyle = "#5c4d40";
    ctx.font = "700 12px 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x, py + 43 * s);
    ctx.textAlign = "left";
  }

  function drawHairBack(hx, hy, look, s) {
    ctx.fillStyle = look.hair;
    if (look.hairStyle === "twin") {
      ctx.beginPath();
      ctx.arc(hx - 14 * s, hy + 4 * s, 7 * s, 0, Math.PI * 2);
      ctx.arc(hx + 14 * s, hy + 4 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = look.bow || "#ff8fab";
      ctx.beginPath();
      ctx.arc(hx - 14 * s, hy - 2 * s, 3.2 * s, 0, Math.PI * 2);
      ctx.arc(hx + 14 * s, hy - 2 * s, 3.2 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (look.hairStyle === "pony" || look.hairStyle === "mia") {
      ctx.beginPath();
      ctx.ellipse(hx + 12 * s, hy + 8 * s, 6 * s, 10 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (look.hairStyle === "mom") {
      ctx.beginPath();
      ctx.ellipse(hx + 10 * s, hy + 6 * s, 7 * s, 11 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHairFront(hx, hy, look, s) {
    ctx.fillStyle = look.hair;
    if (look.hairStyle === "grandma" || look.hairStyle === "bun" || look.hairStyle === "teacher") {
      ctx.beginPath();
      ctx.arc(hx, hy - 10 * s, 10 * s, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx, hy - 18 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (look.hairStyle === "dad" || look.hairStyle === "short" || look.hairStyle === "neat" || look.hairStyle === "sport" || look.hairStyle === "cap" || look.hairStyle === "boy" || look.hairStyle === "vendor") {
      ctx.beginPath();
      ctx.ellipse(hx, hy - 8 * s, 14 * s, 9 * s, 0, Math.PI, 0);
      ctx.fill();
      if (look.hairStyle === "boy" || look.hairStyle === "sport") {
        ctx.beginPath();
        ctx.moveTo(hx - 4 * s, hy - 16 * s);
        ctx.lineTo(hx, hy - 22 * s);
        ctx.lineTo(hx + 4 * s, hy - 16 * s);
        ctx.fill();
      }
    } else if (look.hairStyle === "kid") {
      ctx.beginPath();
      ctx.ellipse(hx, hy - 8 * s, 15 * s, 10 * s, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(hx - 2 * s, hy - 16 * s);
      ctx.quadraticCurveTo(hx + 2 * s, hy - 26 * s, hx + 8 * s, hy - 14 * s);
      ctx.quadraticCurveTo(hx + 2 * s, hy - 18 * s, hx - 2 * s, hy - 16 * s);
      ctx.fill();
    } else if (look.hairStyle === "twin" || look.hairStyle === "mom" || look.hairStyle === "pony" || look.hairStyle === "mia") {
      ctx.beginPath();
      ctx.ellipse(hx, hy - 7 * s, 15 * s, 10 * s, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(hx - 12 * s, hy - 4 * s);
      ctx.quadraticCurveTo(hx - 2 * s, hy + 2 * s, hx + 10 * s, hy - 6 * s);
      ctx.quadraticCurveTo(hx, hy - 10 * s, hx - 12 * s, hy - 4 * s);
      ctx.fill();
      if (look.clip) {
        ctx.fillStyle = look.clip;
        ctx.beginPath();
        ctx.arc(hx + 10 * s, hy - 10 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawFace(hx, hy, look, s, now, isPlayer) {
    const blink = Math.floor(now / 120) % 48 === 0;
    // blush
    if (look.cheeks || look.vibe === "spark" || look.vibe === "happy") {
      ctx.fillStyle = "rgba(255, 140, 150, 0.35)";
      ctx.beginPath();
      ctx.ellipse(hx - 8 * s, hy + 3 * s, 3.2 * s, 2.2 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(hx + 8 * s, hy + 3 * s, 3.2 * s, 2.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // eyes
    if (blink) {
      ctx.strokeStyle = "#3a2f27";
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.moveTo(hx - 7 * s, hy - 1 * s);
      ctx.lineTo(hx - 3 * s, hy - 1 * s);
      ctx.moveTo(hx + 3 * s, hy - 1 * s);
      ctx.lineTo(hx + 7 * s, hy - 1 * s);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#2b211c";
      ctx.beginPath();
      ctx.ellipse(hx - 5 * s, hy - 1 * s, 2.6 * s, 3.2 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(hx + 5 * s, hy - 1 * s, 2.6 * s, 3.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(hx - 4 * s, hy - 2.2 * s, 1.1 * s, 0, Math.PI * 2);
      ctx.arc(hx + 6 * s, hy - 2.2 * s, 1.1 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // mouth
    ctx.strokeStyle = "#c45c5c";
    ctx.lineWidth = 1.8 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (look.vibe === "calm") {
      ctx.moveTo(hx - 3 * s, hy + 7 * s);
      ctx.lineTo(hx + 3 * s, hy + 7 * s);
    } else if (look.vibe === "kind" || look.vibe === "warm") {
      ctx.arc(hx, hy + 5 * s, 4 * s, 0.15 * Math.PI, 0.85 * Math.PI);
    } else {
      ctx.arc(hx, hy + 4.5 * s, 4.5 * s, 0.1 * Math.PI, 0.9 * Math.PI);
    }
    ctx.stroke();
    if (isPlayer || look.vibe === "spark" || look.vibe === "cheer") {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(hx + 10 * s, hy - 8 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawGlasses(hx, hy, s) {
    ctx.strokeStyle = "#3a2f27";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(hx - 5 * s, hy - 1 * s, 4.2 * s, 0, Math.PI * 2);
    ctx.arc(hx + 5 * s, hy - 1 * s, 4.2 * s, 0, Math.PI * 2);
    ctx.moveTo(hx - 1 * s, hy - 1 * s);
    ctx.lineTo(hx + 1 * s, hy - 1 * s);
    ctx.stroke();
  }

  function drawHat(hx, hy, look, s) {
    ctx.fillStyle = look.hat;
    if (look.hairStyle === "cap" || look.hairStyle === "vendor") {
      roundRect(hx - 14 * s, hy - 18 * s, 28 * s, 8 * s, 4 * s);
      ctx.beginPath();
      ctx.ellipse(hx + 10 * s, hy - 12 * s, 12 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function labels() {
    if (!hoverNpc) return;
    ctx.fillStyle = "rgba(58,47,39,0.88)";
    roundRect(player.x - 78, player.y - 92, 156, 28, 12);
    ctx.fillStyle = "#fff8ee";
    ctx.font = "700 13px 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("走近点 " + LifeNpcs[hoverNpc].name, player.x, player.y - 73);
    ctx.textAlign = "left";
  }

  function foodEmoji(food) {
    if (/egg/.test(food)) return "🍳";
    if (/cereal|oatmeal|porridge/.test(food)) return "🥣";
    if (/milk/.test(food)) return "🥛";
    if (/apple/.test(food)) return "🍎";
    if (/banana/.test(food)) return "🍌";
    if (/ice|choco|candy|cake/.test(food)) return "🍦";
    return "🍞";
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  return {
    init,
    resize,
    setEffects,
    setBangs,
    setRoom,
    dropOff,
    goTo,
    snapTo,
    clearTravel,
    holdMove,
    releaseMove,
    nearNpc,
    nearPlace,
    closestNpc,
    get room() {
      return room;
    },
    roomName() {
      return ROOM_NAMES[room] || room;
    },
    set onArrive(fn) {
      arrive = fn;
    }
  };
})();
window.LifeWorld = LifeWorld;
