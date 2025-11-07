import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";

const app = express();
app.set("trust proxy", 1);

// Conexión a Mongo
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI no está definido en las variables de entorno");
    process.exit(1);
}

mongoose.set("strictQuery", true);
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB conectado"))
    .catch(err => {
        console.error("❌ Error conectando a MongoDB:", err);
        process.exit(1);
    });

app.use(cors({
    origin(origin, cb) {
        return (!origin || ["https://frontendusuario.vercel.app", "http://localhost:5173"].includes(origin))
            ? cb(null, true)
            : cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => res.send("✅ API funcionando correctamente"));
app.use("/auth", authRouter);
app.use("/profile", profileRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API en puerto ${PORT}`));