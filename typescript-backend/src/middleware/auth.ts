// backend-ts/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me';

export interface AuthRequest extends Request {
  user?: any;
}

export function requireJwt(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid authorization header' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// helper to sign tokens (for test login)
export function signToken(payload: any, opts?: { expiresIn?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: opts?.expiresIn || '8h' });
}
