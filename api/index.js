import 'dotenv/config'
import serverless from 'serverless-http'
import app from '../src/app.js'   // tu Express
// Si usas ESM y te falla serverless-http, instala: npm i serverless-http

const allowedOrigin = 'https://frontendusuario.vercel.app' // tu front

const handler = serverless(app)

export default async function vercelHandler(req, res) {
    // CORS headers para TODAS las respuestas de la función
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

    // Preflight: Vercel NO siempre deja que Express lo procese, respóndelo aquí
    if (req.method === 'OPTIONS') {
        res.status(204).end()
        return
    }

    // Deja que Express maneje la request real
    return handler(req, res)
}
