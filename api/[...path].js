import serverless from "serverless-http";
import app from "../src/app.js";   // ojo: ../app.js porque estás en src/api

export const config = { api: { bodyParser: false } };
export default serverless(app);
