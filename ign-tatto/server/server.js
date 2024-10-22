// server/server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');  // Rutas de autenticación
const productRoutes = require('./routes/products');  // Rutas de productos
const postRoutes = require('./routes/posts');  // Rutas de publicaciones
const reviewRoutes = require('./routes/reviews');  // Rutas de reseñas
const bookingRoutes = require('./routes/bookings');  // Rutas de reservas

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/posts', postRoutes);
app.use('/reviews', reviewRoutes);
app.use('/bookings', bookingRoutes); // Asegúrate de que esta línea esté presente

// Servir la carpeta de uploads para que las imágenes sean accesibles
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos del frontend (React)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Ruta principal para la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));