const express = require('express');
const productsRoutes = require('./routes/routesProduct');
const postRoutes = require('./routes/routesPosts');
const loginregisterRoutes = require('./routes/routesLoginRegister');
const bookingRoutes = require('./routes/routesBooking');
const reviewsRoutes = require('./routes/routesReviews');
const cookieParser = require('cookie-parser');
const chatbotRoutes = require('./routes/chatbot'); // Importar las rutas del chatbot
const cors = require('cors');
const path = require('path');
const postulacionesRoutes = require('./routes/routePostulaciones');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
app.use(express.json());

// Habilitar CORS
app.use(cors({
    origin: 'http://localhost:3000',  // Permitir solo solicitudes desde el frontend en localhost:3000
    credentials: true,  // Permitir cookies (como el token JWT) en las solicitudes
  }));

// Middleware de cookies
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

app.use(productsRoutes);
app.use(postRoutes);
app.use(loginregisterRoutes);
app.use(bookingRoutes);
app.use(reviewsRoutes);
app.use(chatbotRoutes); // Usar las rutas del chatbot
app.use(postulacionesRoutes);
app.use(reservationRoutes);
// Ruta para cerrar sesión (borrar la cookie con el token)
app.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });  // Eliminar la cookie 'token'
    res.json({ msg: 'Cierre de sesión exitoso' });
  });

app.listen(4000)
console.log('Server is running on port 4000');