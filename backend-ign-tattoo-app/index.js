const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

// Configuración de CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Asegúrate de que la carpeta 'uploads' exista
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Servir la carpeta 'uploads' de forma pública
app.use("/uploads", express.static(uploadsDir));

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: "admin-igntattoo",
  host: "localhost",
  database: "ign-tattoo-test",
  password: "1234",
  port: 5432,
});

// Crear un servidor HTTP y vincular Socket.IO
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Ajusta según sea necesario para tu desarrollo local
    methods: ["GET", "POST"],
  },
});

// Comunicación en tiempo real con Socket.IO
// En index.js

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`Usuario con ID ${userId} se ha unido a su sala personalizada`);
  });

  socket.on("message", async (messageData) => {
    console.log("Mensaje recibido en el servidor:", messageData);

    try {
      let imageUrl = null;

      if (messageData.image) {
        const base64Data = messageData.image.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `message-${Date.now()}.png`;
        const filepath = path.join(uploadsDir, filename);

        fs.writeFileSync(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
      }

      const query =
        "INSERT INTO messages (sender_id, receiver_id, content, image_url, sent_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *";
      const result = await pool.query(query, [
        messageData.sender_id,
        messageData.receiver_id,
        messageData.content,
        imageUrl,
      ]);

      const savedMessage = result.rows[0];

      io.to(messageData.receiver_id.toString()).emit(
        "newMessage",
        savedMessage
      );
      io.to(messageData.sender_id.toString()).emit("newMessage", savedMessage);
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Manejo de errores de conexión a PostgreSQL
pool.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
  } else {
    console.log("Conectado a la base de datos PostgreSQL");
  }
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

//----------------------------------------------------------------------------------------------------
//APARTADO PARA MANEJAR TODO LO RELACIONADO CON LOS USUARIOS
//----------------------------------------------------------------------------------------------------

// Ruta para logearse
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(query, [email]);

    if (rows.length > 0) {
      const user = rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password); // Compara la contraseña

      if (isValidPassword) {
        // Responde con el usuario
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        });
      } else {
        res.json({ success: false, message: "Contraseña incorrecta" });
      }
    } else {
      res.json({ success: false, message: "Usuario no encontrado" });
    }
  } catch (error) {
    console.log(error);
  }
});

// Ruta para registrar un usuario automaticamente rol de user
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
    await pool.query(query, [username, email, hashedPassword]);
    return res.status(200).json({ success: true, user: { username, email } });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error al registrar usuario" });
  }
});

//Obtener informacion de usuario
app.get("/users/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const query =
      "SELECT id,username,bio,profile_pic,role FROM users WHERE id = $1";
    const { rows } = await pool.query(query, [user_id]);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener la información del usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la información del usuario",
    });
  }
});

// Endpoint para buscar usuarios
app.get("/search/users", async (req, res) => {
  const { query } = req.query;

  try {
    const result = await pool.query(
      `SELECT id, username, profile_pic, role
             FROM users
             WHERE username ILIKE $1 AND role IN ('tattoo_artist', 'Designer')
             ORDER BY username ASC`,
      [`%${query}%`]
    );

    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.status(500).json({ message: "Error al buscar usuarios", error });
  }
});

//----------------------------------------------------------------------------------------------------
//FIN DE APARTADO DE USUARIOS
//----------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------
//APARTADO PARA MANEJAR TODO LO RELACIONADO CON LOS POSTEOS
//----------------------------------------------------------------------------------------------------

// Ruta para obtener los posts
app.get("/posts", async (req, res) => {
  const query = `
        SELECT posts.id, posts.user_id, users.username,users.role, posts.content, posts.image, posts.created_at
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC;
    `;
  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener los posts" });
  }
});

// Ruta para obtener los posts de un usuario
app.get("/posts/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const query = ` 
        SELECT posts.id, posts.user_id, users.username,users.role, posts.content, posts.image, posts.created_at
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.user_id = $1
        ORDER BY posts.created_at DESC;
    `;
  try {
    const { rows } = await pool.query(query, [user_id]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener los posts" });
  }
});

// Ruta para SUBIR posteo
app.post("/posts", upload.single("image"), async (req, res) => {
  const { content, user_id } = req.body;
  console.log("Datos recibidos:", { content, user_id }); // Agregar este log para verificar el userId

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const query =
      "INSERT INTO posts (user_id, content, image) VALUES ($1, $2, $3) RETURNING *";
    const result = await pool.query(query, [user_id, content, imageUrl]);

    res.status(200).json({ success: true, post: result.rows[0] });
  } catch (error) {
    console.error("Error al crear el post:", error);
    res.status(500).json({ success: false, message: "Error al crear el post" });
  }
});

// Ruta para contar las publicaciones de un usuario
app.get("/posts/count/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = "SELECT COUNT(*) AS post_count FROM posts WHERE user_id = $1";
    const { rows } = await pool.query(query, [user_id]);

    res.json({ post_count: rows[0].post_count });
  } catch (error) {
    console.error("Error al contar las publicaciones:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al contar las publicaciones" });
  }
});

// Endpoint para dar "like" a un post
app.post("/posts/:post_id/like", async (req, res) => {
  const { post_id } = req.params;
  const { user_id } = req.body;

  try {
    // Verificar si el usuario ya ha dado "like" al post
    const existingLike = await pool.query(
      "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
      [post_id, user_id]
    );

    if (existingLike.rows.length > 0) {
      return res.status(400).json({ message: "Ya has dado like a este post." });
    }

    // Insertar el "like" en la base de datos
    const result = await pool.query(
      "INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *",
      [post_id, user_id]
    );

    res.status(201).json({ success: true, like: result.rows[0] });
  } catch (error) {
    console.error("Error al dar like al post:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al dar like al post" });
  }
});

// Endpoint para quitar "like" a un post
app.delete("/posts/:post_id/unlike", async (req, res) => {
  const { post_id } = req.params;
  const { user_id } = req.body;

  try {
    // Eliminar el "like" de la base de datos
    const result = await pool.query(
      "DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING *",
      [post_id, user_id]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: "Like eliminado" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "No has dado like a este post." });
    }
  } catch (error) {
    console.error("Error al quitar like al post:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al quitar like al post" });
  }
});

app.post("/posts/:postId/isLiked", async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.body;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM likes WHERE post_id = $1 AND user_id = $2`,
      [postId, user_id]
    );

    const isLiked = result.rows[0].count > 0;

    res.status(200).json({ isLiked });
  } catch (error) {
    console.error("Error checking if post is liked:", error);
    res.status(500).json({ message: "Error checking if post is liked", error });
  }
});

// Endpoint para obtener los comentarios de un post
app.get("/posts/:post_id/comments", async (req, res) => {
  const { post_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT comments.id, comments.post_id, comments.user_id, users.username, comments.content, comments.created_at
             FROM comments
             JOIN users ON comments.user_id = users.id
             WHERE comments.post_id = $1
             ORDER BY comments.created_at ASC`,
      [post_id]
    );

    res.status(200).json({ comments: result.rows });
  } catch (error) {
    console.error("Error al obtener los comentarios:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los comentarios", error });
  }
});

// Endpoint para agregar un comentario a un post
app.post("/posts/:post_id/comments", async (req, res) => {
  const { post_id } = req.params;
  const { user_id, content } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [post_id, user_id, content]
    );

    res.status(201).json({ success: true, comment: result.rows[0] });
  } catch (error) {
    console.error("Error al agregar el comentario:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar el comentario",
      error,
    });
  }
});

//----------------------------------------------------------------------------------------------------
//FIN DE APARTADO DE POSTEOS
//----------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------
//APARTADO PARA OBTENER LOS INFORMACION SOBRE FOLLOWERS Y FOLLOWING DE USUARIOS
//----------------------------------------------------------------------------------------------------
// Ruta para seguir a un usuario
app.post("/follow", async (req, res) => {
  const { follower_id, following_id } = req.body;

  try {
    // Insertar en la tabla follows
    const query =
      "INSERT INTO follows (follower_id, following_id, followed_at) VALUES ($1, $2, NOW())";
    await pool.query(query, [follower_id, following_id]);

    res
      .status(200)
      .json({ success: true, message: "Usuario seguido exitosamente" });
  } catch (error) {
    console.error("Error al seguir al usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al seguir al usuario" });
  }
});

// Ruta para obtener un count de los seguidores de un usuario
app.get("/followers/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const query =
      "SELECT COUNT(*) AS follower_count FROM follows WHERE following_id = $1";
    const { rows } = await pool.query(query, [user_id]);

    res.json({ follower_count: rows[0].follower_count });
  } catch (error) {
    console.error("Error al contar los seguidores:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al contar los seguidores" });
  }
});

// Ruta para contar los seguidos de un usuario
app.get("/following/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const query =
      "SELECT COUNT(*) AS following_count FROM follows WHERE follower_id = $1";
    const { rows } = await pool.query(query, [user_id]);

    res.json({ following_count: rows[0].following_count });
  } catch (error) {
    console.error("Error al contar los seguidos:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al contar los seguidos" });
  }
});

// Ruta para obtener la lista de seguidores de un usuario
app.get("/followers/list/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
            SELECT users.id, users.username, users.profile_pic 
            FROM follows
            JOIN users ON follows.follower_id = users.id
            WHERE follows.following_id = $1
        `;
    const { rows } = await pool.query(query, [user_id]);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener la lista de seguidores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la lista de seguidores",
    });
  }
});

// Ruta para dejar de seguir a un usuario
app.delete("/unfollow", async (req, res) => {
  const { follower_id, following_id } = req.body;

  try {
    const query =
      "DELETE FROM followers WHERE follower_id = $1 AND following_id = $2";
    const result = await pool.query(query, [follower_id, following_id]);

    if (result.rowCount > 0) {
      res.json({ success: true, message: "Has dejado de seguir al usuario" });
    } else {
      res.json({
        success: false,
        message: "No estabas siguiendo a este usuario",
      });
    }
  } catch (error) {
    console.error("Error al dejar de seguir al usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al dejar de seguir al usuario" });
  }
});
// Ruta para obtener la lista de seguidos de un usuario
app.get("/following/list/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
            SELECT users.id, users.username, users.profile_pic 
            FROM follows
            JOIN users ON follows.following_id = users.id
            WHERE follows.follower_id = $1
        `;
    const { rows } = await pool.query(query, [user_id]);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener la lista de seguidos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la lista de seguidos",
    });
  }
});
//----------------------------------------------------------------------------------------------------
//FIN DE APARTADO DE SEGUIDORES Y SEGUIDOS
//----------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------
//APARTADO PARA LA GESTION DE CITAS DEL TAUTADOR
//----------------------------------------------------------------------------------------------------

// Ruta para registrar horarios de disponibilidad de un tatuador
app.post("/tattoo-artist/:tattoo_artist_id/availability", async (req, res) => {
  const { tattoo_artist_id } = req.params;
  const { date, start_time, end_time, is_available, description } = req.body;

  try {
    // Intentar hacer un `UPDATE` primero
    const updateResult = await pool.query(
      `UPDATE tattoo_artist_availability
             SET start_time = $3, end_time = $4, is_available = $5, description = $6
             WHERE tattoo_artist_id = $1 AND date = $2
             RETURNING *`,
      [tattoo_artist_id, date, start_time, end_time, is_available, description]
    );

    if (updateResult.rows.length > 0) {
      // Si el `UPDATE` afecta a alguna fila, enviar la fila actualizada como respuesta
      return res.status(200).json({
        success: true,
        message: "Disponibilidad actualizada",
        availability: updateResult.rows[0],
      });
    }

    // Si el `UPDATE` no afecta ninguna fila, hacer un `INSERT`
    const insertResult = await pool.query(
      `INSERT INTO tattoo_artist_availability (tattoo_artist_id, date, start_time, end_time, is_available, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      [tattoo_artist_id, date, start_time, end_time, is_available, description]
    );

    res.status(201).json({
      success: true,
      message: "Disponibilidad creada",
      availability: insertResult.rows[0],
    });
  } catch (error) {
    console.error("Error al agregar o modificar la disponibilidad:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar o modificar la disponibilidad",
      error: error.message,
    });
  }
});

// Ruta para obtener la disponibilidad (fechas) de un tatuador
app.get("/tattoo-artist/:tattoo_artist_id/availability", async (req, res) => {
  const { tattoo_artist_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM tattoo_artist_availability WHERE tattoo_artist_id = $1 AND is_available = TRUE ORDER BY date`,
      [tattoo_artist_id]
    );
    res.status(200).json({ availability: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener disponibilidad", error });
  }
});

// endpoint para crear una cita
app.post(
  "/appointments",
  upload.single("reference_image"),
  async (req, res) => {
    const { user_id, tattoo_artist_id, date, time, description } = req.body;
    let referenceImageUrl = null;

    // Guardar la referencia de la imagen directamente sin intentar convertir o eliminar
    if (req.file) {
      referenceImageUrl = `/uploads/${req.file.filename}`;
    }

    try {
      // Verificar si ya existe una cita para el tatuador en esa fecha y hora
      const existingAppointment = await pool.query(
        `SELECT * FROM appointments 
             WHERE tattoo_artist_id = $1 AND date = $2 AND time = $3`,
        [tattoo_artist_id, date, time]
      );

      if (existingAppointment.rows.length > 0) {
        return res.status(400).json({
          message:
            "Ya existe una cita en la fecha y hora seleccionadas para este tatuador.",
        });
      }

      // Verificar disponibilidad del tatuador en la fecha y hora solicitada
      const availability = await pool.query(
        `SELECT * FROM tattoo_artist_availability 
             WHERE tattoo_artist_id = $1 AND date = $2 AND is_available = TRUE 
             AND start_time <= $3 AND end_time >= $3`,
        [tattoo_artist_id, date, time]
      );

      if (availability.rows.length === 0) {
        return res.status(400).json({
          message:
            "El tatuador no está disponible en la fecha y hora seleccionadas.",
        });
      }

      // Crear la cita si no existe ninguna en la fecha y hora solicitadas
      const result = await pool.query(
        `INSERT INTO appointments (user_id, tattoo_artist_id, date, time, description, reference_image_url, status) 
            VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING *`,
        [user_id, tattoo_artist_id, date, time, description, referenceImageUrl]
      );

      res.status(201).json({ appointment: result.rows[0] });
    } catch (error) {
      console.error("Error al crear la cita:", error);
      res.status(500).json({ message: "Error al crear la cita", error });
    }
  }
);

// Ruta para obtener las citas de un tatuador
app.get("/tattoo-artist/:tattoo_artist_id/appointments", async (req, res) => {
  const { tattoo_artist_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT appointments.id, users.username,appointments.user_id, appointments.tattoo_artist_id, appointments.date,
                appointments.time, appointments.description, appointments.status, appointments.reference_image_url
                FROM appointments
                JOIN users ON appointments.user_id = users.id
                WHERE tattoo_artist_id = $1 ORDER BY date DESC, time`,
      [tattoo_artist_id]
    );
    res.status(200).json({ appointments: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las citas", error });
  }
});

// Ruta para obtener las citas de un  cliente
app.get("/user/:user_id/appointments", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT appointments.id, users.username,appointments.user_id, appointments.tattoo_artist_id, appointments.date,
                appointments.time, appointments.description, appointments.status, appointments.reference_image_url
                FROM appointments
                JOIN users ON appointments.tattoo_artist_id = users.id
                WHERE user_id = $1 ORDER BY date DESC, time`,
      [user_id]
    );
    res.status(200).json({ appointments: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las citas", error });
  }
});

//Endpoint para actualizar el estado de una cita
app.put("/appointments/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, message, sender_id, receiver_id } = req.body;

  try {
    // Actualizar el estado de la cita
    const result = await pool.query(
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length > 0) {
      // Enviar mensaje al cliente
      await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)",
        [sender_id, receiver_id, message]
      );

      res.status(200).json({ success: true, appointment: result.rows[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment status",
      error,
    });
  }
});
//----------------------------------------------------------------------------------------------------
//ENDPOINTS PARA LA GESTION DE DISEÑOS
//----------------------------------------------------------------------------------------------------

// Endpoint para crear un diseño
app.post("/designer/projects", upload.single("image"), async (req, res) => {
  const { designer_id, title, description, price, currency, is_available } =
    req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      "INSERT INTO designer_projects (designer_id, title, description, image, price, currency, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [designer_id, title, description, image, price, currency, is_available]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creando el proyecto del diseñador:", error);
    res.status(500).json({ error: "Error creando el proyecto del diseñador" });
  }
});

// Update the endpoint for creating a designer request
app.post(
  "/design-requests",
  upload.single("reference_image"),
  async (req, res) => {
    const { buyer_id, designer_id, project_id, status, message } = req.body;
    const reference_image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const result = await pool.query(
        `INSERT INTO design_requests (buyer_id, designer_id, project_id, status, message, reference_image) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
        [buyer_id, designer_id, project_id, status, message, reference_image]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creando la solicitud de diseño:", error);
      res.status(500).json({ error: "Error creando la solicitud de diseño" });
    }
  }
);

// Endpoint to update designer's preference to accept custom designs
app.patch("/users/:designer_id/accepts-custom-designs", async (req, res) => {
  const { designer_id } = req.params;
  const { accepts_custom_designs } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET accepts_custom_designs = $1 WHERE id = $2 AND role = 'designer' RETURNING *",
      [accepts_custom_designs, designer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Designer not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating designer preference:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch all available designs
app.get("/designer-projects", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dp.*, u.username
       FROM designer_projects dp
       JOIN users u ON dp.designer_id = u.id
       WHERE dp.is_available = TRUE`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching available designs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/designer/projects/:project_id/availability", async (req, res) => {
  const { project_id } = req.params;
  const { is_available } = req.body;

  try {
    const result = await pool.query(
      "UPDATE designer_projects SET is_available = $1 WHERE id = $2 RETURNING *",
      [is_available, project_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating project availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to create a design request
app.post("/design-requests", async (req, res) => {
  const { buyer_id, designer_id, project_id, message } = req.body;

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // Insert the design request
    const requestQuery = `
      INSERT INTO design_requests (buyer_id, designer_id, project_id, message, status) 
      VALUES ($1, $2, $3, $4, 'pending') 
      RETURNING *
    `;
    const requestResult = await pool.query(requestQuery, [
      buyer_id,
      designer_id,
      project_id,
      message,
    ]);

    // Update the project status
    const updateProjectQuery = `
      UPDATE designer_projects 
      SET status = 'pending' 
      WHERE id = $1
    `;
    await pool.query(updateProjectQuery, [project_id]);

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      request: requestResult.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error creating design request:", error);
    res.status(500).json({
      success: false,
      message: "Error creating design request",
    });
  }
});

// Endpoint para obtener las solicitudes de diseño personalizadas
app.get("/design-requests/custom", async (req, res) => {
  try {
    const query = `
      SELECT dr.*, u.username
      FROM design_requests dr
      JOIN users u ON dr.buyer_id = u.id
      WHERE dr.project_id IS NULL
      ORDER BY dr.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error al obtener las solicitudes de diseño personalizado:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Error al obtener las solicitudes de diseño personalizado",
    });
  }
});

app.get("/designer/projects/:designer_id", async (req, res) => {
  const { designer_id } = req.params;

  try {
    const query = `
      SELECT dp.*, u.username
      FROM designer_projects dp
      JOIN users u ON dp.designer_id = u.id
      WHERE dp.designer_id = $1 AND dp.is_available = TRUE
      ORDER BY dp.created_at DESC
    `;
    const values = [designer_id];
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los diseños del diseñador:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint for designers to fetch their design requests
app.get("/design-requests/designer/:designer_id", async (req, res) => {
  const { designer_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT dr.*, u.username as buyer_username 
       FROM design_requests dr 
       JOIN users u ON dr.buyer_id = u.id 
       WHERE dr.designer_id = $1`,
      [designer_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo las solicitudes de diseño:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint para actualizar el estado de una solicitud de diseño
app.put("/design-requests/:request_id/status", async (req, res) => {
  const { request_id } = req.params;
  const { status, message } = req.body;

  try {
    const result = await pool.query(
      `UPDATE design_requests 
       SET status = $1, message = $2 
       WHERE id = $3 
       RETURNING *`,
      [status, message, request_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Solicitud de diseño no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error actualizando la solicitud de diseño:", error);
    res
      .status(500)
      .json({ error: "Error actualizando la solicitud de diseño" });
  }
});

// Endpoint for designers to send a message to the client
app.post("/design-requests/:request_id/message", async (req, res) => {
  const { request_id } = req.params;
  const { sender_id, message } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO messages (request_id, sender_id, message, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [request_id, sender_id, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error enviando el mensaje:", error);
    res.status(500).json({ error: "Error enviando el mensaje" });
  }
});

// Endpoint to fetch messages for a design request
app.get("/design-requests/:request_id/messages", async (req, res) => {
  const { request_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, u.username as sender_username 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.request_id = $1
       ORDER BY m.created_at ASC`,
      [request_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo los mensajes:", error);
    res.status(500).json({ error: "Error obteniendo los mensajes" });
  }
});

//----------------------------------------------------------------------------------------------------
//APARTADO PARA LA MENSAJERIA
//----------------------------------------------------------------------------------------------------

// Endpoint para enviar un mensaje
app.post("/messages", async (req, res) => {
  const { sender_id, receiver_id, content, image_url } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, content, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [sender_id, receiver_id, content, image_url]
    );

    const newMessage = result.rows[0];
    res.status(201).json({ message: newMessage });

    // Emitir el nuevo mensaje a los clientes conectados
    io.emit("newMessage", newMessage); // Envía a todos los clientes
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Obtener los mensajes de un usuario
// Obtener los mensajes de un usuario
app.get("/user/:id/messages", async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching messages for user ID: ${id}`);

  try {
    const result = await pool.query(
      `SELECT 
                messages.*,
                sender.username AS sender_username,
                receiver.username AS receiver_username
             FROM messages
             JOIN users AS sender ON messages.sender_id = sender.id
             JOIN users AS receiver ON messages.receiver_id = receiver.id
             WHERE messages.sender_id = $1 OR messages.receiver_id = $1
             ORDER BY messages.sent_at ASC`,
      [id]
    );

    res.status(200).json({ messages: result.rows });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

// Obtener las conversaciones únicas de un usuario con el nombre de usuario
app.get("/user/:id/conversations", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
                messages.id,
                messages.sender_id,
                sender.username AS sender_username,
                messages.receiver_id,
                receiver.username AS receiver_username,
                messages.content,
                messages.image_url,
                messages.sent_at,
                messages.is_read
             FROM messages
             JOIN users AS sender ON sender.id = messages.sender_id
             JOIN users AS receiver ON receiver.id = messages.receiver_id
             WHERE sender_id = $1 OR receiver_id = $1
             ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), messages.sent_at DESC`,
      [id]
    );

    res.status(200).json({ conversations: result.rows });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations", error });
  }
});
//----------------------------------------------------------------------------------------------------
//FIN DE APARTADO DE MENSAJERIA
//----------------------------------------------------------------------------------------------------

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
