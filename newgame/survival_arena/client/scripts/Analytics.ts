/**
 * 疾锋战区 — 埋点（Cocos / 微信小游戏）
 */
export class Analytics {
  private static events: Array<Record<string, unknown>> = [];

  static track(event: string, payload: Record<string, unknown> = {}) {
    const ev = { t: Date.now(), e: event, ...payload };
    this.events.push(ev);
    if (this.events.length > 3000) this.events = this.events.slice(-2000);

    if (typeof wx !== 'undefined' && (wx as { reportEvent?: (name: string, data: unknown) => void }).reportEvent) {
      (wx as { reportEvent: (name: string, data: unknown) => void }).reportEvent(event, payload);
    }
  }

  static exportEvents() {
    return JSON.stringify(this.events, null, 2);
  }

  static matchStart() { this.track('match_start'); }
  static matchEnd(rank: number, kills: number, duration: number) {
    this.track('match_end', { rank, kills, duration });
  }
  static adComplete(slot: string) { this.track('ad_complete', { slot }); }
  static shopOpen() { this.track('shop_open'); }
  static iapSuccess(productId: string, price: number) {
    this.track('iap_success', { productId, price });
  }
}
