// routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const { publishHours, reserveHour, getAvailableHours, getArtists } = require('../controllers/reservationController');
const Middleware = require('../middlewares/auth');


// Ruta para que los artistas publiquen horas
router.post(
  '/publish',Middleware,publishHours
);

// Ruta para que los clientes reserven horas
router.post(
  '/book', Middleware,reserveHour
);

// Ruta para obtener horas disponibles de un artista
router.get(
  '/artist/:artistId',Middleware,getAvailableHours
);

router.get('/artists', Middleware, getArtists); // Asegúrate de implementar getArtists

module.exports = router;