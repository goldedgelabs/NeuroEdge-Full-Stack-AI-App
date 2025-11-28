// src/lib/ws.ts
export type MessageHandler = (data: any) => void;

export class WSClient {
  url: string;
  ws: WebSocket | null = null;
  handlers: MessageHandler[] = [];
  reconnectMs = 1000;
  maxReconnect = 30000;
  isClosed = false;
  constructor(url: string) { this.url = url; this.connect(); }

  connect() {
    if (this.isClosed) return;
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => { this.reconnectMs = 1000; console.debug('[ws] open', this.url); };
    this.ws.onmessage = (ev) => {
      try { const data = JSON.parse(ev.data); this.handlers.forEach(h => h(data)); }
      catch(e){ console.warn('invalid ws message', e); }
    };
    this.ws.onclose = () => { if (!this.isClosed) this.scheduleReconnect(); };
    this.ws.onerror = () => { /* ignore */ };
  }

  scheduleReconnect() {
    setTimeout(()=>{
      this.reconnectMs = Math.min(this.maxReconnect, this.reconnectMs * 1.6);
      this.connect();
    }, this.reconnectMs);
  }

  subscribe(h: MessageHandler) { this.handlers.push(h); return () => { this.handlers = this.handlers.filter(x => x !== h); }; }
  send(obj: any) { if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj)); }
  close() { this.isClosed = true; if (this.ws) this.ws.close(); }
}
