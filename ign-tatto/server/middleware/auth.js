// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Obtener el token del encabezado de la solicitud
  const token = req.header('x-auth-token');

  // Si no hay token, denegar acceso
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, 'secret_key');  // Asegúrate de usar tu clave secreta real
    req.user = decoded;  // Guardar los datos del usuario en la solicitud
    next();  // Continuar al siguiente middleware o ruta
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' });
  }
};

module.exports = authMiddleware;
