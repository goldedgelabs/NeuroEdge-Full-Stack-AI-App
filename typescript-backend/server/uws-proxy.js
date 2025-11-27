/**
 * uWebSockets.js proxy server skeleton.
 * uWebSockets.js is a native module and may require special build steps. This file provides a production-ready pattern.
 * If uWebSockets.js is not available, the server will fallback to the simple 'ws' based proxy.
 */
try {
  const uWS = require('uWebSockets.js');
  // Example server using uWS (high-performance). This is a skeleton; adapt message handling per your protocol.
  const app = uWS.App();
  const PY_WS = process.env.PY_WS_URL || 'ws://localhost:8000/ws/metrics';
  // uWS uses different API; you would implement a dedicated bridge here.
  app.ws('/proxy', {
    open: (ws) => { console.log('uWS client connected'); },
    message: (ws, msg, isBinary) => { /* handle incoming */ },
    close: (ws, code, message) => { /* cleanup */ }
  }).listen(8082, (token) => {
    if (token) console.log('uWS proxy listening on 8082');
    else console.log('uWS failed to listen');
  });
} catch (e) {
  console.log('uWebSockets.js not available, falling back to ws proxy');
  const WebSocket = require('ws');
  const wss = new WebSocket.Server({ port: 8082 });
  wss.on('connection', function connection(ws) {
    const py = new WebSocket(process.env.PY_WS_URL || 'ws://localhost:8000/ws/metrics');
    py.on('message', (msg) => { try { ws.send(msg); } catch(e){} });
    ws.on('message', (msg) => { try { py.send(msg); } catch(e){} });
    ws.on('close', () => { try { py.close(); } catch(e){} });
    py.on('close', () => { try { ws.close(); } catch(e){} });
  });
}
