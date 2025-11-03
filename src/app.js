// src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import "./db.js";
import authRouter from "./routes/auth.js";

const app = express();

const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://frontendusuario.vercel.app",  // <-- AJUSTA si tu dominio es otro
];

app.use((req, res, next) => {
    const origin = ALLOWED_ORIGINS.includes(req.headers.origin)
        ? req.headers.origin
        : ALLOWED_ORIGINS[0];

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end(); // <- vital
    next();
});

app.use(express.json());
app.use(cookieParser());

// RUTAS
app.use("/auth", authRouter);

// health
app.get("/", (_, res) => res.send("API OK (Vercel)"));

// al final, ANTES de export default app;
app.use((err, req, res, _next) => {
    // Reaplicar CORS en respuestas de error
    const ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "https://frontendusuario.vercel.app",
    ];
    const origin = ALLOWED_ORIGINS.includes(req.headers.origin)
        ? req.headers.origin
        : ALLOWED_ORIGINS[0];

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    const status = err.status || 500;
    const msg = err.message || "Error en el servidor";
    console.error("Unhandled error:", err);
    res.status(status).json({ error: msg });
});


export default app;
