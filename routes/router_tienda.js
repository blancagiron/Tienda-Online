import express from "express";
import Productos from "../model/productos.js";
import User from "../model/usuarios.js";
import logger from "../logger.js";
import { log } from "console";

const router = express.Router();





// Pasar el estado del carrito a la plantilla si esta vacío, un Middleware es una función que se ejecuta antes de que se ejecute la ruta
router.use((req, res, next) => {

    const carrito = req.session.carrito || [];
    // Calcula la cantidad total de artículos en el carrito sumando la cantidad de cada artículo
    const cantidad = carrito.length;

    const precio_total = carrito.reduce((total, item) => {
        const precio = Number(item.price) || 0; // Convertir a número o usar 0 si no es válido
        return total + (precio);
    }, 0);

    // Asigna la cantidad total de artículos al objeto res.locals para que esté disponible en las vistas
    res.locals.cantidad_carrito = cantidad;

    // Asigna el precio total del carrito al objeto res.locals para que esté disponible en las vistas
    res.locals.precio_total = precio_total;

    // Asigna un valor booleano que indica si el carrito está vacío al objeto res.locals
    res.locals.carrito_vacio = cantidad === 0;

    // Asigna el carrito completo al objeto res.locals para que esté disponible en las vistas
    res.locals.carrito = carrito;


    next();
});

// Cargamos las categorías de productos

router.use(async (req, res, next) => {
    const categorias = await Productos.distinct('category');
    res.locals.categorias = categorias;
    next();
});

// Ruta para la URL raíz
router.get('/', async (req, res) => {
    const productos_destacados = await Productos.find({ "rating.rate": { $gt: 3.5 } });
    const usuario = req.username;
    res.render('home.html', { productos_destacados, categorias: res.locals.categorias, carrito_vacio: res.locals.carrito_vacio, usuario });
    // Pasamos las categorías a la plantilla

});

// Ruta para /portada
router.get('/portada', async (req, res) => {
    const usuario = req.username;
    const productos_destacados = await Productos.find({ "rating.rate": { $gt: 3.5 } });
    res.render('home.html', { productos_destacados, usuario });
});

// Obtener las categorías de productos

router.get('/category/:category', async (req, res) => {
    const productos = await Productos.find({ category: req.params.category });
    res.render('categorias.html', { productos, category: req.params.category });
});


// Ruta para la búsqueda de productos
router.get('/buscar', async (req, res) => {
    const query = req.query.query; // Obtener el término de búsqueda desde la URL
    const productos_buscados = await Productos.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },        // Coincidir con el título (sin distinción entre mayúsculas y minúsculas)
            { description: { $regex: query, $options: 'i' } }   // Coincidir con la descripción
        ]
    });

    res.render('buscar.html', { productos_buscados, query }); // Renderizar la plantilla de búsqueda con los resultados
});



// Ver el carrito
router.get('/carrito', (req, res) => {
    const usuario = req.username;
    res.render('carrito.html', { carrito: res.locals.carrito });
});


// Ver detalles de un producto
router.get('/detalle_producto/:id', async (req, res) => {
    try {
        const producto = await Productos.findOne({ id: parseInt(req.params.id) });
        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }
        res.render('detalle_producto.html', { producto, isAdmin: req.admin });
    } catch (error) {
        res.status(500).send('Error al obtener el producto');
    }
});

// Añadir al carrito
router.post('/carrito/agregar/:id', async (req, res) => {
    try {
        const producto = await Productos.findOne({ id: parseInt(req.params.id) });
        if (!producto) {
            logger.warn(`Producto con id ${req.params.id} no encontrado`);
            return res.status(404).send('Producto no encontrado');
        }
        if (!req.session.carrito) req.session.carrito = [];
        req.session.carrito.push(producto);
        logger.info(`Producto con id ${req.params.id} añadido al carrito`);
        res.redirect('/tienda/carrito');
    } catch (error) {
        res.status(500).send('Error al agregar el producto al carrito');
    }
});

// Quitar del carrito, se añade esto opcional para quitar un producto del carrito y asi poder ver lo de carrito vacio
// es post porque se envia desde un formulario
router.post('/carrito/quitar/:id', (req, res) => {
    // Asegurarse de que req.session.carrito esté inicializado
    if (!req.session.carrito) {
        req.session.carrito = [];
    }

    const productoId = parseInt(req.params.id, 10); // Parsear el ID del producto

    // Encontrar el índice del producto en el carrito
    const itemIndex = req.session.carrito.findIndex(item => item.id === productoId);

    if (itemIndex > -1) { // Si el producto existe en el carrito
        if (req.session.carrito[itemIndex].cantidad > 1) {
            // Reducir la cantidad si es mayor a 1
            req.session.carrito[itemIndex].cantidad -= 1;
        } else {
            // Si la cantidad es 1, eliminar el producto del carrito
            req.session.carrito.splice(itemIndex, 1);
        }
    } else {
        // Manejar el caso en que el producto no existe en el carrito
        logger.warn(`Producto con ID ${productoId} no encontrado en el carrito`);
    }

    // Redirigir de vuelta al carrito
    res.redirect('/tienda/carrito');
});


// actualizar los productos
router.post('/productos/editar/:id', async (req, res) => {
    // Convertir el id en el parámetro a número, ya que 'id' es un campo numérico
    const productoId = parseInt(req.params.id);

    // Extraer los nuevos valores del producto desde el cuerpo de la solicitud
    const { title, price, description, category, image, rating } = req.body;

    try {
        // Actualizar el producto usando findOneAndUpdate
        const producto_actualizado = await Productos.findOneAndUpdate(
            { id: productoId }, // Buscar por el campo 'id' que es un número
            { title, price, description, category, image, rating }, // Campos a actualizar
            { new: true, runValidators: true } // 'new' para devolver el producto actualizado
        );

        // Verificar si el producto fue actualizado correctamente
        if (!producto_actualizado) {
            return res.status(404).send('Producto no encontrado');
        }

        // Redirigir al usuario con un mensaje de éxito
        logger.info(`Producto con id ${productoId} actualizado`);
        res.redirect('/tienda/?mensaje=Producto actualizado exitosamente');
    } catch (error) {
        // Manejar errores si ocurren durante la actualización
        logger.warn(`Error al actualizar el producto con id ${productoId}: ${error.message}`);
        console.error('Error al actualizar el producto:', error);
        res.status(500).send('Error al actualizar el producto');
    }
});

// Obtener todos los ratings (con paginación opcional)
router.get('/api/ratings', async (req, res) => {
    const { desde = 0, hasta = 20 } = req.query;
    try {
        const productos = await Productos.find()
            .select('id rating') // Solo obtener id y rating
            .skip(parseInt(desde)) // Saltar los primeros 'desde' productos
            .limit(parseInt(hasta) - parseInt(desde)); // Limitar el número de resultados

        res.json(productos);
    } catch (error) {
        console.error('Error al obtener los ratings:', error);
        res.status(500).json({ error: 'Error al obtener los ratings' });
    }
});

// Obtener el rating de un producto específico
router.get('/api/ratings/:id', async (req, res) => {
    try {
        const producto = await Productos.findOne({ id: parseInt(req.params.id) })
            .select('id rating'); // Solo obtener id y rating

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        console.error('Error al obtener el rating:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Modificar el rating de un producto específico
router.put('/api/ratings/:id', async (req, res) => {
    const { rate: nuevaValoracion } = req.body;

    try {
        // Buscar el producto existente
        const producto = await Productos.findOne({ id: parseInt(req.params.id) });
        if (!producto) {
            logger.warn(`Producto con id ${req.params.id} no encontrado`);
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Calcular el nuevo rate y count
        const { rate: rateActual, count: countActual } = producto.rating;
        const nuevoCount = countActual + 1;
        const nuevoRate = ((rateActual * countActual) + nuevaValoracion) / nuevoCount;

        // Actualizar el producto con los nuevos valores
        const producto_actualizado = await Productos.findOneAndUpdate(
            { id: parseInt(req.params.id) }, // Buscar por el campo 'id'
            { 'rating.rate': nuevoRate, 'rating.count': nuevoCount }, // Actualizar los campos del rating
            { new: true, runValidators: true } // Devolver el producto actualizado y validar
        );

        // Validar que el producto fue actualizado
        if (!producto_actualizado) {
            logger.warn(`Producto con id ${req.params.id} no encontrado tras intentar actualizar`);
            return res.status(404).json({ error: 'Producto no encontrado tras intentar actualizar' });
        }

        // Mensaje en el logger
        logger.info(`Rating actualizado para el producto con id ${req.params.id}`);

        // Responder con éxito
        res.json({ mensaje: 'Rating actualizado correctamente', producto: producto_actualizado });
    } catch (error) {
        console.error('Error al actualizar el rating:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// ... más rutas aquí

export default router;