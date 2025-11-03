import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";

const app = express();

// === CORS (ANTES de rutas) ===
app.use((req, res, next) => {
    res.header("Vary", "Origin");
    next();
});

const ALLOWED = ["https://frontendusuario.vercel.app"]; // sin "/" final

const corsMw = cors({
    origin(origin, cb) {
        if (!origin) return cb(null, true); // permite Postman, curl, etc.
        return ALLOWED.includes(origin) ? cb(null, true) : cb(new Error("CORS bloqueado: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

app.use(corsMw);
app.options("*", corsMw);

// Necesario para cookies SameSite:'none' + secure
app.set("trust proxy", 1);

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
