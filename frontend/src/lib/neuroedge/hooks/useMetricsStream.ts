
import { useEffect, useState } from 'react';
export default function useMetricsStream() {
  const [metrics, setMetrics] = useState<any>({});
  useEffect(()=>{
    const ws = new WebSocket((process.env.TS_BACKEND_URL || 'ws://localhost:4000') + '/ws/metrics');
    ws.onmessage = (e)=>{ try{ setMetrics(JSON.parse(e.data)) }catch(e){} };
    ws.onopen = ()=>console.log('metrics ws open');
    ws.onclose = ()=>console.log('metrics ws close');
    return ()=>ws.close();
  },[]);
  return { metrics };
}
