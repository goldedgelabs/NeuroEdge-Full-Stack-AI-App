
const axios = require('axios');
const WebSocket = require('ws');
(async ()=>{
  try{
    console.log('ping ts backend');
    let ts = process.env.TS_BACKEND_URL || 'http://localhost:4000';
    let r = await axios.get(ts + '/health'); console.log('ts:', r.data);
    let go = process.env.GO_BACKEND_URL || 'http://localhost:9000';
    r = await axios.get(go + '/health'); console.log('go:', r.data);
    // ws test
    const ws = new WebSocket((process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000') + '/ws/metrics');
    ws.on('open', ()=>{ console.log('ws open'); ws.close(); process.exit(0); });
    ws.on('error', (e)=>{ console.error('ws error', e); process.exit(2); });
  }catch(e){ console.error(e); process.exit(3); }
})()
