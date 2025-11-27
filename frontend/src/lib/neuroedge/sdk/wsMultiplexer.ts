
type Handler = (data:any)=>void;
export default class WSMultiplexer {
  socket: WebSocket|null = null;
  handlers: Record<string, Handler[]> = {};
  constructor(url:string){ this.socket = new WebSocket(url); this.socket.onmessage = (e)=> this.handle(e); this.socket.onopen = ()=>console.log('ws open'); this.socket.onclose = ()=>console.log('ws close'); }
  register(channel:string, h:Handler){ if(!this.handlers[channel]) this.handlers[channel]=[]; this.handlers[channel].push(h); }
  handle(e:MessageEvent){ try{ const msg = JSON.parse(e.data); if(msg.channel && this.handlers[msg.channel]){ this.handlers[msg.channel].forEach(h=>h(msg.payload)); } }catch(err){} }
  send(channel:string, payload:any){ if(this.socket && this.socket.readyState===1) this.socket.send(JSON.stringify({ channel, payload })); }
  close(){ if(this.socket) this.socket.close(); }
}
