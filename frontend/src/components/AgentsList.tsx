
'use client'
import React, { useEffect, useState } from 'react';
export default function AgentsList(){ const [agents, setAgents]=useState([]); useEffect(()=>{ fetch('/api/ts').then(r=>r.json()).then(d=>setAgents(d.agents||[])); },[]); return (<div><h4>Agents</h4><pre>{JSON.stringify(agents,null,2)}</pre></div>); }
