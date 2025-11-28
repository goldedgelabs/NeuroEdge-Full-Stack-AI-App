// backend-ts/src/routes/chat.ts
import { Router } from 'express';
import { routeToEngine } from '../services/engineRouter';

const router = Router();

/**
 * POST /api/chat/send
 * body: { conversationId, message, preferredEngine? }
 */
router.post('/api/chat/send', async (req, res) => {
  const { conversationId, message, preferredEngine } = req.body;
  if (!conversationId || !message) return res.status(400).json({ error: 'missing conversationId or message' });

  try {
    // routeToEngine will forward to python/go and return immediately (or throw)
    await routeToEngine({ conversationId, message, preferredEngine });
    return res.json({ ok: true, streamId: conversationId });
  } catch (err) {
    console.error('routeToEngine error', err);
    return res.status(500).json({ ok: false, error: 'failed to enqueue' });
  }
});

export default router;
