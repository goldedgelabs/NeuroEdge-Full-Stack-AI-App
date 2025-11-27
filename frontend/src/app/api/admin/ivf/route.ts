
import { NextResponse } from 'next/server';
export async function POST(request: Request){
  const url = (process.env.NEXT_PUBLIC_GO_BACKEND_URL || process.env.GO_BACKEND_URL) + '/api/admin/ivf/tune';
  const body = await request.json().catch(()=>null);
  const res = await fetch(url, { method:'POST', body: body?JSON.stringify(body):null, headers:{'Content-Type':'application/json'} });
  const data = await res.json().catch(()=>({error:'bad'}));
  return NextResponse.json(data,{status:res.status});
}
