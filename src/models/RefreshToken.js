// src/models/RefreshToken.js
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jti: { type: String, required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Para búsquedas y limpieza automática
refreshTokenSchema.index({ userId: 1, expiresAt: 1 });
refreshTokenSchema.index({ revokedAt: 1 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
