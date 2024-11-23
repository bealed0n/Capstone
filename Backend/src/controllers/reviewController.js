const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté correctamente configurada

const addReview = async (req, res) => {
    try {
        const { productId, rating, reviewText } = req.body;
        const newReview = await pool.query(
            'INSERT INTO reviews (product_id, user_id, review_text, rating, username) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [productId, req.user.id, reviewText, rating, req.user.username]
        );
        res.status(201).json(newReview.rows[0]);
    } catch (err) {
        console.error('Error al agregar la reseña:', err.message);
        res.status(500).json('Error del servidor');
    }
};

const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await pool.query(
            'SELECT reviews.id, reviews.rating, reviews.review_text, reviews.created_at, users.username FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.product_id = $1',
            [productId]
        );
        res.json(reviews.rows);
    } catch (err) {
        console.error('Error al obtener las reseñas:', err.message);
        res.status(500).json('Error del servidor');
    }
};

module.exports = { addReview, getReviews };