// backend-ts/src/ws-fallback.ts
import { WebSocketServer } from 'ws';
import http from 'http';

const clients = new Map<string, Set<WebSocket>>();

export function setupWsFallback(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  wss.on('connection', (ws, req) => {
    const url = req.url || '';
    const m = url.match(/\/ws\/chat\/([^/?]+)/);
    let conv = '';
    if (m && m[1]) conv = m[1];
    else {
      const u = new URL(req.url || '', `http://${req.headers.host}`);
      conv = u.searchParams.get('conversationId') || '';
    }
    if (!conv) {
      ws.send(JSON.stringify({ type: 'error', message: 'missing conversation id' }));
      ws.close();
      return;
    }

    if (!clients.has(conv)) clients.set(conv, new Set());
    clients.get(conv)!.add(ws);

    ws.send(JSON.stringify({ type: 'info', message: 'connected', conversationId: conv }));

    ws.on('message', (buf) => {
      // optional
    });

    ws.on('close', () => {
      const set = clients.get(conv);
      if (!set) return;
      set.delete(ws);
      if (set.size === 0) clients.delete(conv);
    });
  });

  console.log('[ws-fallback] WebSocket fallback mounted at /ws/chat');
}

export function broadcastToConversationFallback(conversationId: string, obj: any) {
  const set = clients.get(conversationId);
  if (!set) return;
  const str = JSON.stringify(obj);
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) ws.send(str);
  }
}
