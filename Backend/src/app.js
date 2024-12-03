// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken'); // Asegúrate de importar jwt
const productsRoutes = require('./routes/routesProduct');
const postRoutes = require('./routes/routesPosts');
const loginregisterRoutes = require('./routes/routesLoginRegister');
const bookingRoutes = require('./routes/routesBooking');
const reviewsRoutes = require('./routes/routesReviews');
const chatbotRoutes = require('./routes/chatbot');
const postulacionesRoutes = require('./routes/routePostulaciones');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const cartRoutes = require('./routes/routesCart');
const routesModels = require('./routes/routesModel');
const routesDesing = require('./routes/routesDesigns');
const paymentRoutes = require('./routes/paymentRoutes');
const routesHome = require('./routes/routesHome');
const { Pool } = require('pg'); // Asegúrate de importar Pool
const pool = require('./db'); // Importa la configuración de la base de datos
const adminRoutes = require('./routes/adminRoutes'); 
const app = express();
app.use(express.json());

// Habilitar CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Middleware de cookies
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Rutas
app.use(productsRoutes);
app.use(postRoutes);
app.use(loginregisterRoutes);
app.use(bookingRoutes);
app.use(reviewsRoutes);
app.use(chatbotRoutes);
app.use(postulacionesRoutes);
app.use(reservationRoutes);
app.use(userRoutes);
app.use(chatRoutes);
app.use(cartRoutes);
app.use(routesModels);
app.use(routesDesing);
app.use(routesHome);
app.use(adminRoutes);
app.use('/api/payments', paymentRoutes);
// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ msg: 'Cierre de sesión exitoso' });
});

// Ruta para verificar el token     

app.listen(4000)
console.log('Server is running on port 4000');