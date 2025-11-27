
export function makeWS(url:string, onMessage:(d:any)=>void){
  const ws = new WebSocket(url);
  ws.onopen = ()=>console.log('ws open', url);
  ws.onmessage = (e)=>{ try{ onMessage(JSON.parse(e.data)); }catch(e){} };
  ws.onclose = ()=>console.log('ws close', url);
  ws.onerror = (e)=>console.log('ws error', e);
  return ws;
}
