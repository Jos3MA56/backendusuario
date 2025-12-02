// src/routes/firma.js
import express from "express";
import { firmarMensaje, verificarMensaje } from "../lib/firmas.js";

const router = express.Router();

// POST /firma/firmar
router.post("/firmar", (req, res) => {
  const { mensaje } = req.body || {};

  if (!mensaje || typeof mensaje !== "string") {
    return res.status(400).json({ error: "Falta 'mensaje' de tipo string" });
  }

  try {
    const firma = firmarMensaje(mensaje);
    return res.json({ mensaje, firma });
  } catch (err) {
    console.error("Error al firmar:", err);
    return res.status(500).json({ error: "No se pudo firmar el mensaje" });
  }
});

// POST /firma/verificar
router.post("/verificar", (req, res) => {
  const { mensaje, firma } = req.body || {};

  if (!mensaje || !firma) {
    return res.status(400).json({ error: "Faltan 'mensaje' y/o 'firma'" });
  }

  try {
    const valido = verificarMensaje(mensaje, firma);
    return res.json({ valido });
  } catch (err) {
    console.error("Error al verificar:", err);
    return res.status(500).json({ error: "No se pudo verificar la firma" });
  }
});

export default router;
