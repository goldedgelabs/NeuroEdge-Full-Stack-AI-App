
'use client'
import React, { useEffect, useState } from 'react';

async function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('neuroedge-requests', 1);
    req.onupgradeneeded = ()=> { req.result.createObjectStore('requests', { autoIncrement:true }); };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}

export default function QueueManager(){
  const [items, setItems] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(()=>{ load(); 
    const onOnline = ()=> { flushAndReload(); };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', ()=> { if(document.visibilityState==='visible' && navigator.onLine) flushAndReload(); });
    return ()=>{ window.removeEventListener('online', onOnline); };
  },[]);

  async function load(){
    try{
      const db = await openDB();
      const tx = db.transaction('requests','readonly');
      const req = tx.objectStore('requests').getAll();
      req.onsuccess = ()=> setItems(req.result || []);
    }catch(e){ console.error(e); }
  }
  async function removeAll(){
    const db = await openDB();
    const tx = db.transaction('requests','readwrite');
    tx.objectStore('requests').clear();
    tx.oncomplete = ()=> load();
  }

  async function retryItem(index:number){
    const db = await openDB();
    const tx = db.transaction('requests','readwrite');
    const store = tx.objectStore('requests');
    const getAll = store.getAll();
    getAll.onsuccess = async ()=>{
      const list = getAll.result || [];
      const item = list[index];
      if(!item) return;
      try{
        setLogs(l=>[`Retrying item ${index} -> ${item.url}`,...l]);
        const res = await fetch(item.url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(item.body) });
        setLogs(l=>[`Retry result: ${res.status} ${res.statusText}`,...l]);
        if(res.ok){
          store.clear();
          load();
        }
      }catch(e){
        setLogs(l=>[`Retry failed: ${e.message}`,...l]);
      }
    };
  }

  async function cancelItem(index:number){
    const db = await openDB();
    const tx = db.transaction('requests','readwrite');
    const store = tx.objectStore('requests');
    const getAll = store.getAll();
    getAll.onsuccess = ()=>{
      const list = getAll.result || [];
      list.splice(index,1);
      const clear = store.clear();
      clear.onsuccess = async ()=>{
        for(const it of list) store.add(it);
        load();
      };
    };
  }

  async function flushAndReload(){
    const db = await openDB();
    const tx = db.transaction('requests','readwrite');
    const store = tx.objectStore('requests');
    const getAll = store.getAll();
    getAll.onsuccess = async ()=>{
      const list = getAll.result || [];
      for(const req of list){
        try{
          await fetch(req.url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(req.body) });
          setLogs(l=>[`Flushed ${req.url}`,...l]);
        }catch(e){
          setLogs(l=>[`Flush failed ${e.message}`,...l]);
          return;
        }
      }
      store.clear();
      load();
    };
  }
  return (
    <div className='p-4 border rounded bg-white shadow-sm'>
      <h3 className='font-semibold mb-2'>Pending Queue</h3>
      <div className='mb-2'><button onClick={flushAndReload} className='px-3 py-1 bg-green-500 text-white rounded mr-2'>Flush Now</button><button onClick={removeAll} className='px-3 py-1 bg-red-500 text-white rounded'>Clear</button></div>
      <div style={{maxHeight:200, overflow:'auto'}}>
        {items.map((it:any, i:number)=> (<div key={i} className='p-2 border-b'><div><b>{it.url}</b></div><div><pre>{JSON.stringify(it.body)}</pre></div><div className='mt-2'><button onClick={()=>retryItem(i)} className='px-2 py-1 bg-blue-500 text-white rounded mr-2'>Retry</button><button onClick={()=>cancelItem(i)} className='px-2 py-1 bg-gray-300 rounded'>Cancel</button></div></div>))}
      </div>
      <h4 className='mt-2'>Logs</h4>
      <pre style={{maxHeight:120, overflow:'auto'}}>{logs.join('\n')}</pre>
    </div>
  )
}
