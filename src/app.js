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

// ⚠️ CORS - PRIMERO que todo
app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log(`📨 ${req.method} ${req.path} | Origin: ${origin}`);

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('✅ Origin permitido');
  } else if (!origin) {
    console.log('⚠️ Sin origin header');
  } else {
    console.log('❌ Origin no permitido:', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('✅ Respondiendo a OPTIONS preflight');
    return res.status(204).end();
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rutas
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => res.json({ status: "OK", timestamp: new Date().toISOString() }));
app.get("/healthz", (req, res) => res.send("healthy"));

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Ruta no encontrada', path: req.path });
});

export default app;