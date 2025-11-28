import { useEffect, useRef } from "react";

export default function useChatWS(conversationId, onChunk, onMessage) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = `ws://${window.location.host}/ws/chat/${conversationId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        if (data.type === "chunk") onChunk(data.chunk);
        if (data.type === "message") onMessage(data.text);
      } catch {}
    };

    return () => ws.close();
  }, [conversationId]);

  return wsRef;
}
