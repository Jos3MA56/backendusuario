// src/lib/firmas.js
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta a las llaves
const keysDir = path.resolve(__dirname, "../../firma-keys");
const privateKeyPath = path.join(keysDir, "firma.key");
const publicKeyPath = path.join(keysDir, "firma.pub");

// Cargar llaves en memoria
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

// Firma un mensaje (string) y regresa firma en base64
export function firmarMensaje(mensaje) {
    const firma = crypto.sign(
        "sha256",
        Buffer.from(mensaje, "utf8"),
        privateKey
    );
    return firma.toString("base64");
}

// Verifica un mensaje y su firma (base64). Regresa true/false
export function verificarMensaje(mensaje, firmaBase64) {
    const firmaBuffer = Buffer.from(firmaBase64, "base64");

    return crypto.verify(
        "sha256",
        Buffer.from(mensaje, "utf8"),
        publicKey,
        firmaBuffer
    );
}
