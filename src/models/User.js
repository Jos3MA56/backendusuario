import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apPaterno: { type: String, required: true },
    apMaterno: { type: String },
    telefono: { type: String },
    correo: { type: String, required: true, unique: true, index: true },
    fechaNacimiento: { type: Date },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
