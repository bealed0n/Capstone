// server/routes/products.js
const express = require('express');
const pool = require('../db'); // Conexión con PostgreSQL
const router = express.Router();

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

module.exports = router;
// Ruta para agregar un nuevo producto
router.post('/add', async (req, res) => {
    const { name, description, price, image_url, stock } = req.body;
    try {
      const newProduct = await pool.query(
        'INSERT INTO products (name, description, price, image_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, image_url, stock]
      );
      res.json(newProduct.rows[0]);
    } catch (error) {
      console.error(error.message);
      res.status(500).json('Error del servidor');
    }
  });

  module.exports = router;