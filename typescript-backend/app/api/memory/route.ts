import { enforcePublic, enforceInternal } from '../../../lib/utils/routeHelpers';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/utils/httpClient';
const PY = process.env.PY_BACKEND_URL || 'http://localhost:8000';
const client = createClient(PY);

export async function GET(request: Request) {
  const req = request as unknown as Request;
  // enforce auth
  const enforce = enforcePublic(req as any);;
  if (enforce) return enforce as any;
  try {
    const r = await client.get('/api/vectors/top?n=50');
    return NextResponse.json({ ok: true, data: r.data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
