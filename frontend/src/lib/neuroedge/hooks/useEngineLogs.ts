
import { useEffect, useState } from 'react';
export default function useEngineLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(()=>{
    const ws = new WebSocket((process.env.GO_BACKEND_URL || 'ws://localhost:9000') + '/ws/logs');
    ws.onmessage = (e)=>{ try{ setLogs(prev => [JSON.parse(e.data), ...prev].slice(0,500)) }catch(e){} };
    ws.onopen = ()=>console.log('logs ws open');
    ws.onclose = ()=>console.log('logs ws close');
    return ()=>ws.close();
  },[]);
  return { logs };
}
