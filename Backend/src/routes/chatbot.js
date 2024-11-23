// chatbot.routes.js
const express = require('express');
const router = express.Router();
const { openThread, sendMessage } = require('../controllers/assitantController'); // Ajusta la ruta según tu estructura de carpetas

// Ruta para abrir un nuevo hilo
router.post('/thread', openThread);

// Ruta para enviar un mensaje
router.post('/message', sendMessage);

module.exports = router;