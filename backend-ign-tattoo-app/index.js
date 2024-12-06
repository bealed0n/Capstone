const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { profile } = require("console");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;

// Configuración de CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  user: "dbuser",
  host: "localhost",
  database: "your_database",
  password: "your_password",
  port: 5432,
});

// Crear un servidor HTTP y vincular Socket.IO
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
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

      // Fetch sender information
      const senderQuery =
        "SELECT username, profile_pic FROM users WHERE id = $1";
      const senderResult = await pool.query(senderQuery, [
        messageData.sender_id,
      ]);
      const senderInfo = senderResult.rows[0];

      const query =
        "INSERT INTO messages (sender_id, receiver_id, content, image_url, sent_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *";
      const result = await pool.query(query, [
        messageData.sender_id,
        messageData.receiver_id,
        messageData.content,
        imageUrl,
      ]);

      const savedMessage = result.rows[0];

      // Combine saved message with sender info
      const messageWithSenderInfo = {
        ...savedMessage,
        sender_username: senderInfo.username,
        sender_profile_pic: senderInfo.profile_pic,
      };

      io.to(messageData.receiver_id.toString()).emit(
        "newMessage",
        messageWithSenderInfo
      );
      io.to(messageData.sender_id.toString()).emit(
        "newMessage",
        messageWithSenderInfo
      );
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

      // Verificar si el usuario está verificado
      if (!user.is_verified) {
        return res.json({
          success: false,
          message: "Por favor verifica tu correo antes de iniciar sesión.",
        });
      }

      // Validar la contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword) {
        // Obtener la URL base del servidor
        const serverUrl = req.protocol + "://" + req.get("host");

        // Responde con el usuario y la URL completa de la imagen
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            name: user.name,
            bio: user.bio,
            profile_pic: user.profile_pic,
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
    res.json({ success: false, message: "Error en el servidor" });
  }
});

// Endpoint para registrar usuarios con verificación
app.post("/register", upload.single("profile_pic"), async (req, res) => {
  const { username, email, password, name } = req.body;
  const profilePic = req.file
    ? `/uploads/${req.file.filename}`
    : "/uploads/user.png";

  try {
    // Verificar si el correo electrónico ya existe
    const emailCheckQuery = "SELECT * FROM users WHERE email = $1";
    const emailCheckResult = await pool.query(emailCheckQuery, [email]);
    if (emailCheckResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico ya está registrado.",
      });
    }

    // Verificar si el nombre de usuario ya existe
    const usernameCheckQuery = "SELECT * FROM users WHERE username = $1";
    const usernameCheckResult = await pool.query(usernameCheckQuery, [
      username,
    ]);
    if (usernameCheckResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya está registrado.",
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token único
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Valores predeterminados
    const bio = ".";

    // Insertar usuario en la base de datos
    const query = `
      INSERT INTO users (username, email, password, bio, profile_pic, name, is_verified, verification_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await pool.query(query, [
      username,
      email,
      hashedPassword,
      bio,
      profilePic,
      name,
      false,
      verificationToken,
    ]);

    // Configurar transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "yourmail@.com",
        pass: "password-app",
      },
    });

    // Enlace de verificación
    const verificationLink = `${req.protocol}://${req.get(
      "host"
    )}/verify-email?token=${verificationToken}`;

    // Enviar correo de verificación
    await transporter.sendMail({
      from: '"YOURAPP',
      to: email,
      subject: "Verifica tu correo",
      html: `
        <p>Hola ${username},</p>
        <p>Por favor verifica tu correo haciendo clic en el siguiente enlace:</p>
        <a href="${verificationLink}">${verificationLink}</a>        
      `,
    });

    res.status(200).json({
      success: true,
      message: "Usuario registrado. Revisa tu correo para verificarlo.",
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al registrar usuario" });
  }
});

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const query =
      "UPDATE users SET is_verified = $1, verification_token = NULL WHERE verification_token = $2 RETURNING id";
    const { rowCount } = await pool.query(query, [true, token]);

    if (rowCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Token inválido o expirado" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Correo verificado exitosamente" });
  } catch (error) {
    console.error("Error al verificar correo:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error al verificar el correo" });
  }
});

// Endpoint para solicitar el restablecimiento de contraseña
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el usuario existe
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Correo no encontrado." });
    }

    // Generar un token único para el restablecimiento de la contraseña
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");

    // Establecer el tiempo de expiración (ejemplo: 1 hora)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Guardar el token y la expiración en la base de datos
    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
      [resetPasswordToken, expires, email]
    );

    // Configurar el transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "yourmail@gmai.com",
        pass: "password-app",
      },
    });

    // Enlace de restablecimiento
    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/reset-password?token=${resetPasswordToken}`;

    // Enviar correo con el enlace para restablecer la contraseña
    await transporter.sendMail({
      from: '"app>',
      to: email,
      subject: "Restablecer tu contraseña",
      html: `
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para cambiar tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Revisa tu correo para restablecer la contraseña.",
    });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al enviar el correo." });
  }
});

app.get("/reset-password", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Token inválido o no proporcionado.");
  }

  // Verificar que el token existe y no haya expirado
  pool.query(
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
    [token],
    (err, result) => {
      if (err || result.rows.length === 0) {
        return res.status(400).send("El token es inválido o ha expirado.");
      }

      // Mostrar el formulario para restablecer la contraseña
      res.send(`
                <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Cambiar Contraseña</title>
          <style>
            /* Reset de estilos básicos */
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }

            .container {
              background-color: #ffffff;
              padding: 30px 40px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              width: 100%;
              max-width: 400px;
            }

            h2 {
              text-align: center;
              margin-bottom: 20px;
              color: #333333;
            }

            form {
              display: flex;
              flex-direction: column;
            }

            input[type="password"] {
              padding: 12px;
              margin-bottom: 15px;
              border: 1px solid #cccccc;
              border-radius: 5px;
              font-size: 16px;
              transition: border-color 0.3s;
            }

            input[type="password"]:focus {
              border-color: #007BFF;
              outline: none;
            }

            button {
              padding: 12px;
              background-color: #007BFF;
              color: #ffffff;
              border: none;
              border-radius: 5px;
              font-size: 16px;
              cursor: pointer;
              transition: background-color 0.3s;
            }

            button:hover {
              background-color: #0056b3;
            }

            .message {
              margin-top: 20px;
              text-align: center;
              font-size: 16px;
              color: #28a745;
            }

            .error {
              color: #dc3545;
              margin-bottom: 15px;
              text-align: center;
            }

            /* Modal de Éxito */
            .modal {
              display: none; /* Oculto por defecto */
              position: fixed;
              z-index: 1;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              overflow: auto;
              background-color: rgba(0,0,0,0.5); /* Fondo semi-transparente */
              justify-content: center;
              align-items: center;
            }

            .modal-content {
              background-color: #fefefe;
              padding: 20px 30px;
              border: 1px solid #888;
              border-radius: 10px;
              text-align: center;
              max-width: 400px;
              width: 90%;
            }

            .close-btn {
              background-color: #28a745;
              color: #ffffff;
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 15px;
              font-size: 16px;
            }

            .close-btn:hover {
              background-color: #218838;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Cambiar Contraseña</h2>
            <form id="reset-password-form">
              <input type="password" id="new-password" placeholder="Nueva contraseña" required />
              <input type="password" id="confirm-password" placeholder="Confirmar nueva contraseña" required />
              <button type="submit">Cambiar contraseña</button>
              <div id="error-message" class="error"></div>
            </form>
          </div>

          <!-- Modal de Éxito -->
          <div id="success-modal" class="modal">
            <div class="modal-content">
              <h3>Contraseña Actualizada</h3>
              <p>Tu contraseña ha sido cambiada con éxito. Puedes volver a la aplicación.</p>
              <button class="close-btn" id="close-modal-btn">Cerrar</button>
            </div>
          </div>

          <script>
            const form = document.getElementById("reset-password-form");
            const errorMessage = document.getElementById("error-message");
            const successModal = document.getElementById("success-modal");
            const closeModalBtn = document.getElementById("close-modal-btn");

            form.addEventListener("submit", async (e) => {
              e.preventDefault();

              const newPassword = document.getElementById("new-password").value;
              const confirmPassword = document.getElementById("confirm-password").value;

              if (newPassword !== confirmPassword) {
                errorMessage.textContent = "Las contraseñas no coinciden.";
                return;
              }

              const token = new URLSearchParams(window.location.search).get("token");

              try {
                const response = await fetch("/reset-password", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ token, newPassword }),
                });

                const data = await response.json();

                if (data.success) {
                  // Mostrar el modal de éxito
                  successModal.style.display = "flex";
                  // Limpiar el formulario y los mensajes de error
                  form.reset();
                  errorMessage.textContent = "";

                  // Cerrar automáticamente el modal después de 3 segundos
                  setTimeout(() => {
                    successModal.style.display = "none";
                    // Opcional: Puedes redirigir a otra página dentro de la app si lo deseas
                    // window.location.href = "/app-homepage"; // Cambia esto según la ruta de tu aplicación
                  }, 3000);
                } else {
                  errorMessage.textContent = data.message || "Hubo un error.";
                }
              } catch (error) {
                console.error("Error:", error);
                errorMessage.textContent = "Hubo un error en el servidor.";
              }
            });

            // Cerrar el modal cuando se hace clic en el botón
            closeModalBtn.addEventListener("click", () => {
              successModal.style.display = "none";
            });

            // Cerrar el modal cuando se hace clic fuera del contenido del modal
            window.addEventListener("click", (event) => {
              if (event.target == successModal) {
                successModal.style.display = "none";
              }
            });
          </script>
        </body>
        </html>
      `);
    }
  );
});

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verificar si el token es válido
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_password_token = $1",
      [token]
    );
    const user = result.rows[0];

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token inválido o expirado." });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña y limpiar el token
    await pool.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res
      .status(200)
      .json({ success: true, message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
});

//PARA POSTULACIONES DE ROL TATUADOR Y DISEÑADOR

// Endpoint para postular a rol
app.post(
  "/postulaciones",
  upload.fields([
    { name: "requisitos", maxCount: 1 },
    { name: "profile_pic", maxCount: 1 },
  ]),
  async (req, res) => {
    const { username, email, role, password, name } = req.body;
    let requisitos = null;
    let profilePic = null;

    if (req.files["requisitos"]) {
      requisitos = `/uploads/${req.files["requisitos"][0].filename}`;
    }

    if (req.files["profile_pic"]) {
      profilePic = `/uploads/${req.files["profile_pic"][0].filename}`;
    }

    try {
      // Verificar si el correo electrónico ya existe en la tabla de usuarios
      const emailCheckQuery = "SELECT * FROM users WHERE email = $1";
      const emailCheckResult = await pool.query(emailCheckQuery, [email]);
      if (emailCheckResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "El correo electrónico ya está registrado.",
        });
      }

      // Verificar si el nombre de usuario ya existe en la tabla de usuarios
      const usernameCheckQuery = "SELECT * FROM users WHERE username = $1";
      const usernameCheckResult = await pool.query(usernameCheckQuery, [
        username,
      ]);
      if (usernameCheckResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "El nombre de usuario ya está registrado.",
        });
      }

      // Hashear la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar la postulación en la tabla de postulaciones
      const result = await pool.query(
        `INSERT INTO postulaciones (username, email, role, password, requisitos, name, profile_pic, aprobado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE) RETURNING *`,
        [username, email, role, hashedPassword, requisitos, name, profilePic]
      );

      // Configurar transporte de Nodemailer
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "yourmail@gmail.com",
          pass: "password-app",
        },
      });

      // Enviar correo de notificación
      await transporter.sendMail({
        from: '"app',
        to: email,
        subject: "Postulación Recibida",
        html: `
        <p>Hola ${username},</p>
        <p>Hemos recibido tu postulación para el rol de ${role}.</p>
        <p>Nos pondremos en contacto contigo después de revisar tu solicitud.</p>
      `,
      });

      res.status(201).json({ postulacion: result.rows[0] });
    } catch (error) {
      console.error("Error al crear la postulación:", error);
      res.status(500).json({ message: "Error al crear la postulación", error });
    }
  }
);
//Endpoint para obtener todas las postulaciones
app.get("/postulaciones", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM postulaciones where aprobado = FALSE`
    );
    res.status(200).json({ postulaciones: result.rows });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las postulaciones", error });
  }
});

//Endpoint para aprobar una postulacion y mover los datos a la tabla de users
// Endpoint para aprobar postulación
app.post("/postulaciones/:id/aprobar", async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener la postulación por ID
    const postulacionResult = await pool.query(
      `SELECT * FROM postulaciones WHERE id = $1`,
      [id]
    );

    if (postulacionResult.rows.length === 0) {
      return res.status(404).json({ message: "Postulación no encontrada" });
    }

    const postulacion = postulacionResult.rows[0];

    // Definir bio según el rol
    const bio = postulacion.role === "tattoo_artist" ? "Tatuador" : "Diseñador";

    // Usar name y profile_pic de la postulación
    const name = postulacion.name;
    const profilePic = postulacion.profile_pic;

    // Insertar los datos en la tabla de users
    await pool.query(
      `INSERT INTO users (username, email, role, password, bio, profile_pic, name, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
      [
        postulacion.username,
        postulacion.email,
        postulacion.role,
        postulacion.password,
        bio,
        profilePic,
        name,
      ]
    );

    // Actualizar la postulación como aprobada
    await pool.query(`UPDATE postulaciones SET aprobado = TRUE WHERE id = $1`, [
      id,
    ]);

    // Configurar transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "yourmail@.com",
        pass: "password-app",
      },
    });

    // Enviar correo de notificación
    await transporter.sendMail({
      from: '"app',
      to: postulacion.email,
      subject: "Solicitud Aceptada",
      html: `
        <p>Hola ${postulacion.username},</p>
        <p>Nos complace informarte que tu solicitud para el rol de ${postulacion.role} ha sido aceptada.</p>
        <p>¡Bienvenido a nuestro equipo!</p>
      `,
    });

    res.status(200).json({ message: "Postulación aprobada y usuario creado" });
  } catch (error) {
    console.error("Error al aprobar la postulación:", error);
    res.status(500).json({ message: "Error al aprobar la postulación", error });
  }
});

// Endpoint para rechazar una postulacion
app.post("/postulaciones/:id/rechazar", async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener la postulación por ID
    const postulacionResult = await pool.query(
      `SELECT * FROM postulaciones WHERE id = $1`,
      [id]
    );

    if (postulacionResult.rows.length === 0) {
      return res.status(404).json({ message: "Postulación no encontrada" });
    }

    const postulacion = postulacionResult.rows[0];

    // Eliminar la postulación
    await pool.query(`DELETE FROM postulaciones WHERE id = $1`, [id]);

    // Configurar transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "yourmail@.com",
        pass: "password-app",
      },
    });

    // Enviar correo de notificación
    await transporter.sendMail({
      from: '"app',
      to: postulacion.email,
      subject: "Solicitud Rechazada",
      html: `
        <p>Hola ${postulacion.username},</p>
        <p>Lamentamos informarte que tu solicitud para el rol de ${postulacion.role} ha sido rechazada.</p>
        <p>Gracias por tu interés en unirte a la plataforma.</p>
      `,
    });

    res.status(200).json({ message: "Postulación rechazada" });
  } catch (error) {
    console.error("Error al rechazar la postulación:", error);
    res
      .status(500)
      .json({ message: "Error al rechazar la postulación", error });
  }
});

//Obtener informacion de usuario
app.get("/users/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const query =
      "SELECT id,username,bio,profile_pic,role,name FROM users WHERE id = $1";
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

// Endpoint para verificar si un usuario sigue a otro
app.get("/isFollowing", async (req, res) => {
  const { follower_id, following_id } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2",
      [follower_id, following_id]
    );
    res.status(200).json({ isFollowing: result.rows.length > 0 });
  } catch (error) {
    console.error("Error al verificar seguimiento:", error);
    res.status(500).json({ error: "Error al verificar seguimiento" });
  }
});

// Endpoint para seguir a un usuario
app.post("/follow", async (req, res) => {
  const { follower_id, following_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO follows (follower_id, following_id, followed_at) VALUES ($1, $2, NOW()) RETURNING *",
      [follower_id, following_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al seguir al usuario:", error);
    res.status(500).json({ error: "Error al seguir al usuario" });
  }
});

// Endpoint para dejar de seguir a un usuario
app.post("/unfollow", async (req, res) => {
  const { follower_id, following_id } = req.body;
  try {
    await pool.query(
      "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
      [follower_id, following_id]
    );
    res
      .status(200)
      .json({ message: "Se dejó de seguir al usuario correctamente" });
  } catch (error) {
    console.error("Error al dejar de seguir al usuario:", error);
    res.status(500).json({ error: "Error al dejar de seguir al usuario" });
  }
});

//APARTADO PARA LA EDICION DE PERFIL DE USUARIOS
//

//Endpoint para actualizar la imagen de perfil de un usuario
app.put(
  "/users/:user_id/profile-pic",
  upload.single("profile_pic"),
  async (req, res) => {
    const { user_id } = req.params;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const result = await pool.query(
        "UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING *",
        [imageUrl, user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating profile pic:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
//Endpoint para actualizar el nombre de usuario
app.put("/users/:user_id/username", async (req, res) => {
  const { user_id } = req.params;
  const { username } = req.body;

  try {
    // Verificar si el nombre de usuario ya existe
    const usernameCheckQuery = "SELECT * FROM users WHERE username = $1";
    const usernameCheckResult = await pool.query(usernameCheckQuery, [
      username,
    ]);
    if (usernameCheckResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya está registrado.",
      });
    }

    // Actualizar el nombre de usuario
    const result = await pool.query(
      "UPDATE users SET username = $1 WHERE id = $2 RETURNING *",
      [username, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint para actualizar el nombre real de un usuario
app.put("/users/:user_id/name", async (req, res) => {
  const { user_id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING *",
      [name, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint para actualizar la biografia de un usuario
app.put("/users/:user_id/bio", async (req, res) => {
  const { user_id } = req.params;
  const { bio } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET bio = $1 WHERE id = $2 RETURNING *",
      [bio, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating bio:", error);
    res.status(500).json({ error: "Internal server error" });
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
        SELECT posts.id, posts.user_id, users.username,users.role, posts.content, posts.image, posts.created_at, users.profile_pic
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
        SELECT posts.id, posts.user_id, users.username,users.role, posts.content, posts.image, posts.created_at, users.profile_pic
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

//Ruta para obtener los posteos de los usuarios que sigue un usuario
app.get("/posts/following/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT posts.id, posts.user_id, users.username, users.role, posts.content, posts.image, posts.created_at, users.profile_pic
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = $1)
         OR posts.user_id = $1
        ORDER BY posts.created_at DESC`,
      [user_id]
    );
    res.status(200).json({ posts: result.rows });
  } catch (error) {
    console.error("Error al obtener los posts de los seguidos:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los posts de los seguidos", error });
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
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------

//Endpoint para actualizar un post
app.put("/posts/:post_id", async (req, res) => {
  const { post_id } = req.params;
  const { content, user_id } = req.body;

  try {
    // Verificar que el post pertenece al usuario
    const postResult = await pool.query(
      "SELECT * FROM posts WHERE id = $1 AND user_id = $2",
      [post_id, user_id]
    );

    if (postResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Post not found or user not authorized" });
    }

    // Actualizar el contenido del post
    const result = await pool.query(
      "UPDATE posts SET content = $1 WHERE id = $2 RETURNING *",
      [content, post_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint para eliminar un post
app.delete("/posts/:post_id", async (req, res) => {
  const { post_id } = req.params;
  const { user_id } = req.body;

  try {
    // Verificar que el post pertenece al usuario
    const postResult = await pool.query(
      "SELECT * FROM posts WHERE id = $1 AND user_id = $2",
      [post_id, user_id]
    );

    if (postResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Post not found or user not authorized" });
    }

    // Eliminar el post
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [post_id]
    );

    res.json({
      success: true,
      message: "Post deleted successfully",
      post: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
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

//Endpoint todos los artistas en en aleatoriamente
app.get("/tattoo-artist/random", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE role = 'tattoo_artist' ORDER BY RANDOM()`
    );
    res.status(200).json({ tattoo_artists: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los tatuadores", error });
  }
});

//Endpoiont para obtener todos los diseñadores en aleatorio
app.get("/designer/random", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE role = 'Designer' ORDER BY RANDOM()`
    );
    res.status(200).json({ designers: result.rows });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los diseñadores", error });
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
  const { date, start_time, is_available, description } = req.body;

  try {
    // Intentar hacer un `UPDATE` primero
    const updateResult = await pool.query(
      `UPDATE tattoo_artist_availability
             SET start_time = $3, is_available = $4, description = $5
             WHERE tattoo_artist_id = $1 AND date = $2
             RETURNING *`,
      [tattoo_artist_id, date, start_time, is_available, description]
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
      `INSERT INTO tattoo_artist_availability (tattoo_artist_id, date, start_time, is_available, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
      [tattoo_artist_id, date, start_time, is_available, description]
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
      `SELECT * FROM tattoo_artist_availability WHERE tattoo_artist_id = $1 AND is_available = TRUE ORDER BY date DESC`, //ASD/ASDASD ASJDBASHJD SJANDJASND JANSDJ
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

    console.log("Datos recibidos:", {
      user_id,
      tattoo_artist_id,
      date,
      time,
      description,
    });

    if (req.file) {
      referenceImageUrl = `/uploads/${req.file.filename}`;
      console.log("Imagen de referencia recibida:", referenceImageUrl);
    }

    try {
      const existingAppointment = await pool.query(
        `SELECT * FROM appointments 
             WHERE tattoo_artist_id = $1 AND date = $2 AND time = $3`,
        [tattoo_artist_id, date, time]
      );

      if (existingAppointment.rows.length > 0) {
        console.log("Cita existente encontrada:", existingAppointment.rows);
        return res.status(400).json({
          message:
            "Ya existe una cita en la fecha y hora seleccionadas para este tatuador.",
        });
      }

      const availability = await pool.query(
        `SELECT * FROM tattoo_artist_availability 
             WHERE tattoo_artist_id = $1 AND date = $2 AND is_available = TRUE 
             AND start_time <= $3`,
        [tattoo_artist_id, date, time]
      );

      if (availability.rows.length === 0) {
        console.log("Disponibilidad no encontrada para el tatuador:", {
          tattoo_artist_id,
          date,
          time,
        });
        return res.status(400).json({
          message:
            "El tatuador no está disponible en la fecha y hora seleccionadas.",
        });
      }

      const result = await pool.query(
        `INSERT INTO appointments (user_id, tattoo_artist_id, date, time, description, reference_image_url, status) 
            VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING *`,
        [user_id, tattoo_artist_id, date, time, description, referenceImageUrl]
      );

      await pool.query(
        `UPDATE tattoo_artist_availability 
         SET is_available = FALSE 
         WHERE tattoo_artist_id = $1 AND date = $2 
           AND start_time <= $3`,
        [tattoo_artist_id, date, time]
      );

      console.log("Cita creada exitosamente:", result.rows[0]);
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

//Endpoint para cerrar un servicio cita
app.put("/appointments/:id/complete", async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener el ID del tatuador y el username del cliente desde la cita
    const appointmentResult = await pool.query(
      `SELECT 
         appointments.tattoo_artist_id, 
         users.username AS client_username 
       FROM appointments 
       JOIN users ON appointments.user_id = users.id 
       WHERE appointments.id = $1`,
      [id]
    );

    if (appointmentResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const { tattoo_artist_id, client_username } = appointmentResult.rows[0];

    // Actualizar el estado de la cita a "Completed"
    await pool.query(
      "UPDATE appointments SET status = 'Completed' WHERE id = $1",
      [id]
    );

    // Crear la reseña asociada con is_published = false
    await pool.query(
      `INSERT INTO reviews (appointment_id, tattoo_artist_id, client_username, is_published) 
       VALUES ($1, $2, $3, FALSE)`,
      [id, tattoo_artist_id, client_username]
    );

    res.status(200).json({
      success: true,
      message: "Appointment completed. Review created but not yet published.",
    });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res
      .status(500)
      .json({ success: false, message: "Error completing appointment", error });
  }
});

// Endpoint para subir una reseña
app.put("/reviews/:id", upload.single("tattoo_image"), async (req, res) => {
  const { id } = req.params; // ID de la reseña
  const { review_text, rating } = req.body; // El cliente envía solo texto y calificación
  let tattooImageUrl = null;

  // Manejo de la imagen
  if (req.file) {
    tattooImageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    // Actualizar la reseña y forzar `is_published` a true
    const result = await pool.query(
      `UPDATE reviews 
         SET review_text = $1, rating = $2, is_published = TRUE, tattoo_image_url = $3 
         WHERE id = $4 RETURNING *`,
      [review_text, rating, tattooImageUrl, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, review: result.rows[0] });
  } catch (error) {
    console.error("Error updating review:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating review", error });
  }
});

// Endpoint para obtener reseñas de un tatuador
app.get("/tattoo-artist/:tattoo_artist_id/reviews", async (req, res) => {
  const { tattoo_artist_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT review_text, rating, client_username, created_at, tattoo_image_url
       FROM reviews
       WHERE tattoo_artist_id = $1 and is_published = TRUE
       ORDER BY created_at DESC`,
      [tattoo_artist_id]
    );

    res.status(200).json({ reviews: result.rows });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews", error });
  }
});

// Endpoint para obtener las reseñas de un cliente
app.get("/user/:user_id/reviews", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT reviews.id, reviews.review_text, reviews.rating, 
              reviews.is_published, reviews.tattoo_image_url, 
              reviews.created_at, users.username AS tattoo_artist_name
       FROM reviews
       JOIN appointments ON reviews.appointment_id = appointments.id
       JOIN users ON reviews.tattoo_artist_id = users.id
       WHERE appointments.user_id = $1
       ORDER BY reviews.created_at ASC`,
      [user_id]
    );

    const published = result.rows.filter((review) => review.is_published);
    const notPublished = result.rows.filter((review) => !review.is_published);

    res.status(200).json({
      success: true,
      reviews: {
        published,
        notPublished,
      },
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching user reviews", error });
  }
});

//Endpoint para obtener las reseñas de un tatuador
app.get("/tattoo-artist/:tattoo_artist_id/reviews", async (req, res) => {
  const { tattoo_artist_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT reviews.id, reviews.review_text, reviews.rating, 
              reviews.is_published, reviews.tattoo_image_url, 
              reviews.created_at, users.username AS client_username
       FROM reviews
       JOIN appointments ON reviews.appointment_id = appointments.id
       JOIN users ON reviews.user_id = users.id
       WHERE appointments.tattoo_artist_id = $1
       ORDER BY reviews.created_at DESC`,
      [tattoo_artist_id]
    );

    const published = result.rows.filter((review) => review.is_published);
    const notPublished = result.rows.filter((review) => !review.is_published);

    res.status(200).json({
      success: true,
      reviews: {
        published,
        notPublished,
      },
    });
  } catch (error) {
    console.error("Error fetching tattoo artist reviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tattoo artist reviews",
      error,
    });
  }
});

//----------------------------------------------------------------------------------------------------
//ENDPOINTS PARA LA GESTION DE DISEÑOS PARA DISEÑADOR VISTAS
//----------------------------------------------------------------------------------------------------

// Endpoint para crear un diseño para diseñador (PARA DISEÑADOR)
app.post("/designer/projects", upload.single("image"), async (req, res) => {
  const { designer_id, title, description, price, currency, is_available } =
    req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      "INSERT INTO designer_projects (designer_id, title, description, image, price, currency, is_available, is_requested) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE) RETURNING *",
      [designer_id, title, description, image, price, currency, is_available]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creando el proyecto del diseñador:", error);
    res.status(500).json({ error: "Error creando el proyecto del diseñador" });
  }
});
// Endpoint para obtener los diseños de un diseñador en especifico para diseñador
app.get("/designer/projects/:designer_id", async (req, res) => {
  const { designer_id } = req.params;

  try {
    const query = `
      SELECT * FROM public.designer_projects
      WHERE designer_id = $1
      ORDER BY id DESC 
    `;
    const values = [designer_id];
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los diseños del diseñador:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Endpoint para updatear la disponibilidad de un proyecto
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

// Endpoint para actualizar el estado de un proyecto de diseño
app.put("/designer-projects/:id/is_available", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE designer_projects SET is_available = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

//Endpoint para actualizar el estado de un diseño solicitado
app.put("/designer-projects/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE requested_design SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Requested not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});
//Endpoint para obtener los diseños solicitados por un usuario
app.get("/requested-designs/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT requested_design.*, users.username FROM requested_design JOIN users on users.id = requested_design.designer_id WHERE user_id = $1 ORDER BY created_at DESC `,
      [user_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener los diseños solicitados:", error);
    res.status(500).json({ error: "Error al obtener los diseños solicitados" });
  }
});

// Endpoint para obtener los diseños solicitados para un diseñador
app.get("/designer-projects/:designer_id/requests", async (req, res) => {
  const { designer_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT requested_design.*, users.username FROM requested_design
      JOIN users ON requested_design.user_id = users.id
      WHERE designer_id = $1 ORDER BY requested_design.created_at DESC`,
      [designer_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener los diseños solicitados:", error);
    res.status(500).json({ error: "Error al obtener los diseños solicitados" });
  }
});

//----------------------------------------------------------------------------------------------------
//APARTADO PARA DISEÑOS PARTE VISTA PARA CLIETNES
//----------------------------------------------------------------------------------------------------
//Endpoint para obtener diseños disponibles de un diseñador en especifico
app.get("/designer/:designer_id/projects", async (req, res) => {
  const { designer_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM designer_projects WHERE designer_id = $1 AND is_available = TRUE AND is_requested = FALSE ORDER BY created_at DESC`,
      [designer_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener los proyectos del diseñador:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los proyectos del diseñador" });
  }
});

//Endpoint para solicitar diseño y actualizar estado de project
app.post("/request-design", async (req, res) => {
  const { user_id, designer_id, project_id, price, status, image } = req.body; // image viene del body directamente

  try {
    await pool.query("BEGIN"); // Iniciar transacción

    // Inserta en requested_design incluyendo la imagen
    const insertQuery = `
      INSERT INTO requested_design (user_id, designer_id, project_id, price, status, image)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const insertResult = await pool.query(insertQuery, [
      user_id,
      designer_id,
      project_id,
      price,
      status,
      image, // Incluye la ruta de la imagen en la base de datos
    ]);

    // Actualiza designer_projects
    const updateQuery = `
      UPDATE designer_projects
      SET is_requested = TRUE
      WHERE id = $1
      RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [Number(project_id)]);

    await pool.query("COMMIT"); // Confirma la transacción

    res.status(201).json({
      success: true,
      message: "Design requested successfully with image",
      request_id: insertResult.rows[0].id,
      updated_project: updateResult.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK"); // Deshace la transacción en caso de error
    console.error("Error requesting design:", error);
    res.status(500).json({ error: "Error requesting design" });
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

    let newMessage = result.rows[0];

    // Obtener información del remitente
    const senderResult = await pool.query(
      "SELECT username, profile_pic FROM users WHERE id = $1",
      [sender_id]
    );

    const senderInfo = senderResult.rows[0];

    // Agregar la información del remitente al mensaje
    newMessage = {
      ...newMessage,
      sender_username: senderInfo.username,
      sender_profile_pic: senderInfo.profile_pic,
    };

    res.status(201).json({ message: newMessage });

    // Emitir el nuevo mensaje a los clientes conectados
    io.emit("newMessage", newMessage); // Envía a todos los clientes
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Obtener los mensajes de un usuario
app.get("/user/:id/messages", async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching messages for user ID: ${id}`);

  try {
    const result = await pool.query(
      `SELECT 
                messages.*,
                sender.username AS sender_username,
                sender.profile_pic AS sender_profile_pic,
                receiver.username AS receiver_username,
                receiver.profile_pic AS receiver_profile_pic
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
                sender.profile_pic AS sender_profile_pic,
                messages.receiver_id,
                receiver.username AS receiver_username,
                receiver.profile_pic AS receiver_profile_pic,
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
//----------------------------------------------------------------------------------------------------
//APARTADO DE ESTUDIOS DE TATUAJE
//----------------------------------------------------------------------------------------------------
//Endpoint para crear un estudio de tatuaje
app.post("/tattoo-studios", upload.single("image"), async (req, res) => {
  const { owner_id, name, address, description } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Iniciar una transacción
    await pool.query("BEGIN");

    // Crear el estudio
    const studioResult = await pool.query(
      "INSERT INTO tattoo_studios (owner_id, name, address, description, image_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [owner_id, name, address, description, image_url, "active"]
    );

    const studioId = studioResult.rows[0].id;

    // Confirmar la transacción antes de insertar los slots
    await pool.query("COMMIT");

    // Crear 5 slots automáticamente (fuera de la transacción)
    const slotsPromises = [];
    for (let i = 1; i <= 5; i++) {
      slotsPromises.push(
        pool.query(
          "INSERT INTO studio_slots (studio_id, slot_number) VALUES ($1, $2)",
          [studioId, i]
        )
      );
    }
    await Promise.all(slotsPromises);

    // Devolver la información del estudio creado
    res.status(201).json({
      studio: studioResult.rows[0],
      message: "Estudio creado con 5 slots automáticamente",
    });
  } catch (error) {
    console.error("Error creando el estudio de tatuaje y sus slots:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Error creando el estudio de tatuaje" });
  }
});

//Endpoint para verificar si un usuario es propietario de un estudio
app.get("/tattoo-studios/is-owner/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, COUNT(*) AS studio_count FROM tattoo_studios WHERE owner_id = $1 GROUP BY id",
      [user_id]
    );

    // Verificar si hay algún estudio
    const isOwner = result.rows.length > 0;

    // Devolver el id del estudio y el conteo
    const studios = result.rows.map((row) => ({
      id: row.id,
      studio_count: parseInt(row.studio_count, 10),
    }));

    res.status(200).json({ isOwner, studios });
  } catch (error) {
    console.error(
      "Error verificando si el usuario es propietario de un estudio:",
      error
    );
    res.status(500).json({
      error: "Error verificando si el usuario es propietario de un estudio",
    });
  }
});

// Endpoint para obtener los slots disponibles
app.get("/available-slots", async (req, res) => {
  const { studio_id } = req.query;

  try {
    // Consulta para obtener los slots disponibles
    const result = await pool.query(
      `SELECT id, slot_number 
       FROM studio_slots 
       WHERE studio_id = $1 AND is_available = TRUE`,
      [studio_id]
    );

    // Verificar si hay slots disponibles
    const slots = result.rows;

    res.status(200).json({ slots });
  } catch (error) {
    console.error("Error al obtener los slots disponibles:", error);
    res.status(500).json({
      error: "Error al obtener los slots disponibles",
    });
  }
});

app.get("/tattoo-studios/is-member/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        ss.studio_id, 
        ts.name AS studio_name
      FROM studio_slots ss
      INNER JOIN tattoo_studios ts ON ss.studio_id = ts.id
      WHERE ss.assigned_tattoo_artist_id = $1
      `,
      [user_id]
    );

    // Verificar si el usuario pertenece a algún estudio
    const isMember = result.rows.length > 0;
    const studios = result.rows.map((row) => ({
      studio_id: row.studio_id,
      studio_name: row.studio_name,
    }));

    res.status(200).json({ isMember, studios });
  } catch (error) {
    console.error(
      "Error verificando si el usuario pertenece a algún estudio:",
      error
    );
    res.status(500).json({
      error: "Error verificando si el usuario pertenece a algún estudio",
    });
  }
});

//Endpoint para obtener todos los estudios de tatuaje en orden random
app.get("/tattoo-studios", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tattoo_studios ORDER BY RANDOM()`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener los estudios de tatuaje:", error);
    res.status(500).json({ error: "Error al obtener los estudios de tatuaje" });
  }
});

//Endpoint para obtener todos los datos sobre un estudio en especifico
app.get("/tattoo-studios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Información del estudio
    const studioQuery = `
      SELECT 
        ts.id AS studio_id,
        ts.name AS studio_name,
        ts.address,
        ts.description,
        ts.image_url,
        ts.created_at,
        u.username AS owner_name,
        u.email AS owner_email,
        u.id AS owner_id
      FROM tattoo_studios ts
      INNER JOIN users u ON ts.owner_id = u.id
      WHERE ts.id = $1
    `;

    const studioResult = await pool.query(studioQuery, [id]);

    if (studioResult.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    const studio = studioResult.rows[0];

    // Slots del estudio
    const slotsQuery = `
      SELECT 
        ss.slot_number,
        ss.is_available,
        u.username AS assigned_tattoo_artist
      FROM studio_slots ss
      LEFT JOIN users u ON ss.assigned_tattoo_artist_id = u.id
      WHERE ss.studio_id = $1
    `;

    const slotsResult = await pool.query(slotsQuery, [id]);

    // Tatuadores que trabajan en el estudio, incluyendo al propietario
    const tattooArtistsQuery = `
      SELECT DISTINCT 
        u.id AS artist_id,
        u.username AS artist_name,
        u.email AS artist_email,
        u.profile_pic
      FROM users u
      WHERE 
        (u.role = 'tattoo_artist' AND EXISTS (
          SELECT 1 FROM studio_slots ss WHERE ss.studio_id = $1 AND ss.assigned_tattoo_artist_id = u.id
        ))
        OR u.id = $2
    `;

    const artistsResult = await pool.query(tattooArtistsQuery, [
      id,
      studio.owner_id,
    ]);

    // Respuesta combinada
    const response = {
      studio,
      slots: slotsResult.rows,
      tattoo_artists: artistsResult.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener la información del estudio:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la información del estudio" });
  }
});

//Endpoint para obtener informacion mas precisa de un estudio
app.get("/tattoo-studio/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM tattoo_studios WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching studio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint para actualizar nombre de un estudio
app.put("/tattoo-studios/:id/name", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await pool.query(
      "UPDATE tattoo_studios SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating studio name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint para actualizar la dirección de un estudio
app.put("/tattoo-studios/:id/address", async (req, res) => {
  const { id } = req.params;
  const { address } = req.body;

  try {
    const result = await pool.query(
      "UPDATE tattoo_studios SET address = $1 WHERE id = $2 RETURNING *",
      [address, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating studio address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint para actualizar la descripción de un estudio
app.put("/tattoo-studios/:id/description", async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  try {
    const result = await pool.query(
      "UPDATE tattoo_studios SET description = $1 WHERE id = $2 RETURNING *",
      [description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating studio description:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint para actualizar la imagen de un estudio
app.put(
  "/tattoo-studios/:id/image",
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const result = await pool.query(
        "UPDATE tattoo_studios SET image_url = $1 WHERE id = $2 RETURNING *",
        [image_url, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Studio not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating studio image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

//endpoint para salir de un slot
app.put("/studio-slots/:id/leave", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE studio_slots SET assigned_tattoo_artist_id = NULL, is_available = TRUE WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error leaving slot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint para obtener id de slot de un tatuador
app.get("/tattoo-artist/:tattoo_artist_id/slot", async (req, res) => {
  const { tattoo_artist_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id FROM studio_slots WHERE assigned_tattoo_artist_id = $1",
      [tattoo_artist_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching slot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//SECCION DE INVITACIONES A TATUTADORESSS//
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//Endpoint para enviar una invitacion a un tatuador
app.post("/studio-invitations", async (req, res) => {
  const { studio_id, slot_id, tattoo_artist_id } = req.body;

  try {
    // Verificar que el slot pertenece al estudio y está disponible
    const slotResult = await pool.query(
      "SELECT * FROM studio_slots WHERE id = $1 AND studio_id = $2 AND is_available = TRUE",
      [slot_id, studio_id]
    );

    if (slotResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "El slot no es válido o no está disponible" });
    }

    // Crear la invitación
    const invitationResult = await pool.query(
      "INSERT INTO studio_invitations (studio_id, slot_id, tattoo_artist_id) VALUES ($1, $2, $3) RETURNING *",
      [studio_id, slot_id, tattoo_artist_id]
    );

    res.status(201).json(invitationResult.rows[0]);
  } catch (error) {
    console.error("Error al crear la invitación:", error);
    res.status(500).json({ error: "Error al crear la invitación" });
  }
});

//Endpoint para aceptar una invitación a un estudio
app.put("/studio-invitations/:id/accept", async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener la invitación
    const invitationResult = await pool.query(
      "SELECT * FROM studio_invitations WHERE id = $1",
      [id]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ error: "Invitación no encontrada" });
    }

    const invitation = invitationResult.rows[0];

    if (invitation.status !== "Pending") {
      return res
        .status(400)
        .json({ error: "La invitación ya ha sido procesada" });
    }

    // Actualizar el slot asignándolo al tatuador
    await pool.query(
      "UPDATE studio_slots SET assigned_tattoo_artist_id = $1, is_available = FALSE WHERE id = $2",
      [invitation.tattoo_artist_id, invitation.slot_id]
    );

    // Actualizar el estado de la invitación a 'Accepted'
    const updatedInvitationResult = await pool.query(
      "UPDATE studio_invitations SET status = 'Accepted', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    res.json(updatedInvitationResult.rows[0]);
  } catch (error) {
    console.error("Error al aceptar la invitación:", error);
    res.status(500).json({ error: "Error al aceptar la invitación" });
  }
});

//Endpoint para rechazar una invitación a un estudio
app.put("/studio-invitations/:id/reject", async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener la invitación
    const invitationResult = await pool.query(
      "SELECT * FROM studio_invitations WHERE id = $1",
      [id]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ error: "Invitación no encontrada" });
    }

    const invitation = invitationResult.rows[0];

    if (invitation.status !== "Pending") {
      return res
        .status(400)
        .json({ error: "La invitación ya ha sido procesada" });
    }

    // Actualizar el estado de la invitación a 'Rejected'
    const updatedInvitationResult = await pool.query(
      "UPDATE studio_invitations SET status = 'Rejected', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    res.json(updatedInvitationResult.rows[0]);
  } catch (error) {
    console.error("Error al rechazar la invitación:", error);
    res.status(500).json({ error: "Error al rechazar la invitación" });
  }
});

//Endpoint para obtener las invitaciones de un tatuador
app.get("/tattoo-artist/:tattoo_artist_id/invitations", async (req, res) => {
  const { tattoo_artist_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT si.*, ts.name AS studio_name, ss.slot_number
      FROM studio_invitations si
      INNER JOIN tattoo_studios ts ON si.studio_id = ts.id
      INNER JOIN studio_slots ss ON si.slot_id = ss.id
      WHERE si.tattoo_artist_id = $1 AND si.status = 'Pending'
      `,
      [tattoo_artist_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las invitaciones:", error);
    res.status(500).json({ error: "Error al obtener las invitaciones" });
  }
});

//Endpoint para obtener todas las invitaciones de un esutudio para administrador
app.get("/tattoo-studios/:studio_id/invitations", async (req, res) => {
  const { studio_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT si.*, u.username AS tattoo_artist_name
      FROM studio_invitations si
      INNER JOIN users u ON si.tattoo_artist_id = u.id
      WHERE si.studio_id = $1
      `,
      [studio_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las invitaciones del estudio:", error);
    res
      .status(500)
      .json({ error: "Error al obtener las invitaciones del estudio" });
  }
});

//Endpoint para expulsar a tatuador de un estudio para administrador de estudio
app.put(
  "/tattoo-studios/:studio_id/remove-artist/:tattoo_artist_id",
  async (req, res) => {
    const { studio_id, tattoo_artist_id } = req.params;

    try {
      // Verificar que el tatuador está asignado a algún slot en el estudio
      const slotsResult = await pool.query(
        "SELECT * FROM studio_slots WHERE studio_id = $1 AND assigned_tattoo_artist_id = $2",
        [studio_id, tattoo_artist_id]
      );

      if (slotsResult.rows.length === 0) {
        return res.status(400).json({
          error: "El tatuador no está asignado a ningún slot en este estudio",
        });
      }

      // Obtener los IDs de los slots asignados al tatuador
      const slotIds = slotsResult.rows.map((slot) => slot.id);

      // Actualizar los slots para liberar al tatuador
      await pool.query(
        "UPDATE studio_slots SET assigned_tattoo_artist_id = NULL, is_available = TRUE WHERE id = ANY($1::int[])",
        [slotIds]
      );

      res.json({ message: "El tatuador ha sido expulsado del estudio" });
    } catch (error) {
      console.error("Error al expulsar al tatuador del estudio:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);
// Endpoint para buscar usuarios con el rol de tatuador
app.get("/search/tattoer-studio", async (req, res) => {
  const { query } = req.query;
  const searchQuery = query ? `%${query}%` : "%";

  try {
    const result = await pool.query(
      `
      SELECT u.id, u.username, u.profile_pic, u.role
      FROM users u
      WHERE u.username ILIKE $1 
        AND u.role = 'tattoo_artist'
        AND u.id NOT IN (
          SELECT owner_id FROM tattoo_studios
        )
        AND u.id NOT IN (
          SELECT assigned_tattoo_artist_id 
          FROM studio_slots 
          WHERE assigned_tattoo_artist_id IS NOT NULL
        )
      ORDER BY u.username ASC
      `,
      [searchQuery]
    );

    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.status(500).json({ message: "Error al buscar usuarios", error });
  }
});
// Endpoint para obtener la lista de miembros de un estudio
app.get("/tattoo-studios/:studio_id/members", async (req, res) => {
  const { studio_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT u.id AS artist_id, u.username AS artist_name, u.email AS artist_email, u.profile_pic
      FROM users u
      JOIN studio_slots ss ON u.id = ss.assigned_tattoo_artist_id
      WHERE ss.studio_id = $1
      `,
      [studio_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener los miembros del estudio:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los miembros del estudio", error });
  }
});

// Iniciar el servidor
server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
