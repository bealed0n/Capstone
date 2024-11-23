const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = (req, res, next) => {
  console.log('Middleware de autenticación'); // Agrega este log
  const token = req.cookies.token;
  console.log('Token recibido:', token); // Agrega este log

  if (!token) {
    console.warn('Acceso denegado: No se encontró el token');
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    const verified = jwt.verify(token, config.jwtSecret);
    req.user = verified;
    console.log('Usuario autenticado:', req.user); // Log para verificar el usuario autenticado
    next();
  } catch (err) {
    console.error('Error de autenticación:', err.message);
    return res.status(401).json({ msg: 'Token no válido o expirado' });
  }
};

module.exports = authMiddleware;
