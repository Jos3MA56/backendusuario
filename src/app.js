// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";

const app = express();

// Orígenes permitidos (hardcodeados como respaldo)
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://frontendusuario.vercel.app",
];

// Obtener orígenes desde env o usar los hardcodeados
const origins = process.env.APP_ORIGIN
  ? process.env.APP_ORIGIN.split(",").map(o => o.trim())
  : ALLOWED_ORIGINS;

console.log('🔐 Orígenes permitidos:', origins);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, curl, apps móviles)
    if (!origin) return callback(null, true);

    if (origins.includes(origin)) {
      console.log('✅ Origin permitido:', origin);
      callback(null, true);
    } else {
      console.log('❌ Origin bloqueado:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Manejar preflight OPTIONS
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// Health
app.get("/", (_, res) => res.send("Backend OK"));
app.get("/healthz", (_, res) => res.send("ok"));

export default app;