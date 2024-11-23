const pool = require('../db');

const addReviews = async (req, res) => {
    const usuarioId = req.user.id;
    const username = req.user.username;

    const { product_id, review_text, rating } = req.body;
  
    try {
      const newReview = await pool.query(
        'INSERT INTO reviews (product_id, user_id, review_text, rating, username) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [product_id, usuarioId, review_text, rating, username]
      );
  
      res.status(201).json(newReview.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json('Error del servidor');
    }}


const getReviews = async (req, res) => {
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
  };

  module.exports = { addReviews, getReviews };
  