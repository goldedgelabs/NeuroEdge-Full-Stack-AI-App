// src/components/agents/AgentSettingsEditor.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { getAgentConfig, saveAgentConfig, AgentConfig } from '@/lib/api/agents';

export default function AgentSettingsEditor({ agentId }: { agentId: string }) {
  const [cfg, setCfg] = useState<AgentConfig | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(()=>{ getAgentConfig(agentId).then(setCfg).catch(()=> setCfg({ name:'', description:'', resources:{}, autoscale:{} })); }, [agentId]);

  if (!cfg) return <div className="p-4">Loading...</div>;

  const update = (patch: Partial<AgentConfig>) => setCfg(prev => ({ ...(prev||{}), ...patch }));

  const onSave = async () => {
    setSaving(true);
    try { await saveAgentConfig(agentId, cfg!); alert('Saved'); }
    catch(e){ alert('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white p-4 rounded shadow border space-y-4">
      <h4 className="font-semibold text-lg">Agent Settings</h4>

      <label className="block">Name
        <input className="w-full mt-1 p-2 border rounded" value={cfg.name||''} onChange={e=>update({name:e.target.value})}/>
      </label>

      <label className="block">Description
        <textarea className="w-full mt-1 p-2 border rounded" value={cfg.description||''} onChange={e=>update({description:e.target.value})}/>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label>CPU (cores)
          <input type="number" className="w-full mt-1 p-2 border rounded" value={cfg.resources?.cpu ?? 1} onChange={e=>update({ resources:{ ...(cfg.resources||{}), cpu: Number(e.target.value) } })}/>
        </label>
        <label>Memory (MB)
          <input type="number" className="w-full mt-1 p-2 border rounded" value={cfg.resources?.memoryMb ?? 512} onChange={e=>update({ resources:{ ...(cfg.resources||{}), memoryMb: Number(e.target.value) } })}/>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button disabled={saving} onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
    </div>
  );
}
