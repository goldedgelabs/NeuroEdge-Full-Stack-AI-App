import { WebSocketServer } from "ws";

const convSockets = new Map<string, Set<any>>();

export function initChatWS(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (!req.url?.startsWith("/ws/chat/")) return;

    const convId = req.url.split("/ws/chat/")[1];

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, convId);
    });
  });

  wss.on("connection", (ws, convId) => {
    if (!convSockets.has(convId)) convSockets.set(convId, new Set());
    convSockets.get(convId)?.add(ws);

    ws.on("close", () => {
      convSockets.get(convId)?.delete(ws);
    });
  });

  return wss;
}

export function broadcastToConversationFallback(convId: string, payload: any) {
  const set = convSockets.get(convId);
  if (!set) return;

  for (const ws of set) {
    if (ws.readyState === 1) ws.send(JSON.stringify(payload));
  }
}
