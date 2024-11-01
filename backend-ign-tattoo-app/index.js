const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');

// Configuración de CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

const multer = require('multer');

const sharp = require('sharp');

const fs = require('fs');

const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Servir la carpeta 'uploads' de forma pública
app.use('/uploads', express.static('uploads'));


// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'admin-igntattoo',
    host: 'localhost',
    database: 'ign-tattoo-test',
    password: '1234',
    port: 5432,
});

//---------------------------------------------------------------------------------------------------- 
//APARTADO PARA MANEJAR TODO LO RELACIONADO CON LOS USUARIOS
//---------------------------------------------------------------------------------------------------- 

// Ruta para logearse
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);

        if (rows.length > 0) {
            const user = rows[0];
            const isValidPassword = await bcrypt.compare(password, user.password); // Compara la contraseña

            if (isValidPassword) {
                // Responde con el usuario
                res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
            } else {
                res.json({ success: false, message: 'Contraseña incorrecta' });
            }
        } else {
            res.json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.log(error);
    }
});


// Ruta para registrar un usuario automaticamente rol de user
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
        await pool.query(query, [username, email, hashedPassword]);
        return res.status(200).json({ success: true, user: { username, email } });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).json({ success: false, message: 'Error al registrar usuario' });
    }

});

//Obtener informacion de usuario
app.get('/users/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const query = 'SELECT id,username,bio,profile_pic,role FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [user_id]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        res.status(500).json({ success: false, message: 'Error al obtener la información del usuario' });
    }
});


//----------------------------------------------------------------------------------------------------
//FIN DE APARTADO DE USUARIOS
//----------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------- 
//APARTADO PARA MANEJAR TODO LO RELACIONADO CON LOS POSTEOS
//---------------------------------------------------------------------------------------------------- 

// Ruta para obtener los posts
app.get('/posts', async (req, res) => {
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
        console.error('Error al obtener los posts:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los posts' });
    }
});

// Ruta para obtener los posts de un usuario
app.get('/posts/:user_id', async (req, res) => {
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
        console.error('Error al obtener los posts:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los posts' });
    }
});


// Ruta para SUBIR posteo
app.post('/posts', upload.single('image'), async (req, res) => {
    const { content, user_id } = req.body;
    console.log('Datos recibidos:', { content, user_id }); // Agregar este log para verificar el userId

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const query = 'INSERT INTO posts (user_id, content, image) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [user_id, content, imageUrl]);

        res.status(200).json({ success: true, post: result.rows[0] });
    } catch (error) {
        console.error('Error al crear el post:', error);
        res.status(500).json({ success: false, message: 'Error al crear el post' });
    }
});

// Ruta para contar las publicaciones de un usuario
app.get('/posts/count/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = 'SELECT COUNT(*) AS post_count FROM posts WHERE user_id = $1';
        const { rows } = await pool.query(query, [user_id]);

        res.json({ post_count: rows[0].post_count });
    } catch (error) {
        console.error('Error al contar las publicaciones:', error);
        res.status(500).json({ success: false, message: 'Error al contar las publicaciones' });
    }
});
//---------------------------------------------------------------------------------------------------- 
//FIN DE APARTADO DE POSTEOS
//---------------------------------------------------------------------------------------------------- 


//---------------------------------------------------------------------------------------------------- 
//APARTADO PARA OBTENER LOS INFORMACION SOBRE FOLLOWERS Y FOLLOWING DE USUARIOS
//---------------------------------------------------------------------------------------------------- 
// Ruta para seguir a un usuario
app.post('/follow', async (req, res) => {
    const { follower_id, following_id } = req.body;

    try {
        // Insertar en la tabla follows
        const query = 'INSERT INTO follows (follower_id, following_id, followed_at) VALUES ($1, $2, NOW())';
        await pool.query(query, [follower_id, following_id]);

        res.status(200).json({ success: true, message: 'Usuario seguido exitosamente' });
    } catch (error) {
        console.error('Error al seguir al usuario:', error);
        res.status(500).json({ success: false, message: 'Error al seguir al usuario' });
    }
});


// Ruta para obtener un count de los seguidores de un usuario
app.get('/followers/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = 'SELECT COUNT(*) AS follower_count FROM follows WHERE following_id = $1';
        const { rows } = await pool.query(query, [user_id]);

        res.json({ follower_count: rows[0].follower_count });
    } catch (error) {
        console.error('Error al contar los seguidores:', error);
        res.status(500).json({ success: false, message: 'Error al contar los seguidores' });
    }
});


// Ruta para contar los seguidos de un usuario
app.get('/following/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = 'SELECT COUNT(*) AS following_count FROM follows WHERE follower_id = $1';
        const { rows } = await pool.query(query, [user_id]);

        res.json({ following_count: rows[0].following_count });
    } catch (error) {
        console.error('Error al contar los seguidos:', error);
        res.status(500).json({ success: false, message: 'Error al contar los seguidos' });
    }
});


// Ruta para obtener la lista de seguidores de un usuario   
app.get('/followers/list/:user_id', async (req, res) => {
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
        console.error('Error al obtener la lista de seguidores:', error);
        res.status(500).json({ success: false, message: 'Error al obtener la lista de seguidores' });
    }
});

// Ruta para dejar de seguir a un usuario
app.delete('/unfollow', async (req, res) => {
    const { follower_id, following_id } = req.body;

    try {
        const query = 'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2';
        const result = await pool.query(query, [follower_id, following_id]);

        if (result.rowCount > 0) {
            res.json({ success: true, message: 'Has dejado de seguir al usuario' });
        } else {
            res.json({ success: false, message: 'No estabas siguiendo a este usuario' });
        }
    } catch (error) {
        console.error('Error al dejar de seguir al usuario:', error);
        res.status(500).json({ success: false, message: 'Error al dejar de seguir al usuario' });
    }
});
// Ruta para obtener la lista de seguidos de un usuario
app.get('/following/list/:user_id', async (req, res) => {
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
        console.error('Error al obtener la lista de seguidos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener la lista de seguidos' });
    }
});
//---------------------------------------------------------------------------------------------------- 
//FIN DE APARTADO DE SEGUIDORES Y SEGUIDOS
//---------------------------------------------------------------------------------------------------- 



//----------------------------------------------------------------------------------------------------
//APARTADO PARA LA GESTION DE CITAS DEL TAUTADOR
//----------------------------------------------------------------------------------------------------

// Ruta para registrar horarios de disponibilidad de un tatuador    
app.post('/tattoo-artist/:tattoo_artist_id/availability', async (req, res) => {
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
            return res.status(200).json({ success: true, message: 'Disponibilidad actualizada', availability: updateResult.rows[0] });
        }

        // Si el `UPDATE` no afecta ninguna fila, hacer un `INSERT`
        const insertResult = await pool.query(
            `INSERT INTO tattoo_artist_availability (tattoo_artist_id, date, start_time, end_time, is_available, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [tattoo_artist_id, date, start_time, end_time, is_available, description]
        );

        res.status(201).json({ success: true, message: 'Disponibilidad creada', availability: insertResult.rows[0] });
    } catch (error) {
        console.error("Error al agregar o modificar la disponibilidad:", error);
        res.status(500).json({ success: false, message: 'Error al agregar o modificar la disponibilidad', error: error.message });
    }
});

// Ruta para obtener la disponibilidad (fechas) de un tatuador
app.get('/tattoo-artist/:tattoo_artist_id/availability', async (req, res) => {
    const { tattoo_artist_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM tattoo_artist_availability WHERE tattoo_artist_id = $1 AND is_available = TRUE ORDER BY date`,
            [tattoo_artist_id]
        );
        res.status(200).json({ availability: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener disponibilidad', error });
    }
});

// endpoint para crear una cita
app.post('/appointments', upload.single('reference_image'), async (req, res) => {
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
            return res.status(400).json({ message: 'Ya existe una cita en la fecha y hora seleccionadas para este tatuador.' });
        }

        // Verificar disponibilidad del tatuador en la fecha y hora solicitada
        const availability = await pool.query(
            `SELECT * FROM tattoo_artist_availability 
             WHERE tattoo_artist_id = $1 AND date = $2 AND is_available = TRUE 
             AND start_time <= $3 AND end_time >= $3`,
            [tattoo_artist_id, date, time]
        );

        if (availability.rows.length === 0) {
            return res.status(400).json({ message: 'El tatuador no está disponible en la fecha y hora seleccionadas.' });
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
        res.status(500).json({ message: 'Error al crear la cita', error });
    }
});

// Ruta para obtener las citas de un tatuador
app.get('/tattoo-artist/:tattoo_artist_id/appointments', async (req, res) => {
    const { tattoo_artist_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT appointments.id, users.username,appointments.user_id, appointments.tattoo_artist_id, appointments.date,
                appointments.time, appointments.description, appointments.status
                FROM appointments
                JOIN users ON appointments.user_id = users.id
                WHERE tattoo_artist_id = $1 ORDER BY date, time`,
            [tattoo_artist_id]
        );
        res.status(200).json({ appointments: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las citas', error });
    }
});

// Ruta para obtener las citas de un  cliente
app.get('/user/:user_id/appointments', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT appointments.id, users.username,appointments.user_id, appointments.tattoo_artist_id, appointments.date,
                appointments.time, appointments.description, appointments.status
                FROM appointments
                JOIN users ON appointments.tattoo_artist_id = users.id
                WHERE user_id = $1 ORDER BY date, time`,
            [user_id]
        );
        res.status(200).json({ appointments: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las citas', error });
    }
});

//Endpoint para actualizar el estado de una cita
app.put('/appointments/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, message, sender_id, receiver_id } = req.body;

    try {
        // Actualizar el estado de la cita
        const result = await pool.query(
            'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length > 0) {
            // Enviar mensaje al cliente
            await pool.query(
                'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)',
                [sender_id, receiver_id, message]
            );

            res.status(200).json({ success: true, appointment: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Appointment not found' });
        }
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ success: false, message: 'Error updating appointment status', error });
    }
});

//Comnicacion con entre usuarios
app.post('/messages', async (req, res) => {
    const { sender_id, receiver_id, content, image_url } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [sender_id, receiver_id, content, image_url]
        );

        res.status(201).json({ message: result.rows[0] });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message', error });
    }
});


// Obtener los mensajes de un usuario
// Obtener los mensajes de un usuario
app.get('/user/:id/messages', async (req, res) => {
    const { id } = req.params;

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

        // Confirma que el filtro y los datos son correctos
        console.log('Mensajes obtenidos del usuario:', result.rows);

        res.status(200).json({ messages: result.rows });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages', error });
    }
});



// Obtener las conversaciones únicas de un usuario con el nombre de usuario
app.get('/user/:id/conversations', async (req, res) => {
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
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Error fetching conversations', error });
    }
});






app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
