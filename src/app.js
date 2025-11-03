import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js'; // tus rutas

const app = express();

// CORS: incluye tus dominios reales
const allowed = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);         // Thunder/Postman
    if (!allowed.length) return cb(null, true); // permitir si vacío
    return allowed.includes(origin) ? cb(null, true) : cb(new Error('CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// rutas
app.use('/auth', authRouter);

// health
app.get('/', (_req, res) => res.json({ ok: true, service: 'auth-backend-vercel' }));

export default app;
