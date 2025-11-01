import express from "express";
import cors from "cors";

const app = express();

const allowedOrigins = [
    "https://frontuser.vercel.app",
    "http://localhost:5173",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.options("*", cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("✅ API funcionando correctamente");
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Faltan credenciales" });
    }

    if (email === "admin@demo.com" && password === "123456") {
        return res.json({ message: "Login exitoso", token: "fake-jwt-token" });
    } else {
        return res.status(401).json({ message: "Credenciales incorrectas" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
