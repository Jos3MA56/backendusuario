import 'dotenv/config';
import { createServer } from 'http';
import app from './src/app.js';
import './src/db.js'; // inicializa conexión

const PORT = process.env.PORT || 4000;
const server = createServer(app);

server.listen(PORT, () => {
    console.log(`✅ Auth backend escuchando en http://localhost:${PORT}`);
});
