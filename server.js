import 'dotenv/config'; // debe ir ANTES de cualquier import que lea process.env

import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";

import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });

const app = express();

app.use(cors({
    origin: [process.env.APP_ORIGIN, "http://localhost:5173"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);

app.get("/", (_req, res) => res.json({ ok: true, service: "auth-backend" }));
app.get("/health", (_, res) => res.status(200).send("ok"));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en ${PORT}`));
