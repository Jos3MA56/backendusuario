// src/middlewares/auth.js
import jwt from "jsonwebtoken";

/**
 * Middleware de protección por JWT Access Token.
 * Verifica el token de Authorization: Bearer <token>
 * y adjunta los datos del usuario a req.user
 */
export const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autorizado: falta token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, email: payload.email || payload.correo };
    next();
  } catch (err) {
    console.error("❌ Error JWT:", err.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
