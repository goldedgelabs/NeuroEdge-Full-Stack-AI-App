// backend-ts/src/routes/chat.ts
import { Router } from "express";
import { routeToEngine } from "../services/engineRouter";

const router = Router();

router.post("/api/chat/send", async (req, res) => {
  const { conversationId, text, preferredEngine } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Fire-and-forget — engines will stream back via WS
  try {
    routeToEngine(conversationId, text, preferredEngine);
    return res.json({ status: "accepted", streamId: conversationId });
  } catch (err) {
    console.error("routeToEngine error:", err);
    return res.status(500).json({ error: "failed to enqueue" });
  }
});

export default router;
