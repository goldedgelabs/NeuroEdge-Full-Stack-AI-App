'use client';
import React, { useEffect, useState } from 'react';

export default function AgentLogsPanel({ agentId }: { agentId: string }) {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // connect to logs WS (assumes /ws/agent-logs/:agentId)
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/agent-logs/${agentId}`);
    ws.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (d?.log) setLogs(prev => [d.log, ...prev].slice(0,200));
      } catch {}
    };
    return () => ws.close();
  }, [agentId]);

  return (
    <div className="p-3 card">
      <h4 className="font-semibold mb-2">Agent Logs — {agentId}</h4>
      <div className="max-h-80 overflow-auto text-xs space-y-1">
        {logs.map((l,i)=> <div key={i} className="font-mono text-gray-300">{l}</div>)}
      </div>
    </div>
  );
}
