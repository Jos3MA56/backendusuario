// models/MagicLink.js
import mongoose from 'mongoose';

const magicLinkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  tokenHash: { type: String, required: true, index: true },
  // ⚠️ NO pongas index:true aquí
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

// ✅ Deja solo este índice TTL
magicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('MagicLink', magicLinkSchema);
