
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { refresh } = await request.json();
  const url = (process.env.TS_BACKEND_URL || process.env.NEXT_PUBLIC_TS_BACKEND_URL) + '/api/auth/refresh';
  const res = await fetch(url, { method: 'POST', body: JSON.stringify({ refresh }), headers: { 'Content-Type': 'application/json' } });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
