// backend/src/controllers/designController.js
const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté correctamente configurada

// Controlador para subir un diseño
const uploadDesign = async (req, res) => {
  try {
    // Verifica si el archivo fue recibido
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const { description } = req.body;
    const imageUrl = req.file.filename;
    const { estilo } = req.body;

    // Inserta el diseño en la base de datos
    const newDesign = await pool.query(
      'INSERT INTO designs (user_id, image_url, description, estilo) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, imageUrl, description, estilo]
    );

    res.status(201).json(newDesign.rows[0]);
  } catch (err) {
    console.error('Error al subir el diseño:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Controlador para obtener todos los diseños
const getDesigns = async (req, res) => {
  try {
    const designs = await pool.query(
      `SELECT designs.id, designs.image_url, designs.description, designs.estilo, users.username 
       FROM designs 
       JOIN users ON designs.user_id = users.id 
       ORDER BY designs.created_at DESC`
    );
    res.json(designs.rows);
  } catch (err) {
    console.error('Error al obtener los diseños:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
// Controlador para obtener un diseño por ID
const getDesignById = async (req, res) => {
  const { id } = req.params;
  try {
    const design = await pool.query(
      'SELECT designs.id, designs.image_url, designs.description, users.username FROM designs JOIN users ON designs.user_id = users.id WHERE designs.id = $1',
      [id]
    );
    if (design.rows.length === 0) {
      return res.status(404).json({ msg: 'Diseño no encontrado' });
    }
    res.json(design.rows[0]);
  } catch (err) {
    console.error('Error al obtener el diseño:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Controlador para buscar diseños por diferentes criterios
const searchDesigns = async (req, res) => {
  const { query, estilo } = req.query;

  try {
    let searchQuery = 'SELECT designs.id, designs.image_url, designs.description, users.username FROM designs JOIN users ON designs.user_id = users.id WHERE 1=1';
    const queryParams = [];

    if (query) {
      searchQuery += ` AND (designs.description ILIKE $${queryParams.length + 1} OR users.username ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${query}%`);
    }

    if (estilo) {
      searchQuery += ` AND designs.estilo = $${queryParams.length + 1}`;
      queryParams.push(estilo);
    }

    const designs = await pool.query(searchQuery, queryParams);
    res.json(designs.rows);
  } catch (err) {
    console.error('Error al buscar diseños:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = { uploadDesign, getDesigns, getDesignById, searchDesigns };