// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getMessageHistory, getUsers } = require('../controllers/chatController');
const authMiddleware = require('../middlewares/auth');

// Ruta para obtener el historial de mensajes con un usuario específico
router.get('/history/:withUserId', authMiddleware, getMessageHistory);
router.get('/users', authMiddleware, getUsers);
module.exports = router;