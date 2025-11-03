// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js"; // si lo usas

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.APP_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);

// Rutas
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes); // si aplica

// Health
app.get("/healthz", (_, res) => res.send("ok"));

export default app;
