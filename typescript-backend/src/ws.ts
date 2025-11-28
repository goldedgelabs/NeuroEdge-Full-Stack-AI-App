// backend-ts/src/ws.ts
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

/**
 * Map conversationId -> Set<WebSocket>
 */
const clients = new Map<string, Set<WebSocket>>();

export function setupWebsocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  wss.on('connection', (ws: WebSocket, req) => {
    // expect URL: /ws/chat/:conversationId or /ws/chat?conversationId=...
    const url = req.url || '';
    let conversationId = '';
    const m = url.match(/\/ws\/chat\/([^/?]+)/);
    if (m && m[1]) conversationId = m[1];
    // fallback: use query param
    if (!conversationId) {
      const u = new URL(req.url || '', `http://${req.headers.host}`);
      conversationId = u.searchParams.get('conversationId') || '';
    }
    if (!conversationId) {
      ws.send(JSON.stringify({ type: 'error', message: 'missing conversation id' }));
      ws.close();
      return;
    }

    if (!clients.has(conversationId)) clients.set(conversationId, new Set());
    clients.get(conversationId)!.add(ws);

    ws.on('message', (buf) => {
      // echo or receive pings
      try {
        const msg = JSON.parse(buf.toString());
        console.debug('ws recv', conversationId, msg);
      } catch(e) {}
    });

    ws.on('close', () => {
      const set = clients.get(conversationId);
      if (set) {
        set.delete(ws);
        if (set.size === 0) clients.delete(conversationId);
      }
    });

    ws.send(JSON.stringify({ type: 'info', message: 'connected', conversationId }));
  });

  console.log('WebSocket server mounted at /ws/chat');
}

/**
 * Broadcast to all connected clients in a conversation
 */
export function broadcastToConversation(conversationId: string, obj: any) {
  const set = clients.get(conversationId);
  if (!set) return;
  const str = JSON.stringify(obj);
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) {
      ws.send(str);
    }
  }
      }
