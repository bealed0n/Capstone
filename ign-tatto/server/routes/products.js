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

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products');
    res.json(products.rows);
  } catch (err) {
    console.error('Error al obtener productos:', err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para agregar un nuevo producto
router.post('/add', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'tatto_artist') {
    return res.status(403).json({ msg: 'Solo los tatuadores pueden agregar productos.' });
  }

  const { name, description, price } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, imageUrl]
    );

    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error('Error al agregar producto:', err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para obtener los detalles de un producto específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    res.json(product.rows[0]);
  } catch (err) {
    console.error('Error al obtener el producto:', err.message);
    res.status(500).json('Error del servidor');
  }
});

module.exports = router;