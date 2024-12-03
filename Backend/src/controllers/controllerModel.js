const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté correctamente configurada

// Controlador para agregar un modelo 3D
const addModel = async (req, res) => {
  const { name, description } = req.body;
  const modelUrl = req.file ? req.file.filename : null; // Asigna la ruta del modelo si existe

  // Definir userId correctamente
  const userId = req.user && req.user.id;
  if (!userId) {
    return res.status(401).json({ msg: 'Autenticación requerida' });
  }

  try {
    const newModel = await pool.query(
      'INSERT INTO models (name, description, model_url, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, modelUrl, userId]
    );

    res.status(201).json(newModel.rows[0]);
  } catch (err) {
    console.error('Error al agregar modelo 3D:', err.message);
    res.status(500).json('Error del servidor');
  }
};

// Controlador para obtener todos los modelos 3D
const getModels = async (req, res) => {
  try {
    const models = await pool.query('SELECT * FROM models');
    res.json(models.rows);
  } catch (err) {
    console.error('Error al obtener modelos 3D:', err.message);
    res.status(500).json('Error del servidor');
  }
};

const getModelById = async (req, res) => {
  const { id } = req.params;
  try {
    const modelQuery = `
      SELECT models.*, users.username
      FROM models
      JOIN users ON models.user_id = users.id
      WHERE models.id = $1
    `;
    const result = await pool.query(modelQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Modelo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el modelo 3D:', err.message);
    res.status(500).json('Error del servidor');
  }
};



module.exports = { addModel, getModels, getModelById };