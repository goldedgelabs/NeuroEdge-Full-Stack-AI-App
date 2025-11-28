'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Moon, Sun, Send, Upload, Bot, User, Menu
} from 'lucide-react';

import ReactMarkdown from "react-markdown";

import useChatWS from '@/hooks/useChatWS';
import { sendMessage, uploadFile, transcribeAudio } from '@/lib/chatApi';

type Message = {
  role: 'user' | 'assistant';
  text?: string;
  file?: any;
};

export default function Page() {
  const conversationId = "global"; // Later dynamic

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamBuffer, setStreamBuffer] = useState("");
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

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamBuffer]);

  // WebSocket Streaming
  useChatWS(
    conversationId,

    // chunk event
    (chunk) => {
      setStreamBuffer((prev) => prev + chunk);
    },

    // final assembled message event
    (fullMessage) => {
      setMessages((prev) => [...prev, { role: 'assistant', text: fullMessage }]);
      setStreamBuffer("");
    }
  );

  // Send text message
  const handleSend = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    setMessages((m) => [...m, { role: "user", text }]);

    sendMessage(conversationId, text); // triggers WS stream
    setInput("");
  };

  // Handle file upload
  const handleFile = async (ev: any) => {
    const file = ev.target.files?.[0];
    if (!file) return;

    const meta = await uploadFile(file);

    setMessages((m) => [
      ...m,
      { role: "user", file: meta, text: `Uploaded: ${meta.name}` }
    ]);
  };

  // Mic input → transcription
  const handleMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const file = new File(chunks, "audio.webm", { type: "audio/webm" });
      const result = await transcribeAudio(file);
      setInput(result.text);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 3000);
  };

  return (
    <div className={`${dark ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} h-screen flex`}>

      {/* SIDEBAR */}
      <div className={`fixed z-20 h-full top-0 left-0 bg-white dark:bg-gray-800 shadow-xl w-64 p-4
        transform transition-all ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} md:translate-x-0`}>

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

      {/* MAIN CHAT AREA */}
      <div className="flex flex-col flex-1 h-full">

        {/* TOP BAR */}
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

        {/* MESSAGES */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">

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

                <div className="prose prose-invert max-w-none">
                  {msg.file ? (
                    <div>
                      <p className="font-bold">{msg.file.name}</p>
                      <p className="text-sm opacity-75">{msg.file.size} bytes</p>
                    </div>
                  ) : (
                    <ReactMarkdown>{msg.text || ""}</ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* STREAMING BUBBLE */}
          {streamBuffer && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-3 rounded-2xl shadow-sm bg-gray-300 dark:bg-gray-700">
                <Bot size={18} className="opacity-70" />
                <ReactMarkdown>{streamBuffer}</ReactMarkdown>
                <span className="animate-pulse opacity-60">...</span>
              </div>
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="p-4 flex items-center gap-3 bg-white dark:bg-gray-800 shadow-xl">

          {/* File Upload */}
          <label className="p-3 rounded-xl border bg-gray-100 dark:bg-gray-700 cursor-pointer">
            <Upload size={18}/>
            <input type="file" className="hidden" onChange={handleFile}/>
          </label>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message…"
            className="flex-1 rounded-xl p-3 border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />

          <button
            onClick={handleSend}
            className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
    }
