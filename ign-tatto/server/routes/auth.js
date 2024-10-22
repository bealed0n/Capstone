const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Conexión a PostgreSQL
const authMiddleware = require('../middleware/auth'); // Middleware de autenticación
const config = require('../config'); // Importar la clave secreta desde el archivo de configuración


const router = express.Router();

// Ruta para registrar Cliente
router.post('/client/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, 'client']
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para registrar Tatuador
router.post('/tattoo_artist/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, 'tattoo_artist']
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para registrar Diseñador
router.post('/designer/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, 'designer']
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    const payload = {
      id: user.rows[0].id,
      role: user.rows[0].role,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' }); // Usar la clave secreta desde el archivo de configuración
    res.json({ token });
  } catch (err) {
    console.error('Error al iniciar sesión:', err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para obtener los datos del perfil
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Obtener el ID del usuario desde el token JWT
    const userId = req.user.id;

    // Consultar los datos del usuario desde la base de datos
    const user = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Devolver los datos del usuario
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Error del servidor');
  }
});

module.exports = router;