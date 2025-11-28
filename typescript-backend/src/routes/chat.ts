// backend-ts/src/routes/chat.ts
import { Router } from "express";
import axios from "axios";

const router = Router();

/**
 * User sends message -> backend accepts -> triggers python generation
 * Returns immediately:
 * { ok: true, streamId: "conversationId" }
 */
router.post("/api/chat/send", async (req, res) => {
  const { conversationId, message } = req.body;

  // Forward to Python LLM engine
  try {
    await axios.post(process.env.PY_BACKEND_URL + "/api/generate", {
      conversationId,
      message
    });

    return res.json({ ok: true, streamId: conversationId });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Engine failed" });
  }
});

export default router;
