// src/lib/chat/api.ts
import axios from 'axios';

/**
 * Send a chat message to the TS backend orchestrator.
 * The orchestrator will forward to the selected engine (Python/Go) and initiate streaming.
 */
export async function sendChatMessage(conversationId: string, message: string) {
  const url = `/api/chat/send`; // Next.js route or proxy to TS backend
  const res = await axios.post(url, { conversationId, message });
  return res.data; // expected { ok: true, streamId: 'conversationId' }
}

/**
 * Helper to build a WS URL for a conversation
 */
export function wsUrlForConversation(conversationId: string) {
  // Prefer explicit env var for WS base
  const base = (process.env.NEXT_PUBLIC_WS_URL ||
    (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
  return `${base.replace(/\/$/, '')}/ws/chat/${conversationId}`;
}
