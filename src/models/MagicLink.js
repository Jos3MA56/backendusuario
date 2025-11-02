// src/models/MagicLink.js
import mongoose from "mongoose";

const magicLinkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true }, // token en hash (bcrypt)
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

magicLinkSchema.index({ userId: 1, expiresAt: 1 });
magicLinkSchema.index({ usedAt: 1 });

export default mongoose.model("MagicLink", magicLinkSchema);
