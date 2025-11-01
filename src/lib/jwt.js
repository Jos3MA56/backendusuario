import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";

export function signAccess(payload) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "1h" });
}
