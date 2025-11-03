// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true },
    apPaterno: { type: String, trim: true },
    apMaterno: { type: String, trim: true },
    telefono: { type: String, trim: true },
    edad: { type: Number },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
