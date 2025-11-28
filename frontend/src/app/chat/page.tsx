'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Moon, Sun, Send, Upload, Bot, User, Menu
} from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeAgent, setActiveAgent] = useState('NeuroEdge-Core');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const AGENTS = [
    'NeuroEdge-Core',
    'Vision-Engine',
    'Code-Engine',
    'Predictive-Engine',
    'SelfImprovement-Engine'
  ];

  // Smooth scroll
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Simulated streaming (replace with real backend later)
  async function simulateStreamingResponse(userText: string) {
    const chunks = [
      `Thinking about "${userText}"…`,
      'Analyzing context…',
      'Here is a helpful response:',
      `This is a placeholder AI reply for: "${userText}".`
    ];

    let index = messages.length;
    setMessages((prev) => [...prev, { role: 'assistant', text: '', streaming: true }]);

    for (const chunk of chunks) {
      await new Promise((res) => setTimeout(res, 600));

      setMessages((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          text: updated[index].text + ' ' + chunk
        };
        return updated;
      });
    }

    setMessages((prev) => {
      const updated = [...prev];
      if (updated[index]) updated[index].streaming = false;
      return updated;
    });
  }

  // Send message handler
  async function sendMessage() {
    if (!input.trim()) return;

    const text = input.trim();
    setInput('');

    setMessages((m) => [...m, { role: 'user', text }]);

    simulateStreamingResponse(text);
  }

  return (
    <div className={`${dark ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} h-screen flex`}>

      {/* Sidebar */}
      <div className={`fixed z-20 h-full top-0 left-0 bg-white dark:bg-gray-800 shadow-xl transform transition-all w-64 p-4 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} md:translate-x-0`}>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bot size={22}/> Agents
        </h2>

        <div className="space-y-2">
          {AGENTS.map(a => (
            <div
              key={a}
              onClick={() => setActiveAgent(a)}
              className={`p-2 rounded-lg cursor-pointer transition ${
                activeAgent === a
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {a}
            </div>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex flex-col flex-1 h-full">

        {/* Top bar */}
        <div className="p-4 flex items-center justify-between shadow-sm bg-white dark:bg-gray-800">

          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu />
            </button>

            <h1 className="text-2xl font-bold flex items-center gap-2">
              💬 Chat — <span className="text-blue-600">{activeAgent}</span>
            </h1>
          </div>

          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {dark ? <Sun/> : <Moon/>}
          </button>
        </div>

        {/* Message list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.length === 0 && (
            <p className="text-center text-gray-400 py-20">
              Start a conversation with your AI assistant…
            </p>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm flex items-start gap-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                {msg.role === 'assistant' ? <Bot size={20}/> : <User size={20}/>}

                <div>
                  {msg.text}
                  {msg.streaming && (
                    <span className="ml-1 animate-pulse opacity-60">...</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-4 flex items-center gap-3 bg-white dark:bg-gray-800 shadow-xl">
          <label className="p-3 rounded-xl border bg-gray-100 dark:bg-gray-700 cursor-pointer">
            <Upload size={18}/>
            <input type="file" className="hidden" />
          </label>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message…"
            className="flex-1 rounded-xl p-3 border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={sendMessage}
            className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
      }
