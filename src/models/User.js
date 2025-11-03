// src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  telefono: {
    type: String,
    default: '',
    trim: true
  },
  edad: {
    type: Number,
    default: null,
    min: 1,
    max: 120
  },
  passwordHash: {
    type: String,
    select: false  // No incluir por defecto en queries
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Actualiza automáticamente createdAt y updatedAt
});

// Índice para búsquedas por email
userSchema.index({ correo: 1 });

// Método para obtener usuario sin contraseña
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);