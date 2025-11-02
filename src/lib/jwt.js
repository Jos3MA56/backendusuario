// src/lib/jwt.js
import jwt from "jsonwebtoken";

/**
 * Firma un access token corto (stateless).
 * Variables:
 *  - JWT_ACCESS_SECRET
 *  - JWT_ACCESS_EXPIRES  (ej: "15m", "1h")
 */
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";

export function signAccess(payload) {
  // payload: { sub: userId, email: userEmail }
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET);
}
