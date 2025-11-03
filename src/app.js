// src/app.js
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://frontendusuario.vercel.app",
];

// ⚠️ CRÍTICO: Este middleware debe ir PRIMERO, antes de express.json()
app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log('🔍 Request:', req.method, req.path);
  console.log('🔍 Origin:', origin);

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  // ⭐ IMPORTANTE: Responder a OPTIONS antes de las rutas
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondiendo a OPTIONS preflight');
    return res.status(204).end(); // 204 No Content
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

// Catch-all para rutas no encontradas
app.use((req, res) => {
  console.log('❌ Ruta no encontrada:', req.method, req.path);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;