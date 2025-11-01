import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import magicAuthRouter from "./src/routes/auth.js";

const app = express();

// 🧩 1️⃣ Lista de orígenes permitidos
const ALLOWED_ORIGINS = [
    "http://localhost:5173",                    // para desarrollo local
    "https://frontendusuario.vercel.app",       // 👈 tu frontend en Vercel (producción)
];

// 🧠 2️⃣ Middleware CORS avanzado
app.use((req, res, next) => {
    res.header("Vary", "Origin"); // ayuda al cache por proxies
    next();
});

app.use(
    cors({
        origin(origin, cb) {
            // Permitir peticiones sin origen (como de Postman o Render Health Check)
            if (!origin) return cb(null, true);
            if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
            return cb(new Error("Bloqueado por CORS: " + origin));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["set-cookie"],
    })
);

// 🧩 3️⃣ Responder solicitudes preflight (OPTIONS)
app.options("*", cors());

// 🧩 4️⃣ Middleware base
app.use(express.json());
app.use(cookieParser());

// 🧩 5️⃣ Rutas
app.use("/auth", magicAuthRouter);

// 🧩 6️⃣ Endpoint de salud
app.get("/health", (_, res) => res.json({ ok: true }));

// 🧩 7️⃣ Conexión a la base de datos y arranque del servidor
const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb+srv://20230087:4sk1n9666@cluster0.51r6dvm.mongodb.net/usuario?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(MONGO_URI)
    .then(() => {
        const port = process.env.PORT || 8080;
        app.listen(port, () => {
            console.log(`✅ API corriendo en http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("❌ Error conectando a Mongo:", err);
        process.exit(1);
    });
