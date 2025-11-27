import { NextResponse } from 'next/server';
import { consumeRefreshToken, sign } from '../../../lib/utils/authTokens';
export async function POST(request: Request) {
  const payload = await request.json();
  const token = payload.refresh;
  const user = await consumeRefreshToken(token);
  if (!user) return NextResponse.json({ ok: false, error: 'invalid_refresh' }, { status: 401 });
  const access = sign({ username: user.username, role: user.role }, { expiresIn: '15m' });
  return NextResponse.json({ ok: true, access });
}
