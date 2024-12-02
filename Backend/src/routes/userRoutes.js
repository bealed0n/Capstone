// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const middleware = require('../middlewares/auth'); // Asegúrate de tener este middleware

// Ruta para obtener todos los usuarios (excluyendo al usuario autenticado)
router.get('/', middleware, getAllUsers);

module.exports = router;