
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const url = process.env.TS_BACKEND_URL + '/health';
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}
