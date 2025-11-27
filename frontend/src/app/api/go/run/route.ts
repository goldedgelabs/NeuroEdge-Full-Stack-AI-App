
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  const url = process.env.GO_BACKEND_URL + '/runEngine' + (new URL(request.url)).search;
  const body = await request.json().catch(()=>null);
  const res = await fetch(url, { method: 'POST', body: body?JSON.stringify(body):null, headers: { 'Content-Type': 'application/json' } });
  const data = await res.json();
  return NextResponse.json(data);
}
