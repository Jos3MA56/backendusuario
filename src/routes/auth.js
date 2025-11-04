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
    // ✅ Log para debug - VER QUÉ LLEGA
    console.log("📦 Body recibido:", req.body);

    // ✅ Recibe "password" desde el frontend
    let { correo, password, nombre, apPaterno, apMaterno, telefono, edad, isActive } = req.body;

    // ✅ Validación ANTES de normalizar
    if (!correo || !password) {
      const missing = [];
      if (!correo) missing.push('correo');
      if (!password) missing.push('password');
      return res.status(400).json({
        error: "Faltan datos requeridos",
        campos_faltantes: missing,
        recibido: { correo, password: password ? '***' : undefined }
      });
    }

    // ✅ Normalizar el correo DESPUÉS de validar
    correo = correo.toLowerCase().trim();

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
    console.log('🔐 Intento de login:', { correo: req.body?.correo, hasPassword: !!req.body?.password });

    // ✅ Recibe "password" (contraseña en texto plano) desde el frontend
    let { correo, password } = req.body || {};

    // ✅ Normalizar el correo (lowercase y trim)
    if (correo) {
      correo = correo.toLowerCase().trim();
    }

    if (!correo || !password) {
      console.log('❌ Faltan credenciales:', { correo: !!correo, password: !!password });
      return res.status(400).json({ error: 'Faltan credenciales' });
    }

    const user = await User.findOne({ correo });
    console.log('👤 Usuario encontrado:', { exists: !!user, hasHash: !!user?.passwordHash });

    if (!user || !user.passwordHash) {
      console.log('❌ Usuario no existe o no tiene passwordHash');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // ✅ Comparas la contraseña recibida con el hash guardado
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('🔑 Comparación de password:', ok ? '✅ CORRECTA' : '❌ INCORRECTA');

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

// ============================================
// 🔍 RUTAS DE DEBUG - ELIMINAR EN PRODUCCIÓN
// ============================================

// Ver todos los usuarios (lista básica)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('correo nombre createdAt passwordHash').limit(10);
    res.json({
      total: users.length,
      users: users.map(u => ({
        id: u._id,
        correo: u.correo,
        nombre: u.nombre,
        hasPasswordHash: !!u.passwordHash,
        passwordHashLength: u.passwordHash?.length,
        createdAt: u.createdAt
      }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Buscar un usuario específico
router.post('/debug/find-user', async (req, res) => {
  try {
    const { correo } = req.body;
    console.log('🔍 Buscando usuario:', correo);

    const user = await User.findOne({ correo });
    console.log('📊 Resultado:', user ? 'ENCONTRADO' : 'NO ENCONTRADO');

    if (user) {
      res.json({
        found: true,
        user: {
          id: user._id,
          correo: user.correo,
          correoLength: user.correo?.length,
          correoBytes: Buffer.from(user.correo || '').toString('hex'),
          nombre: user.nombre,
          hasPasswordHash: !!user.passwordHash,
          passwordHashLength: user.passwordHash?.length,
          passwordHashStart: user.passwordHash?.substring(0, 10)
        }
      });
    } else {
      // Buscar usuarios similares
      const similar = await User.find({
        correo: { $regex: correo.split('@')[0], $options: 'i' }
      }).limit(5);

      res.json({
        found: false,
        searched: correo,
        totalUsers: await User.countDocuments({}),
        similarUsers: similar.map(u => u.correo)
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});