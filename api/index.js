import 'dotenv/config';
import mongoose from 'mongoose';
import serverless from 'serverless-http';
import app from '../src/app.js';

let conn;
async function connectOnce() {
    if (!conn) {
        conn = mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
    }
    await conn;
}

export default async function handler(req, res) {
    try {
        await connectOnce();
        const h = serverless(app);
        return h(req, res);
    } catch (e) {
        console.error('Serverless error:', e);
        res.statusCode = 500;
        res.end('Internal error');
    }
}
