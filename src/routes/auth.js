import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import MagicLink from '../models/MagicLink.js';
import { signAccess } from '../lib/jwt.js';
import { getTransporter } from '../lib/mailer.js';

const router = express.Router();

function minutesFromNow(mins) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d;
}

// === Registro ===
// auth.js  → dentro de router.post('/register', ...)
router.post("/register", async (req, res) => {
  try {
    const { correo, passwordHash, nombre, apPaterno, apMaterno, telefono, edad, isActive } = req.body;

    if (!correo || !passwordHash) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const exists = await User.findOne({ correo });
    if (exists) return res.status(409).json({ error: "El usuario ya existe" });

    const hashed = await bcrypt.hash(passwordHash, 10);

    const user = await User.create({
      correo,
      passwordHash: hashed,
      nombre,
      apPaterno,
      apMaterno,
      telefono,
      edad,
      isActive
    });

    res.status(201).json({ ok: true, user: { id: user._id, correo: user.correo } });
  } catch (e) {
    res.status(500).json({ error: "No se pudo registrar", detail: e.message });
  }
});


// === Login (JWT) ===
router.post('/login', async (req, res) => {
  try {
    const { email, passwordHash } = req.body || {};
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(passwordHash || '', user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signAccess({ sub: user.id, email: user.email });
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, nombre: user.nombre } });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo iniciar sesión', detail: e?.message });
  }
});

// === Solicitar enlace mágico ===
router.post('/magic-link', async (req, res) => {
  try {
    // Acepta { email } o { correo } y usa el campo "correo" del modelo
    const correoBody = req.body.email || req.body.correo;
    if (!correoBody) return res.status(400).json({ error: 'Falta email/correo' });

    // 1) Buscar o crear usuario passwordless
    let user = await User.findOne({ correo: correoBody });
    if (!user) user = await User.create({ correo: correoBody });

    // 2) Crear token de un solo uso (hash en DB + TTL)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const ttlMin = Number(process.env.MAGIC_TTL_MINUTES || 15);
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

    await MagicLink.create({ user: user._id, tokenHash, expiresAt, used: false });

    // 3) Construir link para el FRONT
    const appOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';
    const link = `${appOrigin}/magic-callback?token=${rawToken}`;

    // 4) Enviar email si hay SMTP; si falla, devolvemos link igual (fallback)
    const tx = getTransporter(); // null si no configuraste SMTP
    if (tx) {
      try {
        await tx.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: correoBody,
          subject: 'Tu enlace de acceso',
          html: `<p>Entra con este enlace (expira en ${ttlMin} min):</p><p><a href="${link}">${link}</a></p>`
        });
        return res.json({ ok: true, sent: true });
      } catch (e) {
        console.warn('SMTP error:', e?.message);
        // ⚠️ Fallback: no cortamos el flujo, devolvemos el link para pruebas
        return res.json({ ok: true, sent: false, link, warn: e?.message || 'SMTP failed' });
      }
    }

    // Sin SMTP configurado → modo dev
    return res.json({ ok: true, sent: false, link });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo generar el enlace', detail: e?.message });
  }
});

// === Verificar enlace mágico (consumir token de un solo uso) ===
router.post('/magic-verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'Falta token' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ml = await MagicLink.findOne({ tokenHash }).populate('user');
    if (!ml || ml.used) return res.status(401).json({ error: 'Token inválido' });
    if (ml.expiresAt < new Date()) return res.status(401).json({ error: 'Token expirado' });

    ml.used = true;
    await ml.save();

    const user = ml.user;
    const jwtToken = jwt.sign({ sub: user.id, correo: user.correo }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.ACCESS_TTL || '60m'
    });

    return res.json({ ok: true, token: jwtToken, user: { id: user.id, correo: user.correo } });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo verificar el enlace', detail: e?.message });
  }
});

export default router;
