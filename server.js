// server.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";

const app = express();

// Para que 'secure' y 'sameSite:none' funcionen detrás de proxy (https)
app.set("trust proxy", 1);

// ===== CORS =====
const ALLOWED = [
    (process.env.APP_ORIGIN || "https://frontendusuario.vercel.app").replace(/\/$/, ""),
    "http://localhost:5173",
];

const corsMw = cors({
    origin(origin, cb) {
        if (!origin) return cb(null, true);              // permite curl/Postman
        const o = origin.replace(/\/$/, "");
        if (ALLOWED.includes(o)) return cb(null, true);
        cb(new Error("CORS bloqueado: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

app.use((req, res, next) => { res.header("Vary", "Origin"); next(); });
app.use(corsMw);
app.options("*", corsMw); // usa el MISMO middleware para preflight

// ===== Middlewares base =====
app.use(express.json());
app.use(cookieParser());

// ===== Rutas =====
app.use("/auth", authRouter);
app.use("/profile", profileRouter);

// Health
app.get("/health", (_, res) => res.json({ ok: true }));

// ===== Mongo + arranque =====
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => {
        const port = process.env.PORT || 8080;
        app.listen(port, () => console.log(`API http://localhost:${port}`));
    })
    .catch(err => {
        console.error("Mongo error:", err);
        process.exit(1);
    });
