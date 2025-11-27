
'use client'
import React, { useState } from 'react';
import { useNeuroEdge } from '../lib/neuroedge/provider';
export default function ChatPanel(){
  const client = useNeuroEdge();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  async function send(){ if(!input) return; setMessages([...messages, {role:'user', text:input}]); setInput(''); try{ const res = await client.ts.runTask('ConversationEngine', { prompt: input }); setMessages(m=>[...m, {role:'assistant', text: JSON.stringify(res)}]); }catch(e){ setMessages(m=>[...m, {role:'assistant', text: 'error'}]) } }
  return (<section className='border border-gray-200 p-4 rounded bg-white shadow-sm'><h2>Chat</h2><div className='min-h-[120px] border border-gray-100 p-2 bg-gray-50 rounded'>{messages.map((m,i)=>(<div key={i}><b>{m.role}:</b> {m.text}</div>))}</div><div className='mt-2 flex gap-2'><input value={input} onChange={e=>setInput(e.target.value)} style={{width:'80%'}} /><button onClick={send}>Send</button></div></section>)
}
