// src/components/agents/AgentDetailClient.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAgentStore } from '@/stores/agentStore';

import AgentControlPanel from './AgentControlPanel';
import AgentLiveLogs from './AgentLiveLogs';
import AgentSettingsEditor from './AgentSettingsEditor';
import AgentAutoscalePanel from './AgentAutoscalePanel';
import AgentMetricsCharts from './AgentMetricsCharts';

export default function AgentDetailClient({ id }: { id: string }) {
  const agent = useAgentStore((s) => s.find(id));

  /* --------------------------
      METRICS + LOGS STATES
  --------------------------- */
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const [metrics, setMetrics] = useState({
    cpu: 12,
    memory: 480,
    rps: 0.8,
    status: 'healthy'
  });

  /* --------------------------
      FAKE STREAM SIMULATION
  --------------------------- */
  useEffect(() => {
    // Fake log stream
    const logInterval = setInterval(() => {
      setLogs((l) => [
        `Log event ${Math.random().toString(36).slice(2, 7)}`,
        ...l,
      ].slice(0, 100));
    }, 2200);

    // Fake metric stream
    const metricInterval = setInterval(() => {
      setMetrics((m) => ({
        cpu: Math.max(5, Math.min(99, m.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(200, Math.min(1200, m.memory + (Math.random() * 40 - 20))),
        rps: Math.max(0.1, Math.min(5, m.rps + (Math.random() - 0.5))),
        status: Math.random() > 0.1 ? 'healthy' : 'warning'
      }));
    }, 3000);

    return () => {
      clearInterval(logInterval);
      clearInterval(metricInterval);
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!agent) return <div className="p-4">Agent not found</div>;

  /* --------------------------
        MAIN UI STRUCTURE
  --------------------------- */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{agent.name}</h1>
          <p className="text-gray-500">{agent.description}</p>
        </div>

        <div className="space-y-3">
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              metrics.status === 'healthy'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {metrics.status}
          </div>
          <div className="text-right text-sm text-gray-500">id: {id}</div>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE — METRICS + LOGS */}
        <div className="lg:col-span-2 space-y-6">
          <AgentMetricsCharts metricsStream={metrics} />

          {/* NEW LOG PANEL */}
          <div className="bg-white rounded-xl shadow p-4 border">
            <h3 className="text-lg font-semibold mb-3">Activity Logs</h3>

            <div className="h-80 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="p-2 rounded border bg-gray-50 text-sm text-gray-700 shadow-sm"
                >
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* (Optional) If you still want the old component */}
          {/* <AgentLiveLogs agentId={id} /> */}
        </div>

        {/* RIGHT SIDE — CONTROLS */}
        <aside className="space-y-4">
          <AgentControlPanel agentId={id} />
          <AgentAutoscalePanel agentId={id} />
          <AgentSettingsEditor agentId={id} />
        </aside>
      </div>
    </div>
  );
      }
