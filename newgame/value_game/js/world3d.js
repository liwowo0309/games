/**
 * 都市大亨 — 俯视街道世界
 * 优先用 Three.js 渲染 3D；若 Three.js 没加载成功（离线/被墙），
 * 自动降级为纯 Canvas 2D 街道，保证永远不会白屏/黑屏。
 */
const World3D = (() => {
  // ---------- 共享状态 ----------
  let mode = "none"; // "3d" | "2d"
  let ready = false;
  let container, canvasHost, promptEl, labelLayer, statusEl;
  let handlers = {};
  let keys = {};
  let joy = { dx: 0, dz: 0, active: false };
  let shopLayout = []; // [{ slot, x, z, side }]
  let nearSlot = null;
  let lastTs = 0;
  let bobble = 0;
  const pos = { x: 0, z: 8, rot: 0 };
  const peds = [];

  const PLAYER_SPEED = 7.5;
  const ENTER_DIST = 3.4;
  const X_LIMIT = 7.5;
  const Z_LIMIT = 36;

  const SHOP_COLORS = {
    stall: "#d4a574",
    cafe: "#b07c2a",
    store: "#2a9d8f",
    esports: "#3f6fc4",
    logistics: "#c45c26",
    mall: "#7a66a8",
    other: "#6a7d92",
  };

  // ---------- Three.js 侧 ----------
  let renderer, scene, camera, playerMesh, streetGroup, raycaster, pointer;
  let shopGroups = [];
  let pedMeshes = [];

  // ---------- Canvas 2D 侧 ----------
  let cv, ctx, sky2 = "#8fc0e8";

  function setHandlers(h) {
    handlers = h || {};
  }

  function setStatus(text, kind) {
    if (!statusEl) return;
    if (!text) {
      statusEl.hidden = true;
      statusEl.textContent = "";
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = text;
    statusEl.className = "world-status" + (kind ? " " + kind : "");
  }

  function init(hostEl) {
    if (!hostEl) return false;
    container = hostEl;
    canvasHost = hostEl.querySelector("#worldCanvas") || hostEl;
    promptEl = hostEl.querySelector("#worldPrompt");
    labelLayer = hostEl.querySelector("#worldLabels");
    statusEl = hostEl.querySelector("#worldStatus");

    const force2d = /[?&]force2d=1/.test(location.search);
    let ok = false;
    if (window.THREE && !force2d) {
      try {
        init3D();
        mode = "3d";
        ok = true;
      } catch (err) {
        console.error("3D 初始化失败，降级为 2D 街道：", err);
        ok = false;
      }
    }
    if (!ok) {
      init2D();
      mode = "2d";
      setStatus("简易街道模式（3D 资源没加载上，玩法完全一样）", "warn");
    } else {
      setStatus("");
    }
    if (labelLayer) labelLayer.hidden = mode !== "3d";
    bindCommonInput();
    ready = true;
    lastTs = performance.now();
    return true;
  }

  function hostSize() {
    const w = canvasHost.clientWidth || container.clientWidth || 360;
    const h = canvasHost.clientHeight || container.clientHeight || 300;
    return { w: Math.max(120, w), h: Math.max(120, h) };
  }

  // =====================================================================
  // 3D 渲染
  // =====================================================================
  function init3D() {
    const { w, h } = hostSize();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8fc0e8);
    scene.fog = new THREE.Fog(0x8fc0e8, 30, 74);

    camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 140);
    camera.position.set(0, 16.5, 22);
    camera.lookAt(0, 0.5, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    canvasHost.innerHTML = "";
    canvasHost.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    scene.add(new THREE.HemisphereLight(0xe6f2ff, 0x51606f, 1.0));
    const sun = new THREE.DirectionalLight(0xfff2d6, 0.85);
    sun.position.set(12, 22, 8);
    scene.add(sun);

    buildStreet3D();
    playerMesh = makeCharacter3D(0x2c5aa0);
    playerMesh.position.set(pos.x, 0, pos.z);
    scene.add(playerMesh);

    renderer.domElement.addEventListener("pointerdown", onPointer3D);
    renderer.render(scene, camera);
  }

  function makeBox3D(w, h, d, color, y) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05 })
    );
    mesh.position.y = y != null ? y : h / 2;
    return mesh;
  }

  function buildStreet3D() {
    streetGroup = new THREE.Group();
    scene.add(streetGroup);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 90),
      new THREE.MeshStandardMaterial({ color: 0x49525f, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    streetGroup.add(ground);

    const walkL = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 90),
      new THREE.MeshStandardMaterial({ color: 0xb9c2ce, roughness: 0.9 })
    );
    walkL.rotation.x = -Math.PI / 2;
    walkL.position.set(-5.4, 0.02, 0);
    streetGroup.add(walkL);
    const walkR = walkL.clone();
    walkR.position.x = 5.4;
    streetGroup.add(walkR);

    for (let z = -38; z <= 38; z += 3) {
      const line = makeBox3D(0.22, 0.05, 1.4, 0xf0dc9a, 0.04);
      line.position.z = z;
      streetGroup.add(line);
    }

    for (let i = 0; i < 12; i++) {
      const z = -38 + i * 7;
      const h = 3.4 + (i % 4) * 1.4;
      const a = makeBox3D(3.2, h, 3.2, 0x5f7086, h / 2);
      a.position.set(-11, h / 2, z);
      streetGroup.add(a);
      const h2 = h * 0.8;
      const b = makeBox3D(3.4, h2, 3, 0x51617a, h2 / 2);
      b.position.set(11.2, h2 / 2, z + 1.6);
      streetGroup.add(b);
    }

    for (let i = 0; i < 6; i++) {
      const ped = makeCharacter3D(0x9aa7b8 - i * 0x060606);
      const px = i % 2 === 0 ? -3.2 : 3.2;
      ped.position.set(px, 0, -20 + i * 7);
      streetGroup.add(ped);
      pedMeshes.push(ped);
      peds.push({ x: px, z: -20 + i * 7, speed: 1.2 + Math.random(), dir: i % 2 === 0 ? 1 : -1 });
    }
  }

  function makeCharacter3D(bodyColor) {
    const g = new THREE.Group();
    const body = makeBox3D(0.58, 0.75, 0.42, bodyColor, 0.85);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0xf2d8bb, roughness: 0.6 })
    );
    head.position.y = 1.48;
    const shade = new THREE.Mesh(
      new THREE.CircleGeometry(0.38, 18),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })
    );
    shade.rotation.x = -Math.PI / 2;
    shade.position.y = 0.03;
    g.add(body, head, shade);
    return g;
  }

  function buildShops3D() {
    shopGroups.forEach((g) => {
      if (g.parent) g.parent.remove(g);
      if (g.userData.labelEl && g.userData.labelEl.parentNode) {
        g.userData.labelEl.parentNode.removeChild(g.userData.labelEl);
      }
    });
    shopGroups = [];
    if (labelLayer) labelLayer.innerHTML = "";

    shopLayout.forEach((item) => {
      const slot = item.slot;
      const h = slot.owned ? 2.6 + Math.min(3.6, (slot.level || 1) * 0.16 + (slot.floorLv || 0) * 0.4) : 2.4;
      const width = slot.owned ? 3.3 + (slot.floorLv || 0) * 0.35 : 3.4;
      const color = new THREE.Color(SHOP_COLORS[slot.colorKey] || SHOP_COLORS.other);

      const group = new THREE.Group();
      group.position.set(item.x, 0, item.z);

      const building = makeBox3D(width, h, width, color, h / 2);
      building.userData.slot = slot;
      group.add(building);

      const signW = slot.owned ? 2.2 + (slot.signLv || 0) * 0.45 : 2.4;
      const sign = makeBox3D(signW, 0.42 + (slot.signLv || 0) * 0.1, 0.16, slot.owned ? 0xf0c33c : 0xf2f4f8, h + 0.4);
      sign.position.z = item.side * -width / 2 - 0.08;
      group.add(sign);

      const door = makeBox3D(1.1, 1.5, 0.14, 0x2b323c, 0.75);
      door.position.z = item.side * -width / 2 - 0.05;
      group.add(door);

      if (slot.owned) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(2.1, 2.4, 32),
          new THREE.MeshBasicMaterial({ color: 0xf0c33c, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.06;
        group.add(ring);
      }

      group.userData.slot = slot;
      group.userData.building = building;
      streetGroup.add(group);
      shopGroups.push(group);

      if (labelLayer) {
        const label = document.createElement("button");
        label.type = "button";
        label.className = "world-shop-label" + (slot.owned ? " mine" : "");
        label.innerHTML = labelHtml(slot);
        label.addEventListener("click", (e) => {
          e.stopPropagation();
          openShop(slot);
        });
        labelLayer.appendChild(label);
        group.userData.labelEl = label;
      }
    });
  }

  function labelHtml(slot) {
    const sub = slot.owned
      ? "我的店 · Lv." + (slot.level || 1) + (slot.floorLv ? " · 扩" + slot.floorLv : "")
      : (slot.ownerName || "街坊") + "的店";
    return `<span>${slot.icon || "🏪"}</span><strong>${slot.name}</strong><small>${sub}</small>`;
  }

  function projectLabel(group) {
    const el = group.userData.labelEl;
    if (!el) return;
    const v = new THREE.Vector3(group.position.x, 3.4, group.position.z);
    v.project(camera);
    if (v.z > 1) {
      el.style.display = "none";
      return;
    }
    const rect = renderer.domElement.getBoundingClientRect();
    const hostRect = container.getBoundingClientRect();
    el.style.display = "flex";
    el.style.left = ((v.x + 1) / 2) * rect.width + (rect.left - hostRect.left) + "px";
    el.style.top = ((-v.y + 1) / 2) * rect.height + (rect.top - hostRect.top) + "px";
  }

  function onPointer3D(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      shopGroups.map((g) => g.userData.building).filter(Boolean),
      false
    );
    if (hits.length) openShop(hits[0].object.userData.slot);
  }

  function tick3D(dt) {
    playerMesh.position.set(pos.x, 0, pos.z);
    playerMesh.rotation.y = pos.rot;
    playerMesh.children[0].position.y = 0.85 + bobble;

    peds.forEach((p, i) => {
      const m = pedMeshes[i];
      if (m) m.position.z = p.z;
    });

    const tx = pos.x * 0.35;
    const tz = pos.z + 14;
    camera.position.x += (tx - camera.position.x) * 0.1;
    camera.position.z += (tz - camera.position.z) * 0.1;
    camera.position.y = 16.5;
    camera.lookAt(pos.x, 0.6, pos.z);

    shopGroups.forEach(projectLabel);
    renderer.render(scene, camera);
  }

  // =====================================================================
  // Canvas 2D 兜底渲染（不需要任何外部库）
  // =====================================================================
  function init2D() {
    canvasHost.innerHTML = "";
    cv = document.createElement("canvas");
    cv.className = "world-2d";
    canvasHost.appendChild(cv);
    ctx = cv.getContext("2d");
    resize2D();
    cv.addEventListener("pointerdown", onPointer2D);
    for (let i = 0; i < 6; i++) {
      peds.push({
        x: i % 2 === 0 ? -3.2 : 3.2,
        z: -20 + i * 7,
        speed: 1.2 + Math.random(),
        dir: i % 2 === 0 ? 1 : -1,
      });
    }
    draw2D();
  }

  function resize2D() {
    if (!cv) return;
    const { w, h } = hostSize();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.width = w + "px";
    cv.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function view2D() {
    const { w, h } = hostSize();
    const scale = Math.max(14, h / 24);
    return { w, h, scale, camX: pos.x * 0.35, camZ: pos.z, baseY: h * 0.6 };
  }

  function toScreen(v, x, z) {
    return {
      x: v.w / 2 + (x - v.camX) * v.scale,
      y: v.baseY + (z - v.camZ) * v.scale,
    };
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function draw2D() {
    if (!ctx) return;
    const v = view2D();
    // 天空/远景
    const grad = ctx.createLinearGradient(0, 0, 0, v.h);
    grad.addColorStop(0, sky2);
    grad.addColorStop(0.45, "#6f8398");
    grad.addColorStop(1, "#3f4854");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, v.w, v.h);

    // 马路
    const roadL = toScreen(v, -8.2, 0).x;
    const roadR = toScreen(v, 8.2, 0).x;
    ctx.fillStyle = "#49525f";
    ctx.fillRect(roadL, 0, roadR - roadL, v.h);

    // 人行道
    ctx.fillStyle = "#b9c2ce";
    const wL1 = toScreen(v, -8.2, 0).x;
    const wL2 = toScreen(v, -2.7, 0).x;
    const wR1 = toScreen(v, 2.7, 0).x;
    const wR2 = toScreen(v, 8.2, 0).x;
    ctx.fillRect(wL1, 0, wL2 - wL1, v.h);
    ctx.fillRect(wR1, 0, wR2 - wR1, v.h);

    // 中线
    ctx.fillStyle = "#f0dc9a";
    for (let z = Math.floor(pos.z) - 26; z < pos.z + 26; z += 3) {
      const p = toScreen(v, 0, z);
      ctx.fillRect(p.x - 2, p.y - v.scale * 0.5, 4, v.scale * 0.9);
    }

    // 远处装饰楼
    ctx.fillStyle = "#5f7086";
    for (let i = -6; i < 8; i++) {
      const z = Math.round(pos.z / 7) * 7 + i * 7;
      [-11, 11.2].forEach((bx, k) => {
        const p = toScreen(v, bx, z);
        const bw = v.scale * 3;
        const bh = v.scale * (k ? 3.2 : 3.8);
        ctx.fillStyle = k ? "#51617a" : "#5f7086";
        roundRect(p.x - bw / 2, p.y - bh, bw, bh, 4);
        ctx.fill();
      });
    }

    // 店铺（远的先画）
    const sorted = shopLayout.slice().sort((a, b) => a.z - b.z);
    sorted.forEach((item) => drawShop2D(v, item));

    // NPC
    peds.forEach((p) => drawPerson2D(v, p.x, p.z, "#aab6c6", 0.8));

    // 玩家
    drawPerson2D(v, pos.x, pos.z, "#2c5aa0", 1);
  }

  function drawShop2D(v, item) {
    const slot = item.slot;
    const p = toScreen(v, item.x, item.z);
    const width = (slot.owned ? 3.3 + (slot.floorLv || 0) * 0.35 : 3.4) * v.scale;
    const height = (slot.owned ? 2.6 + Math.min(3.6, (slot.level || 1) * 0.16 + (slot.floorLv || 0) * 0.4) : 2.4) * v.scale * 0.62;
    const depth = width * 0.5;
    const color = SHOP_COLORS[slot.colorKey] || SHOP_COLORS.other;
    const x = p.x - width / 2;
    const y = p.y - height;

    ctx.fillStyle = "rgba(0,0,0,.28)";
    roundRect(x + 5, p.y - depth * 0.2 + 5, width, depth, 8);
    ctx.fill();

    if (slot.owned) {
      ctx.strokeStyle = "rgba(240,195,60,.85)";
      ctx.lineWidth = 3;
      roundRect(x - 5, y - 5, width + 10, height + depth + 10, 12);
      ctx.stroke();
    }

    ctx.fillStyle = color;
    roundRect(x, y, width, height + depth * 0.6, 10);
    ctx.fill();

    // 屋顶亮面
    ctx.fillStyle = "rgba(255,255,255,.18)";
    roundRect(x, y, width, height * 0.28, 10);
    ctx.fill();

    // 招牌
    const signW = width * (slot.owned ? 0.62 + Math.min(0.3, (slot.signLv || 0) * 0.08) : 0.6);
    ctx.fillStyle = slot.owned ? "#f0c33c" : "#eef2f7";
    roundRect(p.x - signW / 2, y + height * 0.34, signW, Math.max(10, v.scale * 0.4), 4);
    ctx.fill();

    // 门
    ctx.fillStyle = "#2b323c";
    roundRect(p.x - width * 0.15, y + height + depth * 0.1, width * 0.3, depth * 0.45, 3);
    ctx.fill();

    // 名牌（画在楼顶上方，避免压住建筑）
    const nameSize = Math.round(Math.max(11, v.scale * 0.4));
    const subSize = Math.round(Math.max(9, v.scale * 0.32));
    const plateH = nameSize + subSize + 14;
    const plateW = Math.max(width * 0.95, ctx.measureText(slot.name).width + 34);
    const plateY = y - plateH - v.scale * 0.5;
    ctx.fillStyle = slot.owned ? "rgba(201,162,39,.94)" : "rgba(24,34,48,.82)";
    roundRect(p.x - plateW / 2, plateY, plateW, plateH, 8);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = slot.owned ? "#1a1208" : "#eef3fa";
    ctx.font = `600 ${nameSize}px "Noto Sans SC", sans-serif`;
    ctx.fillText(`${slot.icon || "🏪"} ${slot.name}`, p.x, plateY + nameSize + 4);
    ctx.font = `${subSize}px "Noto Sans SC", sans-serif`;
    ctx.fillStyle = slot.owned ? "rgba(26,18,8,.8)" : "rgba(226,235,246,.82)";
    ctx.fillText(
      slot.owned ? `我的店 · Lv.${slot.level || 1}` : `${slot.ownerName || "街坊"}的店`,
      p.x,
      plateY + nameSize + subSize + 7
    );
    ctx.textAlign = "left";
  }

  function drawPerson2D(v, x, z, color, scaleMul) {
    const p = toScreen(v, x, z);
    const s = v.scale * scaleMul;
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, s * 0.34, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    const lift = scaleMul > 0.9 ? bobble * v.scale : 0;
    ctx.fillStyle = color;
    roundRect(p.x - s * 0.22, p.y - s * 0.95 - lift, s * 0.44, s * 0.62, s * 0.14);
    ctx.fill();
    ctx.fillStyle = "#f2d8bb";
    ctx.beginPath();
    ctx.arc(p.x, p.y - s * 1.08 - lift, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  function onPointer2D(e) {
    const v = view2D();
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = null;
    let bestD = Infinity;
    shopLayout.forEach((item) => {
      const p = toScreen(v, item.x, item.z);
      const d = Math.hypot(mx - p.x, my - (p.y - v.scale * 1.1));
      if (d < v.scale * 2 && d < bestD) {
        bestD = d;
        best = item.slot;
      }
    });
    if (best) openShop(best);
  }

  // =====================================================================
  // 共享逻辑
  // =====================================================================
  function bindCommonInput() {
    window.addEventListener("keydown", (e) => {
      keys[e.code] = true;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)
      ) {
        e.preventDefault();
      }
      if (e.code === "KeyE") {
        if (nearSlot) openShop(nearSlot);
      }
    });
    window.addEventListener("keyup", (e) => {
      keys[e.code] = false;
    });

    const stick = container.querySelector("#joyStick");
    const base = container.querySelector("#joyBase");
    if (base && stick) {
      const moveJoy = (e) => {
        const t = e.touches ? e.touches[0] : e;
        const r = base.getBoundingClientRect();
        let dx = t.clientX - (r.left + r.width / 2);
        let dy = t.clientY - (r.top + r.height / 2);
        const max = r.width * 0.38;
        const len = Math.hypot(dx, dy) || 1;
        if (len > max) {
          dx = (dx / len) * max;
          dy = (dy / len) * max;
        }
        stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        joy.dx = dx / max;
        joy.dz = dy / max;
      };
      const start = (e) => {
        joy.active = true;
        moveJoy(e);
        e.preventDefault();
      };
      const move = (e) => {
        if (!joy.active) return;
        moveJoy(e);
        if (e.cancelable) e.preventDefault();
      };
      const end = () => {
        joy.active = false;
        joy.dx = 0;
        joy.dz = 0;
        stick.style.transform = "translate(-50%, -50%)";
      };
      base.addEventListener("pointerdown", start);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      base.addEventListener("touchstart", start, { passive: false });
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", end);
    }

    window.addEventListener("resize", onResize);
    if (window.ResizeObserver && canvasHost) {
      try {
        new ResizeObserver(onResize).observe(canvasHost);
      } catch (err) {
        /* 忽略 */
      }
    }
  }

  function onResize() {
    if (!ready) return;
    if (mode === "3d") {
      const { w, h } = hostSize();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    } else {
      resize2D();
    }
  }

  function inputVector() {
    let x = joy.dx;
    let z = joy.dz;
    if (keys.KeyA || keys.ArrowLeft) x -= 1;
    if (keys.KeyD || keys.ArrowRight) x += 1;
    if (keys.KeyW || keys.ArrowUp) z -= 1;
    if (keys.KeyS || keys.ArrowDown) z += 1;
    const len = Math.hypot(x, z);
    if (len > 1) {
      x /= len;
      z /= len;
    }
    return { x, z };
  }

  function layoutSlots(slots) {
    shopLayout = (slots || []).map((slot, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return { slot, side, x: side * 5.8, z: 4 - Math.floor(i / 2) * 7.2 };
    });
  }

  function syncShops(slots) {
    if (!ready) return;
    layoutSlots(slots);
    if (mode === "3d") buildShops3D();
    else draw2D();
  }

  function openShop(slot) {
    if (!slot) return;
    if (slot.owned) {
      if (handlers.onEnterOwn) handlers.onEnterOwn(slot);
    } else if (handlers.onEnterOther) {
      handlers.onEnterOther(slot);
    }
  }

  function updatePrompt() {
    nearSlot = null;
    let best = ENTER_DIST;
    shopLayout.forEach((item) => {
      const d = Math.hypot(pos.x - item.x, pos.z - item.z);
      if (d < best) {
        best = d;
        nearSlot = item.slot;
      }
    });
    if (!promptEl) return;
    if (nearSlot) {
      const s = nearSlot;
      promptEl.classList.remove("hidden");
      promptEl.innerHTML = s.owned
        ? `<strong>进店经营</strong><span>${s.name}</span><em>点店 / 按 E</em>`
        : `<strong>参观吃喝</strong><span>${s.ownerName || "街坊"}的${s.name}</span><em>点店 / 按 E</em>`;
      promptEl.onclick = () => openShop(s);
    } else {
      promptEl.classList.add("hidden");
      promptEl.onclick = null;
    }
  }

  function tick() {
    if (!ready) return;
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0, (now - lastTs) / 1000));
    lastTs = now;

    const v = inputVector();
    if (v.x || v.z) {
      pos.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, pos.x + v.x * PLAYER_SPEED * dt));
      pos.z = Math.max(-Z_LIMIT, Math.min(Z_LIMIT, pos.z + v.z * PLAYER_SPEED * dt));
      pos.rot = Math.atan2(v.x, v.z);
      bobble = 0.07 * Math.sin(now / 90);
    } else {
      bobble *= 0.9;
    }

    peds.forEach((p) => {
      p.z += p.speed * p.dir * dt;
      if (p.z > Z_LIMIT) p.z = -Z_LIMIT;
      if (p.z < -Z_LIMIT) p.z = Z_LIMIT;
    });

    updatePrompt();
    if (mode === "3d") tick3D(dt);
    else draw2D();
  }

  function setThemeSky(hexOrColors) {
    const c = Array.isArray(hexOrColors) ? hexOrColors[0] : hexOrColors;
    if (c == null) return;
    if (mode === "3d" && scene) {
      scene.background = new THREE.Color(c);
      if (scene.fog) scene.fog.color = new THREE.Color(c);
    } else {
      sky2 = typeof c === "number" ? "#" + c.toString(16).padStart(6, "0") : c;
    }
  }

  function focusShop(shopId) {
    const item = shopLayout.find((s) => s.slot && s.slot.id === shopId);
    if (!item) return;
    pos.x = item.x * 0.35;
    pos.z = item.z + 2.6;
  }

  return {
    init,
    syncShops,
    setHandlers,
    tick,
    setThemeSky,
    focusShop,
    get ready() {
      return ready;
    },
    get mode() {
      return mode;
    },
  };
})();

// 顶层 const 不会挂到 window 上，这里显式挂一次，否则 window.World3D 判断会失败
window.World3D = World3D;
