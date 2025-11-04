import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
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
router.post("/register", async (req, res) => {
  try {
    // ✅ Recibe "password" desde el frontend
    const { correo, nombre, apPaterno, apMaterno, telefono, edad, password, isActive } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const exists = await User.findOne({ correo });
    if (exists) return res.status(409).json({ error: "El usuario ya existe" });

    // ✅ Hasheas la contraseña aquí
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      correo,
      passwordHash, // ✅ Guardas el hash
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
    // ✅ Recibe "password" (contraseña en texto plano) desde el frontend
    const { correo, password } = req.body || {};

    if (!correo || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }

    const user = await User.findOne({ correo });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // ✅ Comparas la contraseña recibida con el hash guardado
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signAccess({ sub: user.id, correo: user.correo });
    return res.json({
      ok: true,
      token,
      user: { id: user.id, correo: user.correo, nombre: user.nombre }
    });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo iniciar sesión', detail: e?.message });
  }
});

router.post("/magic-link", async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: "Falta correo" });

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const link = `${process.env.APP_ORIGIN}/magic-callback?token=${token}`;

    // Busca o crea el usuario
    let user = await User.findOne({ correo });
    if (!user) {
      user = await User.create({ correo, passwordHash: null });
    }

    await MagicLink.create({
      tokenHash,
      user: user._id,
      expiresAt: minutesFromNow(15)
    });

    const sent = await sendMagicLinkEmail(correo, link);

    return res.json({ ok: true, sent, link: sent ? undefined : link });
  } catch (error) {
    console.error("Error generando enlace mágico:", error);
    res.status(500).json({ error: "No se pudo generar el enlace" });
  }
});

// === Verificar enlace mágico ===
router.post('/magic-verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'Falta token' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ml = await MagicLink.findOne({ tokenHash }).populate('user');

    if (!ml || ml.used) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (ml.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Token expirado' });
    }

    ml.used = true;
    await ml.save();

    const user = ml.user;
    const jwtToken = signAccess({ sub: user.id, correo: user.correo });

    return res.json({
      ok: true,
      token: jwtToken,
      user: { id: user.id, correo: user.correo }
    });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo verificar el enlace', detail: e?.message });
  }
});

export default router;