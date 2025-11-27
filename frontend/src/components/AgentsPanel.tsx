
'use client'
import React, { useEffect, useState } from 'react';
import { useNeuroEdge } from '../lib/neuroedge/provider';
export default function AgentsPanel(){
  const client = useNeuroEdge();
  const [agents, setAgents] = useState<any[]>([]);
  useEffect(()=>{
    (async ()=>{
      try{ const res = await client.ts.get('/api/agents'); setAgents(res.agents || []); }catch(e){}
    })();
  },[]);
  return (<section className='border border-gray-200 p-4 mb-4 rounded bg-white shadow-sm'><h2>Agents</h2><pre>{JSON.stringify(agents,null,2)}</pre></section>)
}
