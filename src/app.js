// src/app.js
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";

const app = express();

// ⚠️ IMPORTANTE: Este middleware DEBE ir PRIMERO, antes de todo
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://frontendusuario.vercel.app",
];

// Middleware CORS manual (más confiable que el paquete 'cors' en Vercel)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Permitir el origin si está en la lista
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');

  // ⭐ CRÍTICO: Responder al preflight OPTIONS inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// Health checks
app.get("/", (_, res) => res.send("Backend OK"));
app.get("/healthz", (_, res) => res.send("ok"));

export default app;