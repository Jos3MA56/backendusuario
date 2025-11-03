// src/models/RefreshToken.js
import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jti: {
    type: String,
    required: true,
    unique: true,
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
  revokedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });
refreshTokenSchema.index({ expiresAt: 1, revokedAt: 1 });
refreshTokenSchema.index({ createdAt: -1 });

// Auto-eliminar tokens expirados después de 30 días
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('RefreshToken', refreshTokenSchema);