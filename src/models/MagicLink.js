import mongoose from "mongoose";

const magicLinkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    ip: String,
    userAgent: String
  },
  { timestamps: true }
);

export default mongoose.model("MagicLink", magicLinkSchema);
