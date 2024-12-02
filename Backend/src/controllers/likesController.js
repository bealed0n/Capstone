const pool = require('../db');

// Función para añadir un "Me gusta"
const addLike = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id; // Obtén el ID del usuario desde el token de autenticación

    try {
        await pool.query(
            'INSERT INTO likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [postId, userId]
        );
        res.status(201).json({ msg: 'Me gusta añadido' });
    } catch (err) {
        console.error('Error al añadir "Me gusta":', err.message);
        res.status(500).json('Error del servidor');
    }
};

// Función para quitar un "Me gusta"
const removeLike = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        res.status(200).json({ msg: 'Me gusta eliminado' });
    } catch (err) {
        console.error('Error al eliminar "Me gusta":', err.message);
        res.status(500).json('Error del servidor');
    }
};

// Función para obtener el conteo de "Me gusta"
const getLikesCount = async (req, res) => {
    const { postId } = req.params;

    try {
        const result = await pool.query('SELECT COUNT(*) FROM likes WHERE post_id = $1', [postId]);
        const count = result.rows[0].count;
        res.status(200).json({ likesCount: count });
    } catch (err) {
        console.error('Error al obtener el conteo de "Me gusta":', err.message);
        res.status(500).json('Error del servidor');
    }
};

module.exports = { addLike, removeLike, getLikesCount };
