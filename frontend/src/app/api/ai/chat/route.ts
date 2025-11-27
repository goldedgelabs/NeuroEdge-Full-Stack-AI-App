
import { NextResponse } from 'next/server';
export async function POST(req: Request){
  const body = await req.json().catch(()=>null);
  const bases = [process.env.NEXT_PUBLIC_TS_BACKEND_URL, process.env.NEXT_PUBLIC_PY_BACKEND_URL, process.env.NEXT_PUBLIC_GO_BACKEND_URL];
  for(const b of bases){
    if(!b) continue;
    try{
      const res = await fetch(b.replace(/\/$/,'') + '/api/ai/chat', { method:'POST', body: JSON.stringify(body), headers: {'Content-Type':'application/json'} });
      if(res.ok) return NextResponse.json(await res.json());
    }catch(e){}
  }
  return NextResponse.json({ error: 'no-backend' }, { status: 502 });
}
