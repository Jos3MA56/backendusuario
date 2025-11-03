// src/models/MagicLink.js
import mongoose from 'mongoose';

const magicLinkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  usedAt: {
    type: Date,
    default: null
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
magicLinkSchema.index({ userId: 1, usedAt: 1, expiresAt: 1 });
magicLinkSchema.index({ createdAt: -1 });

// Auto-eliminar links expirados después de 7 días
magicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model('MagicLink', magicLinkSchema);