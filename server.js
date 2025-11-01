// server.js (ESM)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
    "https://frontendusuario.vercel.app",
    "http://localhost:5173",
];

app.use(
    cors({
        // ⬇️ AQUÍ estaba el error. Debe ser una función, no una arrow mal colocada.
        origin(origin, cb) {
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => res.send("✅ API funcionando correctamente"));

app.use("/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en ${PORT}`));
