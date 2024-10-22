// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config'); // Importar la clave secreta desde el archivo de configuración

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No hay token, autorización denegada' });

  try {
    const verified = jwt.verify(token.split(' ')[1], config.jwtSecret); // Usar la clave secreta desde el archivo de configuración
    req.user = verified; // Guardar el usuario en la solicitud
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' });
  }

  
};

module.exports = authMiddleware;