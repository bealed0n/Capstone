const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Conexión a PostgreSQL
const config = require('../config'); // Importar la clave secreta desde el archivo de configuración


const addClient = async (req, res) => {
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
  };

  const addTattoArtist = async (req, res) => {
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
  };

  const addDesigner = async (req, res) => {
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
  };

  const addLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
        console.log('Usuario no encontrado');
        return res.status(400).json({ msg: 'Usuario no encontrado' });
      }
  
      const isMatch = await bcrypt.compare(password, user.rows[0].password);
      if (!isMatch) {
        console.log('Contraseña incorrecta');
        return res.status(400).json({ msg: 'Contraseña incorrecta' });
      }
  
      // Crear un token
      const payload = {
        id: user.rows[0].id,
        role: user.rows[0].role,
        username: user.rows[0].username,
      };
  
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
  
      // Configurar la cookie con el token
      res.cookie('token', token, {
        maxAge: 3600000, // 1 hora en milisegundos
      });
  
      console.log('Inicio de sesión exitoso');
      res.json({ msg: 'Inicio de sesión exitoso' });
    } catch (err) {
      console.error('Error al iniciar sesión:', err.message);
      res.status(500).json('Error del servidor');
    }};

    // controllers/controllerLoginRegister.js

// Función para obtener el perfil del usuario
// Función para obtener el perfil del usuario
const getProfile = async (req, res) => {
  const userId = req.user.id; // Asegúrate de que el middleware de autenticación asigna correctamente req.user.id

  try {
    // Obtener información básica del usuario
    const userResult = await pool.query(
      `SELECT id, username, email, role 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    const profile = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      publicaciones_liked: [],
      comentarios: [],
      productos_creados: [],
      posts_creados: [],
    };
    // Obtener la cantidad de seguidores
    const followersResult = await pool.query(
      `SELECT COUNT(*) AS followers_count FROM follows WHERE followed_id = $1`,
      [userId]
  );
  profile.seguidores = parseInt(followersResult.rows[0].followers_count, 10);

  // Obtener la cantidad de seguidos
  const followingResult = await pool.query(
      `SELECT COUNT(*) AS following_count FROM follows WHERE follower_id = $1`,
      [userId]
  );
  profile.seguidos = parseInt(followingResult.rows[0].following_count, 10);

    // Obtener publicaciones que ha "likeado"
    const likesResult = await pool.query(
      `SELECT l.id, l.post_id, p.image_url, p.description
       FROM likes l
       JOIN posts p ON l.post_id = p.id 
       WHERE l.user_id = $1`,
      [userId]
    );
    profile.publicaciones_liked = likesResult.rows;

    // Obtener comentarios que ha dejado
    const commentsResult = await pool.query(
      `SELECT c.id, c.post_id, p.image_url AS post_image_url, p.description AS post_description, c.text
       FROM comments c
       JOIN posts p ON c.post_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.id DESC`,
      [userId]
    );
    profile.comentarios = commentsResult.rows;

    // Obtener productos creados (si es un artista)
    if (user.role === 'tattoo_artist' || user.role === 'designer') {
      const productosResult = await pool.query(
        `SELECT id, name, description, price, image_url, stock 
         FROM products 
         WHERE user_id = $1
         ORDER BY id DESC`,
        [userId]
      );
      profile.productos_creados = productosResult.rows;
    }

    // Obtener publicaciones creadas
    const postsResult = await pool.query(
      `SELECT id, image_url, description
       FROM posts
       WHERE user_id = $1
       ORDER BY id DESC`,
      [userId]
    );
    profile.posts_creados = postsResult.rows;

   // Obtener horas agendadas para clientes
   if (user.role === 'client') {
    const reservationsResult = await pool.query(
      `SELECT 
         r.id, 
         a.id AS slot_id, 
         a.date, 
         a.time, 
         a.tattoo_artist_id, 
         u.username AS artist_username, 
         r.created_at,
         CONCAT(a.date::text, 'T', a.time::text) AS appointment_datetime
       FROM reservations r
       JOIN available_slots a ON r.slot_id = a.id
       JOIN users u ON a.tattoo_artist_id = u.id
       WHERE r.client_id = $1
       ORDER BY a.date DESC, a.time DESC`,
      [userId]
    );

    profile.horas_agendadas = reservationsResult.rows.map(reserva => ({
      ...reserva,
      appointment_datetime: reserva.appointment_datetime // Ya está en formato "YYYY-MM-DDTHH:MM:SS"
    }));
  }

 // Obtener reservas de clientes para artistas y diseñadores
if (user.role === 'tattoo_artist' || user.role === 'designer') {
  const artistReservationsResult = await pool.query(
    `SELECT 
       r.id, 
       a.id AS slot_id, 
       a.date, 
       a.time, 
       r.client_id, 
       u.username AS client_username, 
       r.created_at,
       TO_CHAR(a.date, 'YYYY-MM-DD') || 'T' || TO_CHAR(a.time, 'HH24:MI:SS') AS appointment_datetime
     FROM reservations r
     JOIN available_slots a ON r.slot_id = a.id
     JOIN users u ON r.client_id = u.id
     WHERE a.tattoo_artist_id = $1
     ORDER BY a.date DESC, a.time DESC`,
    [userId]
  );

  profile.horas_agendadas_con_clientes = artistReservationsResult.rows.map(reserva => ({
    ...reserva,
    appointment_datetime: reserva.appointment_datetime // Formato válido: "YYYY-MM-DDTHH:MM:SS"
  }));
}
    res.status(200).json({ profile });
  } catch (err) {
    console.error('Error al obtener el perfil del usuario:', err.stack);
    res.status(500).json({ msg: 'Error del servidor', error: err.message });
  }
};
    
// Obtener el perfil de un usuario específico
// Función para obtener el perfil de un usuario específico
const getUserProfile = async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user.id;
  try {
      // Obtener información básica del usuario
      const userResult = await pool.query(
          `SELECT id, username, email, role 
           FROM users 
           WHERE id = $1`,
          [userId]
      );

      if (userResult.rows.length === 0) {
          return res.status(404).json({ msg: 'Usuario no encontrado' });
      }

      const user = userResult.rows[0];
      const profile = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          publicaciones_liked: [],
          comentarios: [],
          productos_creados: [],
          posts_creados: [],
          reseñas: [],
          horas_agendadas: [],
          reservas_clientes: []
      };

        const followResult = await pool.query(
          `SELECT * FROM follows WHERE follower_id = $1 AND followed_id = $2`,
          [currentUserId, userId]
      );
      profile.isFollowing = followResult.rows.length > 0;

      // Obtener la cantidad de seguidores
      const followersResult = await pool.query(
          `SELECT COUNT(*) AS followers_count FROM follows WHERE followed_id = $1`,
          [userId]
      );
      profile.seguidores = parseInt(followersResult.rows[0].followers_count, 10);

      // Obtener la cantidad de seguidos
      const followingResult = await pool.query(
          `SELECT COUNT(*) AS following_count FROM follows WHERE follower_id = $1`,
          [userId]
      );
      profile.seguidos = parseInt(followingResult.rows[0].following_count, 10);

  
      // Obtener publicaciones que ha "likeado"
      const likesResult = await pool.query(
          `SELECT l.id, l.post_id, p.image_url, p.description
           FROM likes l
           JOIN posts p ON l.post_id = p.id 
           WHERE l.user_id = $1`,
          [userId]
      );
      profile.publicaciones_liked = likesResult.rows;

      // Obtener comentarios hechos por el usuario
      const commentsResult = await pool.query(
        `SELECT c.id, c.post_id, p.image_url AS post_image_url, p.description AS post_description, c.text
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        WHERE c.user_id = $1
        ORDER BY c.id DESC`,
          [userId]
      );
      profile.comentarios = commentsResult.rows;

      // Obtener posts creados por el usuario
      const postsResult = await pool.query(
        `SELECT id, image_url, description
        FROM posts
        WHERE user_id = $1
        ORDER BY id DESC`,
          [userId]
      );
      profile.posts_creados = postsResult.rows;

      // Obtener horas agendadas para clientes
      if (user.role === 'client') {
          const reservationsResult = await pool.query(
              `SELECT 
                  r.id, 
                  a.id AS slot_id, 
                  a.date, 
                  a.time, 
                  a.tattoo_artist_id, 
                  u.username AS artist_username, 
                  r.created_at,
                  CONCAT(a.date::text, 'T', a.time::text) AS appointment_datetime
              FROM reservations r
              JOIN available_slots a ON r.slot_id = a.id
              JOIN users u ON a.tattoo_artist_id = u.id
              WHERE r.client_id = $1
              ORDER BY a.date DESC, a.time DESC`,
              [userId]
          );

          profile.horas_agendadas = reservationsResult.rows.map(reserva => ({
              ...reserva,
              appointment_datetime: reserva.appointment_datetime // Ya está en formato "YYYY-MM-DDTHH:MM:SS"
          }));

          // Obtener reseñas hechas por el cliente
          const reviewsResult = await pool.query(
              `SELECT r.id, r.rating, r.review_text, r.created_at, p.name AS product_name
              FROM reviews r
              JOIN products p ON r.product_id = p.id
              WHERE r.user_id = $1
              ORDER BY r.created_at DESC`,
              [userId]
          );
          profile.reseñas = reviewsResult.rows;
      }

      // Obtener reservas de clientes para artistas y diseñadores
      if (user.role === 'tattoo_artist' || user.role === 'designer') {
          const artistReservationsResult = await pool.query(
              `SELECT 
                  r.id, 
                  a.id AS slot_id, 
                  a.date, 
                  a.time, 
                  r.client_id, 
                  u.username AS client_username, 
                  r.created_at,
                  CONCAT(a.date::text, 'T', a.time::text) AS appointment_datetime
              FROM reservations r
              JOIN available_slots a ON r.slot_id = a.id
              JOIN users u ON r.client_id = u.id
              WHERE a.tattoo_artist_id = $1
              ORDER BY a.date DESC, a.time DESC`,
              [userId]
          );

          profile.reservas_clientes = artistReservationsResult.rows.map(reserva => ({
              ...reserva,
              appointment_datetime: reserva.appointment_datetime // Ya está en formato "YYYY-MM-DDTHH:MM:SS"
          }));

          // Obtener productos creados por el artista del tatuaje
          const productsResult = await pool.query(
              `SELECT id, name, description, price
              FROM products
              WHERE user_id = $1
              ORDER BY id DESC`,
              [userId]
          );
          profile.productos_creados = productsResult.rows;

          // Obtener reseñas hechas al tatuador
          const tattooArtistReviewsResult = await pool.query(
            `SELECT r.id, r.rating, r.review_text, r.created_at, u.username AS reviewer_username
            FROM tattoo_artist_reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.tattoo_artist_id = $1
            ORDER BY r.created_at DESC`,
            [userId]
        );
        profile.reseñas_tatuador = tattooArtistReviewsResult.rows;


          
      }
      

      res.json(profile);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
  }
};

// Buscar usuarios por nombre
const searchUsers = async (req, res) => {
    const { username } = req.query;

    try {
        const query = `
            SELECT id, username, email, role
            FROM users
            WHERE username ILIKE $1
        `;
        const { rows } = await pool.query(query, [`%${username}%`]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al buscar usuarios' });
    }
};

// Función para seguir a un usuario
// Función para seguir a un usuario
const followUser = async (req, res) => {
  const followerId = req.user.id;
  const { followedId } = req.body;

  try {
      // Verificar si ya existe una relación de seguimiento
      const checkFollowResult = await pool.query(
          `SELECT * FROM follows WHERE follower_id = $1 AND followed_id = $2`,
          [followerId, followedId]
      );

      if (checkFollowResult.rows.length > 0) {
          return res.status(200).json({ msg: 'Ya sigues a este usuario', isFollowing: true });
      }

      // Insertar una nueva relación de seguimiento
      await pool.query(
          `INSERT INTO follows (follower_id, followed_id)
           VALUES ($1, $2)`,
          [followerId, followedId]
      );
      res.status(201).json({ msg: 'Usuario seguido exitosamente', isFollowing: true });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al seguir al usuario' });
  }
};

// Función para dejar de seguir a un usuario
const unfollowUser = async (req, res) => {
  const followerId = req.user.id;
  const { followedId } = req.body;

  try {
      await pool.query(
          `DELETE FROM follows
           WHERE follower_id = $1 AND followed_id = $2`,
          [followerId, followedId]
      );
      res.status(200).json({ msg: 'Usuario dejado de seguir exitosamente', isFollowing: false });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al dejar de seguir al usuario' });
  }
};
// Función para actualizar los datos del usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Actualizar los datos del usuario
    let hashedPassword = userExists.rows[0].password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await pool.query(
      'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING *',
      [username, email, hashedPassword, id]
    );

    res.status(200).json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Error del servidor');
  }
};
    module.exports = { addClient, addTattoArtist, followUser, unfollowUser, addDesigner, addLogin, getProfile, getUserProfile, searchUsers, updateUser
};