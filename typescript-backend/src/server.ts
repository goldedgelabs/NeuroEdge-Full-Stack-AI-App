import express from 'express';
import http from 'http';
import path from 'path';
import chatRouter from './routes/chat';
import uploadsRouter from './routes/uploads';

import { setupWsFallback } from './ws-fallback';
import { setupUWS } from './ws-uws';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Public routes ---
app.use(uploadsRouter);                     // Handles /api/uploads
app.use("/uploads", express.static("uploads"));  // Serves uploaded files
app.use(chatRouter);

const server = http.createServer(app);

// uWS setup (optional)
try {
  const uWS = require('uWebSockets.js');

  if (process.env.UWS_MODE === "true") {
    setupUWS();
  } else {
    setupWsFallback(server);
  }
} catch (e) {
  setupWsFallback(server);
}

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(port, () => console.log(`TS backend listening on ${port}`));
