import express from "express";
import cors from "cors";

const app = express();

// 🔴 PON AQUÍ tus dominios reales
const allowedOrigins = [
    "http://localhost:5173",
    "https://frontusuario.vercel.app"
];

app.use((req, res, next) => {
    // Si quieres ver qué origin llega
    // console.log("Origin:", req.headers.origin);
    next();
});

app.use(cors({
    origin: (origin, cb) => {
        // permite Postman/Thunder (sin origin) y tus dominios
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error("CORS blocked"));
    },
    credentials: true, // si usas cookies/sesión
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// IMPORTANTÍSIMO: responder preflight ANTES de auth/routers
app.options("*", cors());

// … tus otros middlewares
app.use(express.json());

// … tus rutas
// app.use("/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`API on ${PORT}`));
