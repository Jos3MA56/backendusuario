// src/app.js (o donde crees el app)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// 1) Define exactamente tus orígenes
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://frontendusuario.vercel.app",
];

// 2) CORS paquete (para respuestas "normales")
app.use(cors({
    origin: (origin, cb) => {
        // permitir también apps nativas / curl sin Origin
        if (!origin) return cb(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
        cb(new Error("Origen no permitido por CORS: " + origin));
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// 3) CORS manual para el preflight (OPTIONS) y asegurar headers en todas
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin"); // importante para caches/CDN
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");

    if (req.method === "OPTIONS") {
        // El preflight DEBE regresar 204/200 sin pasar por auth ni otras rutas
        return res.status(204).end();
    }
    next();
});

// ... tus rutas:
import authRouter from "./routes/auth.js";
app.use("/api/auth", authRouter);

// healthchecks
app.get("/", (_, res) => res.send("API OK"));
app.get("/healthz", (_, res) => res.send("healthy"));

export default app;
