
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
                res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
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

app.get('/posts', async (req, res) => {
    const query = `
        SELECT posts.id, posts.user_id, users.username, posts.content, posts.image, posts.created_at
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





app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});