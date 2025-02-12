import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info', // Nivel por defecto: info (puede ser debug, error, etc.)
    format: format.combine(
        format.timestamp(), // Añade timestamp a los logs
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`) // Formato personalizado
    ),
    transports: [
        new transports.Console(), // Muestra los logs en la consola
        new transports.File({ filename: 'app.log' }) // Guarda los logs en un archivo
    ]
});

export default logger;
