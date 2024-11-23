const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Necesario para trabajar con extensiones de archivos

const {
  getPostulaciones,
  getPostulacionById,
  addPostulacion,
  approvePostulacion,
  deletePostulacion,
} = require('../controllers/controllerPostulaciones');

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    // Nombre único para cada imagen, con timestamp y extensión original
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Crear el middleware de multer
const upload = multer({ storage: storage });

// Obtener todas las postulaciones
router.get('/getPostulaciones', getPostulaciones);

// Obtener una postulación por ID
router.get('/postulaciones/:id', getPostulacionById);

// Agregar una nueva postulación
// 'upload.array' para manejar múltiples archivos. El nombre 'requisito' debe coincidir con el campo en el frontend
router.post('/add-postulaciones', upload.array('requisitos', 10), addPostulacion);

// Aprobar una postulación
router.put('/postulaciones/:id/approve', approvePostulacion);

// Eliminar una postulación
router.delete('/postulaciones/:id', deletePostulacion);

module.exports = router;
