// src/components/agents/AgentLiveLogs.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { WSClient } from '@/lib/ws';

export default function AgentLiveLogs({ agentId }: { agentId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const clientRef = useRef<WSClient | null>(null);
  const endRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    // build WS url (assumes backend exposes ws at /ws/agent/{id})
    const base = (process.env.NEXT_PUBLIC_WS_URL || (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
    const url = `${base.replace(/\/$/,'')}/ws/agents/${agentId}`;
    const c = new WSClient(url);
    clientRef.current = c;
    const unsub = c.subscribe((msg) => {
      if (msg?.type === 'log') {
        setLogs(prev => [ `[${new Date().toLocaleTimeString()}] ${msg.line}`, ...prev].slice(0,500));
      }
      if (msg?.type === 'snapshot' && Array.isArray(msg.lines)) {
        setLogs(msg.lines.slice(0,500).map((l:string)=>`[snapshot] ${l}`));
      }
    });
    return () => { unsub(); c.close(); };
  }, [agentId]);

  useEffect(()=> { if (endRef.current) endRef.current.scrollIntoView({behavior:'smooth'}); }, [logs]);

  return (
    <div className="bg-gray-50 border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Live Logs</h4>
        <div className="text-sm text-gray-500">{logs.length} lines</div>
      </div>

      <div className="h-64 overflow-y-auto bg-white rounded p-3 space-y-2 text-sm text-gray-800">
        {logs.length === 0 && <div className="text-gray-400">No live logs yet.</div>}
        {logs.map((l,i)=>(<div key={i} className="whitespace-pre-wrap">{l}</div>))}
        <div ref={endRef} />
      </div>
    </div>
  );
      }
