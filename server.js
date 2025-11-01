import cors from "cors";

const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://frontendusuario.vercel.app",   // 👈 tu front en Vercel (sin slash final)
];

app.use((req, res, next) => {
    // ayuda al cache de CORS por CDN/proxies
    res.header("Vary", "Origin");
    next();
});

app.use(
    cors({
        origin(origin, cb) {
            // permitir herramientas como curl / salud de Render (sin Origin)
            if (!origin) return cb(null, true);
            return ALLOWED_ORIGINS.includes(origin)
                ? cb(null, true)
                : cb(new Error("Not allowed by CORS: " + origin));
        },
        credentials: true, // por si usas cookies de refresh en otros endpoints
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["set-cookie"],
    })
);

// Responder preflight explícitamente (por si algún middleware corta OPTIONS)
app.options("*", cors());
