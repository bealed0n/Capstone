// server/server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Rutas de autenticación
const productRoutes = require('./routes/products'); // Rutas de productos

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas de autenticación (login y registro)
app.use('/auth', authRoutes);

// Rutas de productos (API)
app.use('/products', productRoutes);

// Servir archivos estáticos del frontend (React)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Ruta principal para la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
