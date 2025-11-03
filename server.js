// server.js (solo para correr local)
import "dotenv/config";
import mongoose from "mongoose";
import app from "./src/app.js";

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(() => {
    app.listen(PORT, () => {
        console.log(`API local en http://localhost:${PORT}`);
    });
});
