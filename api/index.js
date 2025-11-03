import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../src/app.js';
import serverless from 'serverless-http';

let conn;
async function connectOnce() {
    if (!conn) {
        conn = mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
    }
    await conn;
}

export default async function handler(req, res) {
    await connectOnce();
    const h = serverless(app);
    return h(req, res);
}
