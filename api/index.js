import 'dotenv/config'
import serverless from 'serverless-http'
import app from '../src/app.js'

const allowedOrigin = 'https://frontendusuario.vercel.app'

const handler = serverless(app)

export default async function vercelHandler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

    if (req.method === 'OPTIONS') {
        res.status(204).end()
        return
    }

    return handler(req, res)
}
