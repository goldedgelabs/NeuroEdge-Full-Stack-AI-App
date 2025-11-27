import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const PY = process.env.PY_BACKEND_URL || 'http://localhost:8000';
  try {
    const res = await fetch(PY + '/api/health');
    const data = await res.json();
    return NextResponse.json({ ok: true, from: 'python', data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
