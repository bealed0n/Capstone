// controllers/chatController.js
const pool = require('../db');

// Obtener el historial de mensajes entre dos usuarios
const getMessageHistory = async (req, res) => {
    const userId = req.user.id;
    const withUserId = req.params.withUserId;

    try {
        const query = `
            SELECT m.content, m.image_url, m.sent_at, u.username AS sender_username
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = $1 AND m.receiver_id = $2)
               OR (m.sender_id = $2 AND m.receiver_id = $1)
            ORDER BY m.sent_at ASC
        `;
        const { rows } = await pool.query(query, [userId, withUserId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener el historial de mensajes' });
    }
};

// Obtener la lista de usuarios (excluyendo al usuario actual)
const getUsers = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT id, username
            FROM users
            WHERE id != $1
        `;
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
    }
};

module.exports = { getMessageHistory, getUsers };