const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté correctamente configurada

const addPost = async (req, res) => {
    try {
        const { description } = req.body;
        const imageUrl = req.file ? req.file.filename : null; // Asigna la ruta de la imagen si existe
        const user = req.user.id;
        const newPost = await pool.query(
          'INSERT INTO posts (user_id, image_url, description) VALUES ($1, $2, $3) RETURNING *',
          [user, imageUrl, description]
        );
        res.status(201).json(newPost.rows[0]);
      } catch (err) {
        console.error('Error al subir la publicación:', err.message);
        res.status(500).json('Error del servidor');
      }
};
const getPost = async (req, res) => {
    try {
        const posts = await pool.query(`
          SELECT posts.id, posts.image_url, posts.description, users.username
          FROM posts
          JOIN users ON posts.user_id = users.id
        `);
        
        res.json(posts.rows);
      } catch (err) {
        console.error('Error al obtener publicaciones:', err.message);
        res.status(500).json('Error del servidor');
      }
};



module.exports = { addPost, getPost };