
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

const path = require('path');

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
        console.log('Posts:', rows);
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





app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
