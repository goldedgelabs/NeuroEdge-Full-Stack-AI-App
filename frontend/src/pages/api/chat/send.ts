// src/pages/api/chat/send.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me';
const TS_BACKEND = process.env.TS_BACKEND_URL || 'http://localhost:4000';
const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'internal_replace_me';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  // Simple JWT verification (frontend token)
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid auth' });

  try {
    jwt.verify(parts[1], JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }

  // proxy to TS backend route
  try {
    const body = req.body;
    const r = await axios.post(`${TS_BACKEND}/api/chat/send`, body, {
      headers: { 'x-internal-key': INTERNAL_KEY },
      timeout: 10000,
    });
    return res.status(r.status).json(r.data);
  } catch (err: any) {
    console.error('proxy error', err?.message || err);
    const status = err?.response?.status || 500;
    return res.status(status).json(err?.response?.data || { error: 'proxy failed' });
  }
}
