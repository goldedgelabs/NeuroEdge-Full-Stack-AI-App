
import { useEffect, useState } from 'react';
export default function useMemoryGraph() {
  const [graph, setGraph] = useState<any>({});
  useEffect(()=>{
    const ws = new WebSocket((process.env.PY_BACKEND_URL || 'ws://localhost:5000') + '/ws/memory');
    ws.onmessage = (e)=>{ try{ setGraph(JSON.parse(e.data)) }catch(e){} };
    ws.onopen = ()=>console.log('memory ws open');
    ws.onclose = ()=>console.log('memory ws close');
    return ()=>ws.close();
  },[]);
  return { graph };
}
