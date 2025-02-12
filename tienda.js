import express from "express";
import nunjucks from "nunjucks";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";


import connectDB from "./model/db.js"; // Conexión a la base de datos
connectDB();

// Inicialización de la app
const app = express();

// Configurar la carpeta "static" para servir archivos estáticos
app.use('/static', express.static('static'));

// Variables de entorno
const IN = process.env.IN || "development";
const SECRET_KEY = process.env.SECRET_KEY || "clave-secreta"; // Asegúrate de definir esto en tus variables de entorno

// Configuración de Nunjucks para plantillas HTML
nunjucks.configure("views", {
  autoescape: true,
  noCache: IN === "development",
  watch: IN === "development",
  express: app,
});
app.set("view engine", "html");

// Middlewares globales
app.use(express.json()); // JSON

// Archivos estáticos 


app.use(express.urlencoded({ extended: true })); // Formularios
app.use(cookieParser()); // Cookies
app.use(
  session({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware de autenticación
const autenticacion = (req, res, next) => {
  const token = req.cookies.access_token; // Leer el token desde las cookies
  if (token) {
    try {
      // Verificar el token
      const data = jwt.verify(token, SECRET_KEY);
      req.username = data.usuario; // Adjuntar el usuario autenticado al request
      res.locals.usuario = data.usuario || null; // Hacer el usuario disponible en las vistas
      res.locals.admin = data.admin ; // Hacer el estado de administrador disponible en las vistas
    } catch (error) {
      console.error("Token inválido:", error.message);
      res.clearCookie("access_token"); // Limpiar la cookie si el token no es válido
    }
  }
  next(); // Continuar con la siguiente función
};
app.use(autenticacion);




// Prueba de servidor
app.get("/hola", (req, res) => {
  res.send("Hola desde el servidor");
});

// Rutas
import TiendaRouter from "./routes/router_tienda.js";
import UsuariosRouter from "./routes/usuarios.js";
app.use("/", TiendaRouter);
app.use("/", UsuariosRouter); // Usuarios

// Puerto y servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

