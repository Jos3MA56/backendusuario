import mongoose from "mongoose";

const MagicLinkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

MagicLinkSchema.index({ userId: 1, expiresAt: -1 });

export default mongoose.model("MagicLink", MagicLinkSchema);
