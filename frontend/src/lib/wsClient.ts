// src/lib/wsClient.ts
export type WSMessage = { type: string; [k: string]: any };
export type WSHandler = (msg: WSMessage) => void;

export class WSClient {
  private url: string;
  private ws: WebSocket | null = null;
  private handlers: WSHandler[] = [];
  private reconnectMs = 1000;
  private maxReconnect = 30000;
  private closed = false;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  connect() {
    if (this.closed) return;
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.reconnectMs = 1000;
      console.debug('[ws] open', this.url);
    };
    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        this.handlers.forEach(h => h(data));
      } catch (err) {
        console.warn('ws invalid json', err);
      }
    };
    this.ws.onclose = () => {
      if (!this.closed) this.scheduleReconnect();
    };
    this.ws.onerror = () => { /* noop */ };
  }

  scheduleReconnect() {
    setTimeout(() => {
      this.reconnectMs = Math.min(this.maxReconnect, Math.floor(this.reconnectMs * 1.6));
      this.connect();
    }, this.reconnectMs);
  }

  send(obj: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
      return true;
    }
    return false;
  }

  subscribe(handler: WSHandler) {
    this.handlers.push(handler);
    return () => { this.handlers = this.handlers.filter(h => h !== handler); };
  }

  close() {
    this.closed = true;
    if (this.ws) this.ws.close();
  }
      }
