'use client';

import React, { useState, useEffect, useRef, DragEvent } from 'react';

import ConversationFolders from '@/components/chat/ConversationFolders';
import AgentSwitcher from '@/components/agents/AgentSwitcher';
import AgentTools from '@/components/chat/AgentTools';
import TokenMeter from '@/components/chat/TokenMeter';
import AgentLogsPanel from '@/components/agents/AgentLogsPanel';
import MessageItem from '@/components/chat/MessageItem';

import { useConversations } from '@/hooks/useConversations';
import useChatWS from '@/hooks/useChatWS';
import { sendMessage, uploadFile, transcribeAudio } from '@/lib/chatApi';

export default function ChatPage() {
  const [activeConv, setActiveConv] = useState<string>();
  const [activeAgent, setActiveAgent] = useState('neuro-core');

  const [input, setInput] = useState('');
  const [streamBuffer, setStreamBuffer] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, appendMessage, updateMessage } =
    useConversations(activeConv);

  /* Auto scroll */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamBuffer]);

  /* Websocket streaming binding */
  useChatWS(
    activeConv || 'global',
    chunk => setStreamBuffer(prev => prev + chunk),
    full => {
      appendMessage({ role: 'assistant', text: full });
      setStreamBuffer('');
    }
  );

  /* --- SEND MESSAGE --- */
  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;

    appendMessage({ role: 'user', text: input });
    await sendMessage(activeConv, input, activeAgent);

    setInput('');
  };

  /* --- FILE UPLOAD --- */
  const handleFile = async (file: File) => {
    if (!activeConv) return;

    const meta = await uploadFile(file);

    appendMessage({
      role: 'user',
      file: meta,
      text: `Uploaded: ${meta.name}`
    });
  };

  /* Drag & Drop support */
  const onDrop = async (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    const file = ev.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const allowDrop = (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  };

  /* --- MICROPHONE RECORDING → STT --- */
  const handleMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
      const file = new File(chunks, 'speech.webm', { type: 'audio/webm' });
      const { text } = await transcribeAudio(file);
      setInput(text);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 2500);
  };

  return (
    <div className="flex h-screen bg-app-dark text-gray-200">

      {/* LEFT SIDEBAR */}
      <aside className="w-80 border-r border-gray-700 p-4 flex flex-col gap-4 bg-[#0d1320]">
        <ConversationFolders onSelect={(id) => setActiveConv(id)} />
        <AgentSwitcher active={activeAgent} onChange={setActiveAgent} />
        {activeConv && <TokenMeter conversationId={activeConv} />}
      </aside>

      {/* MAIN CHAT AREA */}
      <main
        className="flex-1 p-4 flex flex-col"
        onDragOver={allowDrop}
        onDrop={onDrop}
      >
        {/* MESSAGES SCROLL AREA */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
        >
          {!activeConv && (
            <div className="flex h-full items-center justify-center text-gray-400">
              Select or create a conversation…
            </div>
          )}

          {activeConv &&
            messages.map((m) => (
              <MessageItem key={m.id} msg={m} onUpdate={() => updateMessage(m)} />
            ))}

          {/* STREAMING MESSAGE */}
          {streamBuffer && (
            <div className="max-w-[70%] bg-[#1a2332] px-4 py-3 rounded-xl border border-gray-700">
              {streamBuffer}
              <span className="animate-pulse">▋</span>
            </div>
          )}
        </div>

        {/* AGENT TOOLS */}
        {activeConv && (
          <>
            <div className="mt-3">
              <AgentTools onRun={(tool) => alert(`Run tool ${tool}`)} />
            </div>

            {/* INPUT BAR */}
            <div className="mt-3 flex items-center gap-3 bg-[#0f1624] border border-gray-700 p-3 rounded-xl shadow-soft">
              
              {/* Upload */}
              <label className="p-2 rounded-lg bg-[#1a2332] cursor-pointer hover:bg-[#1f2a3e]">
                <input type="file" className="hidden" onChange={(ev) => {
                  const f = ev.target.files?.[0];
                  if (f) handleFile(f);
                }} />
                📎
              </label>

              {/* Mic */}
              <button
                onClick={handleMic}
                className="p-2 rounded-lg bg-[#1a2332] hover:bg-[#1f2a3e]"
              >
                🎤
              </button>

              {/* Text input */}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message…"
                className="flex-1 px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg focus:outline-none"
              />

              {/* SEND */}
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-neuro-500 hover:bg-neuro-600 rounded-lg text-white font-medium shadow-glow"
              >
                Send
              </button>
            </div>
          </>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="w-80 border-l border-gray-700 p-4 bg-[#0d1320]">
        <AgentLogsPanel agentId={activeAgent} />
      </aside>
    </div>
  );
                   }
