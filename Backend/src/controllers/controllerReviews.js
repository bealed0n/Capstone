// backend/src/controllers/controllerReviews.js

const pool = require('../db');

const addReviews = async (req, res) => {
  const usuarioId = req.user.id;
  const username = req.user.username;

  const { product_id, design_id, review_text, rating } = req.body;

  // Validar que se proporcione solo product_id o design_id
  if ((product_id && design_id) || (!product_id && !design_id)) {
    return res.status(400).json({ error: 'Debe proporcionar solo product_id o design_id.' });
  }

  try {
    const newReview = await pool.query(
      `INSERT INTO reviews (product_id, design_id, user_id, review_text, rating, username)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_id || null, design_id || null, usuarioId, review_text, rating, username]
    );

    res.status(201).json(newReview.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const getReviews = async (req, res) => {
  const { productId, designId } = req.query;

  // Validar que se proporcione solo productId o designId
  if ((productId && designId) || (!productId && !designId)) {
    return res.status(400).json({ error: 'Debe proporcionar productId o designId.' });
  }

  try {
    let query = '';
    let params = [];

    if (productId) {
      query = `
        SELECT reviews.id, reviews.review_text, reviews.rating, reviews.created_at, users.username
        FROM reviews
        JOIN users ON reviews.user_id = users.id
        WHERE reviews.product_id = $1
        ORDER BY reviews.created_at DESC
      `;
      params = [productId];
    } else if (designId) {
      query = `
        SELECT reviews.id, reviews.review_text, reviews.rating, reviews.created_at, users.username
        FROM reviews
        JOIN users ON reviews.user_id = users.id
        WHERE reviews.design_id = $1
        ORDER BY reviews.created_at DESC
      `;
      params = [designId];
    }

    const reviews = await pool.query(query, params);
    res.json(reviews.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = { addReviews, getReviews };