// api/index.js
import "dotenv/config";
import mongoose from "mongoose";
import app from "../src/app.js";
import serverless from "serverless-http";

let conn;
async function connectOnce() {
    if (!conn) {
        conn = mongoose.connect(process.env.MONGO_URI, {});
    }
    await conn;
}

export default async function handler(req, res) {
    res.status(200).json({ ok: true, ts: Date.now() });
}