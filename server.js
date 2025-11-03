// server.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";

const app = express();

// CORS a prueba de preflight
app.set("trust proxy", 1);

app.use((req, res, next) => {
    // Preflight: SIEMPRE responde con los headers correctos y 204
    if (req.method === "OPTIONS") {
        const acrh = req.headers["access-control-request-headers"] || "Content-Type, Authorization, Accept";
        const origin = req.headers.origin || "*";   // para preflight no vas a mandar cookies, así que * es válido
        res.set({
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": acrh,
            "Vary": "Origin"
        });
        return res.sendStatus(204);
    }

    // Requests normales: si necesitas cookies, aquí sí eco del origin + credentials
    const origin = req.headers.origin;
    if (origin) {
        res.set("Access-Control-Allow-Origin", origin);
        res.set("Access-Control-Allow-Credentials", "true");
        res.set("Vary", "Origin");
    }
    next();
});


app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.get("/health", (_, res) => res.json({ ok: true }));

// Conexión Mongo una vez
if (!mongoose.connection.readyState) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("Mongo conectado"))
        .catch((err) => {
            console.error("Mongo error:", err);
            if (process.env.VERCEL !== "1") process.exit(1);
        });
}

if (process.env.VERCEL !== "1") app.listen(process.env.PORT || 8080);

export default app;
