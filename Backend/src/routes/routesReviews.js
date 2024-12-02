const express = require('express');
const router = express.Router();
const { addReview, getReviews, addTattooArtistReview, getTattooArtistReviews , addDesignReview, getDesignReviews} = require('../controllers/reviewController');
const Middleware = require('../middlewares/auth');

// Ruta para agregar reseñas
router.post('/reviews', Middleware, addReview);
// Ruta para obtener reseñas por productId o designId
router.get('/reviews', getReviews);


// Ruta para obtener reseñas de un producto
router.get('/reviews/:productId', getReviews);
// Ruta para añadir una reseña a un tatuador
router.post('/tattoo_artist_reviews', Middleware, addTattooArtistReview);

// Ruta para obtener las reseñas de un tatuador
router.get('/tattoo_artist_reviews/:tattooArtistId', getTattooArtistReviews);


// Rutas para reseñas de diseños
router.post('/reviews/design', Middleware, addDesignReview);
router.get('/reviews/design/:designId', getDesignReviews);
module.exports = router;