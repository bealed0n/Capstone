const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const Middleware = require('../middlewares/auth');

// Ruta para agregar reseñas
router.post('/reviews', Middleware, addReview);

// Ruta para obtener reseñas de un producto
router.get('/reviews/:productId', getReviews);

module.exports = router;