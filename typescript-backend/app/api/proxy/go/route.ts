import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const GO = process.env.GO_BACKEND_URL || 'http://localhost:9000';
  try {
    const res = await fetch(GO + '/health');
    const data = await res.json();
    return NextResponse.json({ ok: true, from: 'go', data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
