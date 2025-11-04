import mongoose from 'mongoose'
import app from './src/app.js'

const PORT = process.env.PORT || 4000
const MONGO = process.env.MONGO_URI

async function start() {
    try {
        await mongoose.connect(MONGO, { autoIndex: true })
        console.log('✅ Conectado a MongoDB Atlas')

        app.listen(PORT, () => {
            console.log(`✅ Backend escuchando en http://localhost:${PORT}`)
        })
    } catch (e) {
        console.error('❌ Error al iniciar:', e)
        process.exit(1)
    }
}
start()
