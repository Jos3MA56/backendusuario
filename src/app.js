import cors from 'cors';

function allowOrigin(origin) {
  if (!origin) return true; // Thunder/Postman
  try {
    const h = new URL(origin).hostname;
    // PRODUCCIÓN: tu dominio del front en Vercel
    if (h === 'frontendusuario.vercel.app') return true;
    // PREVIEWS de Vercel: si usas ramas (front-branch-user.vercel.app)
    if (h.endsWith('.vercel.app')) return true;
    // LOCAL
    if (h === 'localhost' || h === '127.0.0.1') return true;
  } catch (_) { }
  return false;
}

const corsOptions = {
  origin(origin, cb) {
    return allowOrigin(origin) ? cb(null, true) : cb(new Error('CORS bloqueado: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// MUY IMPORTANTE: responder los preflights
app.options('*', cors(corsOptions));
