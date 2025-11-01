import bcrypt from "bcryptjs";
export const hash = (val) => bcrypt.hash(val, 10);
export const verifyHash = (val, hashed) => bcrypt.compare(val, hashed);
