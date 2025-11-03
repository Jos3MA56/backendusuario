// src/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import User from "../models/User.js";
import MagicLink from "../models/MagicLink.js";
import RefreshToken from "../models/RefreshToken.js";

import { signAccess, verifyAccess } from "../lib/jwt.js";
import { hash, verifyHash } from "../lib/crypto.js";
import { sendMagicLinkEmail } from "../lib/email.js";

const router = Router();

const MAGIC_TTL_MS = 1000 * 60 * 15;                 // 15 min
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30;     // 30 días

// Cookies cross-site para refresh token
const refreshCookieOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: REFRESH_TTL_MS,
  path: "/",
});

// Origen del front SIN "/" final
const APP_ORIGIN = (process.env.APP_ORIGIN || "https://frontendusuario.vercel.app").replace(/\/$/, "");

// --- middleware access token (Bearer) ---
function authenticateAccess(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Falta access token" });
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

/* ============ REGISTER ============ */
router.post('/register', async (req, res) => {
  try {
    console.log('📝 POST /register - Body recibido:', req.body);
    console.log('📝 Headers:', req.headers);

    const { nombre, apellido, email, telefono, edad, password } = req.body;

    // Validaciones
    if (!nombre || !apellido || !email || !password) {
      console.log('❌ Faltan campos obligatorios');
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        received: { nombre, apellido, email, telefono, edad }
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email inválido:', email);
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      console.log('❌ Contraseña muy corta');
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ correo: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ Usuario ya existe:', email);
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hash de la contraseña
    console.log('🔒 Hasheando contraseña...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear el usuario
    console.log('💾 Creando usuario en BD...');
    const newUser = await User.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: email.toLowerCase().trim(),
      telefono: telefono || '',
      edad: edad || null,
      passwordHash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Usuario creado exitosamente:', newUser._id);

    // Generar tokens
    const accessToken = signAccess({
      sub: newUser._id.toString(),
      email: newUser.correo
    });

    // Crear refresh token
    const jti = uuidv4();
    const rawRefresh = `${uuidv4()}.${uuidv4()}`;
    const refreshHash = await hash(rawRefresh);
    const exp = new Date(Date.now() + REFRESH_TTL_MS);

    await RefreshToken.create({
      userId: newUser._id,
      jti,
      tokenHash: refreshHash,
      expiresAt: exp,
      revokedAt: null
    });

    console.log('🔑 Tokens generados');

    // Setear cookie de refresh
    res.cookie("refresh_token", rawRefresh, refreshCookieOpts());

    // Responder con los datos del usuario (sin el hash de contraseña)
    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      accessToken,
      user: {
        id: newUser._id,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.correo,
        telefono: newUser.telefono,
        edad: newUser.edad,
      }
    });

  } catch (error) {
    console.error('❌ Error en /register:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Error al registrar usuario',
      message: error.message
    });
  }
});

/* ============ LOGIN (password) ============ */
router.post("/login", async (req, res) => {
  try {
    console.log('📝 POST /login');
    const { correo, password } = req.body;
    if (!correo || !password) return res.status(400).json({ error: "Faltan datos" });

    const user = await User.findOne({ correo: correo.toLowerCase(), isActive: true });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    if (!user.passwordHash) {
      return res.status(409).json({ error: "Cuenta sin contraseña. Usa enlace mágico o establece una." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const accessToken = signAccess({ sub: user._id.toString(), email: user.correo });

    // crear refresh rotativo
    const jti = uuidv4();
    const rawRefresh = `${uuidv4()}.${uuidv4()}`;
    const refreshHash = await hash(rawRefresh);
    const exp = new Date(Date.now() + REFRESH_TTL_MS);

    await RefreshToken.create({ userId: user._id, jti, tokenHash: refreshHash, expiresAt: exp, revokedAt: null });

    // Setear cookie de refresh
    res.cookie("refresh_token", rawRefresh, refreshCookieOpts());

    console.log('✅ Login exitoso:', user.correo);
    return res.json({ accessToken });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ============ ENVIAR ENLACE MÁGICO ============ */
router.post("/magic-link", async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ error: "Falta correo" });

    let user = await User.findOne({ correo: correo.toLowerCase() });
    if (!user) {
      user = await User.create({
        correo: correo.toLowerCase(),
        nombre: correo.split("@")[0],
        apellido: '',
        isActive: true
      });
    }
    if (user.isActive === false) return res.json({ ok: true });

    const raw = uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
    const tokenHash = await hash(raw);
    const expiresAt = new Date(Date.now() + MAGIC_TTL_MS);

    await MagicLink.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      usedAt: null,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });

    const url = `${APP_ORIGIN}/magic?token=${raw}&email=${encodeURIComponent(correo)}`;
    await sendMagicLinkEmail(correo, url);

    res.json({ ok: true, mensaje: "Enlace enviado" });
  } catch (err) {
    console.error("magic-link error:", err);
    res.status(500).json({ error: "Error al enviar enlace mágico" });
  }
});

/* ============ VERIFICAR ENLACE MÁGICO ============ */
router.post("/magic/verify", async (req, res) => {
  try {
    const { token, email, correo } = req.body;
    const mail = correo || email;
    if (!mail || !token) return res.status(400).json({ error: "Faltan datos" });

    const user = await User.findOne({ correo: mail.toLowerCase(), isActive: true });
    if (!user) return res.status(401).json({ error: "No autorizado" });

    const links = await MagicLink.find({
      userId: user._id,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }).limit(20);

    let row = null;
    for (const r of links) {
      if (await verifyHash(token, r.tokenHash)) { row = r; break; }
    }
    if (!row) return res.status(401).json({ error: "Token inválido o expirado" });

    await MagicLink.updateOne({ _id: row._id }, { $set: { usedAt: new Date() } });

    const accessToken = signAccess({ sub: user._id.toString(), email: user.correo });

    // refresh rotativo
    const jti = uuidv4();
    const rawRefresh = `${uuidv4()}.${uuidv4()}`;
    const refreshHash = await hash(rawRefresh);
    const exp = new Date(Date.now() + REFRESH_TTL_MS);

    await RefreshToken.create({ userId: user._id, jti, tokenHash: refreshHash, expiresAt: exp, revokedAt: null });

    // cookie de refresh
    res.cookie("refresh_token", rawRefresh, refreshCookieOpts());

    return res.json({ accessToken });
  } catch (err) {
    console.error("magic verify error:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ============ REFRESH ============ */
router.post("/refresh", async (req, res) => {
  try {
    const raw = req.cookies?.refresh_token || req.body?.refresh_token;
    if (!raw) return res.status(401).json({ error: "Falta refresh token" });

    const candidates = await RefreshToken.find({
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }).limit(500);

    let row = null;
    for (const r of candidates) {
      if (await verifyHash(raw, r.tokenHash)) { row = r; break; }
    }
    if (!row) return res.status(401).json({ error: "Refresh inválido" });

    // revocar viejo
    await RefreshToken.updateOne({ _id: row._id }, { $set: { revokedAt: new Date() } });

    const user = await User.findById(row.userId);
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const accessToken = signAccess({ sub: user._id.toString(), email: user.correo });

    // emitir nuevo refresh
    const jti = uuidv4();
    const newRaw = `${uuidv4()}.${uuidv4()}`;
    const newHash = await hash(newRaw);
    const exp = new Date(Date.now() + REFRESH_TTL_MS);

    await RefreshToken.create({ userId: user._id, jti, tokenHash: newHash, expiresAt: exp, revokedAt: null });

    // nueva cookie
    res.cookie("refresh_token", newRaw, refreshCookieOpts());

    return res.json({ accessToken });
  } catch (err) {
    console.error("refresh error:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ============ LOGOUT ============ */
router.post("/logout", async (req, res) => {
  try {
    const raw = req.cookies?.refresh_token || req.body?.refresh_token;
    if (raw) {
      const list = await RefreshToken.find({ revokedAt: null }).sort({ createdAt: -1 }).limit(500);
      for (const r of list) {
        if (await verifyHash(raw, r.tokenHash)) {
          await RefreshToken.updateOne({ _id: r._id }, { $set: { revokedAt: new Date() } });
          break;
        }
      }
    }
    // borrar cookie
    res.clearCookie("refresh_token", { ...refreshCookieOpts(), maxAge: 0 });
    return res.json({ ok: true });
  } catch (err) {
    console.error("logout error:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ============ ME (perfil por token de acceso) ============ */
router.get("/me", authenticateAccess, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;