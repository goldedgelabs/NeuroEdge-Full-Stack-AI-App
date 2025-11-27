
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { username, password } = await request.json();
  // preferentially call TypeScript backend auth endpoint
  const url = (process.env.TS_BACKEND_URL || process.env.NEXT_PUBLIC_TS_BACKEND_URL) + '/api/auth/login';
  const res = await fetch(url, { method: 'POST', body: JSON.stringify({ username, password }), headers: { 'Content-Type': 'application/json' } });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
