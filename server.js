import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.routes.js"; // asegúrate del path correcto

const app = express();

/* =========================
 * 1️⃣ Lista de orígenes permitidos
 * ========================= */
const ALLOWED_ORIGINS = [
    "http://localhost:5173",                // desarrollo local
    "https://frontendusuario.vercel.app",   // producción (tu frontend en Vercel)
];

/* =========================
 * 2️⃣ Middleware CORS avanzado
 * ========================= */
app.use((req, res, next) => {
    res.header("Vary", "Origin"); // ayuda con el caché de proxies
    next();
});

app.use(
    cors({
        origin(origin, cb) {
            // Permitir peticiones sin origen (ej: Postman, health checks)
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

/* =========================
 * 3️⃣ Responder solicitudes preflight (OPTIONS)
 * ========================= */
app.options("*", cors());

/* =========================
 * 4️⃣ Middlewares base
 * ========================= */
app.use(express.json());
app.use(cookieParser());

/* =========================
 * 5️⃣ Rutas
 * ========================= */
app.use("/auth", authRoutes);

/* =========================
 * 6️⃣ Endpoint de salud
 * ========================= */
app.get("/", (_, res) => res.json({ ok: true, message: "API OK" }));
app.get("/healthz", (_, res) => res.json({ ok: true, message: "healthy" }));

/* =========================
 * 7️⃣ Conexión a MongoDB y arranque
 * ========================= */
const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb+srv://<USUARIO>:<PASSWORD>@cluster0.mongodb.net/usuario?retryWrites=true&w=majority";

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
