const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté correctamente configurada
const bcrypt = require('bcryptjs'); // Importar bcrypt para encriptar contraseñas

// Función para obtener todas las postulaciones
const getPostulaciones = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.postulaciones');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error al obtener las postulaciones:', err);
    res.status(500).json({ msg: 'Error al obtener las postulaciones' });
  }
};

// Función para obtener una postulación por ID
const getPostulacionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public.postulaciones WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Postulación no encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener la postulación:', err);
    res.status(500).json({ msg: 'Error al obtener la postulación' });
  }
};

// Función para agregar una nueva postulación
const addPostulacion = async (req, res) => {
    const { username, email, password, role } = req.body;
    let requisitos = []

    if(req.files){
        requisitos = req.files.map(file => file.filename);
    }
  
    try {
      const result = await pool.query(
        'INSERT INTO postulaciones (username, email, password, role, requisitos) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [username, email, password, role, requisitos]
      );
      res.status(201).json(result.rows);
    } catch (err) {
      console.error('Error al agregar la postulación:', err);
      res.status(500).json({ msg: 'Error al agregar la postulación' });
    }
  };
  
// Función para aprobar una postulación
const approvePostulacion = async (req, res) => {
    const { id } = req.params;  // ID de la postulación
    const { username, email, password } = req.body; // Datos del nuevo tatuador
  
    try {
      // 1. Aprobar la postulación
      const result = await pool.query(
        'UPDATE postulaciones SET aprobado = TRUE WHERE id = $1 RETURNING *',
        [id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: 'Postulación no encontrada' });
      }
  
      // 2. Comprobar si el usuario ya existe
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ msg: 'El usuario ya existe' });
      }
  
      // 3. Crear un nuevo usuario con el rol 'tattoo_artist'
      // Si estamos aquí, la postulación fue aprobada, ahora podemos crear el usuario
      if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Faltan datos para crear el usuario' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, hashedPassword, 'tattoo_artist']
      );
  
      // 4. Responder con la información del nuevo usuario y la postulación aprobada
      res.status(201).json({
        message: 'Postulación aprobada y nuevo tatuador registrado',
        postulation: result.rows[0], // Información de la postulación aprobada
        newUser: newUser.rows[0]      // Información del nuevo tatuador creado
      });
  
    } catch (err) {
      console.error('Error al aprobar la postulación:', err);
      res.status(500).json({ msg: 'Error al aprobar la postulación y registrar al tatuador' });
    }
  };
  
  

// Función para eliminar una postulación
const deletePostulacion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.postulaciones WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Postulación no encontrada' });
    }
    res.status(200).json({ msg: 'Postulación eliminada' });
  } catch (err) {
    console.error('Error al eliminar la postulación:', err);
    res.status(500).json({ msg: 'Error al eliminar la postulación' });
  }
};

module.exports = {
  getPostulaciones,
  getPostulacionById,
  addPostulacion,
  approvePostulacion,
  deletePostulacion,
};
