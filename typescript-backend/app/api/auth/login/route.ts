import { NextResponse } from 'next/server';
import { sign, storeRefreshToken } from '../../../lib/utils/authTokens';
export async function POST(request: Request) {
  const payload = await request.json();
  // For demo, accept any username/password (replace with real validation)
  const user = { username: payload.username || 'guest', role: payload.role || 'user' };
  const access = sign({ username: user.username, role: user.role }, { expiresIn: '15m' });
  const refresh = sign({ username: user.username, role: user.role }, { expiresIn: '7d' });
  await storeRefreshToken(refresh, user);
  return NextResponse.json({ ok: true, access, refresh });
}
