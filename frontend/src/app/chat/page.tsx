'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function Page() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages((m) => [...m, { role: 'user', text: userMessage }]);

    // Simulate assistant typing (replace with your backend)
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: `This is a placeholder AI reply for: "${userMessage}"`,
        },
      ]);
      setTyping(false);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-[90vh] max-w-3xl mx-auto p-4">

      {/* Header */}
      <div className="pb-4">
        <h1 className="text-3xl font-bold">💬 Chat</h1>
        <p className="text-gray-600">
          Your NeuroEdge AI chat interface.
        </p>
      </div>

      {/* Message container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto border rounded-2xl bg-white p-4 shadow-sm space-y-4"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-400 py-20">
            Start a conversation with your AI assistant…
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-3 rounded-2xl shadow-sm inline-flex items-center gap-2">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-100">●</span>
              <span className="animate-pulse delay-200">●</span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 rounded-xl border p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message…"
        />
        <button
          onClick={sendMessage}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
                }
