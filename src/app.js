import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";

const app = express();

// CORS global (incluye preflight)
const ALLOWED = [
  "http://localhost:5173",
  "https://frontendusuario.vercel.app", // tu front en Vercel
];
app.use((req, res, next) => {
  const origin = ALLOWED.includes(req.headers.origin) ? req.headers.origin : ALLOWED[0];
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());
app.use(cookieParser());

// rutas
app.use("/auth", authRouter);

export default app; // << sin app.listen
