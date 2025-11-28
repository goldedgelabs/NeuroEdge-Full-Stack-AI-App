// src/components/chat/ChatClient.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { WSClient } from '@/lib/wsClient';
import { sendChatMessage, wsUrlForConversation } from '@/lib/chat/api';
import { v4 as uuidv4 } from 'uuid';

export default function ChatClient({ conversationIdProp }: { conversationIdProp?: string }) {
  const [conversationId] = useState(() => conversationIdProp || uuidv4());
  const [messages, setMessages] = useState<{ id: string; role: 'user'|'assistant'; text: string; streaming?: boolean }[]>([]);
  const [input, setInput] = useState('');
  const wsRef = useRef<WSClient | null>(null);
  const assistantStreamingIdRef = useRef<string | null>(null);

  useEffect(() => {
    // open WS
    const url = wsUrlForConversation(conversationId);
    const ws = new WSClient(url);
    wsRef.current = ws;

    const unsub = ws.subscribe((msg) => {
      if (msg.type === 'chunk') {
        // append chunk to the last streaming assistant message
        setMessages(prev => {
          const lastIdx = prev.map(m => m.role).lastIndexOf('assistant');
          if (lastIdx === -1 || !prev[lastIdx].streaming) {
            // create a streaming assistant message
            const id = uuidv4();
            assistantStreamingIdRef.current = id;
            return [...prev, { id, role: 'assistant', text: msg.chunk || '', streaming: true }];
          } else {
            const copy = [...prev];
            copy[lastIdx] = { ...copy[lastIdx], text: (copy[lastIdx].text || '') + (msg.chunk || '') };
            return copy;
          }
        });
      } else if (msg.type === 'message') {
        // final assistant message
        setMessages(prev => {
          const lastIdx = prev.map(m => m.role).lastIndexOf('assistant');
          if (lastIdx === -1 || !prev[lastIdx].streaming) {
            const id = uuidv4();
            return [...prev, { id, role: 'assistant', text: msg.text || '', streaming: false }];
          } else {
            const copy = [...prev];
            copy[lastIdx] = { ...copy[lastIdx], text: msg.text || '', streaming: false };
            return copy;
          }
        });
      } else if (msg.type === 'info') {
        // optional informational message
        console.debug('WS info', msg);
      }
    });

    return () => { unsub(); ws.close(); };
  }, [conversationId]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    // local push
    setMessages(prev => [...prev, { id: uuidv4(), role: 'user', text }]);

    // send to backend to trigger engine streaming
    try {
      await sendChatMessage(conversationId, text);
      // the streaming will arrive via WS
    } catch (err) {
      console.error('sendChatMessage failed', err);
      setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', text: 'Error: failed to send message', streaming: false }]);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'}`}>
              {m.text}
              {m.streaming && <span className="ml-2 opacity-60">▌</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a message..." onKeyDown={(e)=> e.key==='Enter' && handleSend()} />
        <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
      </div>
    </div>
  );
}
