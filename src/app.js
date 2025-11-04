import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'

const app = express()

// CORS: agrega tu dominio de front y local
const allowed = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean)

const corsOpts = {
  origin(origin, cb) {
    if (!origin) return cb(null, true)
    if (!allowed.length || allowed.includes(origin)) return cb(null, true)
    cb(new Error('CORS bloqueado: ' + origin))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOpts))
app.options('*', cors(corsOpts)) // ¡preflight!

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.get('/', (_req, res) => res.status(200).send('API OK')) // health

export default app
