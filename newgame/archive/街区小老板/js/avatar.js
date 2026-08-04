/**
 * CSS 拼装小老板立绘（无外部图片）
 */
const Avatar = (() => {
  function hairStyle(hairId) {
    return GameConfig.hairs.find((h) => h.id === hairId) || GameConfig.hairs[0];
  }
  function outfitStyle(outfitId) {
    return GameConfig.outfits.find((o) => o.id === outfitId) || GameConfig.outfits[0];
  }
  function skinStyle(skinId) {
    return GameConfig.skins.find((s) => s.id === skinId) || GameConfig.skins[0];
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
        <div class="av-blush left"></div>
        <div class="av-blush right"></div>
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
