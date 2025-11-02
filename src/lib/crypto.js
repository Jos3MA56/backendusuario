// src/lib/crypto.js
// Usamos bcrypt para hash de tokens (enlaces mágicos y refresh aleatorios)
import bcrypt from "bcryptjs";

/** Hashea un string (token raw) */
export async function hash(str) {
    return bcrypt.hash(str, 10);
}

/** Verifica string vs hash */
export async function verifyHash(str, hashed) {
    return bcrypt.compare(str, hashed);
}
