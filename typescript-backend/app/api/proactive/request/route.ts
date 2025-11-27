import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/utils/httpClient';
import { ProactiveRequestSchema } from '../../../../lib/utils/schemas';
const PY = process.env.PY_BACKEND_URL || 'http://localhost:8000';
const client = createClient(PY);

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = ProactiveRequestSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.format() }, { status: 400 });
    const r = await client.post('/api/proactive/request', payload);
    return NextResponse.json({ ok: true, data: r.data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
