import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import magicAuthRouter from "./src/routes/auth.js";

const app = express();

// CORS: autoriza al front y habilita credenciales (cookies)
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ORIGIN, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/auth", magicAuthRouter);

// Salud
app.get("/health", (_, res) => res.json({ ok: true }));

// DB + listen
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://20230087:4sk1n9666@cluster0.51r6dvm.mongodb.net/usuario?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`✅ API corriendo en http://localhost:${port}`);
    });
}).catch(err => {
    console.error("❌ Error conectando a Mongo:", err);
    process.exit(1);
});
