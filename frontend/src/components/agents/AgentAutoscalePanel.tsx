// src/components/agents/AgentAutoscalePanel.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { setAgentAutoscale } from '@/lib/api/agents';

export default function AgentAutoscalePanel({ agentId }: { agentId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [minReplicas, setMinReplicas] = useState(1);
  const [maxReplicas, setMaxReplicas] = useState(3);
  const [targetRps, setTargetRps] = useState(1.0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await setAgentAutoscale(agentId, { enabled, minReplicas, maxReplicas, targetRps });
      alert('Autoscale updated');
    } catch (e) { alert('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white p-4 rounded shadow border space-y-3">
      <h4 className="font-semibold">Autoscaling</h4>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} />
        Enable autoscaling
      </label>

      <div className="grid grid-cols-3 gap-2">
        <label>Min replicas
          <input type="number" value={minReplicas} onChange={e=>setMinReplicas(Number(e.target.value))} className="w-full p-2 border rounded"/>
        </label>
        <label>Max replicas
          <input type="number" value={maxReplicas} onChange={e=>setMaxReplicas(Number(e.target.value))} className="w-full p-2 border rounded"/>
        </label>
        <label>Target RPS
          <input type="number" step="0.1" value={targetRps} onChange={e=>setTargetRps(Number(e.target.value))} className="w-full p-2 border rounded"/>
        </label>
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={save} disabled={saving}>{saving? 'Saving...' : 'Apply'}</button>
      </div>
    </div>
  );
}
