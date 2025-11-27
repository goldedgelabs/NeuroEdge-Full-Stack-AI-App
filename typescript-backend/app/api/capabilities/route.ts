import { NextResponse } from 'next/server';
import { listCapabilities } from '../../../lib/brain/router';

export async function GET() {
  try {
    const caps = listCapabilities();
    return NextResponse.json({ ok: true, data: caps });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
