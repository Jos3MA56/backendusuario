import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';

const app = express();

// CORS: incluye el dominio del frontend en Vercel y localhost
const allowed = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (!allowed.length) return cb(null, true);
    return allowed.includes(origin) ? cb(null, true) : cb(new Error('CORS bloqueado: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);

app.get('/', (_req, res) => res.json({ ok: true, service: 'auth-backend' }));

export default app;
