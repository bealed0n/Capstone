// controllers/comentController.js
const pool = require('../db'); // Asegúrate de que este archivo está correctamente configurado

// Función para añadir un comentario
const addComment = async (req, res) => {
  console.log("Añadiendo comentario");
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.user.id; // Asegúrate de que 'req.user.id' está definido

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ msg: 'El comentario no puede estar vacío' });
  }

  try {
    // Verificar si el post existe
    const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Post no encontrado' });
    }

    // Insertar el comentario en la base de datos
    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, text) 
       VALUES ($1, $2, $3) 
       RETURNING id, text, created_at`,
      [postId, userId, text]
    );
    const newComment = result.rows[0];

    // Obtener el username del usuario que hizo el comentario
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    newComment.username = userResult.rows[0].username;

    res.status(201).json({ msg: 'Comentario añadido', comment: newComment });
  } catch (err) {
    console.error('Error al añadir comentario:', err.message);
    res.status(500).json({ msg: 'Error del servidor', error: err.message });
  }
};

// Función para obtener los comentarios de un post
const getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, c.text, c.created_at, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at ASC`,
      [postId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error al obtener comentarios:', err.message);
    res.status(500).json('Error del servidor');
  }
};

// Función para eliminar un comentario
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id; // Asegúrate de que 'req.user.id' está definido

  try {
    // Verificar si el comentario existe y pertenece al usuario
    const result = await pool.query(
      `SELECT * FROM comments WHERE id = $1 AND user_id = $2`,
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Comentario no encontrado o no autorizado' });
    }

    // Eliminar el comentario
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    res.status(200).json({ msg: 'Comentario eliminado' });
  } catch (err) {
    console.error('Error al eliminar comentario:', err.message);
    res.status(500).json('Error del servidor');
  }
};

module.exports = { addComment, getCommentsByPostId, deleteComment };