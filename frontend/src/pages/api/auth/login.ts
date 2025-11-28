// src/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // This is a dummy/userless login for dev. Replace with real auth.
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });

  const token = jwt.sign({ sub: username, role: 'frontend' }, JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
}
