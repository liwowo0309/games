/**
 * 疾锋战区 — 微信小游戏变现接口
 * 开发阶段用沙盒/mock；正式版替换 wx 调用
 */
import { GameConfig } from './GameConfig';

declare const wx: {
  createRewardedVideoAd?: (opts: { adUnitId: string }) => {
    show: () => Promise<void>;
    onClose: (cb: (res: { isEnded: boolean }) => void) => void;
  };
  requestMidasPayment?: (opts: {
    mode: string;
    env: number;
    offerId: string;
    currencyType: string;
    platform: string;
    buyQuantity: number;
    success: () => void;
    fail: (err: unknown) => void;
  }) => void;
};

export class Monetization {
  private static adCounts: Record<string, number> = {};
  private static adDate = '';

  static resetAdDaily() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.adDate !== today) {
      this.adCounts = {};
      this.adDate = today;
    }
  }

  static async showRewardedAd(slot: string): Promise<boolean> {
    this.resetAdDaily();
    const limit = GameConfig.AD_SLOTS[slot]?.limit ?? 5;
    if ((this.adCounts[slot] || 0) >= limit) return false;

    if (typeof wx !== 'undefined' && wx.createRewardedVideoAd) {
      const ad = wx.createRewardedVideoAd({ adUnitId: 'YOUR_AD_UNIT_ID' });
      return new Promise((resolve) => {
        ad.onClose((res) => {
          if (res.isEnded) {
            this.adCounts[slot] = (this.adCounts[slot] || 0) + 1;
            resolve(true);
          } else resolve(false);
        });
        ad.show().catch(() => resolve(false));
      });
    }

    // 沙盒 mock
    await new Promise((r) => setTimeout(r, 2000));
    this.adCounts[slot] = (this.adCounts[slot] || 0) + 1;
    return true;
  }

  static async purchase(productId: string): Promise<boolean> {
    const product = GameConfig.IAP_PRODUCTS.find((p) => p.id === productId);
    if (!product) return false;

    if (typeof wx !== 'undefined' && wx.requestMidasPayment) {
      return new Promise((resolve) => {
        wx.requestMidasPayment!({
          mode: 'game',
          env: 1,
          offerId: 'YOUR_OFFER_ID',
          currencyType: 'CNY',
          platform: 'android',
          buyQuantity: product.price,
          success: () => resolve(true),
          fail: () => resolve(false),
        });
      });
    }

    // 沙盒 mock
    console.log(`[Sandbox IAP] ${product.name} ¥${product.price}`);
    return true;
  }
}
