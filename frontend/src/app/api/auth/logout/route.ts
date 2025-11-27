
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // frontend-only: clear session cookies via response
  return NextResponse.json({ ok: true });
}
