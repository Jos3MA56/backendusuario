const intentos = {};

function checkLimit(key, maxIntentos, ventanaMs) {
  const now = Date.now();
  const data = intentos[key] || { count: 0, first: now };

  if (now - data.first > ventanaMs) {
    intentos[key] = { count: 1, first: now };
    return { allowed: true };
  }

  data.count += 1;
  intentos[key] = data;

  if (data.count > maxIntentos) {
    return { allowed: false, retryInMs: ventanaMs - (now - data.first) };
  }

  return { allowed: true };
}

export function loginLimiter(req, res, next) {
  const key = `login:${req.ip}`;
  const { allowed } = checkLimit(key, 5, 5 * 60 * 1000); 

  if (!allowed) {
    return res.status(429).json({
      error: "Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos."
    });
  }

  next();
}

export function magicLimiter(req, res, next) {
  const correo = (req.body?.correo || "").toLowerCase();
  const key = `magic:${correo}`;
  const { allowed } = checkLimit(key, 3, 15 * 60 * 1000);

  if (!allowed) {
    return res.status(429).json({
      error: "Has solicitado demasiados enlaces. Intenta más tarde."
    });
  }

  next();
}

export function resetLimiter(req, res, next) {
  const correo = (req.body?.correo || "").toLowerCase();
  const key = `reset:${correo}`;
  const { allowed } = checkLimit(key, 3, 30 * 60 * 1000);

  if (!allowed) {
    return res.status(429).json({
      error: "Has solicitado demasiados cambios de contraseña. Intenta más tarde."
    });
  }

  next();
}
