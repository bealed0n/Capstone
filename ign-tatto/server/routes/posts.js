// server/routes/posts.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Ruta para que los tatuadores suban publicaciones
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'tattoo_artist' && req.user.role !== 'designer') {
    return res.status(403).json({ msg: 'Solo los tatuadores pueden subir publicaciones.' });
  }

  const { description } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const newPost = await pool.query(
      'INSERT INTO posts (user_id, image_url, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, imageUrl, description]
    );

    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    console.error('Error al subir la publicación:', err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para obtener todas las publicaciones de los tatuadores
router.get('/', async (req, res) => {
  try {
    const posts = await pool.query(`
      SELECT posts.id, posts.image_url, posts.description, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE users.role = 'tattoo_artist' OR users.role = 'designer'
    `);
    
    res.json(posts.rows);
  } catch (err) {
    console.error('Error al obtener publicaciones:', err.message);
    res.status(500).json('Error del servidor');
  }
});

module.exports = router;