// src/components/chat/AgentTools.tsx
'use client';
import React from 'react';

const TOOLS = [
  { id:'search', label:'Search', desc:'Search internal knowledge' },
  { id:'summarize', label:'Summarize', desc:'Summarize text' },
  { id:'translate', label:'Translate', desc:'Translate text' },
];

export default function AgentTools({ onRun }: { onRun: (toolId:string, payload?:any)=>void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TOOLS.map(t => (
        <div key={t.id} className="p-3 border rounded hover:shadow cursor-pointer" onClick={()=>onRun(t.id)}>
          <h4 className="font-semibold">{t.label}</h4>
          <p className="text-sm text-gray-500">{t.desc}</p>
        </div>
      ))}
    </div>
  );
}
