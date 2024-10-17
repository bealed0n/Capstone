const express = require('express');
const pool = require('../db');

const router = express.Router();

// Ruta para agregar una reseña (sin autenticación)
router.post('/add', async (req, res) => {
  const { product_id, review_text, rating } = req.body;

  try {
    const newReview = await pool.query(
      'INSERT INTO reviews (product_id, review_text, rating) VALUES ($1, $2, $3) RETURNING *',
      [product_id, review_text, rating]
    );

    res.status(201).json(newReview.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para obtener reseñas por producto
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = await pool.query(
      'SELECT reviews.id, reviews.review_text, reviews.rating, reviews.created_at FROM reviews WHERE reviews.product_id = $1',
      [productId]
    );
    res.json(reviews.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Error del servidor');
  }
});

module.exports = router;