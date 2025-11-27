'use client';

import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/offline-db';
import { addEncryptedMessage } from '@/lib/encrypted-db-adapter';
import { getStreamURL } from '@/services/backendSelector';
import { localGenerate } from '@/lib/local-ai-fallback';  // WebGPU offline AI

export default function ChatStream() {
  const [messages, setMessages] = useState<{ text: string, local?: boolean }[]>([]);
  const evtRef = useRef<EventSource | null>(null);
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  /** Load cached messages (decrypted if needed) */
  useEffect(() => {
    (async () => {
      try {
        const rows = await db.messages.toArray();
        const out = rows.map(m => ({ text: m.text, local: m.status === 'local' }));
        setMessages(out);
      } catch (e) {
        console.error("Failed to load DB messages", e);
      }
    })();
  }, []);

  /** Start streaming from backend OR local fallback */
  useEffect(() => {
    let mounted = true;

    async function startSSE() {
      if (!online) {
        console.warn("Offline → switching to WebGPU local model");
        return runLocalFallback();
      }

      const url = await getStreamURL();
      if (!url) {
        console.warn("No backend → running fallback");
        return runLocalFallback();
      }

      const es = new EventSource(url);
      evtRef.current = es;

      /** SSE token handler */
      es.onmessage = async (ev) => {
        if (!mounted) return;

        let token = ev.data;
        try {
          const parsed = JSON.parse(ev.data);
          if (parsed.token) token = parsed.token;
        } catch {}

        setMessages(prev => {
          if (prev.length === 0) return [{ text: token }];

          const last = prev[prev.length - 1];
          const merged = { ...last, text: last.text + token };

          return [...prev.slice(0, -1), merged];
        });
      };

      /** SSE error → fallback to local AI */
      es.onerror = async () => {
        console.warn("SSE error → switching to local AI");
        es.close();
        runLocalFallback();
      };
    }

    /** Local WebGPU fallback */
    async function runLocalFallback() {
      const reply = await localGenerate("assistant");

      // Append to UI
      setMessages(prev => [...prev, { text: reply, local: true }]);

      // Save encrypted
      try {
        await addEncryptedMessage({ role: "assistant", text: reply });
      } catch (e) {
        console.error("Failed to save encrypted fallback msg", e);
      }
    }

    startSSE();

    return () => {
      mounted = false;
      evtRef.current?.close();
    };
  }, [online]);

  return (
    <div>
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 border rounded ${m.local ? 'bg-yellow-100' : 'bg-white'}`}
            data-testid="assistant-message-stream"
          >
            {m.text}
            {m.local && <span className="text-xs opacity-50"> (local)</span>}
          </div>
        ))}
      </div>
    </div>
  );
                             }
