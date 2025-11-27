import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const INTERNAL_KEY = process.env.NEXT_INTERNAL_API_KEY || '';
const ALLOWED_ORIGINS = (process.env.NEXT_ALLOW_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

export function checkPublic(req: NextRequest) {
  if (!PUBLIC_KEY) return true; // allow if not configured
  const key = req.headers.get('x-api-key') || '';
  return key === PUBLIC_KEY;
}

export function checkInternalAuth(req: NextRequest) {
  if (!INTERNAL_KEY) return true;
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  return token === INTERNAL_KEY;
}

export function corsHeaders(origin: string | null) {
  if (!origin) return { 'Access-Control-Allow-Origin': '*' };
  if (ALLOWED_ORIGINS.length === 0) return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' };
  if (ALLOWED_ORIGINS.includes(origin)) return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' };
  return { 'Access-Control-Allow-Origin': 'null' };
}
