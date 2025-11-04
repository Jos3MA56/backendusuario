import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import MagicLink from '../models/MagicLink.js';
import { signAccess } from '../lib/jwt.js';
import { sendMagicLinkEmail } from "../email/sendMail.js";

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

router.post("/magic-link", async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: "Falta correo" });

  try {
    // Aquí generas el link
    const token = crypto.randomBytes(32).toString("hex");
    const link = `${process.env.APP_ORIGIN}/magic-callback?token=${token}`;

    // Guarda el token temporal en MongoDB (ya lo haces)
    // await MagicLink.create({ token, correo, expiresAt: ... })

    // Envía con Resend
    const sent = await sendMagicLinkEmail(correo, link);

    return res.json({ ok: true, sent, link: sent ? undefined : link });
  } catch (error) {
    console.error("Error generando enlace mágico:", error);
    res.status(500).json({ error: "No se pudo generar el enlace" });
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
