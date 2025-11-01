import bcrypt from "bcryptjs";

export async function hash(raw) {
    return bcrypt.hash(raw, 10);
}

export async function verifyHash(raw, hashed) {
    return bcrypt.compare(raw, hashed);
}
