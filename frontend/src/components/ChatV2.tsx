
'use client'
import React, { useEffect, useState } from 'react';

export default function ChatV2(){
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(()=>{
    const saved = localStorage.getItem('ne-chat');
    if(saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(()=>{ localStorage.setItem('ne-chat', JSON.stringify(messages)); }, [messages]);

  async function send(){
    if(!input) return;
    const msg = { role:'user', text: input, ts: Date.now() };
    setMessages(m=>[...m, msg]);
    setInput('');
    try{
      const res = await fetch('/api/ai/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: msg.text }) });
      if(res.status===202){
        setMessages(m=>[...m, { role:'assistant', text:'(queued - will deliver when online)' }]);
      } else {
        const data = await res.json();
        setMessages(m=>[...m, { role:'assistant', text: JSON.stringify(data) }]);
      }
    }catch(e){
      setMessages(m=>[...m, { role:'assistant', text: '(offline - queued)' }]);
      if('serviceWorker' in navigator && navigator.serviceWorker.controller){
        try{ navigator.serviceWorker.controller.postMessage({ type:'queue', url:'/api/ai/chat', body:{ prompt: msg.text } }); }catch(e){} 
      }
    }
  }

  return (
    <div className='p-4 border rounded bg-white shadow-sm'>
      <h3 className='font-semibold mb-2'>Chat (V2)</h3>
      <div className='min-h-[160px] p-2 border rounded bg-gray-50 mb-2'>
        {messages.map((m,i)=>(<div key={i}><b>{m.role}:</b> {m.text}</div>))}
      </div>
      <div className='flex gap-2'>
        <input value={input} onChange={e=>setInput(e.target.value)} className='flex-1 p-2 border rounded' placeholder='Say something...' />
        <button onClick={send} className='px-3 py-2 bg-ne-accent text-white rounded'>Send</button>
      </div>
    </div>
  )
}
