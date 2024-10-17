// server/routes/products.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db'); // Conexión con PostgreSQL
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

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para obtener un producto por su ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para agregar un nuevo producto
router.post('/add', upload.single('image'), async (req, res) => {
  const { name, description, price, stock } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, image_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, imageUrl, stock]
    );
    res.json(newProduct.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json('Error del servidor');
  }
});

module.exports = router;