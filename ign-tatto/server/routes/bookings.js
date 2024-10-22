// server/routes/bookings.js
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Ruta para que los tatuadores creen horas disponibles
router.post('/create', authMiddleware, async (req, res) => {
  if (req.user.role !== 'tattoo_artist') {
    return res.status(403).json({ msg: 'Solo los tatuadores pueden crear horas disponibles.' });
  }

  const { date, time } = req.body;

  try {
    const newBooking = await pool.query(
      'INSERT INTO available_slots (tattoo_artist_id, date, time) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, date, time]
    );

    res.status(201).json(newBooking.rows[0]);
  } catch (err) {
    console.error('Error al crear horas disponibles:', err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para que los clientes reserven horas
router.post('/reserve', authMiddleware, async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ msg: 'Solo los clientes pueden reservar horas.' });
  }

  const { slot_id } = req.body;

  try {
    const newReservation = await pool.query(
      'INSERT INTO reservations (client_id, slot_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, slot_id]
    );

    res.status(201).json(newReservation.rows[0]);
  } catch (err) {
    console.error('Error al reservar horas:', err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para obtener las reservas de un cliente
// Ruta para obtener las reservas de un cliente
router.get('/my-reservations', authMiddleware, async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ msg: 'Solo los clientes pueden ver sus reservas.' });
  }

  try {
    const reservations = await pool.query(
      'SELECT * FROM reservations WHERE client_id = $1',
      [req.user.id]
    );

    res.json(reservations.rows);
  } catch (err) {
    console.error('Error al obtener reservas:', err.message);
    res.status(500).json('Error del servidor');
  }
});

// Ruta para obtener las reservas de un cliente
router.get('/my-reservations', authMiddleware, async (req, res) => {
    if (req.user.role !== 'client') {
      return res.status(403).json({ msg: 'Solo los clientes pueden ver sus reservas.' });
    }
  
    try {
      const reservations = await pool.query(
        'SELECT * FROM reservations WHERE client_id = $1',
        [req.user.id]
      );
  
      res.json(reservations.rows);
    } catch (err) {
      console.error('Error al obtener reservas:', err.message);
      res.status(500).json('Error del servidor');
    }
  });
// Ruta para obtener todas las horas disponibles
// Ruta para obtener todas las horas disponibles
router.get('/available-slots', async (req, res) => {
    try {
      const slots = await pool.query(`
        SELECT available_slots.id, available_slots.date, available_slots.time, users.username
        FROM available_slots
        JOIN users ON available_slots.tattoo_artist_id = users.id
      `);
      res.json(slots.rows);
    } catch (err) {
      console.error('Error al obtener horas disponibles:', err.message);
      res.status(500).json('Error del servidor');
    }
  });
module.exports = router;