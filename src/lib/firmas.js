// src/lib/firmas.js
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysDir = path.resolve(__dirname, "../../firma-keys");
const privateKey = fs.readFileSync(path.join(keysDir, "firma.key"), "utf8");
const publicKey  = fs.readFileSync(path.join(keysDir, "firma.pub"), "utf8");

export function firmarMensaje(mensaje) {
  const firma = crypto.sign("sha256", Buffer.from(mensaje, "utf8"), privateKey);
  return firma.toString("base64");
}

export function verificarMensaje(mensaje, firmaBase64) {
  const firmaBuffer = Buffer.from(firmaBase64, "base64");
  return crypto.verify(
    "sha256",
    Buffer.from(mensaje, "utf8"),
    publicKey,
    firmaBuffer
  );
}
