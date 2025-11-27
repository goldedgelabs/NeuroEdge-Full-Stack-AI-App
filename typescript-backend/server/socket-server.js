/**
 * Lightweight WebSocket proxy server.
 * Starts a ws server that connects to Python backend WS endpoints and forwards messages to connected clients.
 * Run with: node ./server/socket-server.js
 */
import WebSocket, { WebSocketServer } from 'ws';
import fetch from 'node-fetch';

const PY_WS = process.env.PY_WS_URL || 'ws://localhost:8000/ws/metrics';

const wss = new WebSocketServer({ port: 8081 });
console.log('[socket-proxy] listening on ws://0.0.0.0:8081');

wss.on('connection', function connection(ws) {
  console.log('[socket-proxy] client connected');
  // connect to python ws and pipe messages
  const py = new WebSocket(PY_WS);
  py.on('open', () => {
    console.log('[socket-proxy] connected to python ws');
  });
  py.on('message', (msg) => {
    try { ws.send(msg); } catch(e) {}
  });
  ws.on('message', (msg) => {
    // forward client -> python
    try { py.send(msg); } catch(e) {}
  });
  ws.on('close', () => { try { py.close(); } catch(e) {} });
  py.on('close', () => { try { ws.close(); } catch(e) {} });
});
