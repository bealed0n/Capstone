// backend/src/controllers/controllerReviews.js

const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté correctamente configurada

// Función para agregar una reseña de producto
const addReview = async (req, res) => {
    try {
        const { productId, rating, reviewText } = req.body;

        // Validar que se proporcionen los campos necesarios
        if (!productId || !rating || !reviewText) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

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

// Función para obtener reseñas de productos
const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validar que se proporcione el ID del producto
        if (!productId) {
            return res.status(400).json({ error: 'Se requiere el ID del producto.' });
        }

        const reviews = await pool.query(
            'SELECT reviews.id, reviews.rating, reviews.review_text, reviews.created_at, users.username FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.product_id = $1 ORDER BY reviews.created_at DESC',
            [productId]
        );
        res.json(reviews.rows);
    } catch (err) {
        console.error('Error al obtener las reseñas:', err.message);
        res.status(500).json('Error del servidor');
    }
};

// Función para agregar una reseña de artista de tatuajes
const addTattooArtistReview = async (req, res) => {
    try {
        const { tattooArtistId, rating, reviewText } = req.body;

        // Validar que se proporcionen los campos necesarios
        if (!tattooArtistId || !rating || !reviewText) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        const newReview = await pool.query(
            'INSERT INTO tattoo_artist_reviews (tattoo_artist_id, user_id, review_text, rating) VALUES ($1, $2, $3, $4) RETURNING *',
            [tattooArtistId, req.user.id, reviewText, rating]
        );
        res.status(201).json(newReview.rows[0]);
    } catch (err) {
        console.error('Error al agregar la reseña de artista de tatuajes:', err.message);
        res.status(500).json('Error del servidor');
    }
};

// Función para obtener reseñas de artistas de tatuajes
const getTattooArtistReviews = async (req, res) => {
    try {
        const { tattooArtistId } = req.params;

        // Validar que se proporcione el ID del tatuador
        if (!tattooArtistId) {
            return res.status(400).json({ error: 'Se requiere el ID del tatuador.' });
        }

        const reviews = await pool.query(
            'SELECT tattoo_artist_reviews.id, tattoo_artist_reviews.rating, tattoo_artist_reviews.review_text, tattoo_artist_reviews.created_at, users.username FROM tattoo_artist_reviews JOIN users ON tattoo_artist_reviews.user_id = users.id WHERE tattoo_artist_reviews.tattoo_artist_id = $1 ORDER BY tattoo_artist_reviews.created_at DESC',
            [tattooArtistId]
        );
        res.json(reviews.rows);
    } catch (err) {
        console.error('Error al obtener las reseñas de tatuadores:', err.message);
        res.status(500).json('Error del servidor');
    }
};

// Función para agregar una reseña de diseño
const addDesignReview = async (req, res) => {
    try {
        const { designId, rating, reviewText } = req.body;

        // Validar que se proporcionen los campos necesarios
        if (!designId || !rating || !reviewText) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        const newReview = await pool.query(
            'INSERT INTO design_reviews (design_id, user_id, review_text, rating, username) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [designId, req.user.id, reviewText, rating, req.user.username]
        );
        res.status(201).json(newReview.rows[0]);
    } catch (err) {
        console.error('Error al agregar la reseña de diseño:', err.message);
        res.status(500).json('Error del servidor');
    }
};

// Función para obtener reseñas de diseños
const getDesignReviews = async (req, res) => {
    try {
        const { designId } = req.params;

        // Validar que se proporcione el ID del diseño
        if (!designId) {
            return res.status(400).json({ error: 'Se requiere el ID del diseño.' });
        }

        const reviews = await pool.query(
            'SELECT design_reviews.id, design_reviews.rating, design_reviews.review_text, design_reviews.created_at, users.username FROM design_reviews JOIN users ON design_reviews.user_id = users.id WHERE design_reviews.design_id = $1 ORDER BY design_reviews.created_at DESC',
            [designId]
        );
        res.json(reviews.rows);
    } catch (err) {
        console.error('Error al obtener las reseñas de diseño:', err.message);
        res.status(500).json('Error del servidor');
    }
};

module.exports = { addReview, getReviews, addTattooArtistReview, addDesignReview, getDesignReviews, getTattooArtistReviews };