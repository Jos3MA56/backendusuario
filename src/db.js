// src/db.js
import mongoose from "mongoose";

const uri = process.env.MONGO_URI;
if (!uri) {
    console.error("❌ Falta MONGO_URI en variables de entorno");
    throw new Error("Missing MONGO_URI");
}

/**
 * Evita abrir nuevas conexiones en cada invocación serverless.
 * Guarda el estado en globalThis.
 */
if (!globalThis._mongoose) {
    globalThis._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
    if (globalThis._mongoose.conn) return globalThis._mongoose.conn;
    if (!globalThis._mongoose.promise) {
        globalThis._mongoose.promise = mongoose.connect(uri, {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 10000,
        }).then((m) => m);
    }
    globalThis._mongoose.conn = await globalThis._mongoose.promise;
    return globalThis._mongoose.conn;
}

// Conecta de inmediato al importar (puedes hacerlo lazy si prefieres)
await dbConnect();
