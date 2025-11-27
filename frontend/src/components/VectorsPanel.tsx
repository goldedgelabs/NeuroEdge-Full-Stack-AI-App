
'use client'
import React, { useEffect, useState } from 'react';
import { useNeuroEdge } from '../lib/neuroedge/provider';
export default function VectorsPanel(){
  const client = useNeuroEdge();
  const [vectors, setVectors] = useState<any>({});
  useEffect(()=>{ (async ()=>{ try{ const res = await client.py.metrics(); setVectors(res || {}); }catch(e){} })(); },[]);
  return (<section className='border border-gray-200 p-4 mb-4 rounded bg-white shadow-sm'><h2>Vectors</h2><pre>{JSON.stringify(vectors,null,2)}</pre></section>)
}
