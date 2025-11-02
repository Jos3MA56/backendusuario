// server.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.js";

const app = express();

// === CORS ===
const ALLOWED = [
    process.env.APP_ORIGIN || "http://localhost:5173",
];
app.use((req, res, next) => { res.header("Vary", "Origin"); next(); });
app.use(cors({
    origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (ALLOWED.includes(origin)) return cb(null, true);
        return cb(new Error("CORS bloqueado: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
}));
app.options("*", cors());

// === Middlewares base ===
app.use(express.json());
app.use(cookieParser());

// === Rutas ===
app.use("/auth", authRouter);

// Health
app.get("/health", (_, res) => res.json({ ok: true }));

// === Mongo + arranque ===
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
