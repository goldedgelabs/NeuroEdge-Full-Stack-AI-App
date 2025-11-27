
import { useEffect, useState } from 'react';
export default function useRecommendationsStream() {
  const [recommendations, setRecommendations] = useState<any>([]);
  useEffect(()=>{
    const ws = new WebSocket((process.env.PY_BACKEND_URL || 'ws://localhost:5000') + '/ws/recommendations');
    ws.onmessage = (e)=>{ try{ setRecommendations(JSON.parse(e.data)) }catch(e){} };
    ws.onopen = ()=>console.log('reco ws open');
    ws.onclose = ()=>console.log('reco ws close');
    return ()=>ws.close();
  },[]);
  return { recommendations };
}
