/**
 * 都市大亨 — CSS 立绘
 */
const Avatar = (() => {
  function hairStyle(id) {
    return GameConfig.hairs.find((h) => h.id === id) || GameConfig.hairs[0];
  }
  function outfitStyle(id) {
    return GameConfig.outfits.find((o) => o.id === id) || GameConfig.outfits[0];
  }
  function skinStyle(id) {
    return GameConfig.skins.find((s) => s.id === id) || GameConfig.skins[0];
  }

  function renderInto(el, look, size = "md") {
    if (!el) return;
    const hair = hairStyle(look.hair);
    const outfit = outfitStyle(look.outfit);
    const skin = skinStyle(look.skin);
    el.className = "avatar-root size-" + size;
    el.innerHTML = `
      <div class="av-hair hair-${hair.id}" style="--hair:${hair.color}"></div>
      <div class="av-head" style="--skin:${skin.color}">
        <div class="av-eye left"></div>
        <div class="av-eye right"></div>
        <div class="av-mouth"></div>
      </div>
      <div class="av-body" style="--body:${outfit.body};--accent:${outfit.accent}">
        <div class="av-collar"></div>
      </div>
      <div class="av-arm left" style="--skin:${skin.color}"></div>
      <div class="av-arm right" style="--skin:${skin.color}"></div>
    `;
  }

  return { renderInto, hairStyle, outfitStyle, skinStyle };
})();
