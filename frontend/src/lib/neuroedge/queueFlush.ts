
export async function flushQueuedRequests(){
  try{
    const dbReq = indexedDB.open('neuroedge-requests', 1);
    dbReq.onsuccess = async ()=>{
      const db = dbReq.result;
      const tx = db.transaction('requests','readwrite');
      const store = tx.objectStore('requests');
      const allReq = store.getAll();
      allReq.onsuccess = async ()=>{
        const list = allReq.result || [];
        for(const r of list){
          try{
            await fetch(r.url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(r.body) });
          }catch(e){ return; }
        }
        store.clear();
      };
    };
  }catch(e){ console.error('flush error', e); }
}

// register flush on reconnect/visibility
if(typeof window !== 'undefined'){
  window.addEventListener('online', ()=> flushQueuedRequests());
  document.addEventListener('visibilitychange', ()=> { if(document.visibilityState==='visible' && navigator.onLine) flushQueuedRequests(); });
}
