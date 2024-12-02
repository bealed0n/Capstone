const express = require('express');
const router = express.Router();
const { addBooking,
    addReserve,
    getMyReservations,
    getAvailableReserves,
    } = require('../controllers/controllerBooking');
const Middleware = require('../middlewares/auth');
    
// Ruta para obtener todos los productos
router.post('/createReserve', Middleware, addBooking);
router.post('/reserve', Middleware, addReserve);
router.get('/myReserve', Middleware, getMyReservations);
router.get('/availableReserves', Middleware, getAvailableReserves);

module.exports = router;
