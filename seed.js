// seed.js

// Alumna: Blanca Girón Ricoy

import { MongoClient } from 'mongodb'
import fs from 'fs'

console.log('🏁 seed.js ----------------->')

// del archivo .env
const USER_DB = process.env.USER_DB
const PASS = process.env.PASS

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

// función asíncrona
async function Inserta_datos_colección(colección, url) {

    try {
        const datos = await fetch(url).then(res => res.json())
        //console.log(datos)

        // nos conectamos a la BD
        const db = client.db(dbName);
        const collection = db.collection(colección);

        const result = await collection.insertMany(datos)
        // devolvemos los datos insertados
        return `${result.insertedCount} datos insertados en ${colección}`

        // ... Insertar datos en la BD aquí

    } catch (err) {
        err.errorResponse += ` en fetch ${colección}`
        throw err
    }
}

// funciones para las consultas

// productos de más de 100$
async function productos_mas_de_100() {
    try {
        const db = client.db(dbName);
        const collection = db.collection('productos');

        const productos = await collection.find({ price: { $gt: 100 } }).toArray();
        console.log("productos de más de 100$: ", productos);
        return productos;
    } catch (err) {
        console.error('Algo mal: ', err.errorResponse);
    }
}

// productos que contengan 'winter' en la descripción, ordenados por precio
async function productos_invierno() {
    try {
        const db = client.db(dbName);
        const collection = db.collection('productos');
        // productos que contengan 'winter' en la descripción
        const consulta = { description: { $regex: /winter/i } };
        // ordenados por precio ascendente
        const orden = { price: 1 };
        // sacamos los productos
        const productos = await collection.find(consulta).sort(orden).toArray();
        console.log("productos de invierno ordenados por precio: ", productos);
        return productos;
    } catch (err) {

        console.error('Algo mal: ', err.errorResponse);
    }
}

// productos de joyeria ordenados por rating
async function productos_joyeria() {
    try {
        const db = client.db(dbName);
        const collection = db.collection('productos');

        // hacemos la consulta
        const consulta = { category: 'jewelery' };
        // ordenamos por rating descendente
        const orden = { "rating.rate": -1 };
        // sacamos los productos
        const productos = await collection.find(consulta).sort(orden).toArray();
        console.log("productos de joyeria ordenados por rating: ", productos);
        return productos;
    } catch (err) {
        console.error('Algo mal: ', err.errorResponse);
    }
}

// resolver las reseñas totales haciendo un count en rating
async function resenias_totales() {
    try {
        const db = client.db(dbName);
        const collection = db.collection('productos');

        const resenias = await collection.aggregate([
            { $group: { _id: null, total: { $sum: "$rating.count" } } }
        ]).toArray();
        console.log("Resenias totales: ", resenias[0].total); // mejoramos el formato de salida
        return resenias[0].total;
    } catch (err) {
        console.error('Algo mal: ', err.errorResponse);
    }
}




// puntuacion media por categoria de producto
async function puntuacion_media_categoria() {
    try {
        const db = client.db(dbName);
        const collection = db.collection('productos');

        const puntuacion = await collection.aggregate([
            { $group: { _id: "$category", puntuacion_media: { $avg: "$rating.rate" } } }
        ]).toArray();
        console.log("Puntuacion media por categoria: ", puntuacion);
        return puntuacion;
    } catch (err) {
        console.error('Algo mal: ', err.errorResponse);
    }
}

// // usuarios sin digitos en el password
// async function usuarios_sin_digitos() {
//     try {
//         const db = client.db(dbName);
//         const collection = db.collection('usuarios');

//         const usuarios = await collection.find({ password: { $not: /\d/ } }).toArray();
//         console.log("Usuarios sin digitos en el password: ", usuarios);
//         return usuarios;
//     }
//     catch (err) {
//         console.error('Algo mal: ', err.errorResponse);
//     }
// }

async function users_sin_digitos_pswd() {
    try {
        const db = client.db(dbName);
        const collection = db.collection('usuarios');
        // usuarios sin digitos en el password
        const consulta = { password: { $not: /\d/ } };
        // sacamos los productos
        const usuarios = await collection.find(consulta).toArray();
        console.log("Usuarios sin digitos en el password: ", usuarios);
        return usuarios;
    } catch (err) {

        console.error('Algo mal: ', err.errorResponse);
    }
}

// Funciones extra ----------------------------

// Funcion para hacer copia de seguridad de la BD con mongodump
import { exec } from 'child_process';
import path from 'path'

// Función para hacer copia de seguridad de la BD con mongodump
async function backupDB() {
    const dbName = 'myProject';
    const directorio = './backup';
    const username = USER_DB; // Nombre de usuario
    const password = PASS; // Contraseña
    const uri = `mongodb://${username}:${password}@localhost:27017/${dbName}`;

    // Ejecuta mongodump con la URI completa
    exec(`mongodump --uri="${uri}"  --authenticationDatabase admin --out=${directorio}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al hacer la copia de seguridad: ${error.message}`);
            return;
        }
        if (stderr) {
            console.warn(`Error en el proceso de mongodump: ${stderr}`);
            return;
        }
        console.log(`Copia de seguridad realizada correctamente: ${stdout}`);
    });
}


// Bajarse también los archivos de imagen de los productos, y guardarlos en una carpeta.

async function descargarImg() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('productos');
        const downloadDir = './imagenes';


        // Crear la carpeta si no existe
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }

        // Obtener los productos con sus URLs de imagen
        const productos = await collection.find({}, { projection: { image: 1, _id: 1 } }).toArray();

        for (const producto of productos) {
            const url = producto.image;
            const nombreArchivo = path.join(downloadDir, `${producto._id}.jpg`);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error al descargar ${url}: ${response.statusText}`);

            // Leer el cuerpo de la respuesta en un buffer
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(nombreArchivo, Buffer.from(buffer));

            console.log(`Imagen guardada: ${nombreArchivo}`);
        }
    } catch (err) {
        console.error(`Error al descargar imágenes: ${err.message}`);
    } finally {
        await client.close();
    }
}



// funcion para ejecutar la inserción de datos
async function main() {
        try {
            // nos conectamos a la BD
            await client.connect()
            console.log('Conexion establecida correctamente')

            // Inserción consecutiva
            console.log(await Inserta_datos_colección('productos', 'https://fakestoreapi.com/products'))
            console.log(await Inserta_datos_colección('usuarios', 'https://fakestoreapi.com/users'))

            // Consultas
            await productos_mas_de_100();
            await productos_invierno();
            await productos_joyeria();
            await resenias_totales();
            await puntuacion_media_categoria();
            await users_sin_digitos_pswd();

            //  copia de seguridad
            await backupDB();


            // descargar imágenes
            await descargarImg();


        } catch (err) {
            console.error('Algo mal: ', err.errorResponse)
        } finally {
            // Close connection
            await client.close()
            console.log('Conexion cerrada correctamente')
        }
    }

    // ejecutamos la función main
    main();

// // Inserción consecutiva
// Inserta_datos_en_colección('productos', 'https://fakestoreapi.com/products')
//     .then((r) => console.log(`Todo bien: ${r}`))                                 // OK
//     .then(() => Inserta_datos_en_colección('usuarios', 'https://fakestoreapi.com/users'))
//     .then((r) => console.log(`Todo bien: ${r}`))                                // OK
//     .catch((err) => console.error('Algo mal: ', err.errorResponse))             // error


// console.log('Lo primero que pasa')