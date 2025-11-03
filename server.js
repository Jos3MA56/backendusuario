// server.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// importa tus routers
import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";

const app = express();

// ===== CORS a prueba de preflight =====
app.set("trust proxy", 1); // SameSite=None + secure detrás de proxy

const ALLOWED = new Set(["https://frontendusuario.vercel.app"]); // sin slash final

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
    }
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    res.header("Vary", "Origin");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// ===== Middlewares =====
app.use(express.json());
app.use(cookieParser());

// ===== Rutas =====
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.get("/health", (_, res) => res.json({ ok: true }));

// ===== Mongo (una sola vez) =====
const uri = process.env.MONGO_URI;
if (!mongoose.connection.readyState) {
    mongoose
        .connect(uri)
        .then(() => console.log("Mongo conectado"))
        .catch((err) => {
            console.error("Mongo error:", err);
            if (process.env.VERCEL !== "1") process.exit(1);
        });
}

// ===== Local only: no levantar server en Vercel =====
if (process.env.VERCEL !== "1") {
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`API local en http://localhost:${port}`));
}

// 👇 Esto es lo importante para Vercel
export default app;
