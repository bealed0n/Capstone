
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

            // Verifica la contraseña
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.json({ success: true, message: 'Login exitoso' });
                console.log('Login exitoso');
            } else {
                res.status(401).json({ success: false, message: 'Wrong password' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});


app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hashea la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de rondas de salting

        // Inserta el nuevo usuario en la base de datos
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
        await pool.query(query, [username, email, hashedPassword]);

        // Si todo sale bien, enviamos un mensaje de éxito
        res.json({ success: true, message: 'Usuario registrado' });
        console.log('Usuario registrado');
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.json({ success: false, message: 'Error al registrar usuario' });
    }
});



app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});