// controllers/reservationController.js
const db = require('../db');

// Publicar horas disponibles (Solo artistas)
exports.publishHours = async (req, res) => {
  const { date, time } = req.body;
  const tattooArtistId = req.user.id;

  try {
    const query = `
      INSERT INTO available_slots (tattoo_artist_id, date, time)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [tattooArtistId, date, time];
    const result = await db.query(query, values);
    res.status(201).json({ msg: 'Horas publicadas exitosamente', slot: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
};

// Reservar una hora (Solo clientes)
exports.reserveHour = async (req, res) => {
  const { slotId } = req.body;
  const clientId = req.user.id;

  try {
    await db.query('BEGIN');

    // Verificar disponibilidad del slot
    const checkQuery = `
      SELECT * FROM available_slots
      WHERE id = $1
      AND NOT EXISTS (
        SELECT 1 FROM reservations
        WHERE slot_id = available_slots.id
      )
      FOR UPDATE;
    `;
    const checkResult = await db.query(checkQuery, [slotId]);

    if (checkResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ msg: 'Hora no disponible o ya reservada' });
    }

    // Crear la reserva
    const insertQuery = `
      INSERT INTO reservations (client_id, slot_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const insertValues = [clientId, slotId];
    const insertResult = await db.query(insertQuery, insertValues);

    await db.query('COMMIT');
    res.status(201).json({ msg: 'Hora reservada exitosamente', reservation: insertResult.rows[0] });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
};

// Obtener horas disponibles de un artista
exports.getAvailableHours = async (req, res) => {
  const { artistId } = req.params;

  try {
    const query = `
      SELECT aslots.id, aslots.date, aslots.time
      FROM available_slots aslots
      LEFT JOIN reservations res ON aslots.id = res.slot_id
      WHERE aslots.tattoo_artist_id = $1
      AND res.id IS NULL
      ORDER BY aslots.date, aslots.time;
    `;
    const result = await db.query(query, [artistId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
};

exports.getArtists = async (req, res) => {
  try {
    const query = `
      SELECT id, username
      FROM users 
      WHERE role = 'tattoo_artist'
      ORDER BY username;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener la lista de tatuadores:', err.message);
    res.status(500).send('Error del Servidor');
  }
};