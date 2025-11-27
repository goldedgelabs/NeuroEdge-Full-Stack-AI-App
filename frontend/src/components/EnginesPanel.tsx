
'use client'
import React, { useEffect, useState } from 'react';
import { useNeuroEdge } from '../lib/neuroedge/provider';
export default function EnginesPanel(){
  const client = useNeuroEdge();
  const [engines, setEngines] = useState<any[]>([]);
  useEffect(()=>{
    (async ()=>{ try{ const res = await client.go.health(); setEngines(res || {}); }catch(e){} })();
  },[]);
  return (<section className='border border-gray-200 p-4 mb-4 rounded bg-white shadow-sm'><h2>Engines</h2><pre>{JSON.stringify(engines,null,2)}</pre></section>)
}
