import express from 'express';
import http from 'http';
import path from 'path';
import chatRouter from './routes/chat';
import uploadsRouter from './routes/uploads';

import { setupWsFallback, broadcastToConversationFallback } from './ws-fallback';
import { setupUWS, broadcastToConversation as broadcastUws } from './ws-uws';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use(uploadsRouter);
app.use(chatRouter);

const server = http.createServer(app);

// Try setup uWS if available (if set to run that way). If not, fallback to ws server
try {
  // dynamic import / require to avoid hard crash if uws not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const uWS = require('uWebSockets.js');
  // If you want to run uWS as main listener, use ws-uws.setupUWS()
  if (process.env.UWS_MODE === 'true') {
    // WARNING: uWS prefers to be main server. If running in UWS mode, you should not create the http server above.
    setupUWS(); // this will call uwsApp.listen internally
  } else {
    // not running in pure uws mode; use fallback
    setupWsFallback(server);
  }
} catch (e) {
  setupWsFallback(server);
}

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(port, () => console.log(`TS backend listening on ${port}`));
