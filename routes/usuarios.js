import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Para el cifrado de contraseñas
import User from '../model/usuarios.js'; // Modelo de usuario
import logger from '../logger.js';


const router = express.Router();



// Función para obtener un usuario por nombre
async function obtenerUsuarioPorNombre(username) {
  try {
    const user = await User.findOne({ username }); // Buscar usuario en la base de datos
    return user;
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw error;
  }
}



// Mostrar formulario de login
router.get('/login', (req, res) => {
  res.render('login.html', { error: null, usuario: req.username, isAdmin: req.admin });
});

// Procesar login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Obtener el usuario de la base de datos
  const user = await obtenerUsuarioPorNombre(username);
  if (!user) {
    return res.status(401).render('login.html', { error: 'Usuario no encontrado' });
  }

  // Comparar la contraseña con la almacenada (encriptada)
  if (password !== user.password) {
    return res.status(401).render('login.html', { error: 'Contraseña incorrecta' });
  }

  // Generar el token JWT
  const token = jwt.sign(
    { usuario: user.username, admin: user.admin }, // Datos en el token
    process.env.SECRET_KEY); // Clave secreta

  // Enviar el token en una cookie
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.IN === 'production', // Solo en producción si usas HTTPS
  });

  // Redirigir a una página de bienvenida
  logger.info(`Usuario ${user.username} autenticado`);
  res.render('bienvenida.html', { usuario: user.username });
});

// Cerrar sesión
router.get('/logout', (req, res) => {
  // Eliminar la cookie de autenticación (access_token)
  res.clearCookie('access_token');

  logger.info('Sesión finalizada de usuario');

  // Redirigir o renderizar una página de despedida, pasando el nombre de usuario y si es admin
  const usuario = req.username || null;  // Si no está autenticado, usuario será null
  const isAdmin = req.admin || false;    // Asegurarse de que 'admin' está definido correctamente

  // Renderizar la plantilla de despedida
  res.render('despedida.html', { usuario, isAdmin });
 
});

// Exportar router
export default router;
