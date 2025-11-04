import express from "express";
import { auth } from "../middlewares/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user.sub).select("_id nombre apPaterno apMaterno correo telefono edad createdAt");
    res.json({ user });
});

export default router;
