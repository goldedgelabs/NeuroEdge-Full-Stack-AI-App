
import { useEffect, useState } from 'react';
export default function useProactiveActions() {
  const [actions, setActions] = useState<any[]>([]);
  useEffect(()=>{
    const ws = new WebSocket((process.env.GO_BACKEND_URL || 'ws://localhost:9000') + '/ws/proactive');
    ws.onmessage = (e)=>{ try{ setActions(prev => [JSON.parse(e.data), ...prev].slice(0,100)) }catch(e){} };
    ws.onopen = ()=>console.log('proactive ws open');
    ws.onclose = ()=>console.log('proactive ws close');
    return ()=>ws.close();
  },[]);
  return { actions };
}
