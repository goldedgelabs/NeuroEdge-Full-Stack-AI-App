import { NextRequest, NextResponse } from 'next/server';
export function validateInternal(req: NextRequest) {
  const key = process.env.NEXT_INTERNAL_API_KEY || '';
  const auth = req.headers.get('authorization') || '';
  if (!key) return true; // no key configured
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  return token === key;
}

export function requireInternal(req: NextRequest) {
  if (!validateInternal(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return null;
}
