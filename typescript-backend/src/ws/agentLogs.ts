// simple broadcast mapping for agent logs similar to chat WS
import { WebSocketServer } from 'ws';
const agentLogClients = new Map<string, Set<any>>();

export function initAgentLogsWS(server) {
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (req, socket, head) => {
    if (!req.url?.startsWith('/ws/agent-logs/')) return;
    const agentId = req.url.split('/ws/agent-logs/')[1];
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, agentId));
  });

  wss.on('connection', (ws, agentId) => {
    if (!agentLogClients.has(agentId)) agentLogClients.set(agentId, new Set());
    agentLogClients.get(agentId)!.add(ws);
    ws.send(JSON.stringify({ log: `connected to logs for ${agentId}` }));

    ws.on('close', ()=> {
      agentLogClients.get(agentId)?.delete(ws);
    });
  });

  return wss;
}

export function broadcastAgentLog(agentId: string, log: string) {
  const set = agentLogClients.get(agentId);
  if (!set) return;
  const msg = JSON.stringify({ log });
  for (const ws of set) if (ws.readyState === ws.OPEN) ws.send(msg);
                              }
