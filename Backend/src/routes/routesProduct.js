const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProducts, addProducts, getId , searchProducts} = require('../controllers/controllerProduct');
const Middleware = require('../middlewares/auth');

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada imagen
  }
});

// Middleware de multer para la carga de archivos
const upload = multer({ storage: storage });

// Ruta para obtener todos los productos
router.get('/productos', getProducts);

// Ruta para agregar productos con imagen
router.post('/add', upload.single('imageUrl'), Middleware, addProducts);

// Ruta para obtener los detalles de un producto específico por ID
router.get('/productos/:id', getId);

// Ruta para buscar productos
router.get('/searchProducts', searchProducts);

module.exports = router;
