// src/routes/routesHome.js
const express = require('express');
const router = express.Router();
const { getHomeData } = require('../controllers/controllerHome'); // Verifica la ruta

// Ruta para obtener los datos de la home
router.get('/home', getHomeData);

module.exports = router;