'use client';

import React, { useState } from 'react';

export default function Page() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((m) => [...m, input]);
    setInput('');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto h-[80vh] flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Chat</h1>

      <p className="text-gray-600 mb-4">
        This is the NeuroEdge chat shell. When connected to your AI backend, responses and streaming will appear here.
      </p>

      <div className="flex-1 overflow-y-auto p-4 border rounded-xl bg-white shadow-sm space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center">Start a conversation…</p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800"
          >
            {msg}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border p-3 shadow-sm focus:outline-none"
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
