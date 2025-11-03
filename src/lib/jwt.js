import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_access_secret';
const ACCESS_TTL = process.env.ACCESS_TTL || '60m';

export function signAccess(payload, opts = {}) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL, ...opts });
}

export function verifyAccess(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (_e) {
    return null;
  }
}
