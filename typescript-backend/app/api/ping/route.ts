import { NextResponse } from 'next/server';
import { ensureEnginesBooted } from '../../../lib/engine-start';

export async function GET() {
  try {
    await ensureEnginesBooted();
    return NextResponse.json({ ok: true, status: 'engines_booted' });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
