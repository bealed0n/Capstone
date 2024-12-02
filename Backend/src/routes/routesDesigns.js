// backend/routes/designRoutes.js
const express = require('express');
const router = express.Router();
const { uploadDesign, getDesigns, getDesignById, searchDesigns  } = require('../controllers/designController');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads'); // Asegúrate de que esta carpeta existe
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filtrar solo imágenes (opcional pero recomendado)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'));
  }
};

const upload = multer({ storage, fileFilter });

// Ruta para subir un diseño
router.post('/designs', authMiddleware, upload.single('image'), uploadDesign);

// Ruta para obtener todos los diseños
router.get('/designs', getDesigns);

// Ruta para obtener un diseño por ID
router.get('/designs/:id', getDesignById);

// Ruta para buscar diseños
router.get('/search/designs', searchDesigns);


module.exports = router;