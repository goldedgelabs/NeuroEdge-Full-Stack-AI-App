'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAgentStore } from '@/stores/agentStore';

export default function AgentDetailClient({ id }: { id: string }) {
  const agent = useAgentStore((s) => s.find(id));
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // Fake metrics (replace with real API later)
  const [metrics, setMetrics] = useState({
    cpu: 12,
    memory: 480,
    rps: 0.8,
    status: 'healthy'
  });

  useEffect(() => {
    // Fake logs generator
    const interval = setInterval(() => {
      setLogs((l) => [`Log event ${Math.random().toString(36).slice(2, 7)}`, ...l].slice(0, 100));
    }, 2200);

    // Fake metric fluctuations
    const metricInterval = setInterval(() => {
      setMetrics((m) => ({
        cpu: Math.max(5, Math.min(99, m.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(200, Math.min(1200, m.memory + (Math.random() * 40 - 20))),
        rps: Math.max(0.1, Math.min(5, m.rps + (Math.random() - 0.5))),
        status: Math.random() > 0.1 ? 'healthy' : 'warning'
      }));
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(metricInterval);
    };
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!agent) return <div className="p-6 text-gray-700">Agent not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{agent.name}</h2>
          <p className="text-gray-500 text-sm">{agent.description || "AI Agent"}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            metrics.status === 'healthy'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {metrics.status}
        </span>
      </header>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard label="CPU Usage" value={`${metrics.cpu.toFixed(1)}%`} />
        <MetricCard label="Memory" value={`${metrics.memory.toFixed(0)} MB`} />
        <MetricCard label="Req/s" value={metrics.rps.toFixed(2)} />
      </div>

      {/* LOGS PANEL */}
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
    </div>
  );
}

/* -------------------------
   Metric Card Component
-------------------------- */
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white shadow rounded-xl p-5 border hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
    }
