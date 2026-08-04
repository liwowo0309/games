/**
 * 都市大亨 — 沙盒内购（原型模拟；正式环境替换为商店 SDK + 服务端验单）
 */
const IAP = (() => {
  const MODE = "sandbox"; // sandbox | live（live 需接真实商店）

  function product(id) {
    return GameConfig.products.find((p) => p.id === id);
  }

  function verifyReceiptStub(receipt) {
    // 正式版：发往云函数校验 App Store / Google Play 收据
    return !!(receipt && receipt.productId && receipt.txid);
  }

  function purchase(state, productId) {
    const p = product(productId);
    if (!p) return { ok: false, reason: "商品不存在" };

    if (MODE !== "sandbox") {
      return { ok: false, reason: "正式内购尚未接入商店 SDK" };
    }

    const receipt = {
      productId,
      txid: "sandbox_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      priceCny: p.priceCny,
      at: Date.now(),
      mode: MODE,
    };
    if (!verifyReceiptStub(receipt)) return { ok: false, reason: "收据无效" };

    const applied = applyEntitlement(state, p, receipt);
    if (!applied.ok) return applied;

    state.iapReceipts = state.iapReceipts || [];
    state.iapReceipts.push(receipt);
    SaveState.save(state);
    return { ok: true, product: p, receipt, message: applied.message };
  }

  function applyEntitlement(state, p) {
    switch (p.type) {
      case "sub": {
        const days = p.id === "sub_season" ? 90 : 30;
        SaveState.grantSub(state, days, p.id === "sub_season");
        return { ok: true, message: `已开通${p.name}（沙盒）` };
      }
      case "pass": {
        const res = SaveState.unlockPassPremium(state);
        return {
          ok: true,
          message: res.claimable
            ? `高级轨已解锁 · ${res.claimable} 个等级奖励可立刻领取`
            : "高级轨已解锁，之后每升一级都多一份奖励",
        };
      }
      case "fund":
        if (state.fund && state.fund.owned) return { ok: false, reason: "已购买成长基金" };
        SaveState.ownGrowthFund(state);
        return { ok: true, message: "成长基金已激活，去通行证里按等级领钻石" };
      case "gems": {
        let gems = p.gems;
        let extra = "";
        if (GameConfig.FIRST_BUY_DOUBLE && !state.firstBuyUsed) {
          state.firstBuyUsed = true;
          gems *= 2;
          extra = "（首充双倍）";
        }
        state.gems += gems;
        return { ok: true, message: `获得 ${gems} 钻石${extra}` };
      }
      case "boost":
        state.boostTickets += p.count || 1;
        return { ok: true, message: `获得加速券 ×${p.count || 1}` };
      case "theme":
        if (!(state.ownedThemes || []).includes(p.unlockTheme)) {
          state.ownedThemes.push(p.unlockTheme);
        }
        state.themeId = p.unlockTheme;
        return { ok: true, message: "主题已解锁" };
      case "cosmetic":
        if (!(state.ownedCosmetics || []).includes(p.unlockCosmetic)) {
          state.ownedCosmetics.push(p.unlockCosmetic);
        }
        return { ok: true, message: "装扮已解锁" };
      case "bundle":
        if (p.outfit) state.look.outfit = p.outfit;
        if (p.gems) state.gems += p.gems;
        return { ok: true, message: "套装已到账" };
      default:
        return { ok: false, reason: "未知商品类型" };
    }
  }

  function modeLabel() {
    return MODE === "sandbox" ? "沙盒模拟支付（不会真扣款）" : "正式商店支付";
  }

  return { purchase, product, modeLabel, MODE, verifyReceiptStub };
})();
