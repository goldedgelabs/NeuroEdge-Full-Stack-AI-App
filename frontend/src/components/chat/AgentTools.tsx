'use client';
import React from 'react';

const TOOLS = [
  { id: 'search', title: 'Search Knowledge', desc: 'Search internal docs & vectors' },
  { id: 'summarize', title: 'Summarize', desc: 'Summarize text or url' },
  { id: 'translate', title: 'Translate', desc: 'Translate to other languages' },
];

export default function AgentTools({ onRun }: { onRun: (toolId: string, payload?: any) => void }) {
  return (
    <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TOOLS.map(t => (
        <div key={t.id} className="p-3 card hover:shadow cursor-pointer" onClick={() => onRun(t.id)}>
          <div className="font-semibold">{t.title}</div>
          <div className="text-xs text-gray-400 mt-1">{t.desc}</div>
          <div className="mt-2 text-sm">
            <button className="btn-ghost" onClick={(e)=>{ e.stopPropagation(); onRun(t.id); }}>Run</button>
          </div>
        </div>
      ))}
    </div>
  );
}
