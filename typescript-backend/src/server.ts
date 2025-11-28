import express from "express";
import http from "http";
import path from "path";

import chatRoute from "./routes/chat";
import uploadsRouter from "./routes/uploads";

import { initChatWS } from "./ws/chatServer";
import { setupWsFallback } from "./ws-fallback";
import { setupUWS } from "./ws-uws";

// -------------------------
// Express App
// -------------------------
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use(uploadsRouter);                         // handles /api/uploads
app.use("/uploads", express.static("uploads")); // static files
app.use(chatRoute);                             // handles /api/chat/send

// -------------------------
// HTTP Server
// -------------------------
const httpServer = http.createServer(app);

// -------------------------
// Chat WebSocket server
// -------------------------
initChatWS(httpServer);

// -------------------------
// uWS or fallback WS
// -------------------------
try {
  const uWS = require("uWebSockets.js");

  if (process.env.UWS_MODE === "true") {
    // Use pure uWS server instead of Node HTTP
    setupUWS();
  } else {
    // Node HTTP + ws fallback
    setupWsFallback(httpServer);
  }
} catch (e) {
  // If uWS not installed
  setupWsFallback(httpServer);
}

// -------------------------
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
httpServer.listen(port, () =>
  console.log(`HTTP + WS server running on :${port}`)
);
