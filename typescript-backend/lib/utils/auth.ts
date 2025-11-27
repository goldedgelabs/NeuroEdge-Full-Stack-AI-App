import jwt from 'jsonwebtoken';

const SECRET = process.env.INTERNAL_JWT_SECRET || 'neuroedge-secret';

export function sign(payload: any, opts = {}) {
  return jwt.sign(payload, SECRET, opts);
}

export function verify(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}
