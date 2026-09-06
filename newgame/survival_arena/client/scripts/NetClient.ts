/**
 * 疾锋战区 — WebSocket 联机客户端
 * 对接 server/src/index.js
 */
import { GameConfig } from './GameConfig';

type MessageHandler = (data: Record<string, unknown>) => void;

export class NetClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private playerId = '';
  private roomId = '';

  connect(url = GameConfig.SERVER_URL): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string);
          const list = this.handlers.get(data.type) || [];
          list.forEach((h) => h(data));
        } catch (_) {}
      };
    });
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
  }

  send(type: string, payload: Record<string, unknown> = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    }
  }

  join(name: string) {
    this.send('join', { name });
    this.on('joined', (data) => {
      this.playerId = data.playerId as string;
      this.roomId = data.roomId as string;
    });
  }

  move(x: number, y: number) {
    this.send('move', { x, y });
  }

  shoot(angle: number) {
    this.send('shoot', { angle });
  }

  getPlayerId() {
    return this.playerId;
  }

  getRoomId() {
    return this.roomId;
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
