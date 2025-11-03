// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ❌ ELIMINA ESTA LÍNEA (está duplicada)
// const cors = require('cors');

// 1) Define exactamente tus orígenes
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://frontendusuario.vercel.app",
];

// 2) Configuración de CORS simplificada y funcional
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como Postman, mobile apps, etc.)
        if (!origin) return callback(null, true);

        if (ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(cookieParser());

// 3) Middleware adicional para manejar preflight OPTIONS
app.options('*', cors()); // Habilita pre-flight para todas las rutas

// ... tus rutas:
import authRouter from "./routes/auth.js";
app.use("/api/auth", authRouter);

// healthchecks
app.get("/", (_, res) => res.send("API OK"));
app.get("/healthz", (_, res) => res.send("healthy"));

export default app;