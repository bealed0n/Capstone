// src/controllers/userController.js
const pool = require('../db');

// Obtener todos los usuarios excluyendo al usuario autenticado
const getAllUsers = async (req, res) => {
    const userId = req.user.id; // Asume que authMiddleware asigna req.user.id

    try {
        const result = await pool.query(
            'SELECT id, username FROM users WHERE id != $1',
            [userId]
        );
        res.json({ users: result.rows });
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

module.exports = { getAllUsers };