'use client';

import React from 'react';

export default function Page() {
  const agents = [
    { id: 'agent-1', name: 'Cognitive Engine' },
    { id: 'agent-2', name: 'Predictive Engine' },
    { id: 'agent-3', name: 'Voice Engine' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-3">Agents</h1>

      <p classname="text-gray-600 mb-6">
        Manage all AI agents. Select an agent to view logs, stats, and configuration.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((a) => (
          <div
            key={a.id}
            className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => (window.location.href = `/agents/${a.id}`)}
          >
            <h2 className="text-xl font-semibold">{a.name}</h2>
            <p className="text-gray-600">Click to open details</p>
          </div>
        ))}
      </div>
    </div>
  );
}
