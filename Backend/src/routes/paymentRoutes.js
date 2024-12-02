// backend/src/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const authenticate = require('../middlewares/auth'); // Asegúrate de tener este middleware para autenticar al usuario

// Inicializa Stripe con tu clave secreta de prueba
const stripe = Stripe('sk_test_51QRFTFHvIkD9pEjPnzEyXvOEimjK4OgQyMoeSyZ7Se56p4KHVEFEOuCW9CyGszEOzAWCXUbCL3Ea6lsAtDLbJrlT00kip5jkKU');

// Ruta para crear un Payment Intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
    try {
        const { items } = req.body; // Array de productos en el carrito

        // Función para calcular el monto total en centavos
        const calculateOrderAmount = (items) => {
            // Reemplaza esta lógica con el cálculo real basado en tus productos
            return items.reduce((acc, item) => acc + item.price * item.quantity, 0) * 100;
        };

        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(items),
            currency: 'usd',
            metadata: { user_id: req.user.id },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error al crear el Payment Intent:', error);
        res.status(500).json({ error: 'Error al procesar el pago.' });
    }
});

module.exports = router;