'use client';
import React from 'react';
import { AgentProfile, DEFAULT_AGENTS } from '@/lib/agents';

export default function AgentSwitcher({ active, onChange }: { active?: string; onChange: (id:string)=>void }) {
  const agents: AgentProfile[] = DEFAULT_AGENTS;
  return (
    <div className="p-3 space-y-2">
      <h4 className="font-semibold">Agents</h4>
      {agents.map(a => (
        <div key={a.id} className={`p-2 rounded cursor-pointer ${active===a.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'}`} onClick={()=>onChange(a.id)}>
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-gray-400">{a.description}</div>
            </div>
            <div className="text-sm">{a.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
          }
