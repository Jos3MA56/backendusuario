import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";

const app = express();

// === CORS (ANTES de rutas) ===
// === CORS duro (funciona aunque la ruta no exista) ===
app.set("trust proxy", 1); // cookies SameSite=None + secure detrás de proxy

const ALLOWED = new Set(["https://frontendusuario.vercel.app"]); // SIN "/" al final

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
    }
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Vary", "Origin");

    // Responder preflight aquí mismo
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});


// === Middlewares base ===
app.use(express.json());
app.use(cookieParser());

// === Rutas ===
app.use("/auth", authRouter);
app.use("/profile", profileRouter);

// Health check
app.get("/health", (_, res) => res.json({ ok: true }));

// === MongoDB + arranque ===
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => {
        const port = process.env.PORT || 8080;
        app.listen(port, () => console.log(`API corriendo en http://localhost:${port}`));
    })
    .catch(err => {
        console.error("Error Mongo:", err);
        process.exit(1);
    });
