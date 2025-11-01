import express from "express";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import MagicLink from "../models/MagicLink.js";
import { signAccess } from "../lib/jwt.js";
import { hash, verifyHash } from "../lib/crypto.js";
import { transporter } from '../email/transporter.js';
// ya puedes usar transporter.sendMail(...)


const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { nombre, apPaterno, apMaterno, telefono, correo, edad, password } = req.body;

    if (!nombre || !apPaterno || !correo || !password)
      return res.status(400).json({ error: "Faltan datos requeridos" });

    const exists = await User.findOne({ correo });
    if (exists) return res.status(409).json({ error: "El correo ya está registrado" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombre, apPaterno, apMaterno, telefono, correo, edad, passwordHash
    });

    return res.status(201).json({ ok: true, userId: user._id });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    const user = await User.findOne({ correo, isActive: true });
    if (!user || !user.passwordHash) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const accessToken = signAccess({ sub: user._id.toString(), email: user.correo });

    const jti = uuidv4();
    const rawRefresh = uuidv4() + "." + uuidv4();
    const refreshHash = await hash(rawRefresh);
    const exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await RefreshToken.create({
      userId: user._id, jti, tokenHash: refreshHash, expiresAt: exp
    });

    res
      .cookie("refresh_token", rawRefresh, {
        httpOnly: true, secure: true, sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 30
      })
      .json({ accessToken });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const raw = req.cookies?.refresh_token || req.body?.refresh_token;
    if (!raw) return res.status(401).json({ error: "Falta refresh token" });

    const candidates = await RefreshToken.find({
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 }).limit(500);

    let row = null;
    for (const r of candidates) {
      if (await verifyHash(raw, r.tokenHash)) { row = r; break; }
    }
    if (!row) return res.status(401).json({ error: "Refresh inválido" });

    await RefreshToken.updateOne({ _id: row._id }, { $set: { revokedAt: new Date() } });

    const user = await User.findById(row.userId);
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const accessToken = signAccess({ sub: user._id.toString(), email: user.correo });

    const jti = uuidv4();
    const newRaw = uuidv4() + "." + uuidv4();
    const newHash = await hash(newRaw);
    const exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await RefreshToken.create({
      userId: user._id, jti, tokenHash: newHash, expiresAt: exp
    });

    res
      .cookie("refresh_token", newRaw, {
        httpOnly: true, secure: true, sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 30
      })
      .json({ accessToken });
  } catch (err) {
    console.error("refresh error:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const raw = req.cookies?.refresh_token || req.body?.refresh_token;
    if (raw) {
      const candidates = await RefreshToken.find({ revokedAt: null });
      for (const r of candidates) {
        if (await verifyHash(raw, r.tokenHash)) {
          await RefreshToken.updateOne({ _id: r._id }, { $set: { revokedAt: new Date() } });
          break;
        }
      }
    }
    res.clearCookie("refresh_token").json({ ok: true });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/magic-link", async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ error: "Falta correo" });

    const user = await User.findOne({ correo });
    if (!user || user.isActive === false) return res.json({ ok: true }); // no filtra info

    const raw = crypto.randomBytes(32).toString("hex");
    const tokenHash = await hash(raw);
    const expires = new Date(Date.now() + 1000 * 60 * 15);

    await MagicLink.create({
      userId: user._id, tokenHash, expiresAt: expires,
      ip: req.ip, userAgent: req.headers["user-agent"] || ""
    });

    const APP_ORIGIN = process.env.APP_ORIGIN;
    if (!APP_ORIGIN) {
      console.error("magic-link error: falta APP_ORIGIN");
      return res.status(500).json({ error: "Config APP_ORIGIN faltante" });
    }

    const url = `${APP_ORIGIN}/magic?token=${raw}&email=${encodeURIComponent(correo)}`;

    // tras guardar MagicLink y construir `url`
    transporter.sendMail({
      to: correo,
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      subject: "Tu enlace de acceso",
      html: `<p>Haz clic para entrar (expira en 15 min):</p>
         <p><a href="${url}">${url}</a></p>`
    }).catch(e => console.error("magic-link SMTP error:", e));

    return res.json({ ok: true }); // responde inmediato


    await Promise.race([
      send,
      new Promise((_, rej) => setTimeout(() => rej(new Error("SMTP_TIMEOUT")), 7000))
    ]);

    return res.json({ ok: true });
  } catch (err) {
    console.error("magic-link error:", err);
    const msg = String(err?.message || "");
    if (msg.includes("EAUTH")) return res.status(500).json({ error: "SMTP: credenciales inválidas" });
    if (msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) return res.status(500).json({ error: "SMTP: host/puerto incorrectos" });
    if (msg.includes("SMTP_TIMEOUT")) return res.status(500).json({ error: "SMTP: timeout" });
    return res.status(500).json({ error: "Error en el servidor" });
  }
});



router.post("/magic/verify", async (req, res) => {
  try {
    const { email, token, correo } = req.body;
    const mail = correo || email;
    if (!mail || !token) return res.status(400).json({ error: "Faltan datos" });

    const user = await User.findOne({ correo: mail, isActive: true });
    if (!user) return res.status(401).json({ error: "No autorizado" });

    const links = await MagicLink.find({
      userId: user._id,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 }).limit(20);

    let row = null;
    for (const r of links) {
      if (await verifyHash(token, r.tokenHash)) { row = r; break; }
    }
    if (!row) return res.status(401).json({ error: "Token inválido o expirado" });

    await MagicLink.updateOne({ _id: row._id }, { $set: { usedAt: new Date() } });

    const accessToken = signAccess({ sub: user._id.toString(), email: user.correo });

    const jti = uuidv4();
    const rawRefresh = uuidv4() + "." + uuidv4();
    const refreshHash = await hash(rawRefresh);
    const exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await RefreshToken.create({
      userId: user._id, jti, tokenHash: refreshHash, expiresAt: exp
    });

    res.cookie("refresh_token", rawRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: "none",   // ← dominios distintos (Vercel ↔ Render)
      maxAge: 1000 * 60 * 60 * 24 * 30
    }).json({ accessToken });

  } catch (err) {
    console.error("magic verify error:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
