// src/routes/profile.js
import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// GET /profile  → requiere Bearer token
router.get("/", requireAuth, async (req, res) => {
    const user = await User.findById(req.user.sub)
        .select("nombre apPaterno apMaterno correo telefono edad createdAt");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ user });
});

export default router;
