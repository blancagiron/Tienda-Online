import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar las variables de entorno desde el archivo .env en el directorio padre
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const USER_DB = process.env.USER_DB
const PASS = process.env.PASS
const DB_HOST = process.env.DB_HOST
const url = `mongodb://${USER_DB}:${PASS}@${DB_HOST}:27017/myProject?authSource=admin`

export default function connectDB() {
    try {
        mongoose.connect(url);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }

    const dbConnection = mongoose.connection;
    dbConnection.once("open", (_) => {
        console.log(`Database connected: ${url}`);
    });

    dbConnection.on("error", (err) => {
        console.error(`connection error: ${err}`);
    });
    return;
}