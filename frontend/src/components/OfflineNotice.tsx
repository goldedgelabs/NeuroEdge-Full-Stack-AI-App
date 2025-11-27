
'use client'
import React, { useEffect, useState } from 'react';
export default function OfflineNotice(){
  const [online, setOnline] = useState(true);
  useEffect(()=>{
    setOnline(navigator.onLine);
    const on = ()=>setOnline(true);
    const off = ()=>setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return ()=>{ window.removeEventListener('online', on); window.removeEventListener('offline', off); }
  },[]);
  if(online) return null;
  return (<div className='fixed bottom-4 left-4 p-2 bg-yellow-100 border rounded'>Offline: some features queued</div>)
}
