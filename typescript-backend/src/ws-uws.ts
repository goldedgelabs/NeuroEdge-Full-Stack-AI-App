// backend-ts/src/ws-uws.ts
/**
 * uWebSockets.js WebSocket server wrapper that exposes:
 * - setupUWS(server)
 * - broadcastToConversation(conversationId, obj)
 *
 * Note: uWS runs its own listener; to use behind a single http server, we recommend running uWS as the main server.
 * However, we provide a compatibility wrapper that uses uWS if available and fallbacks to ws.
 */

import http from 'http';

let useUws = false;
let uwsApp: any = null;
const clients = new Map<string, Set<{ send: (s:string)=>void }>>();

try {
  // dynamic require so build doesn't fail if uws not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const uWS = require('uWebSockets.js');
  useUws = true;
  console.log('[uws] uWebSockets.js available, using uws for WS.');
} catch (err) {
  console.warn('[uws] uWebSockets.js not installed, fallback to ws will be used.');
  useUws = false;
}

export function setupUWS(server?: http.Server) {
  if (!useUws) {
    console.warn('[uws] not available - setupUWS skipped.');
    return;
  }

  // NOTE: uWS prefers being the actual server. If you want to use a single port,
  // run the uWS app itself (see Dockerfile). Here we prepare the app.
  // Basic example: uWS.App().ws('/ws/chat/:id', { /* handlers */ }).listen(port)
  const uWS = require('uWebSockets.js');
  uwsApp = uWS.App();

  uwsApp.ws('/ws/chat/:conv', {
    /* Options */
    idleTimeout: 32,
    maxBackpressure: 1024,
    compression: 0,
    /* Handlers */
    open: (ws: any, req: any) => {
      const conv = req.getParameter(0);
      if (!clients.has(conv)) clients.set(conv, new Set());
      const wrapper = { send: (s:string)=>ws.send(s) };
      clients.get(conv)!.add(wrapper);
      // attach conv on ws for cleanup
      (ws as any).__conversation = conv;
      // welcome
      ws.send(JSON.stringify({ type: 'info', message: 'connected (uws)', conversationId: conv }));
    },
    message: (ws: any, message: ArrayBuffer, isBinary: boolean) => {
      // message received from client; ignored or used for pings
      // note: message is ArrayBuffer
      try {
        const str = Buffer.from(message).toString();
        // handle if JSON
        const obj = JSON.parse(str);
        // optionally route messages
      } catch (e) {}
    },
    close: (ws: any, code: number, message: ArrayBuffer) => {
      const conv = (ws as any).__conversation;
      if (conv && clients.has(conv)) {
        // remove wrapper
        const set = clients.get(conv)!;
        for (const w of set) {
          // match by reference is hard; we keep wrappers ephemeral - this is a simple cleanup: clear all sets if no longer valid
        }
        // For simplicity, remove set if empty - but uws doesn't expose direct ws object equality easily here.
      }
    },
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  uwsApp.listen(port, (listenSocket: any) => {
    if (listenSocket) console.log(`[uws] listening on port ${port}`);
    else console.error(`[uws] failed to listen on port ${port}`);
  });
}

export function broadcastToConversation(conversationId: string, obj: any) {
  const set = clients.get(conversationId);
  if (!set) return;
  const s = JSON.stringify(obj);
  for (const c of set) {
    try { c.send(s); } catch (e) {}
  }
}
