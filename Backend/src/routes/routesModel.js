const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { addModel, getModels, getModelById } = require('../controllers/controllerModel');
const authMiddleware = require('../middlewares/auth');
const unzipper = require('unzipper');
const fs = require('fs');
const pool = require('../db'); // Importar la conexión a la base de datos

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/models'); // Carpeta donde se guardarán los archivos ZIP
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
  }
});

// Middleware de multer para la carga de archivos
const upload = multer({ storage: storage });

// Ruta para agregar un modelo 3D
router.post('/models', authMiddleware, upload.single('model'), async (req, res) => {
  const { name, description } = req.body;
  const zipFilePath = req.file.path;
  const userId = req.user && req.user.id;

  if (!userId) {
    return res.status(401).json({ msg: 'Autenticación requerida' });
  }

  try {
    // Descomprimir el archivo ZIP
    const unzipPath = `src/uploads/models/${Date.now()}`;
    fs.mkdirSync(unzipPath, { recursive: true });
    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: unzipPath }))
      .on('close', async () => {
        // Buscar el archivo GLTF en la carpeta descomprimida
        const files = fs.readdirSync(unzipPath);
        const gltfFile = files.find(file => file.endsWith('.gltf'));

        if (!gltfFile) {
          return res.status(400).json({ msg: 'Archivo GLTF no encontrado en el ZIP' });
        }

        const modelUrl = `uploads/models/${unzipPath.split('/').pop()}/${gltfFile}`;

        // Guardar la información del modelo en la base de datos
        const newModel = await pool.query(
          'INSERT INTO models (name, description, model_url, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [name, description, modelUrl, userId]
        );

        res.status(201).json(newModel.rows[0]);
      });
  } catch (err) {
    console.error('Error al agregar modelo 3D:', err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para obtener todos los modelos 3D
router.get('/models', getModels);

// Ruta para obtener un modelo 3D específico por ID
router.get('/models/:id', getModelById);

module.exports = router;