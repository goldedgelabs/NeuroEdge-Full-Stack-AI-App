// backend-ts/src/middleware/internalKey.ts
import { Request, Response, NextFunction } from 'express';

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'internal_replace_me';

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const k = req.headers['x-internal-key'] as string | undefined;
  if (!k || k !== INTERNAL_KEY) {
    return res.status(401).json({ ok: false, error: 'invalid internal key' });
  }
  next();
}
