import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'

const app = express()

// ✅ CORS con fallback por si no existe la variable de entorno
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://frontendusuario.vercel.app'
]

const allowed = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : defaultOrigins

console.log('✅ CORS permitidos:', allowed)

const corsOpts = {
  origin(origin, cb) {
    // Permite requests sin origin (Postman, curl, apps móviles)
    if (!origin) return cb(null, true)

    // Verifica si el origin está en la lista permitida
    if (allowed.includes(origin)) {
      return cb(null, true)
    }

    // También permite subdominos de vercel (preview deployments)
    if (origin.includes('vercel.app')) {
      return cb(null, true)
    }

    console.warn('⚠️ CORS bloqueado:', origin)
    cb(new Error('CORS bloqueado: ' + origin))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOpts))
app.options('*', cors(corsOpts)) // preflight

// ✅ Parser de JSON (asegúrate que esté después de CORS)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ✅ Log de requests (útil para debug)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`,
    req.method === 'POST' ? '📦 Body:' : '',
    req.method === 'POST' ? JSON.stringify(req.body) : ''
  )
  next()
})

// ✅ Rutas
app.use('/auth', authRouter)

// ✅ Health check mejorado
app.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API OK',
    timestamp: new Date().toISOString(),
    cors_origins: allowed
  })
})

// ✅ Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.path })
})

// ✅ Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  })
})

export default app