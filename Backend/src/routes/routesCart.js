const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeFromCart } = require('../controllers/controllerCart');
const Middleware = require('../middlewares/auth');

// Ruta para agregar un producto al carrito
router.post('/cart', Middleware, addToCart);

// Ruta para obtener el contenido del carrito
router.get('/cart', Middleware, getCart);

// Ruta para actualizar la cantidad de un producto en el carrito
router.put('/cart', Middleware, updateCartItem);

// Ruta para eliminar un producto del carrito
router.delete('/cart/:cartItemId', Middleware, removeFromCart);

module.exports = router;